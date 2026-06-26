import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildBootstrapState } from "@/features/bootstrap";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, metrics: [], rank: null }, { status: 401 });
  }

  const state = await buildBootstrapState(user.id);
  return NextResponse.json(state);
}
