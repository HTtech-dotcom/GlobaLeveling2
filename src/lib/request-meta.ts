import { headers } from "next/headers";

export async function getRequestMeta() {
  const h = await headers();
  return {
    userAgent: h.get("user-agent") ?? "unknown",
    ipAddress: h.get("x-forwarded-for") ?? "local"
  };
}
