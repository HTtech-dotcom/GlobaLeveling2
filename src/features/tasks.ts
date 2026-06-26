import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getTodayKey, getWeekDates, getWeekKey, isWeekend } from "@/lib/dates";
import {
  getStorageMetricCodes,
  intensityMultiplier,
  planDefinitions,
  progressionTable,
  TASK_LOGIC_VERSION,
  toPublicMetricCode,
  type MetricCode,
  type PlanCode
} from "@/config/metrics";
import { getRank } from "@/features/rank";
import { calculateJobScore } from "@/features/scoring";
import { round, clamp } from "@/lib/number";
import { parseJson } from "@/lib/safe-json";

type MetricState = {
  metricCode: MetricCode;
  score: number;
  rankCode: string;
  rawValueJson: string | null;
};

type GeneratedTaskWithTemplate = Prisma.GeneratedTaskGetPayload<{
  include: { taskTemplate: { include: { metricDefinition: true } } };
}>;

const ensureTodayTasksLocks = new Map<string, Promise<GeneratedTaskWithTemplate[]>>();

const LOOP_METRICS: MetricCode[] = ["STR", "DUR", "SPD", "INT", "EMO", "CRR"];
const TIMER_METRICS = new Set<MetricCode>(["INT", "EMO", "CRR"]);
const DEFAULT_WORK_QUALITY = "medium";

function allocateSlots(metrics: MetricState[], slots: number[]) {
  const sorted = [...metrics].sort((a, b) => b.score - a.score);
  const map: Record<string, number> = {};
  sorted.forEach((metric, index) => {
    map[metric.metricCode] = slots[index] ?? 0;
  });
  return map;
}

export function allocateWeeklyLoops(planCode: string, metrics: MetricState[]) {
  const plan = planDefinitions[(planCode as PlanCode) ?? "balanced"] ?? planDefinitions.balanced;
  if (!plan.groupB) {
    return allocateSlots(metrics.filter((metric) => plan.groupA.includes(metric.metricCode)).slice(0, 6), plan.slotsA);
  }

  return {
    ...allocateSlots(metrics.filter((metric) => plan.groupA.includes(metric.metricCode)), plan.slotsA),
    ...allocateSlots(metrics.filter((metric) => plan.groupB?.includes(metric.metricCode)), plan.slotsB ?? [])
  };
}

function getDailyLoopBudget(date: Date) {
  return isWeekend(date) ? 4 : 3;
}

function scaleAllocationToRemainingWindow(allocation: Record<string, number>, remainingCapacity: number) {
  const entries = Object.entries(allocation);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  if (!total || remainingCapacity >= total) return allocation;

  const scaled = entries.map(([metricCode, count]) => {
    const raw = (count / total) * remainingCapacity;
    return {
      metricCode,
      floor: Math.floor(raw),
      remainder: raw - Math.floor(raw)
    };
  });

  let assigned = scaled.reduce((sum, entry) => sum + entry.floor, 0);
  scaled.sort((a, b) => b.remainder - a.remainder);

  for (const entry of scaled) {
    if (assigned >= remainingCapacity) break;
    entry.floor += 1;
    assigned += 1;
  }

  return Object.fromEntries(scaled.map((entry) => [entry.metricCode, entry.floor]));
}

function chooseMetricsForDay(
  metrics: MetricState[],
  remainingByMetric: Record<string, number>,
  previousDayMetrics: Set<string>,
  loopCount: number,
  dayIndex: number,
  totalDays: number
) {
  const remainingDays = totalDays - dayIndex;
  const earlyWeekFactor = (totalDays - dayIndex) / totalDays;
  const candidates = metrics
    .filter((metric) => (remainingByMetric[metric.metricCode] ?? 0) > 0)
    .map((metric) => {
      const remaining = remainingByMetric[metric.metricCode] ?? 0;
      const forced = remaining >= remainingDays ? 1 : 0;
      const urgency = remaining / Math.max(remainingDays, 1);
      const weakness = (100 - metric.score) / 100;
      const consecutivePenalty = previousDayMetrics.has(metric.metricCode) && remaining < remainingDays ? 0.35 : 0;
      const priority = forced * 1000 + urgency * 100 + weakness * 20 * earlyWeekFactor - consecutivePenalty * 25;

      return {
        metricCode: metric.metricCode,
        priority,
        remaining,
        score: metric.score
      };
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.remaining !== a.remaining) return b.remaining - a.remaining;
      return a.score - b.score;
    });

  return candidates.slice(0, loopCount).map((entry) => entry.metricCode);
}

