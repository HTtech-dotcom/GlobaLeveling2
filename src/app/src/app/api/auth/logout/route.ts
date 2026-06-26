
import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/security";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  }

  await clearSessionCookie();
  return NextResponse.json({ message: "Logged out." });
}
