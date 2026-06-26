
import {
  getAgeGroup,
  jobExperienceBenchmarks,
  rankBands,
  durBenchmarksByAgeBand,
  spdBenchmarksByAgeBand,
  strengthBenchmarksByAgeBand,
  type MetricCode
} from "@/config/metrics";
import { clamp, round } from "@/lib/number";
import { getRank } from "@/features/rank";
import {
  buildLocalCertificationHref,
  companyTierOptions,
  educationLevelOptions,
  educationRelevanceOptions,
  getCertificationTrack,
  getCompanyTier,
  getEducationRelevanceMultiplier,
  getIndustryGroup,
  getJobScoringProfile,
  getProfession,
  getScoreOptionScore,
  normalizeCompanyTier,
  seniorityLevelOptions
} from "@/config/job-taxonomy";

export type ScoreContext = {
  age?: number | null;
  gender?: string | null;
};

export type MetricComputationResult = {
  metricCode: MetricCode;
  score: number;
  rankCode: string;
  rawScore: number;
  rawValue: number;
  normalizedInput: Record<string, unknown>;
  detail: Record<string, unknown>;
  confidenceStatus: string;
};


type GenderCode = "male" | "female" | "other";

function normalizeGender(value?: string | null): GenderCode {
  return value === "female" || value === "other" ? value : "male";
}

function mapBenchmarkRows(rows: Array<{ rank: string; raw: number }>, multiplier: number) {
  return rows.map((row) => ({ ...row, raw: round(row.raw * multiplier, 4) }));
}

function strengthGenderMultiplier(gender: GenderCode) {
  if (gender === "female") return 0.62;
  if (gender === "other") return 0.82;
  return 1;
}

function durationGenderMultiplier(gender: GenderCode) {
  if (gender === "female") return 1.12;
  if (gender === "other") return 1.06;
  return 1;
}

function speedGenderMultiplier(gender: GenderCode) {
  if (gender === "female") return 1.10;
  if (gender === "other") return 1.05;
  return 1;
}

function cognitiveAgeAdjustment(ageGroup: string) {
  if (ageGroup === "under_18") return 5;
  if (ageGroup === "18_22") return 2;
  if (ageGroup === "31_35") return 1;
  if (ageGroup === "36_plus") return 3;
  return 0;
}

function healthAgeAdjustment(ageGroup: string) {
  if (ageGroup === "under_18") return 2;
  if (ageGroup === "18_22") return 1;
  if (ageGroup === "31_35") return 2;
  if (ageGroup === "36_plus") return 4;
  return 0;
}

type BenchmarkPoint = { score: number; raw: number; rank: string };

function toBenchmarkPoints(rows: Array<{ rank: string; raw: number }>): BenchmarkPoint[] {
  return rows.map((row) => ({
    rank: row.rank,
    raw: row.raw,
    score: rankBands.find((band) => band.code === row.rank)?.scorePoint ?? 0
  }));
}

function interpolateHigher(raw: number, points: BenchmarkPoint[]) {
  const ordered = [...points].sort((a, b) => a.raw - b.raw);
  if (raw <= ordered[0].raw) {
    return ordered[0].score * (raw / Math.max(ordered[0].raw, 1));
  }

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const lower = ordered[index];
    const upper = ordered[index + 1];
    if (raw <= upper.raw) {
      const ratio = (raw - lower.raw) / Math.max(upper.raw - lower.raw, 1);
      return lower.score + ratio * (upper.score - lower.score);
    }
  }

  const last = ordered[ordered.length - 1];
  const prev = ordered[ordered.length - 2];
  const slope = (last.score - prev.score) / Math.max(last.raw - prev.raw, 1);
  return Math.min(100, last.score + (raw - last.raw) * slope);
}

