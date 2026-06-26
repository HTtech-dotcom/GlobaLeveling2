
import { NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { applyTaskCompletion } from "@/features/tasks";
import { buildBootstrapState } from "@/features/bootstrap";
import { summarizeTask } from "@/features/task-summary";
import { prisma } from "@/lib/prisma";
import { toPublicMetricCode } from "@/config/metrics";

export async function POST(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;

  const { taskId } = await context.params;
  const task = await prisma.generatedTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== auth.user.id) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  try {
    const result = await applyTaskCompletion(taskId, {
      undo: false,
      workedToday: typeof body?.workedToday === "string" ? body.workedToday : undefined,
      workQuality: typeof body?.workQuality === "string" ? body.workQuality : undefined
    });
    const state = await buildBootstrapState(auth.user.id);

    return NextResponse.json({
      message: "Task completed.",
      metricCode: toPublicMetricCode(result.task.metricCode),
      reward: result.reward,
      task: summarizeTask(result.task),
      ...state
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Task completion failed." },
      { status: 400 }
    );
  }
}
