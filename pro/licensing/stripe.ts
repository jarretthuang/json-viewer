import "server-only";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
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
export async function fulfill(
  stripe: Stripe,
  sessionId: string,
  recovery = false
) {
  const license = await paidLicense(stripe, sessionId);
  if (!license) return;
  if (!process.env.RESEND_API_KEY) {
    console.info("[stripe] license_email_not_configured");
    if (recovery) throw new Error("email_delivery_failed");
    return;
  }
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send(
    {
      from: "JSON Viewer <support@jsonviewer.io>",
      to: license.email,
      subject: "Your JSON Viewer Pro license key",
      text: `Thank you for choosing JSON Viewer Pro. Keep this key safe:\n\n${license.key}\n\nActivate it at https://jsonviewer.io/pro`,
    },
    {
      idempotencyKey: recovery
        ? `pro-recovery/${randomUUID()}`
        : `pro-license/${sessionId}`,
    }
  );
  if (result.error) throw new Error("email_delivery_failed");
}

// Paginate customer-anchored lists so older purchases remain recoverable.
export async function recoverLicense(stripe: Stripe, email: string) {
  const normalizedEmail = email.toLowerCase();
  const customerIds = new Set<string>();
  for (const lookupEmail of Array.from(new Set([email, normalizedEmail]))) {
    for await (const customer of stripe.customers.list({
      email: lookupEmail,
      limit: 100,
    })) {
      if (customerIds.has(customer.id)) continue;
      customerIds.add(customer.id);
      for await (const session of stripe.checkout.sessions.list({
        customer: customer.id,
        status: "complete",
        limit: 100,
      })) {
        const license = await paidLicense(stripe, session.id);
        if (license && license.email.toLowerCase() === normalizedEmail) {
          await fulfill(stripe, session.id, true);
          return;
        }
      }
    }
  }

  // Guest checkout may have no Customer. Scan at most the latest 1,000
  // completed sessions (10 pages of 100) to bound each recovery request.
  let scanned = 0;
  for await (const session of stripe.checkout.sessions.list({
    status: "complete",
    limit: 100,
  })) {
    if (session.customer_details?.email?.toLowerCase() === normalizedEmail) {
      const license = await paidLicense(stripe, session.id);
      if (license && license.email.toLowerCase() === normalizedEmail) {
        await fulfill(stripe, session.id, true);
        return;
      }
    }
    if (++scanned >= 1_000) break;
  }
}
