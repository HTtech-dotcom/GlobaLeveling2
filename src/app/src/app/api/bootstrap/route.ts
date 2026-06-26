
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRank } from "@/features/rank";
import { getAgeGroup } from "@/config/metrics";
import { getProfession, normalizeProfessionCode } from "@/config/job-taxonomy";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, metrics: [], rank: null }, { status: 401 });
  }

  const metrics = await prisma.userMetric.findMany({
    where: { userId: user.id },
    include: { metricDefinition: true },
    orderBy: { metricDefinition: { displayOrder: "asc" } }
  });

  const metricSummaries = metrics.map((item) => ({
    metricCode: item.metricDefinition.code,
    metricName: item.metricDefinition.name,
    score: item.score,
    rankCode: item.rankCode,
    confidenceStatus: item.confidenceStatus
  }));

  const rank = calculateRank(metricSummaries);
  const age = user.ageSnapshot ?? (user.birthYear ? new Date().getFullYear() - user.birthYear : 25);
  const ageGroup = user.ageGroup ?? getAgeGroup(age);
  const occupation = normalizeProfessionCode(user.occupation);
  const profession = getProfession(occupation);

  if (rank.currentRankCode !== user.currentRankCode || rank.overallScore !== user.currentOverallScore || age !== user.ageSnapshot || ageGroup !== user.ageGroup || occupation !== user.occupation || profession.industryGroupCode !== user.occupationCategory) {
    await prisma.user.update({
      where: { id: user.id },
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

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType,
      age,
      ageGroup,
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
  });
}
