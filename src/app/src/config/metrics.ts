import { professionOptions } from "./job-taxonomy";


export const LOGIC_VERSION = "schema_v0_3";
export const TASK_LOGIC_VERSION = "task_engine_v0_1";

export const metricCatalog = [
  { code: "STR", name: "Strength", unitLabel: "score", displayOrder: 1, isLoopActive: true },
  { code: "DUR", name: "Endurance", unitLabel: "score", displayOrder: 2, isLoopActive: true },
  { code: "SPD", name: "Speed", unitLabel: "score", displayOrder: 3, isLoopActive: true },
  { code: "INT", name: "Intelligence", unitLabel: "score", displayOrder: 4, isLoopActive: true },
  { code: "EMO", name: "Emotional Intelligence", unitLabel: "score", displayOrder: 5, isLoopActive: true },
  { code: "CRR", name: "Career", unitLabel: "score", displayOrder: 6, isLoopActive: true },
  { code: "HEA", name: "Health", unitLabel: "score", displayOrder: 7, isLoopActive: false }
] as const;

export type MetricCode = typeof metricCatalog[number]["code"];

export const CAREER_METRIC_CODE = "CRR";
export const LEGACY_CAREER_METRIC_CODE = "JOB";

export function toPublicMetricCode(metricCode: string): MetricCode | string {
  return metricCode === LEGACY_CAREER_METRIC_CODE ? CAREER_METRIC_CODE : metricCode;
}

export function toStorageMetricCode(metricCode: string): string {
  return metricCode === CAREER_METRIC_CODE ? LEGACY_CAREER_METRIC_CODE : metricCode;
}

export function getStorageMetricCodes(metricCode: string): string[] {
  return metricCode === CAREER_METRIC_CODE || metricCode === LEGACY_CAREER_METRIC_CODE
    ? [CAREER_METRIC_CODE, LEGACY_CAREER_METRIC_CODE]
    : [metricCode];
}

export type PlanCode = "balanced" | "intelligent_oriented" | "physique_oriented" | "custom";
export type IntensityCode = "slow" | "balanced" | "fast";

export const rankBands = [
  { code: "E", min: 0, max: 24.99, scorePoint: 0 },
  { code: "D", min: 25, max: 39.99, scorePoint: 25 },
  { code: "C", min: 40, max: 54.99, scorePoint: 40 },
  { code: "B", min: 55, max: 69.99, scorePoint: 55 },
  { code: "A", min: 70, max: 79.99, scorePoint: 70 },
  { code: "S", min: 80, max: 89.99, scorePoint: 80 },
  { code: "SS", min: 90, max: 100, scorePoint: 90 }
] as const;

export const overallWeights: Record<MetricCode, number> = {
  STR: 0.15,
  DUR: 0.15,
  SPD: 0.10,
  INT: 0.15,
  EMO: 0.10,
  CRR: 0.20,
  HEA: 0.15
};

export const ageBands = [
  { code: "under_18", label: "Under 18", min: 0, max: 17 },
  { code: "18_22", label: "18-22", min: 18, max: 22 },
  { code: "23_26", label: "23-26", min: 23, max: 26 },
  { code: "27_30", label: "27-30", min: 27, max: 30 },
  { code: "31_35", label: "31-35", min: 31, max: 35 },
  { code: "36_plus", label: "36+", min: 36, max: 120 }
] as const;

export const regionOptions = [
  { code: "VN-HN", label: "Hanoi" },
  { code: "VN-HCM", label: "Ho Chi Minh City" },
  { code: "VN-DN", label: "Da Nang" },
  { code: "SG-SG", label: "Singapore" },
  { code: "OTHER", label: "Other" }
] as const;

export const occupationOptions = professionOptions.map((item) => ({ code: item.value, label: item.label, category: item.industryGroupCode })) as ReadonlyArray<{ code: string; label: string; category: string }>;

type BenchmarkRow = { rank: string; raw: number };

