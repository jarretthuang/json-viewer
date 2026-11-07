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
      className="ml-1 self-end rounded-full border border-mono-800/20 bg-black/[0.05] px-1.5 py-px text-xs font-semibold leading-none text-mono-800/70 shadow-sm hover:text-mono-800/90 dark:border-mono-300/20 dark:bg-white/[0.08] dark:text-mono-300/70 dark:hover:text-mono-300/90"
    >
      {isPro ? "Pro" : "Upgrade to Pro"}
    </Link>
  );
}