async function selectTaskTemplate(userId: string, metricCode: MetricCode) {
  const templates = await prisma.taskTemplate.findMany({
    where: { metricDefinition: { is: { code: { in: getStorageMetricCodes(metricCode) } } }, isLoop: true },
    orderBy: [{ cycleOrder: "asc" }, { taskCode: "asc" }]
  });

  if (!templates.length) return null;

  if (["STR", "DUR", "SPD"].includes(metricCode)) {
    const latest = await prisma.generatedTask.findFirst({
      where: { userId, metricCode: { in: getStorageMetricCodes(metricCode) }, isLoop: true },
      include: { taskTemplate: true },
      orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }]
    });

    if (!latest?.taskTemplate.cycleOrder) return templates[0];
    const nextOrder = latest.taskTemplate.cycleOrder >= templates.length ? 1 : latest.taskTemplate.cycleOrder + 1;
    return templates.find((item) => item.cycleOrder === nextOrder) ?? templates[0];
  }

  if (metricCode === "INT") {
    const latest = await prisma.generatedTask.findMany({
      where: { userId, metricCode: { in: getStorageMetricCodes(metricCode) }, isLoop: true },
      include: { taskTemplate: true },
      orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
      take: 2
    });
    const latestGroups = latest.map((item) => item.taskTemplate.cycleGroup).filter(Boolean);
    const groups = ["hobby_logic", "language", "reading"];
    const nextGroup =
      groups.find((group) => !latestGroups.includes(group)) ??
      groups[(groups.indexOf(latest[0]?.taskTemplate.cycleGroup ?? "hobby_logic") + 1) % groups.length];
    const pool = templates.filter((item) => item.cycleGroup === nextGroup);
    if (!pool.length) return templates[0];
    const count = await prisma.generatedTask.count({ where: { userId, taskTemplateId: { in: pool.map((item) => item.id) } } });
    return pool[count % pool.length];
  }

  if (metricCode === "EMO") {
    const recent = await prisma.generatedTask.findMany({
      where: { userId, metricCode: { in: getStorageMetricCodes(metricCode) }, isLoop: true },
      include: { taskTemplate: true },
      orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
      take: 2
    });

    const blockedCode = recent.length === 2 && recent[0].taskTemplateId === recent[1].taskTemplateId ? recent[0].taskTemplate.taskCode : null;
    const allowed = blockedCode ? templates.filter((item) => item.taskCode !== blockedCode) : templates;
    const counts = await prisma.generatedTask.groupBy({
      by: ["taskTemplateId"],
      where: { userId, taskTemplateId: { in: allowed.map((item) => item.id) } },
      _count: { taskTemplateId: true }
    });
    const countMap = Object.fromEntries(counts.map((item) => [item.taskTemplateId, item._count.taskTemplateId]));
    return [...allowed].sort((a, b) => (countMap[a.id] ?? 0) - (countMap[b.id] ?? 0))[0] ?? templates[0];
  }

  if (toPublicMetricCode(metricCode) === "CRR") {
    return templates.find((item) => item.taskCode === "JOB-01") ?? templates[0];
  }

  return templates[0];
}

function getProgressionReward(intensity: string, rankCode: string) {
  const bucket = progressionTable[intensity] ?? progressionTable.balanced;
  return bucket[rankCode] ?? 0;
}

function getIntensityPercentAdjustment(intensity: string) {
  if (intensity === "slow") return -0.05;
  if (intensity === "fast") return 0.05;
  return 0;
}

function roundToStep(value: number, step: number) {
  return Math.floor(value / step) * step;
}

