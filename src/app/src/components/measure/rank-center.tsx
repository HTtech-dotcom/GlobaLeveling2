export function RankCenter({ rank }: { rank: { currentRankCode: string; averageScore: number; floorScore: number } | null }) {
  const average = typeof rank?.averageScore === "number" ? rank.averageScore.toFixed(2) : "0.00";
  const floor = typeof rank?.floorScore === "number" ? rank.floorScore.toFixed(2) : "0.00";

  return (
    <div className="card p-4">
      <div className="text-lg font-black text-white">Rank Center</div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="card-soft p-3">
          <div className="text-xs text-slate-400">Rank</div>
          <div className="mt-1 text-xl font-black text-white">{rank?.currentRankCode ?? "E"}</div>
        </div>
        <div className="card-soft p-3">
          <div className="text-xs text-slate-400">Average</div>
          <div className="mt-1 text-xl font-black text-white">{average}</div>
        </div>
        <div className="card-soft p-3">
          <div className="text-xs text-slate-400">Floor</div>
          <div className="mt-1 text-xl font-black text-white">{floor}</div>
        </div>
      </div>
    </div>
  );
}
