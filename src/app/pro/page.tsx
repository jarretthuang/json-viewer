import { isProEnabled } from "@/lib/feature-flags";
import { LicenseScreen } from "../../../pro/licensing/Screens";
export const metadata = {
  title: "Pro license",
  robots: { index: false, follow: false },
};
export default function ProPage() {
  if (!isProEnabled()) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <p>Pro isn&apos;t available yet.</p>
      </main>
    );
  }

  return <LicenseScreen />;
}
