
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";
import { getAgeGroup } from "../src/config/metrics";
import { getRank, calculateRank } from "../src/features/rank";
import { getProfession } from "../src/config/job-taxonomy";

const prisma = new PrismaClient();

const metricDefinitions = [
  { code: "STR", name: "Strength", unitLabel: "score", displayOrder: 1, aggregationMethod: "average_of_three", isLoopActive: true },
  { code: "DUR", name: "Endurance", unitLabel: "score", displayOrder: 2, aggregationMethod: "single_measure", isLoopActive: true },
  { code: "SPD", name: "Speed", unitLabel: "score", displayOrder: 3, aggregationMethod: "single_measure", isLoopActive: true },
  { code: "INT", name: "Intelligence", unitLabel: "score", displayOrder: 4, aggregationMethod: "single_measure", isLoopActive: true },
  { code: "EMO", name: "Emotional Intelligence", unitLabel: "score", displayOrder: 5, aggregationMethod: "single_measure", isLoopActive: true },
  { code: "CRR", name: "Career", unitLabel: "score", displayOrder: 6, aggregationMethod: "weighted_composite", isLoopActive: true },
  { code: "HEA", name: "Health", unitLabel: "score", displayOrder: 7, aggregationMethod: "weighted_composite", isLoopActive: false }
] as const;

const taskTemplates = [
  ["STR", "STR-01", "training", "Bench Press loop", "Bench Press 3×12 + accessories", "str_cycle", 1, true, false, 30, "weight"],
  ["STR", "STR-02", "training", "Deadlift loop", "Deadlift 3×12 + accessories", "str_cycle", 2, true, false, 30, "weight"],
  ["STR", "STR-03", "training", "Squat loop", "Squat 3×12 + accessories", "str_cycle", 3, true, false, 30, "weight"],
  ["DUR", "DUR-01", "training", "Easy run", "Build base endurance", "dur_cycle", 1, true, false, 30, "distance"],
  ["DUR", "DUR-03", "training", "Long slow run", "Increase endurance capacity", "dur_cycle", 2, true, false, 45, "distance"],
  ["DUR", "DUR-04", "training", "Tempo run", "Improve sustained speed/endurance", "dur_cycle", 3, true, false, 35, "distance"],
  ["SPD", "SPD-03", "training", "100m sprint practice", "Practice 100m speed", "spd_cycle", 1, true, false, 25, "sprint"],
  ["SPD", "SPD-04", "training", "Shuttle suicide run", "Acceleration and repeated speed", "spd_cycle", 2, true, false, 25, "sprint"],
  ["INT", "INT-01", "study", "Chess / game analysis", "Hobby logic training", "hobby_logic", 1, true, false, 40, "duration"],
  ["INT", "INT-02", "study", "Sudoku", "Hobby logic training", "hobby_logic", 2, true, false, 40, "duration"],
  ["INT", "INT-03", "study", "Logic puzzle", "Hobby logic training", "hobby_logic", 3, true, false, 40, "duration"],
  ["INT", "INT-04", "study", "Vocabulary learning", "Language learning", "language", 1, true, false, 40, "duration"],
  ["INT", "INT-05", "study", "Grammar drill", "Language learning", "language", 2, true, false, 40, "duration"],
  ["INT", "INT-06", "study", "Listening / shadowing", "Language learning", "language", 3, true, false, 40, "duration"],
  ["INT", "INT-07", "study", "Read analytical article", "Reading analysis", "reading", 1, true, false, 40, "duration"],
  ["INT", "INT-08", "study", "Read profession-related article", "Reading analysis", "reading", 2, true, false, 40, "duration"],
  ["INT", "INT-09", "study", "Argument map", "Reading analysis", "reading", 3, true, false, 40, "duration"],
  ["EMO", "EMO-01", "emotional", "Emotion journal", "Write main emotion, trigger, reaction, better response", "emo_pool", 1, true, false, 25, "duration"],
  ["EMO", "EMO-02", "emotional", "Trigger log", "Identify what caused a strong reaction", "emo_pool", 2, true, false, 25, "duration"],
  ["EMO", "EMO-03", "emotional", "Non-KPI hobby", "Do a hobby without KPI", "emo_pool", 3, true, false, 25, "duration"],
  ["EMO", "EMO-04", "emotional", "Perspective taking", "Explain another person's viewpoint", "emo_pool", 4, true, false, 25, "duration"],
  ["EMO", "EMO-05", "emotional", "Read opposing view", "Summarize before reacting", "emo_pool", 5, true, false, 25, "duration"],
  ["CRR", "JOB-01", "career", "Certificate / professional learning", "90-minute study loop", "job_loop", 1, true, false, 90, "duration"],
  ["CRR", "JOB-CHECK", "career", "Daily work check", "Log whether you worked today. This does not consume a loop.", "job_daily", 0, false, true, 5, "check"]
] as const;