export const strengthBenchmarksByAgeBand: Record<string, Record<"bench" | "deadlift" | "squat", BenchmarkRow[]>> = {
  under_18: {
    bench: [
      { rank: "E", raw: 22 }, { rank: "D", raw: 32 }, { rank: "C", raw: 45 }, { rank: "B", raw: 58 }, { rank: "A", raw: 72 }, { rank: "S", raw: 85 }, { rank: "SS", raw: 100 }
    ],
    deadlift: [
      { rank: "E", raw: 40 }, { rank: "D", raw: 55 }, { rank: "C", raw: 75 }, { rank: "B", raw: 95 }, { rank: "A", raw: 115 }, { rank: "S", raw: 135 }, { rank: "SS", raw: 160 }
    ],
    squat: [
      { rank: "E", raw: 30 }, { rank: "D", raw: 45 }, { rank: "C", raw: 65 }, { rank: "B", raw: 85 }, { rank: "A", raw: 105 }, { rank: "S", raw: 125 }, { rank: "SS", raw: 145 }
    ]
  },
  "18_22": {
    bench: [
      { rank: "E", raw: 28 }, { rank: "D", raw: 40 }, { rank: "C", raw: 56 }, { rank: "B", raw: 72 }, { rank: "A", raw: 88 }, { rank: "S", raw: 102 }, { rank: "SS", raw: 118 }
    ],
    deadlift: [
      { rank: "E", raw: 50 }, { rank: "D", raw: 68 }, { rank: "C", raw: 92 }, { rank: "B", raw: 118 }, { rank: "A", raw: 144 }, { rank: "S", raw: 166 }, { rank: "SS", raw: 190 }
    ],
    squat: [
      { rank: "E", raw: 40 }, { rank: "D", raw: 58 }, { rank: "C", raw: 82 }, { rank: "B", raw: 106 }, { rank: "A", raw: 130 }, { rank: "S", raw: 150 }, { rank: "SS", raw: 172 }
    ]
  },
  "23_26": {
    bench: [
      { rank: "E", raw: 32.69 }, { rank: "D", raw: 46.7 }, { rank: "C", raw: 69.9 }, { rank: "B", raw: 86 }, { rank: "A", raw: 102 }, { rank: "S", raw: 118 }, { rank: "SS", raw: 135 }
    ],
    deadlift: [
      { rank: "E", raw: 60 }, { rank: "D", raw: 82 }, { rank: "C", raw: 110 }, { rank: "B", raw: 138 }, { rank: "A", raw: 166 }, { rank: "S", raw: 188 }, { rank: "SS", raw: 215 }
    ],
    squat: [
      { rank: "E", raw: 48 }, { rank: "D", raw: 70 }, { rank: "C", raw: 98 }, { rank: "B", raw: 124 }, { rank: "A", raw: 150 }, { rank: "S", raw: 172 }, { rank: "SS", raw: 195 }
    ]
  },
  "27_30": {
    bench: [
      { rank: "E", raw: 31 }, { rank: "D", raw: 44 }, { rank: "C", raw: 66 }, { rank: "B", raw: 82 }, { rank: "A", raw: 98 }, { rank: "S", raw: 112 }, { rank: "SS", raw: 128 }
    ],
    deadlift: [
      { rank: "E", raw: 58 }, { rank: "D", raw: 80 }, { rank: "C", raw: 106 }, { rank: "B", raw: 132 }, { rank: "A", raw: 158 }, { rank: "S", raw: 178 }, { rank: "SS", raw: 202 }
    ],
    squat: [
      { rank: "E", raw: 46 }, { rank: "D", raw: 68 }, { rank: "C", raw: 94 }, { rank: "B", raw: 118 }, { rank: "A", raw: 142 }, { rank: "S", raw: 162 }, { rank: "SS", raw: 184 }
    ]
  },
  "31_35": {
    bench: [
      { rank: "E", raw: 29 }, { rank: "D", raw: 41 }, { rank: "C", raw: 61 }, { rank: "B", raw: 76 }, { rank: "A", raw: 90 }, { rank: "S", raw: 104 }, { rank: "SS", raw: 118 }
    ],
    deadlift: [
      { rank: "E", raw: 54 }, { rank: "D", raw: 74 }, { rank: "C", raw: 98 }, { rank: "B", raw: 122 }, { rank: "A", raw: 146 }, { rank: "S", raw: 166 }, { rank: "SS", raw: 188 }
    ],
    squat: [
      { rank: "E", raw: 42 }, { rank: "D", raw: 62 }, { rank: "C", raw: 86 }, { rank: "B", raw: 108 }, { rank: "A", raw: 130 }, { rank: "S", raw: 148 }, { rank: "SS", raw: 168 }
    ]
  },
  "36_plus": {
    bench: [
      { rank: "E", raw: 25 }, { rank: "D", raw: 36 }, { rank: "C", raw: 54 }, { rank: "B", raw: 68 }, { rank: "A", raw: 82 }, { rank: "S", raw: 94 }, { rank: "SS", raw: 106 }
    ],
    deadlift: [
      { rank: "E", raw: 48 }, { rank: "D", raw: 66 }, { rank: "C", raw: 88 }, { rank: "B", raw: 110 }, { rank: "A", raw: 132 }, { rank: "S", raw: 150 }, { rank: "SS", raw: 170 }
    ],
    squat: [
      { rank: "E", raw: 36 }, { rank: "D", raw: 54 }, { rank: "C", raw: 76 }, { rank: "B", raw: 96 }, { rank: "A", raw: 116 }, { rank: "S", raw: 132 }, { rank: "SS", raw: 150 }
    ]
  }
};

