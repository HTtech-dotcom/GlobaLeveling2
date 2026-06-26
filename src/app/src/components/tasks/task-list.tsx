
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CompletionToast } from "./completion-toast";
import { safeJson } from "@/lib/safe-json";
import { useAppData } from "@/components/providers/app-data-provider";

type TaskItem = {
  id: string;
  metricCode: string;
  title: string;
  description: string;
  status: string;
  rewardGranted: number | null;
  isLoop?: boolean;
  taskType?: string;
  volumeMain?: string | null;
  volumeAccessories?: string[];
  requiredMinutes?: number | null;
  timerStartedAt?: string | null;
  workCheck?: boolean;
  workStatus?: string | null;
  workQuality?: string | null;
};

type CompleteOrUndoPayload = {
  message?: string;
  metricCode?: string;
  reward?: number;
  task?: TaskItem;
  metrics?: any;
  rank?: any;
  user?: any;
};

function isTaskItem(value: unknown): value is TaskItem {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    typeof task.metricCode === "string" &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    typeof task.status === "string"
  );
}

function sanitizeTasks(input: unknown): TaskItem[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isTaskItem);
}

function isTimedTask(task: TaskItem) {
  return Boolean(task.isLoop && ["INT", "EMO", "CRR"].includes(task.metricCode) && typeof task.requiredMinutes === "number" && task.requiredMinutes > 0);
}

