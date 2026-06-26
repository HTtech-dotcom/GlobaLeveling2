
import { toPublicMetricCode } from "@/config/metrics";
import { parseJson } from "@/lib/safe-json";

export type TaskSummary = {
  id: string;
  metricCode: string;
  title: string;
  description: string;
  status: string;
  rewardGranted: number | null;
  isLoop: boolean;
  taskType: string;
  volumeMain: string | null;
  volumeAccessories: string[];
  requiredMinutes: number | null;
  timerStartedAt: string | null;
  workCheck: boolean;
  workStatus: string | null;
  workQuality: string | null;
};

export function summarizeTask(task: {
  id: string;
  metricCode: string;
  title: string;
  description: string;
  status: string;
  rewardGranted: number | null;
  isLoop: boolean;
  taskType: string;
  volumeJson: string | null;
}) : TaskSummary {
  const volume = parseJson<Record<string, unknown>>(task.volumeJson, {});
  return {
    id: task.id,
    metricCode: toPublicMetricCode(task.metricCode),
    title: task.title,
    description: task.description,
    status: task.status,
    rewardGranted: task.rewardGranted,
    isLoop: task.isLoop,
    taskType: task.taskType,
    volumeMain: typeof volume.main === "string" ? volume.main : null,
    volumeAccessories: Array.isArray(volume.accessories) ? volume.accessories.filter((item): item is string => typeof item === "string") : [],
    requiredMinutes: typeof volume.requiredMinutes === "number" ? volume.requiredMinutes : null,
    timerStartedAt: typeof volume.timerStartedAt === "string" ? volume.timerStartedAt : null,
    workCheck: volume.workCheck === true,
    workStatus: typeof volume.workStatus === "string" ? volume.workStatus : null,
    workQuality: typeof volume.workQuality === "string" ? volume.workQuality : null
  };
}