export const durBenchmarksByAgeBand: Record<string, BenchmarkRow[]> = {
  under_18: [{ rank: "E", raw: 15.5 }, { rank: "D", raw: 13.5 }, { rank: "C", raw: 12 }, { rank: "B", raw: 10.8 }, { rank: "A", raw: 9.8 }, { rank: "S", raw: 8.9 }, { rank: "SS", raw: 8 }],
  "18_22": [{ rank: "E", raw: 14.8 }, { rank: "D", raw: 12.8 }, { rank: "C", raw: 11.3 }, { rank: "B", raw: 10 }, { rank: "A", raw: 9 }, { rank: "S", raw: 8.2 }, { rank: "SS", raw: 7.5 }],
  "23_26": [{ rank: "E", raw: 15 }, { rank: "D", raw: 13 }, { rank: "C", raw: 11.6 }, { rank: "B", raw: 10.3 }, { rank: "A", raw: 9.4 }, { rank: "S", raw: 8.5 }, { rank: "SS", raw: 7.8 }],
  "27_30": [{ rank: "E", raw: 15.4 }, { rank: "D", raw: 13.4 }, { rank: "C", raw: 12 }, { rank: "B", raw: 10.7 }, { rank: "A", raw: 9.8 }, { rank: "S", raw: 8.9 }, { rank: "SS", raw: 8.2 }],
  "31_35": [{ rank: "E", raw: 15.8 }, { rank: "D", raw: 13.8 }, { rank: "C", raw: 12.4 }, { rank: "B", raw: 11.1 }, { rank: "A", raw: 10.2 }, { rank: "S", raw: 9.4 }, { rank: "SS", raw: 8.7 }],
  "36_plus": [{ rank: "E", raw: 16.5 }, { rank: "D", raw: 14.4 }, { rank: "C", raw: 13 }, { rank: "B", raw: 11.7 }, { rank: "A", raw: 10.8 }, { rank: "S", raw: 10 }, { rank: "SS", raw: 9.2 }]
};

export const spdBenchmarksByAgeBand: Record<string, BenchmarkRow[]> = {
  under_18: [{ rank: "E", raw: 17.5 }, { rank: "D", raw: 16 }, { rank: "C", raw: 14.8 }, { rank: "B", raw: 13.8 }, { rank: "A", raw: 12.9 }, { rank: "S", raw: 12.2 }, { rank: "SS", raw: 11.5 }],
  "18_22": [{ rank: "E", raw: 17 }, { rank: "D", raw: 15.5 }, { rank: "C", raw: 14.2 }, { rank: "B", raw: 13.1 }, { rank: "A", raw: 12.2 }, { rank: "S", raw: 11.5 }, { rank: "SS", raw: 10.8 }],
  "23_26": [{ rank: "E", raw: 17.2 }, { rank: "D", raw: 15.8 }, { rank: "C", raw: 14.5 }, { rank: "B", raw: 13.4 }, { rank: "A", raw: 12.5 }, { rank: "S", raw: 11.8 }, { rank: "SS", raw: 11.1 }],
  "27_30": [{ rank: "E", raw: 17.5 }, { rank: "D", raw: 16.1 }, { rank: "C", raw: 14.8 }, { rank: "B", raw: 13.7 }, { rank: "A", raw: 12.8 }, { rank: "S", raw: 12.1 }, { rank: "SS", raw: 11.4 }],
  "31_35": [{ rank: "E", raw: 17.9 }, { rank: "D", raw: 16.5 }, { rank: "C", raw: 15.2 }, { rank: "B", raw: 14 }, { rank: "A", raw: 13.1 }, { rank: "S", raw: 12.4 }, { rank: "SS", raw: 11.7 }],
  "36_plus": [{ rank: "E", raw: 18.5 }, { rank: "D", raw: 17 }, { rank: "C", raw: 15.7 }, { rank: "B", raw: 14.5 }, { rank: "A", raw: 13.6 }, { rank: "S", raw: 12.8 }, { rank: "SS", raw: 12 }]
};

