
import { requireCurrentUserPage } from "@/lib/page-auth";
import { MeasureWorkspace } from "@/components/measure/measure-workspace";

export default async function MeasurePage() {
  await requireCurrentUserPage();
  return <MeasureWorkspace />;
}
