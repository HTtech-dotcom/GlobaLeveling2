export function RankCenter({ rank }: { rank: { currentRankCode: string; averageScore: number; floorScore: number } | null }) {
  const average = typeof rank?.averageScore === "number" ? rank.averageScore.toFixed(2) : "0.00";
  const floor = typeof rank?.floorScore === "number" ? rank.floorScore.toFixed(2) : "0.00";

  return (
    <div className="card p-4">
      <div className="text-lg font-black">Rank Center</div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="card-soft p-3">
          <div className="text-xs text-muted">Rank</div>
          <div className="mt-1 text-xl font-black">{rank?.currentRankCode ?? "E"}</div>
        </div>
        <div className="card-soft p-3">
          <div className="text-xs text-muted">Average</div>
          <div className="mt-1 text-xl font-black">{average}</div>
        </div>
        <div className="card-soft p-3">
          <div className="text-xs text-muted">Floor</div>
          <div className="mt-1 text-xl font-black">{floor}</div>
        </div>
      </div>
    </div>
  );
}
