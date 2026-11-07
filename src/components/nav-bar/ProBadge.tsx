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
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="ml-1 rounded-full border border-mono-800/30 bg-white/70 px-1.5 py-px text-[25px] font-semibold leading-none text-mono-800/75 shadow-sm hover:bg-white/90 hover:text-mono-800/90 dark:border-mono-300/[0.35] dark:bg-white/[0.08] dark:text-mono-300/75 dark:hover:bg-white/[0.12] dark:hover:text-mono-300/90"
    >
      {isPro ? "Pro" : "Upgrade to Pro"}
    </Link>
  );
}
