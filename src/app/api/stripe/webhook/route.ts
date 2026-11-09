import { NextResponse } from "next/server";
import { getStripe, fulfill, paidLicense } from "../../../../../pro/licensing/stripe";
import { revokeLicenseKey } from "../../../../../pro/licensing/revocation";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret || !process.env.LICENSE_KEY_SECRET)
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      secret
    );
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfill(stripe, event.data.object.id);
        break;
      case "checkout.session.async_payment_failed":
        console.info("[stripe] async_payment_failed");
        break;
      case "charge.refunded": {
        const charge = event.data.object;
        if (charge.amount_refunded !== charge.amount) break;
        const paymentIntent = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
        if (!paymentIntent) {
          console.info("[stripe] refund_session_not_found");
          break;
        }
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent,
          limit: 1,
        });
        const session = sessions.data[0];
        if (!session) {
          console.info("[stripe] refund_session_not_found");
          break;
        }
        const license = await paidLicense(stripe, session.id);
        if (license) await revokeLicenseKey(license.key);
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    console.warn("[stripe] fulfillment_unavailable");
    return NextResponse.json(
      { error: "fulfillment_unavailable" },
      { status: 502 }
    );
  }
}
