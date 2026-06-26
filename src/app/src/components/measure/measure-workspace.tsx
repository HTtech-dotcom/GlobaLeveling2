
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppData } from "@/components/providers/app-data-provider";
import { RankCenter } from "@/components/measure/rank-center";
import { MeasurementForm } from "@/components/measure/measurement-form";
import { metricCatalog } from "@/config/metrics";
import { safeJson } from "@/lib/safe-json";
import { normalizeProfessionCode, professionOptions } from "@/config/job-taxonomy";

const regionOptions = [
  { value: "VN-HN", label: "Hanoi" },
  { value: "VN-HCM", label: "Ho Chi Minh City" },
  { value: "VN-DN", label: "Da Nang" },
  { value: "SG-SG", label: "Singapore" },
  { value: "OTHER", label: "Other" }
];


const planOptions = [
  { value: "balanced", label: "Balanced" },
  { value: "intelligent_oriented", label: "Intelligent-oriented" },
  { value: "physique_oriented", label: "Physique-oriented" },
  { value: "custom", label: "Custom" }
];

const intensityOptions = [
  { value: "slow", label: "Slow" },
  { value: "balanced", label: "Balanced" },
  { value: "fast", label: "Fast" }
];

export function MeasureWorkspace() {
  const { data, applyBootstrapPatch, refresh } = useAppData();
  const [selectedMetric, setSelectedMetric] = useState("STR");
  const [editMode, setEditMode] = useState(false);
  const initializedRef = useRef(false);
  const hydratedProfileUserIdRef = useRef<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profile, setProfile] = useState({
    age: String(data.user?.age ?? 25),
    occupation: normalizeProfessionCode(data.user?.occupation),
    regionCode: data.user?.regionCode ?? "VN-HCM",
    currentPlanCode: data.user?.currentPlanCode ?? "balanced",
    trainingIntensity: data.user?.trainingIntensity ?? "balanced"
  });

  const measuredCount = useMemo(
    () => data.metrics.filter((metric) => metric.confidenceStatus && metric.confidenceStatus !== "missing").length,
    [data.metrics]
  );

  useEffect(() => {
    const nextUserId = data.user?.id ?? null;

    if (nextUserId && hydratedProfileUserIdRef.current !== nextUserId) {
      setProfile({
        age: String(data.user?.age ?? 25),
        occupation: normalizeProfessionCode(data.user?.occupation),
        regionCode: data.user?.regionCode ?? "VN-HCM",
        currentPlanCode: data.user?.currentPlanCode ?? "balanced",
        trainingIntensity: data.user?.trainingIntensity ?? "balanced"
      });

      hydratedProfileUserIdRef.current = nextUserId;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      setEditMode(!data.user?.hasCompletedInitialMeasurement);
    } else if (!data.user?.hasCompletedInitialMeasurement) {
      setEditMode(true);
    }
  }, [data.user]);


  async function saveProfile() {
    setProfileSaving(true);
    setProfileMessage("");

    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: Number(profile.age),
        occupation: profile.occupation,
        regionCode: profile.regionCode,
        currentPlanCode: profile.currentPlanCode,
        trainingIntensity: profile.trainingIntensity
      })
    });

    const payload = await safeJson<{ message?: string; user?: typeof data.user }>(response);

    if (!response.ok || !payload) {
      setProfileSaving(false);
      setProfileMessage(payload?.message ?? "Profile update failed.");
      return;
    }

    applyBootstrapPatch({ user: payload.user ?? undefined });
    setProfileSaving(false);
    setProfileMessage(payload.message ?? "Profile updated.");
    await refresh(true);
  }

  const isInitialSetup = !data.user?.hasCompletedInitialMeasurement;

  return (
    <div className="space-y-4">
      <RankCenter rank={data.rank} />

      <section className="card space-y-3 p-4">
        <div className="section-title">{isInitialSetup ? "Measurement setup" : "Measurement profile"}</div>
        <div className="text-sm text-muted">
          {isInitialSetup
            ? `Complete all 7 metrics to unlock tasks. Progress ${measuredCount}/7.`
            : "Your benchmark context affects scoring, compare and task allocation."}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="block space-y-1">
            <div className="text-sm text-muted">Age</div>
            <input
              className="input"
              type="number"
              value={profile.age}
              onChange={(event) => setProfile((current) => ({ ...current, age: event.target.value }))}
            />
          </label>

          <label className="block space-y-1">
            <div className="text-sm text-muted">Occupation</div>
            <select
              className="input"
              value={profile.occupation}
              onChange={(event) => setProfile((current) => ({ ...current, occupation: event.target.value }))}
            >
              {professionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="block space-y-1">
            <div className="text-sm text-muted">Region</div>
            <select
              className="input"
              value={profile.regionCode}
              onChange={(event) => setProfile((current) => ({ ...current, regionCode: event.target.value }))}
            >
              {regionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="block space-y-1">
            <div className="text-sm text-muted">Plan</div>
            <select
              className="input"
              value={profile.currentPlanCode}
              onChange={(event) => setProfile((current) => ({ ...current, currentPlanCode: event.target.value }))}
            >
              {planOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="block space-y-1">
            <div className="text-sm text-muted">Intensity</div>
            <select
              className="input"
              value={profile.trainingIntensity}
              onChange={(event) => setProfile((current) => ({ ...current, trainingIntensity: event.target.value }))}
            >
              {intensityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>

        <button className="action-btn w-full" disabled={profileSaving} onClick={() => void saveProfile()} type="button">
          {profileSaving ? "Saving..." : "Save profile"}
        </button>
        {profileMessage ? <div className="text-sm text-sky-200">{profileMessage}</div> : null}
      </section>

      <section className="card p-4">
        <div className="section-title">Metrics</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {metricCatalog.map((metric) => {
            const value = data.metrics.find((item) => item.metricCode === metric.code);
            return (
              <button
                key={metric.code}
                className={`card-soft p-4 text-left ${selectedMetric === metric.code ? "border border-sky-300/30" : ""}`}
                onClick={() => setSelectedMetric(metric.code)}
                type="button"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-muted">{metric.code}</div>
                <div className="mt-1 text-lg font-black">{(value?.score ?? 0).toFixed(2)}</div>
                <div className="text-sm text-muted">{metric.name}</div>
                <div className="mt-1 text-xs text-muted">{value?.confidenceStatus ?? "missing"}</div>
              </button>
            );
          })}
        </div>

        <MeasurementForm
          metricCode={selectedMetric}
          editable={isInitialSetup || editMode}
          onSaved={() => {
            if (!isInitialSetup) {
              setEditMode(false);
            }
          }}
        />

        {!isInitialSetup ? (
          <button className="ghost-btn mt-4 w-full" onClick={() => setEditMode((current) => !current)} type="button">
            {editMode ? "Lock measurement" : "Measurement update"}
          </button>
        ) : null}
      </section>
    </div>
  );
}