const occupations = ["student", "auditor", "software_engineer", "investment_analyst", "management_consultant", "doctor", "lawyer", "data_analyst", "general_professional"];
const regions = [
  { code: "VN-HN", name: "Hanoi" },
  { code: "VN-HCM", name: "Ho Chi Minh City" },
  { code: "VN-DN", name: "Da Nang" },
  { code: "SG-SG", name: "Singapore" }
];

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function scoreSet(index: number) {
  const rnd = seeded(index + 42);
  const age = 18 + Math.floor(rnd() * 18);
  const occ = occupations[Math.floor(rnd() * occupations.length)];
  const region = regions[Math.floor(rnd() * regions.length)];
  const jobBase = occ === "student" ? 18 : occ === "auditor" ? 55 : occ === "software_engineer" ? 60 : occ === "doctor" || occ === "lawyer" ? 62 : 45;
  return {
    age,
    occupation: occ,
    region,
    scores: {
      STR: Math.min(100, 20 + rnd() * 60 + (occ === "software_engineer" ? -5 : 0)),
      DUR: Math.min(100, 18 + rnd() * 55),
      SPD: Math.min(100, 18 + rnd() * 50),
      INT: Math.min(100, 35 + rnd() * 55 + (occ === "software_engineer" || occ === "management_consultant" ? 8 : 0)),
      EMO: Math.min(100, 30 + rnd() * 50),
      CRR: Math.min(100, jobBase + rnd() * 25),
      HEA: Math.min(100, 35 + rnd() * 45)
    }
  };
}

