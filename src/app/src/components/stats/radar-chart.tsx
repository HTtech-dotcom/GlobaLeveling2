"use client";

import { useEffect, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

export type RadarPoint = {
  metricCode: string;
  current: number;
  baseline?: number;
  age?: number;
  region?: number;
};

export function MetricsRadarChart({
  data,
  visible,
  loadingBenchmarks
}: {
  data: RadarPoint[];
  visible: { baseline: boolean; age: boolean; region: boolean };
  loadingBenchmarks: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="section-title">Radar Overview</div>
        {loadingBenchmarks ? (
          <div className="inline-chip"><span className="spinner" /> Đang tải benchmark</div>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="inline-chip">Current</span>
        {visible.baseline ? <span className="inline-chip" style={{ color: "#ff7b7b" }}>Baseline</span> : null}
        {visible.age ? <span className="inline-chip" style={{ color: "#c084fc" }}>Age</span> : null}
        {visible.region ? <span className="inline-chip" style={{ color: "#facc15" }}>Region</span> : null}
      </div>

      <div style={{ width: "100%", height: 290, minHeight: 290 }}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="rgba(121,212,255,0.18)" />
              <PolarAngleAxis dataKey="metricCode" stroke="currentColor" />
              <Radar dataKey="current" name="Current" stroke="#37b7ff" fill="#37b7ff" fillOpacity={0.28} />
              {visible.baseline ? <Radar dataKey="baseline" name="Baseline" stroke="#ff7b7b" fill="#ff7b7b" fillOpacity={0.08} /> : null}
              {visible.age ? <Radar dataKey="age" name="Age average" stroke="#c084fc" fill="#c084fc" fillOpacity={0.08} /> : null}
              {visible.region ? <Radar dataKey="region" name="Region average" stroke="#facc15" fill="#facc15" fillOpacity={0.08} /> : null}
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="card-soft h-full min-h-[290px] animate-pulse" />
        )}
      </div>
    </div>
  );
}
