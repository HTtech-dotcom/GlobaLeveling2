import { requireCurrentUserPage } from "@/lib/page-auth";

export default async function RankTestPage() {
  await requireCurrentUserPage();

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="badge">Promotion</div>
        <h2 className="mt-3 text-2xl font-black text-white">Rank Test Placeholder</h2>
        <p className="mt-2 text-sm text-slate-300">Phase 11 keeps this placeholder while hardening online usage.</p>
      </section>
    </div>
  );
}
