"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { getDisplayRank, getNextRankTarget, getRankVisualByScore } from "@/config/rank-visual";

export type RadarPoint = {
  metricCode: string;
  current: number;
  baseline?: number;
  age?: number;
  region?: number;
};

type RadarPointWithVisual = RadarPoint & {
  metricLabel: string;
  displayRank: string;
  rankColor: string;
  rankGlow: string;
};

function renderRadarTick(points: RadarPointWithVisual[]) {
  return function RadarTick(props: any) {
    const { x, y, payload } = props;
    const centerX = props.cx ?? props.viewBox?.cx ?? 0;
    const centerY = props.cy ?? props.viewBox?.cy ?? 0;
    const dx = Number(x) - Number(centerX);
    const dy = Number(y) - Number(centerY);
    const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const labelX = Number(x) + (dx / length) * 34;
    const labelY = Number(y) + (dy / length) * 34;
    const point = points.find((item) => item.metricLabel === payload?.value);
    const metricCode = point?.metricCode ?? String(payload?.value ?? "");
    const displayRank = point?.displayRank ?? "E-";
    const color = point?.rankColor ?? "currentColor";

    return (
      <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central" className="radar-axis-tick">
        <tspan x={labelX} dy="-0.35em" fill="currentColor" opacity="0.88" fontSize="12" fontWeight="900">
          {metricCode}
        </tspan>
        <tspan x={labelX} dy="1.35em" fill={color} fontSize="15" fontWeight="950">
          {displayRank}
        </tspan>
      </text>
    );
  };
}

export function MetricsRadarChart({
  data,
  visible,
  loadingBenchmarks,
  overallScore
}: {
  data: RadarPoint[];
  visible: { baseline: boolean; age: boolean; region: boolean };
  loadingBenchmarks: boolean;
  overallScore?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [animateRadar, setAnimateRadar] = useState(true);
  const [radarAnimationKey, setRadarAnimationKey] = useState(0);
  const previousSignatureRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const visualData = useMemo<RadarPointWithVisual[]>(() => {
    return data.map((point) => {
      const display = getDisplayRank(point.current);
      const visual = getRankVisualByScore(point.current);
      return {
        ...point,
        metricLabel: `${point.metricCode}-${display.label}`,
        displayRank: display.label,
        rankColor: visual.color,
        rankGlow: visual.glowColor
      };
    });
  }, [data]);

  const dataSignature = useMemo(() => {
    return visualData
      .map((point) => [point.metricCode, point.current, point.baseline ?? "", point.age ?? "", point.region ?? ""].join(":"))
      .join("|");
  }, [visualData]);

  useEffect(() => {
    if (!dataSignature) return;
    if (previousSignatureRef.current === dataSignature) return;

    previousSignatureRef.current = dataSignature;
    setAnimateRadar(true);
    setRadarAnimationKey((current) => current + 1);

    const timer = window.setTimeout(() => setAnimateRadar(false), 1150);
    return () => window.clearTimeout(timer);
  }, [dataSignature]);

  const overall = getNextRankTarget(overallScore ?? 0);
  const overallVisual = getRankVisualByScore(overallScore ?? 0);
  const isFireRank = overallVisual.code === "S";
  const isMythicRank = overallVisual.code === "SS";

  return (
    <div className={`card p-4 rank-panel ${overallVisual.effectClass}`} style={{ ["--rank-color" as string]: overallVisual.color, ["--rank-glow" as string]: overallVisual.glowColor, ["--rank-border" as string]: overallVisual.borderColor }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="section-title">Character Stats</div>
          <div className="mt-1 text-sm text-muted">Current profile</div>
        </div>
        <div className="overall-rank-card" style={{ ["--rank-gradient" as string]: overallVisual.chipGradient, ["--rank-color" as string]: overallVisual.color, ["--rank-glow" as string]: overallVisual.glowColor }}>
          <div className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-muted">Overall</div>
          <div className={`rank-letter ${overallVisual.effectClass} ${isFireRank ? "fire-rank-text" : ""}`} data-rank={overall.current.label} style={{ color: overallVisual.color }}>{overall.current.label}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-chip">Current</span>
        {visible.baseline ? <span className="inline-chip" style={{ color: "#ff7b7b" }}>Baseline</span> : null}
        {visible.age ? <span className="inline-chip" style={{ color: "#c084fc" }}>Age</span> : null}
        {visible.region ? <span className="inline-chip" style={{ color: "#facc15" }}>Region</span> : null}
        {loadingBenchmarks ? <span className="inline-chip"><span className="spinner" /> Loading</span> : null}
      </div>

      <div className="radar-stage mx-auto mt-3" style={{ width: "100%", height: 430, minHeight: 410 }}>
        {isFireRank ? <div className="flame-frame" aria-hidden="true"><span className="flame-strip flame-strip-top" /><span className="flame-strip flame-strip-right" /><span className="flame-strip flame-strip-bottom" /><span className="flame-strip flame-strip-left" /></div> : null}
        {isMythicRank ? <div className="mythic-field" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div> : null}
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={visualData} cx="50%" cy="50%" outerRadius="78%" margin={{ top: 54, right: 54, bottom: 54, left: 54 }}>
              <defs>
                <filter id="currentRadarGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <PolarGrid stroke="rgba(121,212,255,0.18)" radialLines />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <PolarAngleAxis dataKey="metricLabel" tick={renderRadarTick(visualData)} tickLine={false} />
              {visible.baseline ? <Radar dataKey="baseline" name="Baseline" stroke="#ff7b7b" fill="#ff7b7b" fillOpacity={0.06} strokeOpacity={0.55} isAnimationActive={false} /> : null}
              {visible.age ? <Radar dataKey="age" name="Age average" stroke="#c084fc" fill="#c084fc" fillOpacity={0.06} strokeOpacity={0.55} isAnimationActive={false} /> : null}
              {visible.region ? <Radar dataKey="region" name="Region average" stroke="#facc15" fill="#facc15" fillOpacity={0.06} strokeOpacity={0.55} isAnimationActive={false} /> : null}
              <Radar
                key={radarAnimationKey}
                dataKey="current"
                name="Current"
                stroke={overallVisual.color}
                fill={overallVisual.color}
                fillOpacity={0.26}
                strokeWidth={3}
                filter="url(#currentRadarGlow)"
                isAnimationActive={animateRadar}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="card-soft h-full min-h-[340px] animate-pulse" />
        )}
      </div>
    </div>
  );
}
