import { requireCurrentUserPage } from "@/lib/page-auth";
import { AccountPanel } from "@/components/account/account-panel";

export default async function AccountPage() {
  await requireCurrentUserPage();
  return <AccountPanel />;
}
