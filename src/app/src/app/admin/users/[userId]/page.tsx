
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/page-auth";
import { AdminNav } from "@/components/account/admin-nav";
import { parseJson } from "@/lib/safe-json";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  await requireAdminPage();
  const { userId } = await params;

  const [user, metrics, inputs, results, tasks] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userMetric.findMany({ where: { userId }, include: { metricDefinition: true }, orderBy: { metricDefinition: { displayOrder: "asc" } } }),
    prisma.metricInput.findMany({ where: { userId }, include: { metricDefinition: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.levelingResult.findMany({ where: { userId }, include: { metricDefinition: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.generatedTask.findMany({ where: { userId }, orderBy: { scheduledDate: "desc" }, take: 20 })
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
      <AdminNav />
      <div className="space-y-4">
        <section className="card p-4">
          <div className="section-title">User detail</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="card-soft p-3"><div className="text-muted">Email</div><div className="font-bold">{user.email ?? "-"}</div></div>
            <div className="card-soft p-3"><div className="text-muted">Type</div><div className="font-bold">{user.userType}</div></div>
            <div className="card-soft p-3"><div className="text-muted">Age / group</div><div className="font-bold">{user.ageSnapshot ?? "-"} / {user.ageGroup ?? "-"}</div></div>
            <div className="card-soft p-3"><div className="text-muted">Occupation</div><div className="font-bold">{user.occupation ?? "-"}</div></div>
            <div className="card-soft p-3"><div className="text-muted">Region</div><div className="font-bold">{user.regionName}</div></div>
            <div className="card-soft p-3"><div className="text-muted">Overall</div><div className="font-bold">{user.currentOverallScore.toFixed(2)} / {user.currentRankCode}</div></div>
          </div>
        </section>

        <section className="card p-4">
          <div className="section-title">Current metric results</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <div key={metric.metricDefinition.code} className="card-soft p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">{metric.metricDefinition.code}</div>
                <div className="mt-1 text-xl font-black">{metric.score.toFixed(2)}</div>
                <div className="text-sm text-muted">{metric.rankCode} · {metric.confidenceStatus}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="section-title">Input history</div>
          <div className="mt-3 space-y-3 text-sm">
            {inputs.map((item) => (
              <div key={item.id} className="card-soft p-3">
                <div className="font-bold">{item.metricDefinition.code}</div>
                <pre className="mt-2 overflow-x-auto text-xs text-muted">{JSON.stringify(parseJson(item.rawInputJson, {}), null, 2)}</pre>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="section-title">Calculation debug</div>
          <div className="mt-3 space-y-3 text-sm">
            {results.map((item) => (
              <div key={item.id} className="card-soft p-3">
                <div className="font-bold">{item.metricDefinition.code} · {item.finalScore.toFixed(2)} · {item.rankCode}</div>
                <div className="text-xs text-muted">logic_version: {item.logicVersion}</div>
                <pre className="mt-2 overflow-x-auto text-xs text-muted">{JSON.stringify(parseJson(item.calculationDetailJson, {}), null, 2)}</pre>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="section-title">Recent tasks</div>
          <div className="mt-3 space-y-2 text-sm">
            {tasks.map((task) => (
              <div key={task.id} className="card-soft p-3">
                <div className="font-bold">{task.title}</div>
                <div className="text-muted">{task.metricCode} · {task.status} · {task.scheduledDate}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