export const jobExperienceBenchmarks: Record<string, BenchmarkRow[]> = {
  top_firm: [{ rank: "E", raw: 0 }, { rank: "D", raw: 1 }, { rank: "C", raw: 3 }, { rank: "B", raw: 5 }, { rank: "A", raw: 8 }, { rank: "S", raw: 10 }, { rank: "SS", raw: 15 }],
  top_50: [{ rank: "E", raw: 0 }, { rank: "D", raw: 2 }, { rank: "C", raw: 4 }, { rank: "B", raw: 6 }, { rank: "A", raw: 10 }, { rank: "S", raw: 12 }, { rank: "SS", raw: 17 }],
  top_100: [{ rank: "E", raw: 0 }, { rank: "D", raw: 2 }, { rank: "C", raw: 4 }, { rank: "B", raw: 7 }, { rank: "A", raw: 12 }, { rank: "S", raw: 15 }, { rank: "SS", raw: 20 }],
  sme: [{ rank: "E", raw: 0 }, { rank: "D", raw: 3 }, { rank: "C", raw: 5 }, { rank: "B", raw: 8 }, { rank: "A", raw: 15 }, { rank: "S", raw: 20 }, { rank: "SS", raw: 25 }],
  local_small_company: [{ rank: "E", raw: 0 }, { rank: "D", raw: 4 }, { rank: "C", raw: 7 }, { rank: "B", raw: 10 }, { rank: "A", raw: 18 }, { rank: "S", raw: 24 }, { rank: "SS", raw: 30 }],
  top_20: [{ rank: "E", raw: 0 }, { rank: "D", raw: 1 }, { rank: "C", raw: 3 }, { rank: "B", raw: 5 }, { rank: "A", raw: 9 }, { rank: "S", raw: 11 }, { rank: "SS", raw: 16 }],
  smes: [{ rank: "E", raw: 0 }, { rank: "D", raw: 3 }, { rank: "C", raw: 5 }, { rank: "B", raw: 7 }, { rank: "A", raw: 15 }, { rank: "S", raw: 20 }, { rank: "SS", raw: 25 }]
};

export const progressionTable: Record<string, Record<string, number>> = {
  slow: { E: 1.39, D: 0.18, C: 0.05, B: 0.02, A: 0.01, S: 0.005, SS: 0.002 },
  balanced: { E: 2.08, D: 0.24, C: 0.06, B: 0.03, A: 0.01, S: 0.006, SS: 0.003 },
  fast: { E: 2.78, D: 0.33, C: 0.09, B: 0.05, A: 0.019, S: 0.009, SS: 0.005 }
};

export const intensityMultiplier: Record<IntensityCode, number> = {
  slow: 0.8,
  balanced: 1,
  fast: 1.2
};

export const planDefinitions: Record<PlanCode, { label: string; groupA: MetricCode[]; groupB?: MetricCode[]; slotsA: number[]; slotsB?: number[] }> = {
  balanced: {
    label: "Balanced",
    groupA: ["STR", "DUR", "SPD", "INT", "EMO", "CRR"],
    slotsA: [2, 3, 3, 4, 5, 6]
  },
  intelligent_oriented: {
    label: "Intelligent-oriented",
    groupA: ["INT", "EMO", "CRR"],
    groupB: ["STR", "DUR", "SPD"],
    slotsA: [4, 5, 6],
    slotsB: [2, 3, 3]
  },
  physique_oriented: {
    label: "Physique-oriented",
    groupA: ["STR", "DUR", "SPD"],
    groupB: ["INT", "EMO", "CRR"],
    slotsA: [4, 5, 6],
    slotsB: [2, 3, 3]
  },
  custom: {
    label: "Custom",
    groupA: ["STR", "DUR", "SPD", "INT", "EMO", "CRR"],
    slotsA: [2, 3, 3, 4, 5, 6]
  }
};

export function getAgeGroup(age: number | null | undefined) {
  const safeAge = age ?? 25;
  return ageBands.find((band) => safeAge >= band.min && safeAge <= band.max)?.code ?? "23_26";
}

export function getAgeGroupLabel(code: string | null | undefined) {
  return ageBands.find((band) => band.code === code)?.label ?? "23-26";
}

export function getRegionLabel(code: string | null | undefined) {
  return regionOptions.find((item) => item.code === code)?.label ?? code ?? "Unknown";
}

export function getOccupationLabel(code: string | null | undefined) {
  return occupationOptions.find((item) => item.code === code)?.label ?? code ?? "General";
}
