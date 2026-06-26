
import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/hash";

export async function POST(request: NextRequest) {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;
  if (!auth.user.email || !auth.user.passwordHash) {
    return NextResponse.json({ message: "Password update is unavailable for this account." }, { status: 400 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "Current password and new password are required." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: auth.user.id } });
  if (!dbUser.passwordHash || !(await verifyPassword(currentPassword, dbUser.passwordHash))) {
    return NextResponse.json({ message: "Current password is invalid." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { passwordHash: await hashPassword(newPassword) }
  });

  return NextResponse.json({ message: "Password updated." });
}
