
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function requireCurrentUserPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  return user;
}

export async function requireCompletedMeasurementPage() {
  const user = await requireCurrentUserPage();
  if (!user.hasCompletedInitialMeasurement) {
    redirect("/measure");
  }
  return user;
}

export async function requireAdminPage() {
  const user = await requireCurrentUserPage();
  if (user.role !== "ADMIN") redirect("/tasks");
  return user;
}
