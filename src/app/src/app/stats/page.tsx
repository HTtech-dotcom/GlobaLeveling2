
import { requireCompletedMeasurementPage } from "@/lib/page-auth";
import { StatsWorkspace } from "@/components/stats/stats-workspace";

export default async function StatsPage() {
  await requireCompletedMeasurementPage();
  return <StatsWorkspace />;
}