function buildStrengthVolume(taskCode: string, rankCode: string, intensity: string, rawValueJson: string | null) {
  const raw = parseJson<{ benchKg?: number; deadliftKg?: number; squatKg?: number }>(rawValueJson, {});
  const map: Record<string, number> = { E: 0.5, D: 0.55, C: 0.6, B: 0.625, A: 0.65, S: 0.675, SS: 0.7 };
  const pct = clamp((map[rankCode] ?? 0.55) + getIntensityPercentAdjustment(intensity), 0.45, 0.7);

  if (taskCode === "STR-01") {
    const main = roundToStep((raw.benchKg ?? 40) * pct, 2.5);
    const incline = Math.max(2.5, roundToStep(main * 0.75, 2.5));
    const tricep = Math.max(2.5, roundToStep(main * 0.3, 2.5));

    return {
      main: `Bench Press 3×12 × ${main}kg`,
      accessories: [
        `Incline Bench Press 2×12 × ${incline}kg`,
        `Tricep Pushdown 2×12 × ${tricep}kg`
      ]
    };
  }

  if (taskCode === "STR-02") {
    const main = roundToStep((raw.deadliftKg ?? 60) * pct, 2.5);
    const curlEachHand = Math.max(2.5, roundToStep((main * 0.175) / 2, 2.5));

    return {
      main: `Deadlift 3×12 × ${main}kg`,
      accessories: [
        `Bicep Curl 2×12 × ${curlEachHand}kg each hand`
      ]
    };
  }

  const main = roundToStep((raw.squatKg ?? 50) * pct, 2.5);
  const legPress = Math.max(10, roundToStep(main * 2, 2.5));
  const legExtension = Math.max(5, roundToStep(main * 0.35, 2.5));

  return {
    main: `Squat 3×12 × ${main}kg`,
    accessories: [
      `Leg Press 2×12 × ${legPress}kg`,
      `Leg Extension 2×12 × ${legExtension}kg`
    ]
  };
}

function buildDurVolume(score: number, intensity: string, taskCode: string) {
  const baseDistance = 1 + score / 20;
  const factor = taskCode === "DUR-03" ? 1.3 : taskCode === "DUR-04" ? 0.7 : 1;
  const adjusted = baseDistance * (intensityMultiplier[intensity as keyof typeof intensityMultiplier] ?? 1) * factor;
  const finalDistance = clamp(Math.round(adjusted * 2) / 2, 1, 10);
  const label = taskCode === "DUR-03" ? "Long slow run" : taskCode === "DUR-04" ? "Tempo run" : "Easy run";
  return { main: `${label}: ${finalDistance.toFixed(1)}km`, accessories: [] as string[] };
}

function buildSpdVolume(score: number, intensity: string, taskCode: string, rankCode: string) {
  const totalMeters = clamp((120 + score * 4.8) * (intensityMultiplier[intensity as keyof typeof intensityMultiplier] ?? 1), 100, 750);

  if (taskCode === "SPD-03") {
    const reps = clamp(Math.floor(totalMeters / 100), 2, 7);
    const rest = ["E", "D"].includes(rankCode) ? "3–4 min" : ["C", "B"].includes(rankCode) ? "2.5–3 min" : "2–3 min";
    return { main: `${reps} × 100m sprint`, accessories: [`Rest ${rest} between reps`] };
  }

  const sets = clamp(Math.floor(totalMeters / 120), 1, 5);
  return {
    main: `${sets} suicide run sets`,
    accessories: ["Each set: 10m + 20m + 30m out-and-back", "Rest 2–3 min between sets"]
  };
}

function buildTimedVolume(main: string, duration: number, accessories: string[] = []) {
  return {
    main,
    accessories,
    requiredMinutes: duration,
    timerStartedAt: null
  };
}

function buildIntVolume(score: number, intensity: string, cycleGroup: string | null, taskTitle: string) {
  const duration = intensity === "slow" ? 25 : intensity === "fast" ? 60 : 40;
  if (cycleGroup === "reading") {
    if (score < 40) return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Summarize 3 key ideas"]);
    if (score < 70) return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Summary + main argument + evidence"]);
    if (score < 90) return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Argument map + counterpoint"]);
    return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Argument map + critique + open question"]);
  }

  if (cycleGroup === "language") {
    return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Vocabulary / grammar / listening"]);
  }

  return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Logic / puzzle / analysis"]);
}

function buildEmoVolume(rankCode: string, intensity: string, taskTitle: string) {
  const duration = intensity === "slow" ? 15 : intensity === "fast" ? 40 : 25;
  if (["E", "D"].includes(rankCode)) {
    return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Name emotion and trigger"]);
  }
  if (["C", "B"].includes(rankCode)) {
    return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Analyze cause and behavior"]);
  }
  if (["A", "S"].includes(rankCode)) {
    return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Add the other person's viewpoint"]);
  }
  return buildTimedVolume(`${taskTitle} · ${duration}m`, duration, ["Future response plan"]);
}

function buildJobVolume() {
  return buildTimedVolume("Certificate / professional learning · 90m", 90, ["Study until the timer is done"]);
}

function buildDailyWorkCheckVolume() {
  return {
    main: "Daily work check",
    accessories: ["Work status and quality"],
    workCheck: true,
    workStatus: "yes",
    workQuality: DEFAULT_WORK_QUALITY
  };
}

