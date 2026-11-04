import { getStripe, paidLicense } from "../../../../pro/licensing/stripe";
import { ThankYouScreen } from "../../../../pro/licensing/Screens";
export const metadata = {
  title: "Thank you",
  referrer: "no-referrer" as const,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id: id } = await searchParams;
  const stripe = getStripe();
  let completion;
  if (
    stripe &&
    process.env.LICENSE_KEY_SECRET &&
    typeof id === "string" &&
    /^cs_[A-Za-z0-9_]+$/.test(id) &&
    id.length < 256
  ) {
    try {
      const license = await paidLicense(stripe, id);
      if (license) completion = { key: license.key, emailSent: false };
    } catch {
      console.warn("[stripe] confirmation_unavailable");
    }
  }
  return <ThankYouScreen completion={completion} />;
}
