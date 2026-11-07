import { isProEnabled } from "@/lib/feature-flags";
import { LicenseScreen } from "../../../pro/licensing/Screens";
export const metadata = {
  title: "PRO license",
  robots: { index: false, follow: false },
};
export default function ProPage() {
  if (!isProEnabled()) {
    return (
      <main className="mx-auto max-w-[576px] px-[24px] py-[40px] text-[16px] sm:py-[64px]">
        <p>PRO isn&apos;t available yet.</p>
      </main>
    );
  }

  return <LicenseScreen />;
}