function buildTaskVolume(template: { taskCode: string; title: string; cycleGroup: string | null }, metric: MetricState, intensity: string) {
  switch (metric.metricCode) {
    case "STR":
      return buildStrengthVolume(template.taskCode, metric.rankCode, intensity, metric.rawValueJson);
    case "DUR":
      return buildDurVolume(metric.score, intensity, template.taskCode);
    case "SPD":
      return buildSpdVolume(metric.score, intensity, template.taskCode, metric.rankCode);
    case "INT":
      return buildIntVolume(metric.score, intensity, template.cycleGroup, template.title);
    case "EMO":
      return buildEmoVolume(metric.rankCode, intensity, template.title);
    case "CRR":
      return buildJobVolume();
    default:
      return { main: "General task", accessories: [] as string[] };
  }
}

function isTimedLoop(task: { isLoop: boolean; metricCode: string }) {
  return task.isLoop && TIMER_METRICS.has(toPublicMetricCode(task.metricCode) as MetricCode);
}

function getTimerState(volumeJson: string | null) {
  const volume = parseJson<Record<string, unknown>>(volumeJson, {});
  return {
    requiredMinutes: typeof volume.requiredMinutes === "number" ? volume.requiredMinutes : null,
    timerStartedAt: typeof volume.timerStartedAt === "string" ? volume.timerStartedAt : null
  };
}

function withTimerStart(volumeJson: string | null, startedAt: string) {
  const volume = parseJson<Record<string, unknown>>(volumeJson, {});
  return JSON.stringify({ ...volume, timerStartedAt: startedAt });
}

function clearTimer(volumeJson: string | null) {
  const volume = parseJson<Record<string, unknown>>(volumeJson, {});
  return JSON.stringify({ ...volume, timerStartedAt: null });
}

function withWorkCheckAnswers(volumeJson: string | null, workedToday: string, workQuality: string) {
  const volume = parseJson<Record<string, unknown>>(volumeJson, {});
  return JSON.stringify({ ...volume, workStatus: workedToday, workQuality });
}

function compareDateKeys(a: string, b: string) {
  return a.localeCompare(b);
}

async function createLoopTaskForDate(userId: string, user: { currentPlanCode: string; trainingIntensity: string }, metrics: MetricState[], metricCode: MetricCode, dateKey: string, weekKey: string, loopNumber: number) {
  const template = await selectTaskTemplate(userId, metricCode);
  const metricState = metrics.find((item) => item.metricCode === metricCode);
  if (!template || !metricState) return null;

  const volume = buildTaskVolume(
    { taskCode: template.taskCode, title: template.title, cycleGroup: template.cycleGroup },
    metricState,
    user.trainingIntensity
  );

  return prisma.generatedTask.create({
    data: {
      userId,
      taskTemplateId: template.id,
      metricCode,
      taskType: template.taskType,
      title: template.title,
      description: template.description,
      scheduledDate: dateKey,
      weekKey,
      loopNumber,
      isLoop: true,
      reasonJson: JSON.stringify({
        metricScore: metricState.score,
        metricRank: metricState.rankCode,
        planCode: user.currentPlanCode,
        generatedBecause: "weekly_plan_allocation"
      }),
      volumeJson: JSON.stringify(volume),
      logicVersion: TASK_LOGIC_VERSION
    }
  });
}

async function ensureJobDailyCheck(userId: string, weekKey: string, dateKey: string) {
  const dailyJobCheck = await prisma.taskTemplate.findFirst({
    where: { taskCode: "JOB-CHECK" }
  });

  if (!dailyJobCheck) return;

  await prisma.generatedTask.upsert({
    where: {
      userId_scheduledDate_taskTemplateId_loopNumber: {
        userId,
        scheduledDate: dateKey,
        taskTemplateId: dailyJobCheck.id,
        loopNumber: 0
      }
    },
    create: {
      userId,
      taskTemplateId: dailyJobCheck.id,
      metricCode: "CRR",
      taskType: dailyJobCheck.taskType,
      title: dailyJobCheck.title,
      description: dailyJobCheck.description,
      scheduledDate: dateKey,
      weekKey,
      loopNumber: 0,
      isLoop: false,
      reasonJson: JSON.stringify({ generatedBecause: "daily_job_check" }),
      volumeJson: JSON.stringify(buildDailyWorkCheckVolume()),
      logicVersion: TASK_LOGIC_VERSION
    },
    update: {}
  });
}

