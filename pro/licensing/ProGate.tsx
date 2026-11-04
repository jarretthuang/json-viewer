"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePro } from "./usePro";
import { PRO_PRICE_DISPLAY } from "@/lib/pro-config";
export function CheckoutButton() {
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <>
      <button
        className="underline disabled:opacity-50"
        disabled={busy || unavailable}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/checkout/create", {
              method: "POST",
            });
            const data = await response.json();
            if (data.error === "not_configured") {
              setUnavailable(true);
              setMessage(
                "Checkout is not configured yet. Your free JSON tools remain available."
              );
            } else if (response.ok && typeof data.url === "string") {
              window.location.assign(data.url);
            } else
              setMessage("Checkout is unavailable. Please try again later.");
          } catch {
            setMessage("Could not connect to checkout. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Opening checkout…" : "Upgrade to Pro"}
      </button>
      <p role="status" aria-label="Checkout status">
        {message}
      </p>
    </>
  );
}
export function ProGate({ children }: { children: ReactNode }) {
  const { isPro } = usePro();
  if (isPro) return <>{children}</>;
  return (
    <section className="rounded-xl border p-6" aria-label="Pro upgrade">
      <h2 className="text-xl font-bold">Unlock this Pro feature</h2>
      <p className="my-3">
        Pro is a {PRO_PRICE_DISPLAY} one-time add-on. All existing JSON tools
        remain free.
      </p>
      <CheckoutButton />
      <p className="mt-3">
        <Link href="/pro" className="underline">
          Enter a license key
        </Link>
      </p>
    </section>
  );
}
