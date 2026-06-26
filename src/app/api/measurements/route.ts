
import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { calculateMetricScore } from "@/features/scoring";
import { buildBootstrapState } from "@/features/bootstrap";
import { LOGIC_VERSION, getStorageMetricCodes, metricCatalog, toPublicMetricCode } from "@/config/metrics";

export async function POST(request: NextRequest) {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;
  const user = auth.user;

  try {
    await enforceRateLimit(`measure:${user.id}`, 60, 60);
  } catch {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  const body = await request.json();
  const requestedMetricCode = body?.metricCode as string | undefined;
  const payload = body?.payload as Record<string, unknown> | undefined;

  if (!requestedMetricCode || !payload) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const publicMetricCode = toPublicMetricCode(requestedMetricCode);
  const metricDefinition = await prisma.metricDefinition.findFirst({
    where: { code: { in: getStorageMetricCodes(requestedMetricCode) } },
    orderBy: { displayOrder: "asc" }
  });
  if (!metricDefinition) {
    return NextResponse.json({ message: "Metric not found." }, { status: 404 });
  }

  const result = calculateMetricScore(publicMetricCode as never, payload, { age: user.ageSnapshot ?? 25, gender: user.gender ?? "male" });

  await prisma.$transaction(async (tx) => {
    const metricInput = await tx.metricInput.create({
      data: {
        userId: user.id,
        metricDefinitionId: metricDefinition.id,
        rawInputJson: JSON.stringify(payload),
        normalizedInputJson: JSON.stringify(result.normalizedInput),
        source: "manual_input"
      }
    });

    await tx.userMetric.upsert({
      where: {
        userId_metricDefinitionId: {
          userId: user.id,
          metricDefinitionId: metricDefinition.id
        }
      },
      create: {
        userId: user.id,
        metricDefinitionId: metricDefinition.id,
        score: result.score,
        rankCode: result.rankCode,
        rawValueJson: JSON.stringify(result.normalizedInput),
        confidenceStatus: result.confidenceStatus,
        lastMeasuredAt: new Date()
      },
      update: {
        score: result.score,
        rankCode: result.rankCode,
        rawValueJson: JSON.stringify(result.normalizedInput),
        confidenceStatus: result.confidenceStatus,
        lastMeasuredAt: new Date()
      }
    });

    await tx.levelingResult.create({
      data: {
        userId: user.id,
        metricDefinitionId: metricDefinition.id,
        metricInputId: metricInput.id,
        rawScore: result.rawScore,
        finalScore: result.score,
        rankCode: result.rankCode,
        logicVersion: LOGIC_VERSION,
        profileSnapshotJson: JSON.stringify({
          age: user.ageSnapshot,
          ageGroup: user.ageGroup,
          gender: user.gender,
          occupation: user.occupation,
          regionCode: user.regionCode
        }),
        calculationDetailJson: JSON.stringify(result.detail)
      }
    });

    const completedMetricCodes = await tx.metricInput.findMany({
      where: { userId: user.id },
      select: { metricDefinitionId: true },
      distinct: ["metricDefinitionId"]
    });

    if (completedMetricCodes.length >= metricCatalog.length) {
      await tx.user.update({
        where: { id: user.id },
        data: { hasCompletedInitialMeasurement: true }
      });
    }

    await tx.activityLog.create({
      data: {
        userId: user.id,
        eventType: "submit_metric",
        eventDetailJson: JSON.stringify({
          metricCode: publicMetricCode,
          logicVersion: LOGIC_VERSION,
          score: result.score
        })
      }
    });
  });

  const state = await buildBootstrapState(user.id);

  return NextResponse.json({
    message: "Saved.",
    score: result.score,
    metricCode: publicMetricCode,
    ...state
  });
}