async function ensureTodayTasksUnlocked(userId: string): Promise<GeneratedTaskWithTemplate[]> {
  const today = new Date();
  const todayKey = getTodayKey(today);
  const weekKey = getWeekKey(today);

  const existingToday = await prisma.generatedTask.findMany({
    where: { userId, scheduledDate: todayKey },
    include: { taskTemplate: { include: { metricDefinition: true } } },
    orderBy: [{ isLoop: "desc" }, { loopNumber: "asc" }, { createdAt: "asc" }]
  });

  if (existingToday.length) {
    if (!existingToday.some((task) => task.taskTemplate.taskCode === "JOB-CHECK")) {
      await ensureJobDailyCheck(userId, weekKey, todayKey);
      return prisma.generatedTask.findMany({
        where: { userId, scheduledDate: todayKey },
        include: { taskTemplate: { include: { metricDefinition: true } } },
        orderBy: [{ isLoop: "desc" }, { loopNumber: "asc" }, { createdAt: "asc" }]
      });
    }
    return existingToday;
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.hasCompletedInitialMeasurement) return [];

  const userMetrics = await prisma.userMetric.findMany({
    where: { userId, metricDefinition: { is: { isLoopActive: true } } },
    include: { metricDefinition: true },
    orderBy: { metricDefinition: { displayOrder: "asc" } }
  });

  const metrics: MetricState[] = userMetrics.map((item) => ({
    metricCode: toPublicMetricCode(item.metricDefinition.code) as MetricCode,
    score: item.score,
    rankCode: item.rankCode,
    rawValueJson: item.rawValueJson
  }));

  const originalAllocation = allocateWeeklyLoops(user.currentPlanCode, metrics);
  const weekDates = getWeekDates(today);
  const todayIndex = weekDates.findIndex((date) => getTodayKey(date) === todayKey);
  const remainingCapacity = weekDates.slice(todayIndex).reduce((sum, date) => sum + getDailyLoopBudget(date), 0);

  const existingWeekTasks = await prisma.generatedTask.findMany({
    where: { userId, weekKey, isLoop: true },
    orderBy: [{ scheduledDate: "asc" }, { loopNumber: "asc" }]
  });

  let allocation = originalAllocation;
  const hasWeekTasks = existingWeekTasks.length > 0;
  const hasPastTasks = existingWeekTasks.some((task) => compareDateKeys(task.scheduledDate, todayKey) < 0);
  if (!hasWeekTasks && todayIndex > 0) {
    allocation = scaleAllocationToRemainingWindow(originalAllocation, remainingCapacity);
  } else if (hasWeekTasks && !hasPastTasks) {
    const existingCount = existingWeekTasks.length;
    allocation = scaleAllocationToRemainingWindow(originalAllocation, Math.max(existingCount + remainingCapacity, existingCount));
  }

  const existingByDate = new Map<string, string[]>();
  for (const task of existingWeekTasks) {
    const publicMetricCode = toPublicMetricCode(task.metricCode);
    const list = existingByDate.get(task.scheduledDate) ?? [];
    if (!list.includes(publicMetricCode)) list.push(publicMetricCode);
    existingByDate.set(task.scheduledDate, list);
  }

  const remainingByMetric: Record<string, number> = { ...allocation };
  for (const task of existingWeekTasks) {
    const publicMetricCode = toPublicMetricCode(task.metricCode);
    remainingByMetric[publicMetricCode] = Math.max(0, (remainingByMetric[publicMetricCode] ?? 0) - 1);
  }

  let previousDayMetrics = new Set<string>();
  for (let index = 0; index < weekDates.length; index += 1) {
    const dateKey = getTodayKey(weekDates[index]);
    const existingForDay = existingByDate.get(dateKey) ?? [];

    if (compareDateKeys(dateKey, todayKey) < 0) {
      previousDayMetrics = new Set(existingForDay);
      continue;
    }

    if (existingForDay.length) {
      previousDayMetrics = new Set(existingForDay);
      continue;
    }

    const loopBudget = getDailyLoopBudget(weekDates[index]);
    const selectedMetrics = chooseMetricsForDay(metrics, remainingByMetric, previousDayMetrics, loopBudget, index, weekDates.length);

    let loopNumber = 1;
    for (const metricCode of selectedMetrics) {
      await createLoopTaskForDate(userId, user, metrics, metricCode, dateKey, weekKey, loopNumber);
      remainingByMetric[metricCode] = Math.max(0, (remainingByMetric[metricCode] ?? 0) - 1);
      loopNumber += 1;
    }

    previousDayMetrics = new Set(selectedMetrics);
  }

  await ensureJobDailyCheck(userId, weekKey, todayKey);

  return prisma.generatedTask.findMany({
    where: { userId, scheduledDate: todayKey },
    include: { taskTemplate: { include: { metricDefinition: true } } },
    orderBy: [{ isLoop: "desc" }, { loopNumber: "asc" }, { createdAt: "asc" }]
  });
}

