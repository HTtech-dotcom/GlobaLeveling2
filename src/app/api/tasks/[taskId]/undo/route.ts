
import { NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { applyTaskCompletion } from "@/features/tasks";
import { buildBootstrapState } from "@/features/bootstrap";
import { summarizeTask } from "@/features/task-summary";
import { prisma } from "@/lib/prisma";
import { toPublicMetricCode } from "@/config/metrics";

export async function POST(_: Request, context: { params: Promise<{ taskId: string }> }) {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;

  const { taskId } = await context.params;
  const task = await prisma.generatedTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== auth.user.id) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  const result = await applyTaskCompletion(taskId, { undo: true });
  const state = await buildBootstrapState(auth.user.id);

  return NextResponse.json({
    message: "Task reverted.",
    metricCode: toPublicMetricCode(result.task.metricCode),
    reward: result.reward,
    task: summarizeTask(result.task),
    ...state
  });
}
