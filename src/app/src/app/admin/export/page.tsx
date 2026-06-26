
import { requireAdminPage } from "@/lib/page-auth";
import { AdminNav } from "@/components/account/admin-nav";

const exportOptions = [
  { key: "users.csv", desc: "Users, profile, status, segmentation" },
  { key: "leveling_results.csv", desc: "Metric score history" },
  { key: "metric_inputs.csv", desc: "Raw inputs and normalized inputs" },
  { key: "tasks.csv", desc: "Generated tasks and reasons" },
  { key: "feedback.csv", desc: "Feedback" },
  { key: "error_logs.csv", desc: "System logs" }
];

export default async function AdminExportPage() {
  await requireAdminPage();

  return (
    <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
      <AdminNav />
      <div className="card p-4">
        <div className="section-title">Export</div>
        <div className="mt-4 space-y-3">
          {exportOptions.map((item) => (
            <div key={item.key} className="card-soft p-3">
              <div className="font-bold">{item.key}</div>
              <div className="text-sm text-muted">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
