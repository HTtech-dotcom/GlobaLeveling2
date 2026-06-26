
import { NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import { calculateRank } from "@/features/rank";

export async function POST() {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;

  const metrics = await prisma.userMetric.findMany({
    where: { userId: auth.user.id },
    select: { score: true, metricDefinition: { select: { code: true } } }
  });

  const evaluation = calculateRank(metrics.map((item) => ({ metricCode: item.metricDefinition.code, score: item.score })));
  return NextResponse.json({
    ok: true,
    currentRankCode: evaluation.currentRankCode,
    overallScore: evaluation.overallScore,
    message: "Promotion exam placeholder. Commercial exam flow can be added later."
  });
}