function interpolateLower(raw: number, points: BenchmarkPoint[]) {
  const ordered = [...points].sort((a, b) => b.raw - a.raw);
  if (raw >= ordered[0].raw) {
    const worst = ordered[0];
    return worst.score * (worst.raw / Math.max(raw, worst.raw));
  }

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const slower = ordered[index];
    const faster = ordered[index + 1];
    if (raw >= faster.raw) {
      const ratio = (slower.raw - raw) / Math.max(slower.raw - faster.raw, 1e-6);
      return slower.score + ratio * (faster.score - slower.score);
    }
  }

  const best = ordered[ordered.length - 1];
  const prev = ordered[ordered.length - 2];
  const slope = (best.score - prev.score) / Math.max(prev.raw - best.raw, 1e-6);
  return Math.min(100, best.score + (best.raw - raw) * slope);
}

function interpolateFixed(raw: number, points: Array<{ raw: number; score: number }>) {
  const ordered = [...points].sort((a, b) => a.raw - b.raw);
  if (raw <= ordered[0].raw) {
    return ordered[0].score;
  }

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const lower = ordered[index];
    const upper = ordered[index + 1];
    if (raw <= upper.raw) {
      const ratio = (raw - lower.raw) / Math.max(upper.raw - lower.raw, 1);
      return lower.score + ratio * (upper.score - lower.score);
    }
  }

  return ordered[ordered.length - 1].score;
}

export function scoreSleep(hours: number, ageGroup = "23_26") {
  const optimumMin = ageGroup === "under_18" ? 8 : ageGroup === "36_plus" ? 6.8 : 7;
  const optimumMax = ageGroup === "under_18" ? 10 : ageGroup === "36_plus" ? 8.5 : 9;

  if (hours <= 0 || Number.isNaN(hours)) return 0;
  if (hours < 4) return 18;
  if (hours < optimumMin) return clamp(35 + ((hours - 4) / Math.max(optimumMin - 4, 1)) * 60, 0, 95);
  if (hours <= optimumMax) return 100;
  if (hours <= optimumMax + 1) return 88;
  if (hours <= optimumMax + 2) return 68;
  return 45;
}

export function scoreBmi(bmi: number, ageGroup = "23_26", gender: GenderCode = "male") {
  if (!bmi || Number.isNaN(bmi)) return 0;
  const upperHealthy = ageGroup === "36_plus" ? 26.5 : ageGroup === "31_35" ? 25.7 : 24.9;
  const lowerHealthy = gender === "female" ? 18.2 : 18.5;

  if (bmi < 16) return 25;
  if (bmi < lowerHealthy) return 55 + ((bmi - 16) / Math.max(lowerHealthy - 16, 1)) * 45;
  if (bmi <= upperHealthy) return 100;
  if (bmi <= upperHealthy + 2.5) return 100 - ((bmi - upperHealthy) / 2.5) * 25;
  if (bmi <= upperHealthy + 5) return 75 - ((bmi - (upperHealthy + 2.5)) / 2.5) * 20;
  if (bmi <= upperHealthy + 10) return 55 - ((bmi - (upperHealthy + 5)) / 5) * 20;
  return 20;
}

export function scoreSteps(stepsPerDay: number, ageGroup = "23_26") {
  const target = ageGroup === "under_18" ? 11000 : ageGroup === "36_plus" ? 7500 : ageGroup === "31_35" ? 8500 : 10000;
  if (!stepsPerDay || Number.isNaN(stepsPerDay)) return 0;
  if (stepsPerDay < 2000) return Math.max(5, (stepsPerDay / 2000) * 25);
  if (stepsPerDay < target) return 25 + ((stepsPerDay - 2000) / Math.max(target - 2000, 1)) * 75;
  if (stepsPerDay <= target * 1.8) return 100;
  return 92;
}

export function scoreRecovery(restingHr: number, ageGroup = "23_26", gender: GenderCode = "male") {
  if (!restingHr || Number.isNaN(restingHr)) return 0;
  const genderOffset = gender === "female" ? 3 : gender === "other" ? 1 : 0;
  const ageOffset = ageGroup === "36_plus" ? 4 : ageGroup === "31_35" ? 2 : 0;
  const adjustedHr = restingHr - genderOffset - ageOffset;

  if (adjustedHr < 45) return 62;
  if (adjustedHr <= 62) return 100;
  if (adjustedHr <= 72) return 88;
  if (adjustedHr <= 82) return 68;
  if (adjustedHr <= 92) return 48;
  return 25;
}

