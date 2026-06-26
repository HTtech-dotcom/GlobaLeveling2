
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/page-auth";
import { AdminNav } from "@/components/account/admin-nav";

function sectionCard(title: string, value: string | number) {
  return (
    <div className="card-soft p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-muted">{title}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const [totalUsers, activeUsers, attempts, avgScoreRows, byAgeRows, byRegionRows] = await Promise.all([
    prisma.user.count({ where: { userType: "real_user" } }),
    prisma.user.count({ where: { userType: "real_user", lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.metricInput.count({ where: { user: { userType: "real_user" } } }),
    prisma.user.findMany({ where: { userType: "real_user" }, select: { currentOverallScore: true }, take: 500 }),
    prisma.user.groupBy({ by: ["ageGroup"], where: { userType: "real_user" }, _count: { ageGroup: true } }),
    prisma.user.groupBy({ by: ["regionName"], where: { userType: "real_user" }, _count: { regionName: true } })
  ]);

  const averageOverall = avgScoreRows.length
    ? (avgScoreRows.reduce((sum, row) => sum + row.currentOverallScore, 0) / avgScoreRows.length).toFixed(2)
    : "0.00";

  return (
    <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
      <AdminNav />
      <div className="space-y-4">
        <section className="card p-4">
          <div className="badge">ADMIN</div>
          <h2 className="mt-3 text-2xl font-black">Dashboard</h2>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {sectionCard("Users", totalUsers)}
          {sectionCard("Active 7d", activeUsers)}
          {sectionCard("Inputs", attempts)}
          {sectionCard("Avg overall", averageOverall)}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="card p-4">
            <div className="section-title">Age groups</div>
            <div className="mt-3 space-y-2 text-sm">
              {byAgeRows.map((row) => (
                <div key={row.ageGroup ?? "unknown"} className="flex items-center justify-between">
                  <span className="text-muted">{row.ageGroup ?? "Unknown"}</span>
                  <span className="font-bold">{row._count.ageGroup}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="section-title">Regions</div>
            <div className="mt-3 space-y-2 text-sm">
              {byRegionRows.map((row) => (
                <div key={row.regionName ?? "unknown"} className="flex items-center justify-between">
                  <span className="text-muted">{row.regionName ?? "Unknown"}</span>
                  <span className="font-bold">{row._count.regionName}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link className="action-btn text-center" href="/admin/users">Users</Link>
          <Link className="ghost-btn text-center" href="/admin/results">Results</Link>
        </section>
      </div>
    </div>
  );
}
