
import { clamp, round } from "@/lib/number";
import { overallWeights, rankBands, toPublicMetricCode, type MetricCode } from "@/config/metrics";

export type RankSummary = {
  currentRankCode: string;
  averageScore: number;
  floorScore: number;
  overallScore: number;
};

export function getRank(score: number) {
  const safe = clamp(score, 0, 100);
  return rankBands.find((band) => safe >= band.min && safe <= band.max)?.code ?? "E";
}

export function calculateOverallScore(metrics: Array<{ metricCode: string; score: number }>) {
  if (!metrics.length) return 0;
  let total = 0;
  let weightTotal = 0;

  for (const metric of metrics) {
    const publicMetricCode = toPublicMetricCode(metric.metricCode);
    const weight = overallWeights[publicMetricCode as MetricCode] ?? 0;
    total += metric.score * weight;
    weightTotal += weight;
  }

  return round(weightTotal ? total / weightTotal : 0);
}

export function calculateRank(scores: number[] | Array<{ metricCode: string; score: number }>): RankSummary {
  if (!scores.length) {
    return { currentRankCode: "E", averageScore: 0, floorScore: 0, overallScore: 0 };
  }

  const numericScores = typeof scores[0] === "number"
    ? (scores as number[])
    : (scores as Array<{ metricCode: string; score: number }>).map((item) => item.score);

  const averageScore = round(numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length);
  const floorScore = round(Math.min(...numericScores));
  const overallScore = typeof scores[0] === "number"
    ? averageScore
    : calculateOverallScore(scores as Array<{ metricCode: string; score: number }>);

  return {
    currentRankCode: getRank(overallScore),
    averageScore,
    floorScore,
    overallScore
  };
}