export function scoreExperience(companyTier: string, yearsExperience: number) {
  const normalizedCompanyTier = normalizeCompanyTier(companyTier);
  const rows = jobExperienceBenchmarks[normalizedCompanyTier] ?? jobExperienceBenchmarks.sme;
  return interpolateHigher(yearsExperience, toBenchmarkPoints(rows));
}

function scoreSeniorityResponsibility(companyTierCode: string, experienceScore: number, seniorityLevel: string) {
  const seniorityLevelScore = getScoreOptionScore(seniorityLevelOptions, seniorityLevel, "associate");
  const companyTier = getCompanyTier(companyTierCode);
  const companyAdjustedSeniority = seniorityLevelScore * companyTier.validationFactor;

  if (companyAdjustedSeniority > experienceScore) {
    const titleBoost = (companyAdjustedSeniority - experienceScore) * companyTier.validationFactor;
    return clamp(Math.max(companyAdjustedSeniority, experienceScore * 0.85 + titleBoost), 0, 100);
  }

  return clamp(Math.max(companyAdjustedSeniority, experienceScore * 0.9), 0, 100);
}

function scoreEducationTraining(educationLevel: string, educationRelevance: string) {
  const baseScore = getScoreOptionScore(educationLevelOptions, educationLevel, "bachelor_related");
  const relevanceMultiplier = getEducationRelevanceMultiplier(educationRelevance);
  return clamp(baseScore * relevanceMultiplier, 0, 100);
}

function scoreCertificationProgress(payload: {
  professionCode: string;
  certificationCode: string;
  certificationStage?: string | null;
  passedUnits?: number | null;
  percentComplete?: number | null;
}) {
  const track = getCertificationTrack(payload.certificationCode, payload.professionCode);
  const passedUnits = clamp(Number(payload.passedUnits ?? 0), 0, track.totalUnits ?? 1);
  const percentComplete = clamp(Number(payload.percentComplete ?? 0), 0, 100);
  const selectedStage = track.stages?.find((stage) => stage.code === payload.certificationStage);

  switch (track.measurementMode) {
    case "NONE":
      return 0;
    case "MODULE_PASSED":
    case "EXAM_PART_PASSED":
      return clamp((passedUnits / Math.max(track.totalUnits ?? 1, 1)) * track.maxScore, 0, track.maxScore);
    case "PERCENT_COMPLETE":
      return clamp((percentComplete / 100) * track.maxScore, 0, track.maxScore);
    case "LEVEL_PASSED":
    case "LICENSE_STAGE":
    case "PORTFOLIO_SCOPE":
      return clamp(selectedStage?.score ?? 0, 0, track.maxScore);
    default:
      return 0;
  }
}

function scoreIqLike(value: number, ageGroup = "23_26") {
  const adjustedValue = value + cognitiveAgeAdjustment(ageGroup);
  return {
    score: round(clamp(interpolateFixed(adjustedValue, [
      { raw: 70, score: 0 },
      { raw: 85, score: 25 },
      { raw: 100, score: 50 },
      { raw: 115, score: 70 },
      { raw: 130, score: 90 },
      { raw: 145, score: 100 }
    ]), 0, 100)),
    adjustedValue
  };
}

function scoreEqLike(value: number, ageGroup = "23_26") {
  const adjustedValue = value + cognitiveAgeAdjustment(ageGroup);
  return {
    score: round(clamp(interpolateFixed(adjustedValue, [
      { raw: 70, score: 0 },
      { raw: 85, score: 25 },
      { raw: 100, score: 50 },
      { raw: 115, score: 70 },
      { raw: 130, score: 90 },
      { raw: 145, score: 100 }
    ]), 0, 100)),
    adjustedValue
  };
}

