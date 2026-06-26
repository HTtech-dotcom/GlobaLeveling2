
import { requireAdminPage } from "@/lib/page-auth";
import { AdminNav } from "@/components/account/admin-nav";
import { metricCatalog, LOGIC_VERSION, TASK_LOGIC_VERSION, rankBands } from "@/config/metrics";

export default async function AdminLogicPage() {
  await requireAdminPage();

  return (
    <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
      <AdminNav />
      <div className="space-y-4">
        <section className="card p-4">
          <div className="section-title">Logic</div>
          <div className="mt-3 space-y-2 text-sm">
            <div>Score: <span className="font-bold">{LOGIC_VERSION}</span></div>
            <div>Task engine: <span className="font-bold">{TASK_LOGIC_VERSION}</span></div>
          </div>
        </section>

        <section className="card p-4">
          <div className="section-title">Metric catalog</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {metricCatalog.map((metric) => (
              <div key={metric.code} className="card-soft p-3">
                <div className="font-bold">{metric.code} · {metric.name}</div>
                <div className="text-sm text-muted">Loop active: {metric.isLoopActive ? "yes" : "no"}</div>
                <div className="text-sm text-muted">Unit: {metric.unitLabel}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="section-title">Rank bands</div>
          <div className="mt-3 space-y-2 text-sm">
            {rankBands.map((band) => (
              <div key={band.code} className="card-soft flex items-center justify-between p-3">
                <span className="font-bold">{band.code}</span>
                <span className="text-muted">{band.min} - {band.max}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
