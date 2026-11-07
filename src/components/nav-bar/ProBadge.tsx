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

  const label = isPro ? "PRO" : "Upgrade to PRO";
  // Chromium, app font at 600 / 25px: text widths 52.075 and 191.300.
  // Add 13.5 units of padding and a 1-unit border on each side.
  const width = isPro ? 81.075 : 220.3;
  // SVG height: 29px at the reference root font-size of 36px.

  return (
    <Link
      href="/pro"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={label}
      className="group/pro-badge ml-1 inline-flex rounded-full shadow-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} 29`}
        aria-hidden="true"
        focusable="false"
        className="block h-[0.8055555556rem] w-auto font-semibold"
      >
        <rect
          x="0.5"
          y="0.5"
          width={width - 1}
          height="28"
          rx="14.5"
          strokeWidth="1"
          className="fill-white/70 stroke-mono-800/30 group-hover/pro-badge:fill-white/90 dark:fill-white/[0.08] dark:stroke-mono-300/[0.35] dark:group-hover/pro-badge:fill-white/[0.12]"
        />
        <text
          x={width / 2}
          y="14.5"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="25"
          textRendering="geometricPrecision"
          className="fill-mono-800/75 group-hover/pro-badge:fill-mono-800/90 dark:fill-mono-300/75 dark:group-hover/pro-badge:fill-mono-300/90"
        >
          {label}
        </text>
      </svg>
    </Link>
  );
}
