
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/components/providers/app-data-provider";
import { safeJson } from "@/lib/safe-json";
import { ComparisonPanel, type ComparisonRow } from "@/components/stats/comparison-panel";
import { MetricsRadarChart, type RadarPoint } from "@/components/stats/radar-chart";

type SettingsForm = {
  theme: string;
};

export function StatsWorkspace() {
  const { data, applyBootstrapPatch } = useAppData();
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [compareLoading, setCompareLoading] = useState(true);
  const [visible, setVisible] = useState({ baseline: true, age: false, region: false });
  const [settings, setSettings] = useState<SettingsForm>({
    theme: data.user?.theme ?? "dark"
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSettings({
      theme: data.user?.theme ?? "dark"
    });
  }, [data.user?.theme]);

  useEffect(() => {
    let active = true;
    async function load() {
      setCompareLoading(true);
      const response = await fetch("/api/comparisons", { cache: "no-store" });
      const payload = await safeJson<{ rows?: ComparisonRow[] }>(response);
      if (active) {
        setRows(payload?.rows ?? []);
        setCompareLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const radarData = useMemo<RadarPoint[]>(() => {
    return data.metrics.map((metric) => {
      const comparison = rows.find((row) => row.metricCode === metric.metricCode);
      return {
        metricCode: metric.metricCode,
        current: metric.score,
        baseline: comparison?.baseline,
        age: comparison?.age,
        region: comparison?.region
      };
    });
  }, [data.metrics, rows]);

  async function saveSettings() {
    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    const payload = await safeJson<{ message?: string; user?: typeof data.user }>(response);

    if (!response.ok || !payload) {
      setMessage(payload?.message ?? "Save failed.");
      return;
    }

    applyBootstrapPatch({ user: payload.user ?? undefined });
    setMessage(payload.message ?? "Saved.");
  }

  return (
    <div className="space-y-4">
      <MetricsRadarChart data={radarData} visible={visible} loadingBenchmarks={compareLoading} overallScore={data.rank?.overallScore ?? data.user?.currentOverallScore ?? 0} />
      <ComparisonPanel
        visible={visible}
        onToggle={(key) => setVisible((current) => ({ ...current, [key]: !current[key] }))}
        loading={compareLoading}
      />

      <section className="card p-4">
        <div className="section-title">Account</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link className="action-btn text-center" href="/account">Account settings</Link>
          {data.user?.role === "ADMIN"
            ? <Link className="ghost-btn text-center" href="/admin">Admin</Link>
            : <button className="ghost-btn text-center opacity-60" disabled type="button">User</button>}
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <div className="section-title">Settings</div>
        <label className="block space-y-1">
          <div className="text-sm text-muted">Theme</div>
          <select className="input" value={settings.theme} onChange={(event) => setSettings({ theme: event.target.value })}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <button className="action-btn w-full" onClick={() => void saveSettings()} type="button">Save settings</button>
        {message ? <div className="message-text text-sm">{message}</div> : null}
      </section>
    </div>
  );
}
