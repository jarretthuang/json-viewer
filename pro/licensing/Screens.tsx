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
function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-16">
      <Link href="/" className="underline">
        Back to JSON Viewer
      </Link>
      <h1 className="text-3xl font-bold">{title}</h1>
      {children}
    </main>
  );
}
const inputClass = "w-full rounded border border-gray-400 bg-transparent p-3";
const buttonClass =
  "rounded bg-sky-700 px-4 py-3 text-white disabled:opacity-50";
export function LicenseScreen() {
  const { isPro, validateKey, clearKey } = usePro();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <Frame title="Your Pro license">
      <p>
        Enter your license key to enable future Pro features on this browser.
        Existing JSON tools stay free.
      </p>
      <p>Pro is {PRO_PRICE_DISPLAY} USD, one time.</p>
      <CheckoutButton />
      <form
        className="space-y-4"
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
        <label className="block" htmlFor="license-key">
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
        <button className={buttonClass} disabled={busy}>
          {busy ? "Validating…" : "Validate key"}
        </button>
        <button
          type="button"
          className="ml-4 underline"
          disabled={busy}
          onClick={() => {
            clearKey();
            setKey("");
            setMessage("Saved license cleared.");
          }}
        >
          Clear key
        </button>
      </form>
      <p role="status" aria-label="License status">
        {message || (isPro ? "Pro is enabled on this browser." : "")}
      </p>
      <Link className="underline" href="/pro/lost-key">
        Lost my key?
      </Link>
    </Frame>
  );
}
export function LostKeyScreen() {
  return (
    <Frame title="Find your license key">
      <p>
        Automatic key recovery is unavailable. Find your Stripe receipt email
        for purchase details and your separate JSON Viewer Pro license email for
        the key. Keep the key from the purchase confirmation page safe.
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
    <Frame title="Thank you for choosing Pro">
      {completion ? (
        <>
          <p>Your license key:</p>
          <code className="block break-all rounded border p-4">
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