function scoreStrength(ageGroup: string, gender: GenderCode, bench: number, deadlift: number, squat: number) {
  const benchmark = strengthBenchmarksByAgeBand[ageGroup] ?? strengthBenchmarksByAgeBand["23_26"];
  const multiplier = strengthGenderMultiplier(gender);
  const benchScore = interpolateHigher(bench, toBenchmarkPoints(mapBenchmarkRows(benchmark.bench, multiplier)));
  const deadliftScore = interpolateHigher(deadlift, toBenchmarkPoints(mapBenchmarkRows(benchmark.deadlift, multiplier)));
  const squatScore = interpolateHigher(squat, toBenchmarkPoints(mapBenchmarkRows(benchmark.squat, multiplier)));
  return {
    score: (benchScore + deadliftScore + squatScore) / 3,
    detail: { benchScore: round(benchScore), deadliftScore: round(deadliftScore), squatScore: round(squatScore), genderMultiplier: multiplier }
  };
}

function parseDurationToMinutes(minutes: number, seconds: number) {
  return round(minutes + seconds / 60, 4);
}

export function calculateJobScore(payload: {
  professionCode?: string;
  countryCode?: string;
  companyTier?: string;
  yearsExperience?: number;
  seniorityLevel?: string;
  educationLevel?: string;
  educationRelevance?: string;
  certificationCode?: string;
  certificationStage?: string | null;
  passedUnits?: number | null;
  percentComplete?: number | null;
  fCompleted?: number;
  pCompleted?: number;
  certificateStatus?: string | null;
}) {
  const profession = getProfession(payload.professionCode ?? "general_professional");
  const industryGroup = getIndustryGroup(profession.industryGroupCode);
  const scoringProfile = getJobScoringProfile(industryGroup.code);
  const companyTier = normalizeCompanyTier(payload.companyTier);
  const yearsExperience = Number(payload.yearsExperience ?? 0);
  const seniorityLevel = String(payload.seniorityLevel ?? "associate");
  const educationLevel = String(payload.educationLevel ?? "bachelor_related");
  const educationRelevance = String(payload.educationRelevance ?? "related");
  const certificationCode = String(payload.certificationCode ?? "none");
  const track = getCertificationTrack(certificationCode, profession.code);

  const legacyAccaPassedUnits =
    certificationCode === "acca" && payload.passedUnits == null
      ? Number(payload.fCompleted ?? 0) + Number(payload.pCompleted ?? 0)
      : payload.passedUnits;

  const experienceScore = scoreExperience(companyTier, yearsExperience);
  const seniorityResponsibilityScore = scoreSeniorityResponsibility(companyTier, experienceScore, seniorityLevel);
  const educationTrainingScore = scoreEducationTraining(educationLevel, educationRelevance);
  const certificationLicenseScore = scoreCertificationProgress({
    professionCode: profession.code,
    certificationCode,
    certificationStage: payload.certificationStage,
    passedUnits: legacyAccaPassedUnits,
    percentComplete: payload.percentComplete
  });

  const score = round(clamp(
    experienceScore * scoringProfile.experienceWeight +
    seniorityResponsibilityScore * scoringProfile.seniorityWeight +
    educationTrainingScore * scoringProfile.educationWeight +
    certificationLicenseScore * scoringProfile.certificationWeight,
    0,
    100
  ));

  const localCertificationHref = buildLocalCertificationHref(String(payload.countryCode ?? "VN"), profession.code);

  return {
    score,
    rankCode: getRank(score),
    normalizedInput: {
      professionCode: profession.code,
      professionName: profession.name,
      industryGroupCode: industryGroup.code,
      industryGroupName: industryGroup.name,
      countryCode: String(payload.countryCode ?? "VN"),
      companyTier,
      yearsExperience: round(yearsExperience, 6),
      seniorityLevel,
      educationLevel,
      educationRelevance,
      certificationCode: track.code,
      certificationName: track.name,
      certificationMeasurementMode: track.measurementMode,
      certificationStage: payload.certificationStage ?? null,
      passedUnits: legacyAccaPassedUnits == null ? null : Number(legacyAccaPassedUnits),
      percentComplete: payload.percentComplete == null ? null : Number(payload.percentComplete),
      localCertificationHref: track.isLocal ? localCertificationHref : null
    },
    detail: {
      scoringProfileCode: scoringProfile.code,
      weights: {
        experience: scoringProfile.experienceWeight,
        seniorityResponsibility: scoringProfile.seniorityWeight,
        educationTraining: scoringProfile.educationWeight,
        certificationLicense: scoringProfile.certificationWeight
      },
      experienceScore: round(experienceScore),
      seniorityResponsibilityScore: round(seniorityResponsibilityScore),
      educationTrainingScore: round(educationTrainingScore),
      certificationLicenseScore: round(certificationLicenseScore)
    }
  };
}

