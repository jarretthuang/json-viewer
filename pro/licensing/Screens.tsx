"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckoutButton } from "./ProGate";
import { PRO_PRICE_DISPLAY } from "@/lib/pro-config";
import { usePro, type LicenseError } from "./usePro";
const messages: Record<LicenseError, string> = {
  invalid_key: "This license key is invalid, expired, or disabled.",
  network_error: "Could not reach the license service. Please try again.",
  not_configured:
    "Licensing is not configured yet. Your free JSON tools are ready to use.",
  rate_limited: "Too many attempts. Please try again in 10 minutes.",
  storage_unavailable:
    "Browser storage is unavailable. Allow local storage to save your license.",
};
// The editor scales the root font with the viewport; keep license forms compact.
function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[576px] space-y-[24px] px-[24px] py-[40px] text-[16px] sm:py-[64px]">
      <h1 className="text-[30px] font-medium tracking-tight">{title}</h1>
      {children}
    </main>
  );
}
const inputClass =
  "w-full rounded border border-powderBlue-200 bg-powderBlue-50 p-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-powderBlue-400 dark:border-neutral-700 dark:bg-neutral-950 dark:focus-visible:outline-powderBlue-100";
const buttonClass =
  "rounded bg-sky-700 px-[16px] py-[12px] text-[14px] font-medium text-white hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-powderBlue-400 disabled:opacity-50 dark:focus-visible:outline-powderBlue-100";
