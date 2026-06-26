
import { NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { startTaskTimer } from "@/features/tasks";
import { summarizeTask } from "@/features/task-summary";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, context: { params: Promise<{ taskId: string }> }) {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;

  const { taskId } = await context.params;
  const task = await prisma.generatedTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== auth.user.id) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  const updated = await startTaskTimer(taskId);
  return NextResponse.json({
    message: "Timer started.",
    task: summarizeTask(updated)
  });
}
