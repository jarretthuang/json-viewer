"use client";

import Link from "next/link";
import { MouseEventHandler } from "react";
import { isProEnabled } from "@/lib/feature-flags";
import { usePro } from "../../../pro/licensing/usePro";

type ProBadgeProps = {
  showUpgrade?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function ProBadge({
  showUpgrade = false,
  onClick,
}: ProBadgeProps) {
  const { isPro } = usePro();

  if (!isProEnabled() || (!isPro && !showUpgrade)) {
    return null;
  }

  return (
    <Link
      href="/pro"
      onClick={onClick}
      className="ml-1 rounded-full border border-current px-2 py-0.5 text-xs font-semibold leading-none opacity-50 hover:opacity-70"
    >
      {isPro ? "Pro" : "Upgrade to Pro"}
    </Link>
  );
}
