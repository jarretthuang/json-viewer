import { NextResponse } from "next/server";
import { getStripe, fulfill } from "../../../../../pro/licensing/stripe";
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
      case "charge.refunded":
        console.info("[stripe] refund_received_revocation_pending");
        break;
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
