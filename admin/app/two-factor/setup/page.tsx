import { SetupTwoFactor } from "@admin/components/setup-two-factor";
import { redirect } from "next/navigation";
import { requireAuthenticatedSession } from "@admin/lib/require-admin-session";

export const dynamic = "force-dynamic";

export default async function SetupTwoFactorPage() {
  const session = await requireAuthenticatedSession();
  if ("twoFactorEnabled" in session.user && session.user.twoFactorEnabled) redirect("/admin");
  return <SetupTwoFactor />;
}
