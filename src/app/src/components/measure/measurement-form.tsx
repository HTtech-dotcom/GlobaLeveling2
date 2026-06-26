"use client";

import { useEffect, useMemo, useState } from "react";
import { safeJson } from "@/lib/safe-json";
import { useAppData } from "@/components/providers/app-data-provider";
import {
  buildLocalCertificationHref,
  companyTierOptions,
  educationLevelOptions,
  educationRelevanceOptions,
  getCertificationProgressLabel,
  getCertificationTrack,
  getCertificationTracksForProfession,
  getProfession,
  normalizeProfessionCode,
  seniorityLevelOptions
} from "@/config/job-taxonomy";

type FieldDefinition = {
  name: string;
  label: string;
  type: "number" | "select";
  options?: Array<{ value: string; label: string }>;
};

const fieldMap: Record<string, FieldDefinition[]> = {
  STR: [
    { name: "benchKg", label: "Bench Press 1RM (kg)", type: "number" },
    { name: "deadliftKg", label: "Deadlift 1RM (kg)", type: "number" },
    { name: "squatKg", label: "Squat 1RM (kg)", type: "number" }
  ],
  DUR: [
    { name: "minutes", label: "2km time - minutes", type: "number" },
    { name: "seconds", label: "2km time - seconds", type: "number" }
  ],
  SPD: [
    { name: "seconds", label: "100m time (seconds)", type: "number" }
  ],
  INT: [
    { name: "iqValue", label: "IQ value", type: "number" }
  ],
  EMO: [
    { name: "eqValue", label: "EQ value", type: "number" }
  ],
  HEA: [
    { name: "sleepHours", label: "Average sleep in last 7 days", type: "number" },
    { name: "heightCm", label: "Height (cm)", type: "number" },
    { name: "weightKg", label: "Weight (kg)", type: "number" },
    { name: "restingHr", label: "Resting heart rate (optional)", type: "number" }
  ]
};

const countryOptions = [
  { value: "VN", label: "Vietnam" },
  { value: "SG", label: "Singapore" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "OTHER", label: "Other" }
];

type SaveResponse = {
  message?: string;
  score?: number;
  metrics?: Array<{ metricCode: string; metricName: string; score: number; rankCode?: string; confidenceStatus?: string }>;
  rank?: { currentRankCode: string; averageScore: number; floorScore: number; overallScore: number };
  user?: any;
};

function optionList<T extends string>(items: Array<{ code: T; label: string }>) {
  return items.map((item) => ({ value: item.code, label: item.label }));
}

function getDefaultCountry(regionCode: string | undefined | null) {
  if (regionCode?.startsWith("SG")) return "SG";
  return "VN";
}

function buildJobDefaults(userOccupation: string | undefined | null, regionCode: string | undefined | null) {
  const professionCode = normalizeProfessionCode(userOccupation);
  const tracks = getCertificationTracksForProfession(professionCode);
  const firstTrack = tracks[0];

  return {
    countryCode: getDefaultCountry(regionCode),
    professionCode,
    companyTier: "sme",
    yearsExperience: "",
    seniorityLevel: "associate",
    educationLevel: "bachelor_related",
    educationRelevance: "related",
    certificationCode: firstTrack?.code ?? "none",
    certificationStage: firstTrack?.stages?.[0]?.code ?? "",
    passedUnits: "",
    percentComplete: firstTrack?.isLocal ? "0" : ""
  };
}