function Purchase() {
  return (
    <>
      <p className="flex flex-wrap items-baseline gap-x-[8px]">
        <span className="text-[30px] font-medium tracking-tight">
          {PRO_PRICE_DISPLAY}
        </span>
        <span className="text-[14px] text-slate-600 dark:text-neutral-400">
          USD · one-time purchase
        </span>
      </p>
      <div className="[&_button]:rounded [&_button]:bg-sky-700 [&_button]:px-[16px] [&_button]:py-[12px] [&_button]:text-[14px] [&_button]:font-medium [&_button]:text-white [&_button]:no-underline hover:[&_button]:bg-sky-800 focus-visible:[&_button]:outline focus-visible:[&_button]:outline-2 focus-visible:[&_button]:outline-offset-2 focus-visible:[&_button]:outline-powderBlue-400 [&_p:empty]:hidden [&_p]:mt-[12px] [&_p]:text-[14px]">
        <CheckoutButton />
      </div>
      <p className="text-[14px] text-slate-600 dark:text-neutral-400">
        Existing JSON tools stay free. License key delivered by email.
      </p>
    </>
  );
}
export function LicenseScreen() {
  const { isPro, validateKey, clearKey } = usePro();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <Frame title={isPro ? "Your PRO license" : "JSON Viewer PRO"}>
      {isPro ? (
        <p className="rounded border border-powderBlue-200 bg-powderBlue-100/20 p-[16px] font-medium dark:border-neutral-700 dark:bg-neutral-900">
          PRO is enabled on this browser.
        </p>
      ) : (
        <p className="text-slate-600 dark:text-neutral-400">
          A one-time license for the next set of JSON Viewer tools.
        </p>
      )}
      {isPro ? (
        <details className="text-[14px] text-slate-600 dark:text-neutral-400">
          <summary className="cursor-pointer underline underline-offset-4">
            Purchase another license
          </summary>
          <div className="mt-[16px] space-y-[12px]">
            <Purchase />
          </div>
        </details>
      ) : (
        <div className="space-y-[16px]">
          <Purchase />
        </div>
      )}
      <section
        aria-labelledby="included-heading"
        className="space-y-[8px] text-[14px]"
      >
        <h2 id="included-heading" className="font-medium">
          What’s included
        </h2>
        <p className="text-slate-600 dark:text-neutral-400">
          Coming soon. Your license unlocks these tools as they roll out:
        </p>
        <ul className="list-disc space-y-[4px] pl-[20px] text-slate-600 dark:text-neutral-400">
          <li>JSON diff &amp; compare</li>
          <li>JWT inspector</li>
          <li>Schema tools</li>
          <li>Format conversion</li>
          <li>Regex search</li>
        </ul>
      </section>
      <section
        aria-labelledby="activation-heading"
        className="space-y-[16px] rounded-lg border border-powderBlue-200 bg-powderBlue-100/10 p-[20px] dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 id="activation-heading" className="text-[18px] font-medium">
          {isPro ? "Manage your license" : "Already have a license?"}
        </h2>
        <form
          className="space-y-[16px]"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setMessage("");
            const result = await validateKey(key);
            setBusy(false);
            setMessage(
              result.valid
                ? "License validated and saved on this browser."
                : messages[result.error || "network_error"]
            );
            if (result.valid) setKey("");
          }}
        >
          <label
            className="block text-[14px] font-medium"
            htmlFor="license-key"
          >
            License key
          </label>
          <input
            id="license-key"
            className={inputClass}
            type="password"
            autoComplete="off"
            required
            maxLength={256}
            value={key}
            onChange={(event) => setKey(event.target.value)}
          />
          <div className="flex flex-wrap gap-[12px]">
            <button className={buttonClass} disabled={busy}>
              {busy ? "Validating…" : "Validate key"}
            </button>
            <button
              type="button"
              className="rounded border border-powderBlue-200 px-[16px] py-[12px] text-[14px] hover:bg-powderBlue-100/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-powderBlue-400 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              disabled={busy}
              onClick={() => {
                clearKey();
                setKey("");
                setMessage("Saved license cleared.");
              }}
            >
              Clear key
            </button>
          </div>
        </form>
        <p
          className="min-h-[20px] text-[14px]"
          role="status"
          aria-label="License status"
        >
          {message}
        </p>
        <Link
          className="inline-block text-[14px] underline underline-offset-4"
          href="/pro/lost-key"
        >
          Lost my key?
        </Link>
      </section>
    </Frame>
  );
}
export function LostKeyScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <Frame title="Find your license key">
      <p>
        Enter your purchase email to recover your JSON Viewer PRO license key.
      </p>
      <form
        className="space-y-[16px]"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/license/resend", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            setMessage(
              response.ok
                ? "If that email purchased PRO, the key has been sent."
                : response.status === 429
                ? messages.rate_limited
                : "Could not send right now. Please try again later."
            );
          } catch {
            setMessage("Could not send right now. Please try again later.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label
          className="block text-[14px] font-medium"
          htmlFor="purchase-email"
        >
          Purchase email
        </label>
        <input
          id="purchase-email"
          className={inputClass}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button className={buttonClass} disabled={busy}>
          {busy ? "Sending…" : "Send license key"}
        </button>
      </form>
      <p role="status" aria-label="Recovery status" className="text-[14px]">
        {message}
      </p>
      <Link href="/pro" className="underline">
        Enter your key
      </Link>
    </Frame>
  );
}
// Completion is supplied only by the server-verified Stripe adapter.
export function ThankYouScreen({
  completion,
}: {
  completion?: { key: string; emailSent: boolean };
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Frame title="Thank you for choosing PRO">
      {completion ? (
        <>
          <p>Your license key:</p>
          <code className="block break-all rounded border p-[16px]">
            {completion.key}
          </code>
          <button
            className={buttonClass}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(completion.key);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy license key"}
          </button>
          <p>Keep this key safe.</p>
          <p>
            {completion.emailSent
              ? "Your license key email has been sent."
              : "Email delivery has not been confirmed. Keep a copy of your key."}
          </p>
        </>
      ) : (
        <p>
          Purchase confirmation is not connected yet. After purchasing, find
          your purchase details in your Stripe receipt email.
        </p>
      )}
      <Link href="/pro" className="underline">
        Activate your license
      </Link>
    </Frame>
  );
}
