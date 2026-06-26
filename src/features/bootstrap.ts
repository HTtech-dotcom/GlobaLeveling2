
import { prisma } from "@/lib/prisma";
import { calculateRank } from "@/features/rank";
import { getAgeGroup, toPublicMetricCode } from "@/config/metrics";
import { getProfession, normalizeProfessionCode } from "@/config/job-taxonomy";

function parseMetricRawValue(rawValueJson: string | null): Record<string, unknown> | null {
  if (!rawValueJson) return null;
  try {
    const parsed = JSON.parse(rawValueJson) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export async function buildBootstrapState(userId: string) {
  const [user, metrics] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userMetric.findMany({
      where: { userId },
      include: { metricDefinition: true },
      orderBy: { metricDefinition: { displayOrder: "asc" } }
    })
  ]);

  const metricSummaries = metrics.map((item) => {
    const metricCode = toPublicMetricCode(item.metricDefinition.code);
    return {
      metricCode,
      metricName: metricCode === "CRR" ? "Career" : item.metricDefinition.name,
      score: item.score,
      rankCode: item.rankCode,
      confidenceStatus: item.confidenceStatus,
      rawValue: parseMetricRawValue(item.rawValueJson)
    };
  });
  const rank = calculateRank(metricSummaries);
  const age = user.ageSnapshot ?? (user.birthYear ? new Date().getFullYear() - user.birthYear : 25);
  const ageGroup = user.ageGroup ?? getAgeGroup(age);
  const occupation = normalizeProfessionCode(user.occupation);
  const profession = getProfession(occupation);

  if (rank.currentRankCode !== user.currentRankCode || rank.overallScore !== user.currentOverallScore || age !== user.ageSnapshot || ageGroup !== user.ageGroup || occupation !== user.occupation || profession.industryGroupCode !== user.occupationCategory) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentRankCode: rank.currentRankCode,
        currentOverallScore: rank.overallScore,
        ageSnapshot: age,
        ageGroup,
        occupation,
        occupationCategory: profession.industryGroupCode,
        currentJobCode: occupation
      }
    });
  }

  return {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType,
      age,
      ageGroup,
      gender: user.gender ?? "male",
      occupation,
      occupationCategory: profession.industryGroupCode,
      regionCode: user.regionCode,
      regionName: user.regionName,
      currentJobCode: occupation,
      currentRankCode: rank.currentRankCode,
      currentOverallScore: rank.overallScore,
      theme: user.theme,
      currentPlanCode: user.currentPlanCode,
      trainingIntensity: user.trainingIntensity,
      hasCompletedInitialMeasurement: user.hasCompletedInitialMeasurement
    },
    metrics: metricSummaries,
    rank
  };
}