function formatMsAsClock(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function TaskList() {
  const { applyBootstrapPatch } = useAppData();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [toast, setToast] = useState<{ metricCode: string; reward: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMenuTaskId, setActionMenuTaskId] = useState<string | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<Record<string, boolean>>({});
  const [workTodayByTaskId, setWorkTodayByTaskId] = useState<Record<string, string>>({});
  const [workQualityByTaskId, setWorkQualityByTaskId] = useState<Record<string, string>>({});
  const [now, setNow] = useState(Date.now());
  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function loadTasks() {
    setLoading(true);
    const response = await fetch("/api/tasks", { cache: "no-store" });
    const payload = await safeJson<{ tasks?: unknown[] }>(response);
    const nextTasks = response.ok ? sanitizeTasks(payload?.tasks) : [];
    setTasks(nextTasks);
    setWorkTodayByTaskId(
      Object.fromEntries(nextTasks.filter((task) => task.workCheck).map((task) => [task.id, task.workStatus ?? "yes"]))
    );
    setWorkQualityByTaskId(
      Object.fromEntries(nextTasks.filter((task) => task.workCheck).map((task) => [task.id, task.workQuality ?? "medium"]))
    );
    setLoading(false);
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  function setTaskPending(taskId: string, value: boolean) {
    setPendingTaskIds((current) => {
      const next = { ...current };
      if (value) next[taskId] = true;
      else delete next[taskId];
      return next;
    });
  }

  function patchTask(taskId: string, patch: Partial<TaskItem>) {
    setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, ...patch } : item)));
  }

  function replaceTask(taskId: string, nextTask?: TaskItem) {
    if (!nextTask) return;
    setTasks((current) => current.map((item) => (item.id === taskId ? nextTask : item)));
  }

  function openUndoMenu(taskId: string) {
    setActionMenuTaskId(taskId);
  }

  function startHold(taskId: string) {
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => openUndoMenu(taskId), 550);
  }

  function clearHold() {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }

  async function startTask(task: TaskItem) {
    if (!isTimedTask(task) || pendingTaskIds[task.id]) return;

    setTaskPending(task.id, true);
    patchTask(task.id, { status: "in_progress", timerStartedAt: new Date().toISOString() });

    const response = await fetch(`/api/tasks/${task.id}/start`, { method: "POST" });
    const payload = await safeJson<{ task?: TaskItem }>(response);

    if (!response.ok || !payload?.task) {
      await loadTasks();
      setTaskPending(task.id, false);
      return;
    }

    replaceTask(task.id, payload.task);
    setTaskPending(task.id, false);
  }

  async function completeTask(task: TaskItem) {
    if (task.status === "completed" || pendingTaskIds[task.id]) return;

    const previousTask = { ...task };
    setTaskPending(task.id, true);

    const response = await fetch(`/api/tasks/${task.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        task.workCheck
          ? {
              workedToday: workTodayByTaskId[task.id] ?? "yes",
              workQuality: workQualityByTaskId[task.id] ?? "medium"
            }
          : {}
      )
    });
    const payload = await safeJson<CompleteOrUndoPayload>(response);

    if (!response.ok) {
      patchTask(task.id, previousTask);
      setTaskPending(task.id, false);
      return;
    }

    if (payload?.task && isTaskItem(payload.task)) replaceTask(task.id, payload.task);
    if (payload?.metrics || payload?.rank || payload?.user) {
      applyBootstrapPatch({
        metrics: Array.isArray(payload.metrics) ? payload.metrics : undefined,
        rank: payload.rank !== null && typeof payload.rank === "object" ? payload.rank : undefined,
        user: payload.user !== null && typeof payload.user === "object" ? payload.user : undefined
      });
    }
    if (typeof payload?.metricCode === "string" && typeof payload?.reward === "number" && payload.reward > 0) {
      setToast({ metricCode: payload.metricCode, reward: payload.reward });
    }
    setTaskPending(task.id, false);
  }

  async function undoTask(task: TaskItem) {
    setActionMenuTaskId(null);
    if (task.status !== "completed" || pendingTaskIds[task.id]) return;
    const previousTask = { ...task };

    setTaskPending(task.id, true);
    patchTask(task.id, { status: "new", rewardGranted: null, timerStartedAt: null });

    const response = await fetch(`/api/tasks/${task.id}/undo`, { method: "POST" });
    const payload = await safeJson<CompleteOrUndoPayload>(response);

    if (!response.ok) {
      patchTask(task.id, previousTask);
      setTaskPending(task.id, false);
      return;
    }

    if (payload?.task && isTaskItem(payload.task)) replaceTask(task.id, payload.task);
    if (payload?.metrics || payload?.rank || payload?.user) {
      applyBootstrapPatch({
        metrics: Array.isArray(payload.metrics) ? payload.metrics : undefined,
        rank: payload.rank !== null && typeof payload.rank === "object" ? payload.rank : undefined,
        user: payload.user !== null && typeof payload.user === "object" ? payload.user : undefined
      });
    }
    setTaskPending(task.id, false);
  }

  const visibleTasks = useMemo(() => sanitizeTasks(tasks), [tasks]);

  if (loading) return <div className="card p-4 text-sm text-muted">Loading tasks...</div>;
  if (!visibleTasks.length) return <div className="card p-4 text-sm text-muted">No tasks available yet.</div>;

  return (
    <>
      <CompletionToast toast={toast} onClose={() => setToast(null)} />

      <div className="space-y-3">
        {visibleTasks.map((task) => {
          const syncing = Boolean(pendingTaskIds[task.id]);
          const timed = isTimedTask(task);
          const timerStartedAt = task.timerStartedAt ? new Date(task.timerStartedAt).getTime() : null;
          const requiredMs = (task.requiredMinutes ?? 0) * 60 * 1000;
          const remainingMs = timerStartedAt ? Math.max(0, requiredMs - (now - timerStartedAt)) : requiredMs;
          const canCompleteTimer = timed && timerStartedAt != null && remainingMs <= 0;

          return (
            <div
              key={task.id}
              className="card p-4"
              onContextMenu={(event) => {
                event.preventDefault();
                openUndoMenu(task.id);
              }}
              onTouchEnd={clearHold}
              onTouchStart={() => startHold(task.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="badge">{task.metricCode}</div>
                  <div className="mt-3 text-lg font-black">{task.title}</div>
                  <div className="mt-1 text-sm text-muted">{task.description}</div>
                  {task.volumeMain ? <div className="mt-3 text-sm text-sky-100">{task.volumeMain}</div> : null}
                  {task.volumeAccessories?.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-muted">
                      {task.volumeAccessories.map((line) => <li key={line}>• {line}</li>)}
                    </ul>
                  ) : null}
                  {timed ? (
                    <div className="mt-3 inline-chip">
                      {task.status === "in_progress"
                        ? `Time left ${formatMsAsClock(remainingMs)}`
                        : `Timer ${formatMsAsClock(requiredMs)}`}
                    </div>
                  ) : null}
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-bold ${task.status === "completed" ? "bg-emerald-400/15 text-emerald-300" : "bg-sky-400/12 text-sky-200"}`}>
                  {syncing ? "syncing..." : task.status}
                </div>
              </div>

              {task.workCheck ? (
                <div className="mt-4 grid gap-3">
                  <label className="block space-y-1">
                    <div className="text-sm text-muted">Worked today?</div>
                    <select
                      className="input"
                      disabled={syncing || task.status === "completed"}
                      value={workTodayByTaskId[task.id] ?? "yes"}
                      onChange={(event) => setWorkTodayByTaskId((current) => ({ ...current, [task.id]: event.target.value }))}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <div className="text-sm text-muted">Work quality</div>
                    <select
                      className="input"
                      disabled={syncing || task.status === "completed" || (workTodayByTaskId[task.id] ?? "yes") === "no"}
                      value={workQualityByTaskId[task.id] ?? "medium"}
                      onChange={(event) => setWorkQualityByTaskId((current) => ({ ...current, [task.id]: event.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                </div>
              ) : null}

              {timed && task.status === "new" ? (
                <button className="action-btn mt-4 w-full" disabled={syncing} onClick={() => void startTask(task)} type="button">
                  {syncing ? "Starting..." : "Start"}
                </button>
              ) : timed && task.status !== "completed" ? (
                <button
                  className="action-btn mt-4 w-full"
                  disabled={syncing || !canCompleteTimer}
                  onClick={() => void completeTask(task)}
                  type="button"
                >
                  {syncing ? "Saving..." : canCompleteTimer ? "Complete" : `Complete in ${formatMsAsClock(remainingMs)}`}
                </button>
              ) : (
                <button
                  className="action-btn mt-4 w-full"
                  disabled={task.status === "completed" || syncing}
                  onClick={() => void completeTask(task)}
                  type="button"
                >
                  {task.status === "completed"
                    ? `Completed (+${(task.rewardGranted ?? 0).toFixed(2)})`
                    : syncing ? "Saving..." : task.workCheck ? "Submit work check" : "Complete task"}
                </button>
              )}

              {actionMenuTaskId === task.id && task.status === "completed" ? (
                <div className="mt-3 card-soft p-3">
                  <div className="text-sm text-muted">Undo this completion?</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="ghost-btn" disabled={syncing} onClick={() => setActionMenuTaskId(null)} type="button">Cancel</button>
                    <button className="action-btn" disabled={syncing} onClick={() => void undoTask(task)} type="button">
                      {syncing ? "Saving..." : "Undo"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
