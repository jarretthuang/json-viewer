# Pro licensing and billing

`pro/` contains proprietary Pro licensing and Stripe billing for jsonviewer.io,
with a one-time paid license. The open-core licensing split is described in
[LICENSE](LICENSE) and the root README's [Licensing section](../README.md#licensing).
The JSON editor, tree and toolbar do not import `pro/`; the navbar and Next.js
route adapters do import its licensing code.

## Purchase flow and code layout

- `/pro` uses `POST /api/checkout/create` to open a one-time Stripe Checkout
  session with Managed Payments enabled.
- `POST /api/stripe/webhook` verifies the Stripe signature against the raw request
  body. Completed and asynchronous-success checkout events retrieve the session,
  verify paid status, payment mode, quantity, price and product, then mint a key
  and email it through Resend. Missing Resend configuration skips email; delivery
  errors return 502 so Stripe can retry.
- `/pro/thank-you?session_id=…` independently retrieves and verifies the purchase
  and re-mints the key for display. It does not confirm email delivery.
- `/pro/lost-key` submits an email form to `POST /api/license/resend`. The endpoint
  queries Stripe customers using the as-entered and lowercased email, deduplicates
  matches, and scans the latest 1,000 completed checkout sessions for a
  case-insensitive `customer_details.email` match to cover guest checkouts without
  a Customer object. It re-checks paid status, deterministically re-mints the same
  key and re-sends it through the normal fulfillment path. Responses are generic
  to avoid disclosing account existence; requests share the resend rate-limit
  bucket of 5 requests per 10 minutes.

`pro/licensing/` holds the screens, checkout button, browser license state,
key signing/verification, validation handler and Stripe/Resend helpers.
`src/app/pro/**` supplies page adapters; `src/app/api/**` supplies checkout,
webhook and license endpoints. `src/lib/pro-config.ts` defines the displayed
price and Stripe product/price IDs.

## License keys

Keys are self-validating HMAC-SHA256 signatures. The payload contains a version
and an HMAC derived from `session_id|email`, without personal data or timestamps.
The same purchase re-mints the same key while the signing secret is unchanged;
there is no license database. `POST /api/license/validate` verifies the key.
`usePro` stores it in browser local storage and revalidates after 24 hours.
The response's `activations: 1` is an honor-system placeholder, not a measured
device count.

## Configuration and security

Server-only Vercel variables are `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`LICENSE_KEY_SECRET` and `RESEND_API_KEY`. Rotating `LICENSE_KEY_SECRET`
invalidates issued keys. Never put a secret in a public `NEXT_PUBLIC_*` variable.

`NEXT_PUBLIC_PRO_ENABLED=true` enables the badge, `/pro` purchase/activation
screen and checkout creation. Unset means off. License validation remains
ungated; the thank-you and lost-key routes are also independent of this flag.

The thank-you `session_id` is a bearer purchase-confirmation credential: never
share the confirmation URL. Licensing and billing logs contain fixed codes only,
never emails, request bodies, keys or secrets. Validation is limited to 20
requests per 10 minutes per IP within each process on Vercel; outside Vercel,
requests share one bucket. Multi-instance limiting needs a shared store.

## Current status and future work

Pro tools are coming soon. Automatic key recovery is available at `/pro/lost-key`
through Stripe lookup by email and a bounded scan of completed checkout sessions
for guest purchases. Paid purchases deterministically re-mint the same key and
re-send it without a database, with generic responses and resend rate limiting.
Refund events are logged; revocation is future work. Live mode needs live
product/price IDs, webhook configuration and keys in Vercel, plus explicit
launch review.

Reported sandbox verification on November 6, 2026: a sandbox purchase completed,
the webhook fired, the license email arrived and the key validated
on `/pro`.

## Future extension points (not built)

The proposed node-decoration and toolbar slots would add annotations beside tree
labels and new Pro actions after free toolbar actions, starting with diff/compare.
Extensions would receive a read-only JSON snapshot, avoid whole-document parsing
per node, preserve large-payload guards and keep JSON off the network. Only new
Pro actions would be license-gated. These slots are not implemented.
