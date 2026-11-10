"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageLabels: Record<string, string> = {
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/pro": "Pro",
  "/pro/lost-key": "Lost key",
  "/pro/thank-you": "Thank you",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const currentLabel = pageLabels[pathname];
  const isLegalPage = pathname === "/privacy" || pathname === "/terms";

  if (!currentLabel) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mx-auto w-full ${isLegalPage ? "max-w-[800px]" : "max-w-[576px]"} px-[24px] pt-[16px] text-[14px] leading-[20px] text-mono-600 dark:text-mono-300`}
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:underline focus-visible:underline">
            Home
          </Link>
        </li>
        {pathname.startsWith("/pro/") && (
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
