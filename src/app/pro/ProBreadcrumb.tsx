"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageLabels: Record<string, string> = {
  "/pro": "Pro",
  "/pro/lost-key": "Lost key",
  "/pro/thank-you": "Thank you",
};

export default function ProBreadcrumb() {
  const pathname = usePathname();
  const currentLabel = pageLabels[pathname];

  if (!currentLabel) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto w-full max-w-[576px] px-[24px] pt-[16px] text-sm text-mono-600 dark:text-mono-300"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:underline focus-visible:underline">
            Home
          </Link>
        </li>
        {pathname !== "/pro" && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link
              href="/pro"
              className="hover:underline focus-visible:underline"
            >
              Pro
            </Link>
          </li>
        )}
        <li className="flex items-center gap-2">
          <span aria-hidden="true">/</span>
          <span aria-current="page">{currentLabel}</span>
        </li>
      </ol>
    </nav>
  );
}