async function main() {
  await prisma.generatedTask.deleteMany();
  await prisma.taskTemplate.deleteMany();
  await prisma.levelingResult.deleteMany();
  await prisma.metricInput.deleteMany();
  await prisma.userMetric.deleteMany();
  await prisma.session.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.systemLog.deleteMany();
  await prisma.exportLog.deleteMany();
  await prisma.virtualUserMetadata.deleteMany();
  await prisma.metricDefinition.deleteMany();
  await prisma.user.deleteMany();

  const definitions: Array<{ id: string; code: string }> = [];
  for (const metric of metricDefinitions) {
    definitions.push(await prisma.metricDefinition.create({ data: metric as any }));
  }
  const metricIdByCode = Object.fromEntries(definitions.map((item) => [item.code, item.id]));

  for (const [metricCode, taskCode, taskType, title, description, cycleGroup, cycleOrder, isLoop, isDaily, estimatedMinutes, volumeType] of taskTemplates) {
    await prisma.taskTemplate.create({
      data: {
        taskCode,
        metricDefinitionId: metricIdByCode[metricCode],
        taskType,
        title,
        description,
        cycleGroup,
        cycleOrder,
        isLoop,
        isDaily,
        estimatedMinutes,
        volumeType
      }
    });
  }

  const admin = await prisma.user.create({
    data: {
      email: "admin@globaleveling.local",
      passwordHash: await hashPassword("admin12345"),
      name: "Founder Admin",
      role: "ADMIN",
      userType: "real_user",
      status: "active",
      ageSnapshot: 27,
      ageGroup: getAgeGroup(27),
      occupation: "management_consultant",
      occupationCategory: getProfession("management_consultant").industryGroupCode,
      regionCode: "VN-HCM",
      regionName: "Ho Chi Minh City",
      country: "Vietnam",
      currentPlanCode: "balanced",
      trainingIntensity: "balanced",
      hasCompletedInitialMeasurement: true,
      currentJobCode: "management_consultant"
    }
  });

  const adminMetrics = [
    { code: "STR", score: 52 },
    { code: "DUR", score: 58 },
    { code: "SPD", score: 49 },
    { code: "INT", score: 78 },
    { code: "EMO", score: 71 },
    { code: "CRR", score: 65 },
    { code: "HEA", score: 74 }
  ];
  const adminRank = calculateRank(adminMetrics.map((item) => ({ metricCode: item.code, score: item.score })));

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      currentRankCode: adminRank.currentRankCode,
      currentOverallScore: adminRank.overallScore
    }
  });

  for (const metric of adminMetrics) {
    const metricId = metricIdByCode[metric.code];
    await prisma.userMetric.create({
      data: {
        userId: admin.id,
        metricDefinitionId: metricId,
        score: metric.score,
        rankCode: getRank(metric.score),
        confidenceStatus: "complete",
        rawValueJson: JSON.stringify({ demo: true }),
        lastMeasuredAt: new Date()
      }
    });
  }

  for (let index = 0; index < 140; index += 1) {
    const profile = scoreSet(index);
    const synthetic = await prisma.user.create({
      data: {
        name: `Virtual_${profile.occupation}_${profile.region.code}_${index + 1}`,
        role: "USER",
        userType: "virtual_user",
        status: "active",
        ageSnapshot: profile.age,
        ageGroup: getAgeGroup(profile.age),
        occupation: profile.occupation,
        occupationCategory: getProfession(profile.occupation).industryGroupCode,
        regionCode: profile.region.code,
        regionName: profile.region.name,
        country: profile.region.code.startsWith("SG") ? "Singapore" : "Vietnam",
        currentPlanCode: index % 2 === 0 ? "balanced" : index % 3 === 0 ? "physique_oriented" : "intelligent_oriented",
        trainingIntensity: index % 3 === 0 ? "slow" : index % 3 === 1 ? "balanced" : "fast",
        hasCompletedInitialMeasurement: true,
        currentJobCode: profile.occupation
      }
    });

    const syntheticMetrics = Object.entries(profile.scores).map(([code, score]) => ({ code, score }));
    const rank = calculateRank(syntheticMetrics.map((item) => ({ metricCode: item.code, score: item.score })));
    await prisma.user.update({
      where: { id: synthetic.id },
      data: {
        currentRankCode: rank.currentRankCode,
        currentOverallScore: rank.overallScore
      }
    });

    for (const metric of syntheticMetrics) {
      await prisma.userMetric.create({
        data: {
          userId: synthetic.id,
          metricDefinitionId: metricIdByCode[metric.code],
          score: Number(metric.score.toFixed(2)),
          rankCode: getRank(metric.score),
          confidenceStatus: "complete",
          rawValueJson: JSON.stringify({ synthetic: true, seed: index })
        }
      });
    }

    await prisma.virtualUserMetadata.create({
      data: {
        userId: synthetic.id,
        scenarioType: "benchmark",
        scenarioName: "proposal_seed_v1",
        batchId: "seed_batch_001",
        createdBy: "seed.ts",
        simulationConfigJson: JSON.stringify({ source: "proposal documents" })
      }
    });
  }

  console.log("Seed completed.");
  console.log("Admin login: admin@globaleveling.local / admin12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
