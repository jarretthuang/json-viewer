# Pro infrastructure

## Extension contract (v1)

The MIT editor/tree/toolbar never import `pro/`. Future core extension types belong
with the core and accept optional props with empty defaults. A Pro composition
root supplies implementations; the core remains independently buildable.

- Node decoration: `decorateNode({ path, value, kind }): ReactNode`, where path is
  a readonly array of string/number segments, value is read-only JSON, and kind is
  object/array/string/number/boolean/null. Render only for mounted visible nodes,
  beside the existing label; never replace editing, expansion, or copy controls.
- Toolbar: `toolbarExtensions: readonly { id, label, disabled?, onSelect }[]`.
  Append accessible buttons after free actions. Actions receive a read-only JSON
  snapshot through the composition root; no global registration or mutation.
- Extensions must not parse whole documents per node, traverse collapsed trees,
  remove chunking, bypass large-payload guards, or send JSON over the network.
- Gate only new Pro actions in that composition root. No existing free action
  depends on a license. These slots are a design contract, not installed features.

Documented UI entry points: `src/app/pro/**` are thin route adapters importing
Pro screens. License API routes may import `pro/licensing/server.ts`. No other
core module imports Pro; no navbar change or existing feature gate is needed.

## Stripe test-mode integration

Server-only Vercel variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`LICENSE_KEY_SECRET`, `RESEND_API_KEY`. Generate a strong random license signing
secret and retain it: rotating it invalidates issued keys. Never use a public
Next.js variable for any secret. `.env*` remains ignored.

Price/product constants live in `src/lib/pro-config.ts`. These currently identify
the sandbox $19.99 USD one-time product. Moving to live mode requires live IDs,
keys, webhook registration and explicit launch review; there is no test-only
branch in the integration code. Checkout enables Managed Payments explicitly.

Webhook signatures are checked against the raw request body. Both successful
Checkout events retrieve the session and verify paid status, mode, quantity,
price and product before issuing a key. The thank-you page uses the same checks;
it is dynamic and never trusts the redirect alone. Treat session IDs as bearer
purchase-confirmation credentials; never share the confirmation URL.

Keys are `base64url(payload).base64url(HMAC-SHA256(payload))`. The v1 payload
contains a version and HMAC of `session_id|email`, with no timestamps or personal
data. This produces the same key on every retry, including across serverless
instances. Validation checks the signature with a timing-safe comparison.
There is no license database. `activations: 1` is an honor-system value, not a
measured device count. Activation limits, revocation and email-to-key lookup
require a store later. Refunds are logged with a fixed code; revocation is future
work. Browser validation/cache behavior is unchanged.

Resend sends from `support@jsonviewer.io` with idempotency key
`pro-license/<session_id>`. Provider-side idempotency suppresses duplicate email
effects within Resend's 24-hour retention window, including concurrent requests.
Deterministic license issuance remains idempotent indefinitely; exactly-once
email beyond that window requires durable state. Delivery failures return 502 so
Stripe can retry. With no Resend key, email is skipped and logged with a fixed
code; the thank-you page still shows the key. The page does not claim email was
sent. Stripe receipt emails contain purchase details, not our license key;
automatic recovery is explicitly unavailable. Keep the separate license email
and confirmation-page key safe.

Buyer payment records remain at Stripe; the application persists no buyer data.
Email delivery necessarily sends the buyer email and key to Resend. No JSON
editor content is involved, and no existing free feature is gated.

Validation retains bounded per-process rate limiting (20 requests per 10 minutes,
trusted Vercel IP header only on Vercel). Multi-instance rate limiting needs a
shared store. Logs contain fixed codes only, never emails, bodies, keys or secrets.

Before testing real purchases, configure the product's eligible Managed Payments
tax code, register `/api/stripe/webhook` for completed/async success/async failure
and refund events, configure Vercel variables, and verify the Resend domain.
No real Checkout, webhook or email delivery has been verified without credentials.

References:
- https://docs.stripe.com/payments/managed-payments/set-up
- https://docs.stripe.com/webhooks/signature
- https://resend.com/docs/dashboard/emails/idempotency-keys
