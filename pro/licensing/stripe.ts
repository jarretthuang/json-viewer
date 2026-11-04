import "server-only";
import Stripe from "stripe";
import { Resend } from "resend";
import { STRIPE_PRICE_ID, STRIPE_PRODUCT_ID } from "@/lib/pro-config";
import { mintLicense } from "./keys";
export function getStripe() {
  return process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
}
export async function paidLicense(stripe: Stripe, sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });
  const items = session.line_items?.data;
  const price = items?.[0]?.price;
  const product =
    typeof price?.product === "string" ? price.product : price?.product?.id;
  if (
    session.payment_status !== "paid" ||
    session.mode !== "payment" ||
    items?.length !== 1 ||
    items[0].quantity !== 1 ||
    price?.id !== STRIPE_PRICE_ID ||
    product !== STRIPE_PRODUCT_ID ||
    !session.customer_details?.email
  )
    return null;
  return {
    key: mintLicense(session.id, session.customer_details.email),
    email: session.customer_details.email,
  };
}
export async function fulfill(stripe: Stripe, sessionId: string) {
  const license = await paidLicense(stripe, sessionId);
  if (!license) return;
  if (!process.env.RESEND_API_KEY) {
    console.info("[stripe] license_email_not_configured");
    return;
  }
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send(
    {
      from: "JSON Viewer <support@jsonviewer.io>",
      to: license.email,
      subject: "Your JSON Viewer Pro license key",
      text: `Thank you for choosing JSON Viewer Pro. Keep this key safe:\n\n${license.key}\n\nActivate it at https://jsonviewer.io/pro`,
    },
    { idempotencyKey: `pro-license/${sessionId}` }
  );
  if (result.error) throw new Error("email_delivery_failed");
}
