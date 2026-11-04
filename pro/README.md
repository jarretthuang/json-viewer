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

## Configuration and operations

Server only: `LEMON_SQUEEZY_API_KEY`, `LEMON_SQUEEZY_STORE_ID`, and
`LEMON_SQUEEZY_PRODUCT_ID`. All are required to enable the endpoints; store and
product checks prevent accepting another seller's valid key. Optional
`LEMON_SQUEEZY_TEST_MODE=true` permits test keys (default false).
Public: `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL`, the dashboard's HTTPS
`*.lemonsqueezy.com/checkout/buy/...` share link. Missing configuration fails closed.

Validation uses POST /v1/licenses/validate (form encoded; public License API,
no bearer needed). The API key enables the integration and authenticates order
lookup only. Positive validation is cached for 5 minutes by SHA-256 key digest,
up to 1,000 entries. Browser validation is cached for 24 hours, including across
reloads; failed periodic validation closes the gate and retries after 5 minutes.
Browser storage is a convenience gate, not tamper-resistant authorization.

Per-process sliding windows allow 20 validations or 5 recovery requests per
10 minutes per IP. Maps are bounded and expired entries pruned. Vercel's trusted
`x-vercel-forwarded-for` is used only on Vercel; elsewhere all requests share a
bucket. Multi-instance deployment needs shared rate limiting before scale.
Only fixed operation/error codes are logged, never bodies, keys, emails or IPs.
Responses are no-store; customer records are not persisted.

## Provider choices and remaining launch work

Docs checked 2026-11-04:
- https://docs.lemonsqueezy.com/api/license-api/validate-license-key
- https://docs.lemonsqueezy.com/api/orders/list-all-orders
- https://docs.lemonsqueezy.com/api/license-keys/list-all-license-keys
- https://docs.lemonsqueezy.com/help/orders/resend-receipt
- https://docs.lemonsqueezy.com/help/checkout/hosted-checkout
- https://docs.lemonsqueezy.com/help/licensing/generating-license-keys

No public resend endpoint is documented (receipt resend is a dashboard action).
The requested fallback returns the matching key for display, not an email-sent
claim. This email-only recovery does not prove mailbox ownership and exposes a
key to anyone who knows the purchase email; replace it with provider My Orders
magic-link recovery before public launch if that tradeoff is unacceptable.
Lookup is restricted to paid, unrefunded orders and configured product/store/mode.
Pagination is bounded to 10 pages of 100 per collection, returning an upstream
error rather than silently reporting no match when the bound is exceeded.

Hosted checkout avoids loading Lemon.js or a third-party overlay in the editor.
Configure the $29 one-time product, license generation, receipt delivery and
checkout URL in the future account. No price or purchase is created by this code.
The thank-you screen supports a future verified completion adapter; redirect
wiring and trustworthy key/email-delivery confirmation remain outstanding.
Never put license keys in query strings. Without verified completion data the
screen explicitly says completion is not connected; it does not claim an email
was sent. Real validation/revocation, recovery, checkout, email delivery and
post-purchase handoff require the account and cannot yet be tested end to end.

## Foundation audit

The privacy policy already disclosed Vercel Web Analytics on the base branch;
no legal-page changes or new tracking were needed. `noImplicitAny` is enabled
with Jest/Prism types and a notification declaration; the fixes stayed below
the 20-file cutoff.

The requested history keyword scan was run once during the resumed audit:
`git log -p | grep -iE 'api[_-]?key|secret|token|password' | head -50`.
Its 50 returned lines contain dependency names/registry URLs (tokenizers), Sentry
DSN documentation, literal `SECRET` URL-scrubbing fixtures, a syntax-highlight
`token` assertion, and privacy guidance about passwords/API keys. No credential
values were found in those results. This truncated keyword scan is not proof
that the entire history is secret-free. `.env`, `.env.production`, and `*.key`
are ignored.
