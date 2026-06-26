
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/hash";
import { randomToken, sha256 } from "@/lib/security";
import { setSessionCookie, getSessionToken } from "@/lib/auth";
import { getRequestMeta } from "@/lib/request-meta";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  try {
    await enforceRateLimit(`login:${email}`, 20, 60);
  } catch {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

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

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      eventType: "login",
      eventDetailJson: JSON.stringify({ email })
    }
  });

  await setSessionCookie(token);

  return NextResponse.json({
    message: "Logged in.",
    nextPath: user.hasCompletedInitialMeasurement ? "/tasks" : "/measure"
  });
}
