
import { NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { ensureTodayTasks } from "@/features/tasks";
import { summarizeTask } from "@/features/task-summary";

export async function GET() {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;

  const tasks = await ensureTodayTasks(auth.user.id);

  return NextResponse.json({
    tasks: tasks.map(summarizeTask)
  });
}
