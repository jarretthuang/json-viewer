import { isProEnabled } from "@/lib/feature-flags";
import { NextResponse } from "next/server";
import { getStripe } from "../../../../../pro/licensing/stripe";
import { STRIPE_PRICE_ID } from "@/lib/pro-config";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!isProEnabled() || !stripe || !process.env.LICENSE_KEY_SECRET)
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  try {
    const site = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      managed_payments: { enabled: true },
      success_url: `${site}/pro/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/pro`,
    });
    if (!session.url) throw new Error("missing_checkout_url");
    return NextResponse.json(
      { url: session.url },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    console.warn("[stripe] checkout_unavailable");
    return NextResponse.json(
      { error: "checkout_unavailable" },
      { status: 502 }
    );
  }
}
