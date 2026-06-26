
"use client";

export type ComparisonRow = {
  metricCode: string;
  baseline: number;
  age: number;
  region: number;
};

export function ComparisonPanel({
  visible,
  onToggle,
  loading
}: {
  visible: { baseline: boolean; age: boolean; region: boolean };
  onToggle: (key: "baseline" | "age" | "region") => void;
  loading: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="section-title">Compare on radar</div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <label className="card-soft flex items-center gap-2 p-3 text-sm">
          <input checked={visible.baseline} onChange={() => onToggle("baseline")} type="checkbox" />
          Baseline
        </label>
        <label className="card-soft flex items-center gap-2 p-3 text-sm">
          <input checked={visible.age} onChange={() => onToggle("age")} type="checkbox" />
          Age
        </label>
        <label className="card-soft flex items-center gap-2 p-3 text-sm">
          <input checked={visible.region} onChange={() => onToggle("region")} type="checkbox" />
          Region
        </label>
      </div>
      {loading ? <div className="mt-3 text-sm text-muted">Loading compare...</div> : null}
    </div>
  );
}
