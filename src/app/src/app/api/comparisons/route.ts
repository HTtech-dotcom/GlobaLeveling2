
import { NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

export async function GET() {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;

  const user = auth.user;

  const metrics = await prisma.userMetric.findMany({
    where: { userId: user.id },
    include: { metricDefinition: true },
    orderBy: { metricDefinition: { displayOrder: "asc" } }
  });

  const rows = await Promise.all(
    metrics.map(async (metric) => {
      const [baseline, age, region] = await Promise.all([
        prisma.userMetric.findMany({
          where: { metricDefinitionId: metric.metricDefinitionId, user: { is: { status: "active" } } },
          select: { score: true }
        }),
        prisma.userMetric.findMany({
          where: {
            metricDefinitionId: metric.metricDefinitionId,
            user: { is: { status: "active", ageGroup: user.ageGroup } }
          },
          select: { score: true }
        }),
        prisma.userMetric.findMany({
          where: {
            metricDefinitionId: metric.metricDefinitionId,
            user: { is: { status: "active", regionCode: user.regionCode } }
          },
          select: { score: true }
        })
      ]);

      return {
        metricCode: metric.metricDefinition.code,
        baseline: average(baseline.map((item) => item.score)),
        age: average(age.map((item) => item.score)),
        region: average(region.map((item) => item.score))
      };
    })
  );

  return NextResponse.json({ rows });
}
