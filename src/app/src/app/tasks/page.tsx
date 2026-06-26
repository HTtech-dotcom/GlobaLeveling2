
import { requireCompletedMeasurementPage } from "@/lib/page-auth";
import { TaskList } from "@/components/tasks/task-list";

export default async function TasksPage() {
  await requireCompletedMeasurementPage();

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="badge">Today</div>
        <h2 className="mt-3 text-2xl font-black">Tasks</h2>
      </section>
      <TaskList />
    </div>
  );
}
