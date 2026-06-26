
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

type RouteAuthSuccess = {
  ok: true;
  user: CurrentUser;
  response: null;
};

type RouteAuthFailure = {
  ok: false;
  user: null;
  response: NextResponse;
};

export async function requireCurrentUserJson(): Promise<RouteAuthSuccess | RouteAuthFailure> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      user: null,
      response: NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    };
  }

  return {
    ok: true,
    user,
    response: null
  };
}

export async function requireRouteUser(): Promise<RouteAuthSuccess | RouteAuthFailure> {
  return requireCurrentUserJson();
}