export async function ensureTodayTasks(userId: string): Promise<GeneratedTaskWithTemplate[]> {
  const existingLock = ensureTodayTasksLocks.get(userId);
  if (existingLock) return existingLock;

  const promise = ensureTodayTasksUnlocked(userId).finally(() => {
    ensureTodayTasksLocks.delete(userId);
  });

  ensureTodayTasksLocks.set(userId, promise);
  return promise;
}


export async function startTaskTimer(taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.generatedTask.findUniqueOrThrow({
      where: { id: taskId }
    });

    if (!isTimedLoop(task)) {
      return task;
    }

    if (task.status === "completed") {
      return task;
    }

    const { timerStartedAt } = getTimerState(task.volumeJson);
    if (timerStartedAt && task.status === "in_progress") {
      return task;
    }

    const activeTimedTasks = await tx.generatedTask.findMany({
      where: {
        userId: task.userId,
        scheduledDate: task.scheduledDate,
        status: "in_progress",
        isLoop: true,
        id: { not: task.id },
        metricCode: { in: ["INT", "EMO", ...getStorageMetricCodes("CRR")] }
      }
    });

    const runningTask = activeTimedTasks.find((item) => getTimerState(item.volumeJson).timerStartedAt);
    if (runningTask) {
      throw new Error("Another timed task is already running.");
    }

    return tx.generatedTask.update({
      where: { id: taskId },
      data: {
        status: "in_progress",
        volumeJson: withTimerStart(task.volumeJson, new Date().toISOString())
      }
    });
  });
}

function getWorkQualityMultiplier(workQuality: string) {
  if (workQuality === "high") return 1.5;
  if (workQuality === "low") return 0.5;
  return 1;
}

function applyLoopReward(score: number, reward: number) {
  const nextScore = clamp(round(score + reward, 3), 0, 100);
  return {
    nextScore,
    nextRankCode: getRank(nextScore)
  };
}

async function applyDailyWorkCheck(tx: Prisma.TransactionClient, task: any, workedToday: string, workQuality: string) {
  const userMetric = await tx.userMetric.findFirst({
    where: {
      userId: task.userId,
      metricDefinition: { is: { code: { in: getStorageMetricCodes("CRR") } } }
    },
    include: { metricDefinition: true }
  });

  if (!userMetric) {
    return { reward: 0, updatedScore: 0, updatedRank: "E", volumeJson: withWorkCheckAnswers(task.volumeJson, workedToday, workQuality), detail: { workedToday, workQuality, yearsDelta: 0 } };
  }

  const current = parseJson<{
    professionCode?: string;
    countryCode?: string;
    companyTier?: string;
    yearsExperience?: number;
    seniorityLevel?: string;
    educationLevel?: string;
    educationRelevance?: string;
    certificationCode?: string;
    certificationStage?: string | null;
    passedUnits?: number | null;
    percentComplete?: number | null;
    fCompleted?: number;
    pCompleted?: number;
    certificateStatus?: string;
  }>(userMetric.rawValueJson, {
    professionCode: task.user.occupation ?? "general_professional",
    countryCode: "VN",
    companyTier: "sme",
    yearsExperience: 0,
    seniorityLevel: "associate",
    educationLevel: "bachelor_related",
    educationRelevance: "related",
    certificationCode: "none",
    percentComplete: 0
  });

  const worked = workedToday !== "no";
  const yearsDelta = worked ? getWorkQualityMultiplier(workQuality) / 260 : 0;
  const nextPayload = {
    ...current,
    yearsExperience: Number(current.yearsExperience ?? 0) + yearsDelta
  };

  const job = calculateJobScore(nextPayload);
  const reward = round(Math.max(0, job.score - userMetric.score), 4);

  await tx.userMetric.update({
    where: { id: userMetric.id },
    data: {
      score: job.score,
      rankCode: job.rankCode,
      rawValueJson: JSON.stringify(job.normalizedInput)
    }
  });

  await tx.levelingResult.create({
    data: {
      userId: task.userId,
      metricDefinitionId: userMetric.metricDefinitionId,
      rawScore: userMetric.score,
      finalScore: job.score,
      rankCode: job.rankCode,
      logicVersion: TASK_LOGIC_VERSION,
      profileSnapshotJson: JSON.stringify({
        ageGroup: task.user.ageGroup,
        occupation: task.user.occupation,
        regionCode: task.user.regionCode
      }),
      calculationDetailJson: JSON.stringify({
        source: "daily_work_check",
        previousScore: userMetric.score,
        yearsDelta: round(yearsDelta, 6),
        workedToday,
        workQuality
      })
    }
  });

  return {
    reward,
    updatedScore: job.score,
    updatedRank: job.rankCode,
    volumeJson: withWorkCheckAnswers(task.volumeJson, workedToday, workQuality),
    detail: { workedToday, workQuality, yearsDelta: round(yearsDelta, 6) }
  };
}

