
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { randomToken, sha256 } from "@/lib/security";
import { setSessionCookie, getSessionToken } from "@/lib/auth";
import { getRequestMeta } from "@/lib/request-meta";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAgeGroup, metricCatalog } from "@/config/metrics";

function deriveNameFromEmail(email: string) {
  const [local] = email.split("@");
  return local?.trim() || "user";
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  try {
    await enforceRateLimit(`register:${email}`, 10, 60);
  } catch {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ message: "Email already registered." }, { status: 400 });
  }

  const realUserCount = await prisma.user.count({ where: { userType: "real_user" } });
  const role = realUserCount === 0 ? "ADMIN" : "USER";
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: deriveNameFromEmail(email),
      role,
      userType: "real_user",
      status: "active",
      ageSnapshot: 25,
      ageGroup: getAgeGroup(25),
      occupation: "general_professional",
      occupationCategory: "OTHER_GENERAL",
      currentJobCode: "general_professional"
    }
  });

  const metricDefinitions = await prisma.metricDefinition.findMany({ orderBy: { displayOrder: "asc" } });

  await prisma.userMetric.createMany({
    data: metricDefinitions.map((metric) => ({
      userId: user.id,
      metricDefinitionId: metric.id,
      score: 0,
      rankCode: "E",
      confidenceStatus: "missing"
    }))
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      eventType: "signup",
      eventDetailJson: JSON.stringify({ email, role })
    }
  });

  const previousToken = await getSessionToken();
  if (previousToken) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(previousToken) } });
  }

  const meta = await getRequestMeta();
  const token = randomToken();

  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: sha256(token),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  await setSessionCookie(token);

  return NextResponse.json({
    message: "Registered.",
    nextPath: "/measure",
    role,
    metrics: metricCatalog.map((metric) => metric.code)
  });
}
