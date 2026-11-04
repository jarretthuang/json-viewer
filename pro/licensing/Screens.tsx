"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
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
      <p role="status">
        {message || (isPro ? "Pro is enabled on this browser." : "")}
      </p>
      <Link className="underline" href="/pro/lost-key">
        Lost my key?
      </Link>
    </Frame>
  );
}
export function LostKeyScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  return (
    <Frame title="Find your license key">
      <p>Use the email from your purchase. Your key will be displayed here.</p>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setKey("");
          setMessage("");
          try {
            const response = await fetch("/api/license/resend", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
              cache: "no-store",
              signal: AbortSignal.timeout(30_000),
            });
            const result = await response.json();
            if (response.ok && typeof result.key === "string") {
              setKey(result.key);
              setEmail("");
              setMessage("Your key was found. No new email was sent.");
            } else
              setMessage(
                result.error === "not_found"
                  ? "No eligible license was found for that email."
                  : messages[result.error as LicenseError] ||
                      messages.network_error
              );
          } catch {
            setMessage(messages.network_error);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="purchase-email" className="block">
          Purchase email
        </label>
        <input
          id="purchase-email"
          className={inputClass}
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button className={buttonClass} disabled={busy}>
          {busy ? "Finding key…" : "Find my key"}
        </button>
      </form>
      <p role="status">{message}</p>
      {key && <code className="block break-all rounded border p-4">{key}</code>}
      <Link href="/pro" className="underline">
        Enter your key
      </Link>
    </Frame>
  );
}
// Only a future server-verified purchase adapter may supply completion.
export function ThankYouScreen({
  completion,
}: {
  completion?: { key: string; emailSent: boolean };
}) {
  return (
    <Frame title="Thank you for choosing Pro">
      {completion ? (
        <>
          <p>Your license key:</p>
          <code className="block break-all rounded border p-4">
            {completion.key}
          </code>
          <p>
            {completion.emailSent
              ? "Your license key email has been sent."
              : "Email delivery has not been confirmed. Keep a copy of your key."}
          </p>
        </>
      ) : (
        <p>
          Purchase confirmation is not connected yet. After purchasing, find
          your key in your Lemon Squeezy receipt email.
        </p>
      )}
      <Link href="/pro" className="underline">
        Activate your license
      </Link>
    </Frame>
  );
}