export async function applyTaskCompletion(
  taskId: string,
  options: { undo?: boolean; workedToday?: string; workQuality?: string } = {}
) {
  const undo = options.undo === true;

  return prisma.$transaction(async (tx) => {
    const task = await tx.generatedTask.findUniqueOrThrow({
      where: { id: taskId },
      include: { user: true, taskTemplate: { include: { metricDefinition: true } } }
    });

    if (undo && task.status !== "completed") {
      return { task, reward: 0, user: task.user };
    }

    if (!undo && task.status === "completed") {
      return { task, reward: task.rewardGranted ?? 0, user: task.user };
    }

    let reward = 0;
    let updatedVolumeJson = task.volumeJson;
    let previousScoreForLog = 0;
    let updatedMetricId: string | null = null;
    let nextMetricScore = 0;
    let nextMetricRank = "E";

    if (!undo && isTimedLoop(task)) {
      const { requiredMinutes, timerStartedAt } = getTimerState(task.volumeJson);
      if (!requiredMinutes || !timerStartedAt) {
        throw new Error("Timer has not started yet.");
      }

      const elapsedMs = Date.now() - new Date(timerStartedAt).getTime();
      if (elapsedMs < requiredMinutes * 60 * 1000) {
        throw new Error("Timer is not finished yet.");
      }
    }

    if (task.isLoop) {
      const userMetric = await tx.userMetric.findUniqueOrThrow({
        where: {
          userId_metricDefinitionId: {
            userId: task.userId,
            metricDefinitionId: task.taskTemplate.metricDefinitionId
          }
        },
        include: { metricDefinition: true }
      });

      previousScoreForLog = userMetric.score;
      updatedMetricId = userMetric.metricDefinitionId;

      if (undo) {
        reward = -(task.rewardGranted ?? 0);
      } else {
        reward = getProgressionReward(task.user.trainingIntensity, userMetric.rankCode);
      }

      const loopResult = applyLoopReward(userMetric.score, reward);
      nextMetricScore = loopResult.nextScore;
      nextMetricRank = loopResult.nextRankCode;

      await tx.userMetric.update({
        where: { id: userMetric.id },
        data: {
          score: nextMetricScore,
          rankCode: nextMetricRank
        }
      });

      await tx.levelingResult.create({
        data: {
          userId: task.userId,
          metricDefinitionId: userMetric.metricDefinitionId,
          rawScore: userMetric.score,
          finalScore: nextMetricScore,
          rankCode: nextMetricRank,
          logicVersion: TASK_LOGIC_VERSION,
          profileSnapshotJson: JSON.stringify({
            ageGroup: task.user.ageGroup,
            occupation: task.user.occupation,
            regionCode: task.user.regionCode
          }),
          calculationDetailJson: JSON.stringify({
            source: undo ? "undo_task_completion" : "task_completion",
            previousScore: userMetric.score,
            reward: round(reward, 3),
            taskCode: task.taskTemplate.taskCode
          })
        }
      });

      if (isTimedLoop(task) && undo) {
        updatedVolumeJson = clearTimer(task.volumeJson);
      }
    } else if (task.taskTemplate.taskCode === "JOB-CHECK") {
      if (undo) {
        const volume = parseJson<Record<string, unknown>>(task.volumeJson, {});
        const previousYearsDelta = typeof volume.yearsDelta === "number" ? volume.yearsDelta : 0;
        const workStatus = typeof volume.workStatus === "string" ? volume.workStatus : "yes";
        const workQuality = typeof volume.workQuality === "string" ? volume.workQuality : DEFAULT_WORK_QUALITY;

        const userMetric = await tx.userMetric.findFirstOrThrow({
          where: { userId: task.userId, metricDefinition: { is: { code: { in: getStorageMetricCodes("CRR") } } } },
          include: { metricDefinition: true }
        });

        const current = parseJson<{
          professionCode?: string;
          countryCode?: string;
          companyTier?: string;
          yearsExperience?: number;
          seniorityLevel?: string;
                educationLevel?: string;
          educationRelevance?: string;
          certificationCode?: string;
          certificationStage?: string | null;
          passedUnits?: number | null;
          percentComplete?: number | null;
          fCompleted?: number;
          pCompleted?: number;
          certificateStatus?: string;
        }>(userMetric.rawValueJson, {
          professionCode: task.user.occupation ?? "general_professional",
          countryCode: "VN",
          companyTier: "sme",
          yearsExperience: 0,
          seniorityLevel: "associate",
                educationLevel: "bachelor_related",
          educationRelevance: "related",
          certificationCode: "none",
          percentComplete: 0
        });

        previousScoreForLog = userMetric.score;
        updatedMetricId = userMetric.metricDefinitionId;

        const reverted = calculateJobScore({
          ...current,
          yearsExperience: Math.max(0, Number(current.yearsExperience ?? 0) - previousYearsDelta)
        });

        reward = -(task.rewardGranted ?? 0);
        nextMetricScore = reverted.score;
        nextMetricRank = reverted.rankCode;

        await tx.userMetric.update({
          where: { id: userMetric.id },
          data: {
            score: reverted.score,
            rankCode: reverted.rankCode,
            rawValueJson: JSON.stringify(reverted.normalizedInput)
          }
        });

        await tx.levelingResult.create({
          data: {
            userId: task.userId,
            metricDefinitionId: userMetric.metricDefinitionId,
            rawScore: userMetric.score,
            finalScore: reverted.score,
            rankCode: reverted.rankCode,
            logicVersion: TASK_LOGIC_VERSION,
            profileSnapshotJson: JSON.stringify({
              ageGroup: task.user.ageGroup,
              occupation: task.user.occupation,
              regionCode: task.user.regionCode
            }),
            calculationDetailJson: JSON.stringify({
              source: "undo_daily_work_check",
              previousScore: userMetric.score,
              yearsDelta: -previousYearsDelta,
              workedToday: workStatus,
              workQuality
            })
          }
        });

        updatedVolumeJson = JSON.stringify({
          ...volume,
          workStatus: "yes",
          workQuality: DEFAULT_WORK_QUALITY,
          yearsDelta: 0
        });
      } else {
        const workedToday = options.workedToday === "no" ? "no" : "yes";
        const workQuality = options.workQuality === "high" || options.workQuality === "low" ? options.workQuality : DEFAULT_WORK_QUALITY;
        const result = await applyDailyWorkCheck(tx, task, workedToday, workQuality);
        reward = result.reward;
        nextMetricScore = result.updatedScore;
        nextMetricRank = result.updatedRank;
        updatedVolumeJson = JSON.stringify({
          ...parseJson<Record<string, unknown>>(result.volumeJson, {}),
          yearsDelta: result.detail.yearsDelta
        });
      }
    }

    const nextStatus = undo ? "new" : "completed";
    const updatedTask = await tx.generatedTask.update({
      where: { id: task.id },
      data: {
        status: nextStatus,
        rewardGranted: undo ? null : round(Math.abs(reward), 3),
        completedAt: undo ? null : new Date(),
        volumeJson: updatedVolumeJson
      },
      include: { taskTemplate: true }
    });

    await tx.activityLog.create({
      data: {
        userId: task.userId,
        eventType: undo ? "undo_task" : "complete_task",
        eventDetailJson: JSON.stringify({
          taskId: task.id,
          taskCode: task.taskTemplate.taskCode,
          reward: round(Math.abs(reward), 3),
          previousScore: previousScoreForLog,
          nextMetricScore,
          nextMetricRank
        })
      }
    });

    const metrics = await tx.userMetric.findMany({
      where: { userId: task.userId },
      include: { metricDefinition: true },
      orderBy: { metricDefinition: { displayOrder: "asc" } }
    });

    return {
      reward: round(Math.abs(reward), 3),
      task: updatedTask,
      metrics: metrics.map((item) => ({
        metricCode: item.metricDefinition.code,
        metricName: item.metricDefinition.name,
        score: item.score
      }))
    };
  });
}
