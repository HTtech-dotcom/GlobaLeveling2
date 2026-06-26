
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/security";

const cookieName = process.env.AUTH_COOKIE_NAME ?? "gl_session";
const ttlDays = Number(process.env.SESSION_TTL_DAYS ?? 14);

export async function getSessionToken() {
  const jar = await cookies();
  return jar.get(cookieName)?.value ?? null;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttlDays * 24 * 60 * 60
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(cookieName);
}

export async function getCurrentSession() {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true }
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() }
  });

  await prisma.user.update({
    where: { id: session.userId },
    data: { lastActiveAt: new Date() }
  });

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}
