
import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserJson } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import { getAgeGroup, getRegionLabel } from "@/config/metrics";
import { buildBootstrapState } from "@/features/bootstrap";
import { getProfession, normalizeProfessionCode } from "@/config/job-taxonomy";

export async function POST(request: NextRequest) {
  const auth = await requireCurrentUserJson();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const age = Number(body.age ?? auth.user.ageSnapshot ?? 25);
  const occupation = normalizeProfessionCode(String(body.occupation ?? auth.user.occupation ?? "general_professional"));
  const gender = String(body.gender ?? auth.user.gender ?? "male");
  const profession = getProfession(occupation);
  const regionCode = String(body.regionCode ?? auth.user.regionCode ?? "VN-HCM");
  const currentPlanCode = String(body.currentPlanCode ?? auth.user.currentPlanCode ?? "balanced");
  const trainingIntensity = String(body.trainingIntensity ?? auth.user.trainingIntensity ?? "balanced");
  const theme = String(body.theme ?? auth.user.theme ?? "dark");
  const goal = body.goal == null ? auth.user.goal : String(body.goal);

  await prisma.user.update({
    where: { id: auth.user.id },
    data: {
      ageSnapshot: age,
      ageGroup: getAgeGroup(age),
      gender,
      occupation,
      occupationCategory: profession.industryGroupCode,
      currentJobCode: occupation,
      regionCode,
      regionName: getRegionLabel(regionCode),
      currentPlanCode,
      trainingIntensity,
      theme,
      goal
    }
  });

  await prisma.activityLog.create({
    data: {
      userId: auth.user.id,
      eventType: "update_profile",
      eventDetailJson: JSON.stringify({ age, gender, occupation, industryGroupCode: profession.industryGroupCode, regionCode, currentPlanCode, trainingIntensity, theme })
    }
  });

  const state = await buildBootstrapState(auth.user.id);
  return NextResponse.json({ message: "Profile updated.", user: state.user });
}
