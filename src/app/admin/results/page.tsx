
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/page-auth";
import { AdminNav } from "@/components/account/admin-nav";
import { parseJson } from "@/lib/safe-json";

export default async function AdminResultsPage() {
  await requireAdminPage();

  const results = await prisma.levelingResult.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, metricDefinition: true },
    take: 100
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
      <AdminNav />
      <div className="card overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="section-title">Results</div>
        </div>
        <div className="space-y-3 p-4">
          {results.map((result) => (
            <div key={result.id} className="card-soft p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">{result.user.name} · {result.metricDefinition.code}</div>
                <div className="text-xs text-muted">{result.logicVersion}</div>
              </div>
              <div className="mt-1 text-sm text-muted">raw {result.rawScore.toFixed(2)} → final {result.finalScore.toFixed(2)} ({result.rankCode})</div>
              <pre className="mt-2 overflow-x-auto text-xs text-muted">{JSON.stringify(parseJson(result.calculationDetailJson, {}), null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
