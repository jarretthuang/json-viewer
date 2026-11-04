"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePro } from "./usePro";
export function checkoutUrl() {
  try {
    const url = new URL(
      process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || ""
    );
    return url.protocol === "https:" &&
      url.hostname.endsWith(".lemonsqueezy.com") &&
      url.pathname.startsWith("/checkout/buy/")
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function ProGate({ children }: { children: ReactNode }) {
  const { isPro } = usePro();
  const checkout = checkoutUrl();
  if (isPro) return <>{children}</>;
  return (
    <section className="rounded-xl border p-6" aria-label="Pro upgrade">
      <h2 className="text-xl font-bold">Unlock this Pro feature</h2>
      <p className="my-3">
        Pro is a $29 one-time add-on. All existing JSON tools remain free.
      </p>
      {checkout ? (
        <a href={checkout} rel="noreferrer" className="underline">
          Upgrade to Pro
        </a>
      ) : (
        <p>Checkout is not configured yet.</p>
      )}
      <p className="mt-3">
        <Link href="/pro" className="underline">
          Enter a license key
        </Link>
      </p>
    </section>
  );
}