export function calculateMetricScore(metricCode: MetricCode, payload: Record<string, unknown>, context: ScoreContext = {}): MetricComputationResult {
  const ageGroup = getAgeGroup(context.age);
  const gender = normalizeGender(context.gender);

  switch (metricCode) {
    case "STR": {
      const bench = Number(payload.benchKg ?? 0);
      const deadlift = Number(payload.deadliftKg ?? 0);
      const squat = Number(payload.squatKg ?? 0);
      const result = scoreStrength(ageGroup, gender, bench, deadlift, squat);
      const score = round(clamp(result.score, 0, 100));
      return {
        metricCode,
        score,
        rankCode: getRank(score),
        rawScore: score,
        rawValue: round((bench + deadlift + squat) / 3),
        normalizedInput: { benchKg: bench, deadliftKg: deadlift, squatKg: squat, ageGroup, gender },
        detail: { ...result.detail, benchmarkAgeGroup: ageGroup, benchmarkGender: gender },
        confidenceStatus: "complete"
      };
    }
    case "DUR": {
      const minutes = Number(payload.minutes ?? 0);
      const seconds = Number(payload.seconds ?? 0);
      const totalMinutes = parseDurationToMinutes(minutes, seconds);
      const score = round(clamp(interpolateLower(totalMinutes, toBenchmarkPoints(mapBenchmarkRows(durBenchmarksByAgeBand[ageGroup] ?? durBenchmarksByAgeBand["23_26"], durationGenderMultiplier(gender)))), 0, 100));
      return {
        metricCode,
        score,
        rankCode: getRank(score),
        rawScore: score,
        rawValue: totalMinutes,
        normalizedInput: { minutes, seconds, totalMinutes, ageGroup, gender },
        detail: { benchmarkAgeGroup: ageGroup, benchmarkGender: gender, genderMultiplier: durationGenderMultiplier(gender) },
        confidenceStatus: "complete"
      };
    }
    case "SPD": {
      const seconds = Number(payload.seconds ?? 0);
      const score = round(clamp(interpolateLower(seconds, toBenchmarkPoints(mapBenchmarkRows(spdBenchmarksByAgeBand[ageGroup] ?? spdBenchmarksByAgeBand["23_26"], speedGenderMultiplier(gender)))), 0, 100));
      return {
        metricCode,
        score,
        rankCode: getRank(score),
        rawScore: score,
        rawValue: seconds,
        normalizedInput: { seconds, ageGroup, gender },
        detail: { benchmarkAgeGroup: ageGroup, benchmarkGender: gender, genderMultiplier: speedGenderMultiplier(gender) },
        confidenceStatus: "complete"
      };
    }
    case "INT": {
      const iqValue = Number(payload.iqValue ?? 0);
      const result = scoreIqLike(iqValue, ageGroup);
      const score = result.score;
      return {
        metricCode,
        score,
        rankCode: getRank(score),
        rawScore: score,
        rawValue: iqValue,
        normalizedInput: { iqValue, ageGroup, ageAdjustedValue: round(result.adjustedValue) },
        detail: { scoreSource: "IQ-like self input", mappedScore: score, ageGroup, ageAdjustment: cognitiveAgeAdjustment(ageGroup) },
        confidenceStatus: "complete"
      };
    }
    case "EMO": {
      const eqValue = Number(payload.eqValue ?? 0);
      const result = scoreEqLike(eqValue, ageGroup);
      const score = result.score;
      return {
        metricCode,
        score,
        rankCode: getRank(score),
        rawScore: score,
        rawValue: eqValue,
        normalizedInput: { eqValue, ageGroup, ageAdjustedValue: round(result.adjustedValue) },
        detail: { scoreSource: "EQ self input", mappedScore: score, ageGroup, ageAdjustment: cognitiveAgeAdjustment(ageGroup) },
        confidenceStatus: "complete"
      };
    }
    case "CRR": {
      const job = calculateJobScore({
        professionCode: String(payload.professionCode ?? "general_professional"),
        countryCode: String(payload.countryCode ?? "VN"),
        companyTier: String(payload.companyTier ?? "sme"),
        yearsExperience: Number(payload.yearsExperience ?? 0),
        seniorityLevel: String(payload.seniorityLevel ?? "associate"),
        educationLevel: String(payload.educationLevel ?? "bachelor_related"),
        educationRelevance: String(payload.educationRelevance ?? "related"),
        certificationCode: String(payload.certificationCode ?? "none"),
        certificationStage: payload.certificationStage == null ? null : String(payload.certificationStage),
        passedUnits: payload.passedUnits == null ? null : Number(payload.passedUnits),
        percentComplete: payload.percentComplete == null ? null : Number(payload.percentComplete),
        fCompleted: Number(payload.fCompleted ?? 0),
        pCompleted: Number(payload.pCompleted ?? 0),
        certificateStatus: String(payload.certificateStatus ?? "none")
      });

      return {
        metricCode,
        score: job.score,
        rankCode: job.rankCode,
        rawScore: job.score,
        rawValue: job.score,
        normalizedInput: job.normalizedInput,
        detail: job.detail,
        confidenceStatus: "complete"
      };
    }
    case "HEA": {
      const sleepHours = Number(payload.sleepHours ?? 0);
      const heightCm = Number(payload.heightCm ?? 0);
      const weightKg = Number(payload.weightKg ?? 0);
      const stepsPerDay = Number(payload.stepsPerDay ?? 0);
      const restingHr = Number(payload.restingHr ?? 0);
      const bmi = heightCm > 0 ? weightKg / ((heightCm / 100) ** 2) : 0;
      const sleepScore = scoreSleep(sleepHours, ageGroup);
      const bodyScore = scoreBmi(bmi, ageGroup, gender);
      const stepsScore = scoreSteps(stepsPerDay, ageGroup);
      const recoveryScore = scoreRecovery(restingHr, ageGroup, gender);
      const baseScore = sleepScore * 0.30 + bodyScore * 0.25 + stepsScore * 0.25 + recoveryScore * 0.20;
      const score = round(clamp(baseScore + healthAgeAdjustment(ageGroup) * 0.15, 0, 100));
      return {
        metricCode,
        score,
        rankCode: getRank(score),
        rawScore: score,
        rawValue: score,
        normalizedInput: { sleepHours, heightCm, weightKg, bmi: round(bmi), stepsPerDay, restingHr, ageGroup, gender },
        detail: {
          weights: { sleep: 0.30, bodyBmi: 0.25, steps: 0.25, restingHeartRate: 0.20 },
          sleepScore: round(sleepScore),
          bodyScore: round(bodyScore),
          stepsScore: round(stepsScore),
          recoveryScore: round(recoveryScore),
          ageGroup,
          gender
        },
        confidenceStatus: "complete"
      };
    }
    default:
      return {
        metricCode,
        score: 0,
        rankCode: "E",
        rawScore: 0,
        rawValue: 0,
        normalizedInput: {},
        detail: {},
        confidenceStatus: "missing"
      };
  }
}