export function MeasurementForm({
  metricCode,
  editable,
  onSaved
}: {
  metricCode: string;
  editable: boolean;
  onSaved: () => void;
}) {
  const { data: appData, applyBootstrapPatch } = useAppData();
  const fields = useMemo(() => fieldMap[metricCode] ?? [], [metricCode]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProfessionCode = values.professionCode ?? normalizeProfessionCode(appData.user?.occupation);
  const selectedProfession = getProfession(selectedProfessionCode);
  const certificationOptions = useMemo(() => getCertificationTracksForProfession(selectedProfessionCode), [selectedProfessionCode]);
  const selectedCertification = getCertificationTrack(values.certificationCode, selectedProfessionCode);
  const localCertificationHref = buildLocalCertificationHref(values.countryCode ?? getDefaultCountry(appData.user?.regionCode), selectedProfessionCode);

  useEffect(() => {
    setValues((current) => {
      if (metricCode === "CRR") {
        const defaults = buildJobDefaults(appData.user?.occupation, appData.user?.regionCode);
        const professionChanged = current.professionCode != null && current.professionCode !== defaults.professionCode;
        return {
          ...defaults,
          ...current,
          professionCode: defaults.professionCode,
          countryCode: current.countryCode ?? defaults.countryCode,
          certificationCode: professionChanged ? defaults.certificationCode : current.certificationCode ?? defaults.certificationCode,
          certificationStage: professionChanged ? defaults.certificationStage : current.certificationStage ?? defaults.certificationStage,
          passedUnits: professionChanged ? defaults.passedUnits : current.passedUnits ?? defaults.passedUnits,
          percentComplete: professionChanged ? defaults.percentComplete : current.percentComplete ?? defaults.percentComplete
        };
      }

      const next: Record<string, string> = {};
      for (const field of fieldMap[metricCode] ?? []) {
        next[field.name] = current[field.name] ?? field.options?.[0]?.value ?? "";
      }
      return next;
    });
    setMessage("");
  }, [metricCode, appData.user?.occupation, appData.user?.regionCode]);

  function setJobCertification(certificationCode: string) {
    const track = getCertificationTrack(certificationCode, selectedProfessionCode);

    setValues((current) => ({
      ...current,
      certificationCode,
      certificationStage: track.stages?.[0]?.code ?? "",
      passedUnits: "",
      percentComplete: track.measurementMode === "PERCENT_COMPLETE" ? "0" : ""
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editable) return;

    setSaving(true);

    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value !== "" && !Number.isNaN(Number(value)) ? Number(value) : value])
    );

    const response = await fetch("/api/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metricCode, payload })
    });

    const data = await safeJson<SaveResponse>(response);

    if (!response.ok || !data) {
      setSaving(false);
      setMessage(data?.message ?? "Submit failed.");
      return;
    }

    applyBootstrapPatch({
      metrics: data.metrics,
      rank: data.rank,
      user: data.user
    });
    setSaving(false);
    setMessage(`Saved ${metricCode} at ${data.score?.toFixed(2) ?? "0.00"} pts.`);
    onSaved();
  }

  function renderGenericField(field: FieldDefinition) {
    if (field.type === "select") {
      return (
        <label key={field.name} className="block space-y-1">
          <div className="text-sm text-muted">{field.label}</div>
          <select
            className="input"
            disabled={!editable || saving}
            value={values[field.name] ?? field.options?.[0]?.value ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label key={field.name} className="block space-y-1">
        <div className="text-sm text-muted">{field.label}</div>
        <input
          className="input"
          disabled={!editable || saving}
          inputMode="decimal"
          type="number"
          value={values[field.name] ?? ""}
          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
        />
      </label>
    );
  }

  function renderCertificationProgress() {
    const label = getCertificationProgressLabel(selectedCertification);

    if (selectedCertification.measurementMode === "NONE") {
      return null;
    }

    if (selectedCertification.measurementMode === "MODULE_PASSED" || selectedCertification.measurementMode === "EXAM_PART_PASSED") {
      return (
        <label className="block space-y-1">
          <div className="text-sm text-muted">{label}</div>
          <input
            className="input"
            disabled={!editable || saving}
            inputMode="decimal"
            max={selectedCertification.totalUnits ?? 1}
            min={0}
            type="number"
            value={values.passedUnits ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, passedUnits: event.target.value }))}
          />
        </label>
      );
    }

    if (selectedCertification.measurementMode === "PERCENT_COMPLETE") {
      return (
        <label className="block space-y-1">
          <div className="text-sm text-muted">{label}</div>
          <input
            className="input"
            disabled={!editable || saving}
            inputMode="decimal"
            max={100}
            min={0}
            type="number"
            value={values.percentComplete ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, percentComplete: event.target.value }))}
          />
        </label>
      );
    }

    return (
      <label className="block space-y-1">
        <div className="text-sm text-muted">{label}</div>
        <select
          className="input"
          disabled={!editable || saving}
          value={values.certificationStage ?? selectedCertification.stages?.[0]?.code ?? ""}
          onChange={(event) => setValues((current) => ({ ...current, certificationStage: event.target.value }))}
        >
          {selectedCertification.stages?.map((stage) => (
            <option key={stage.code} value={stage.code}>{stage.label}</option>
          ))}
        </select>
      </label>
    );
  }

  function renderJobFields() {
    return (
      <div className="space-y-3">

        <label className="block space-y-1">
          <div className="text-sm text-muted">Country</div>
          <select
            className="input"
            disabled={!editable || saving}
            value={values.countryCode ?? getDefaultCountry(appData.user?.regionCode)}
            onChange={(event) => setValues((current) => ({ ...current, countryCode: event.target.value }))}
          >
            {countryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <div className="card-soft space-y-1 p-3">
          <div className="text-sm text-muted">Profession</div>
          <div className="font-bold">{selectedProfession.name}</div>
        </div>

        <label className="block space-y-1">
          <div className="text-sm text-muted">Company type</div>
          <select
            className="input"
            disabled={!editable || saving}
            value={values.companyTier ?? "sme"}
            onChange={(event) => setValues((current) => ({ ...current, companyTier: event.target.value }))}
          >
            {optionList(companyTierOptions).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="block space-y-1">
          <div className="text-sm text-muted">Years of experience</div>
          <input
            className="input"
            disabled={!editable || saving}
            inputMode="decimal"
            min={0}
            type="number"
            value={values.yearsExperience ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, yearsExperience: event.target.value }))}
          />
        </label>

        <label className="block space-y-1">
          <div className="text-sm text-muted">Seniority level</div>
          <select
            className="input"
            disabled={!editable || saving}
            value={values.seniorityLevel ?? "associate"}
            onChange={(event) => setValues((current) => ({ ...current, seniorityLevel: event.target.value }))}
          >
            {optionList(seniorityLevelOptions).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="block space-y-1">
          <div className="text-sm text-muted">Education / training level</div>
          <select
            className="input"
            disabled={!editable || saving}
            value={values.educationLevel ?? "bachelor_related"}
            onChange={(event) => setValues((current) => ({ ...current, educationLevel: event.target.value }))}
          >
            {optionList(educationLevelOptions).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="block space-y-1">
          <div className="text-sm text-muted">Education relevance</div>
          <select
            className="input"
            disabled={!editable || saving}
            value={values.educationRelevance ?? "related"}
            onChange={(event) => setValues((current) => ({ ...current, educationRelevance: event.target.value }))}
          >
            {optionList(educationRelevanceOptions).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="block space-y-1">
          <div className="text-sm text-muted">Certification / license</div>
          <select
            className="input"
            disabled={!editable || saving}
            value={values.certificationCode ?? certificationOptions[0]?.code ?? "none"}
            onChange={(event) => setJobCertification(event.target.value)}
          >
            {certificationOptions.map((track) => <option key={track.code} value={track.code}>{track.name}</option>)}
          </select>
        </label>

        {selectedCertification.isLocal ? (
          <div className="card-soft space-y-2 p-3 text-sm">
            <div className="font-bold">Local certification/license</div>
            <div className="text-muted">Chấm điểm bằng percentage complete. Link dưới chỉ để tham khảo danh sách, không dùng để chấm tự động.</div>
            <a className="inline-chip" href={localCertificationHref} target="_blank" rel="noreferrer">
              Open local certificate reference
            </a>
          </div>
        ) : null}

        {renderCertificationProgress()}
      </div>
    );
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      {!editable ? <div className="text-sm text-muted">Measurement is locked. Use the update button below to edit.</div> : null}
      {metricCode === "CRR" ? renderJobFields() : fields.map(renderGenericField)}
      <button className="action-btn w-full" disabled={!editable || saving} type="submit">
        {saving ? "Saving..." : "Save measurement"}
      </button>
      {message ? <div className="text-sm text-sky-200">{message}</div> : null}
    </form>
  );
}
