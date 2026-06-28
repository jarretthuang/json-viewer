"use client";
import Link from "next/link";
import NavBar from "@/components/nav-bar/NavBar";
import StatusCard from "@/components/status-card/StatusCard";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col bg-[#fdfeff] text-slate-950 dark:bg-[#0a0a0a] dark:text-offWhite">
      <NavBar
        actionVisibility={{
          back: false,
          forward: false,
          share: false,
          themeToggle: true,
          moreOptions: true,
        }}
      />

      <section className="flex w-full flex-1 p-8">
        <StatusCard
          eyebrow="404"
          title="Page not found"
          titleLevel={1}
          description="The link might be broken or the page may have been removed."
          action={
            <Link
              href="/"
              className="w-fit px-5 py-2 text-[16px] font-medium underline hover:opacity-80"
            >
              Back to home
            </Link>
          }
        />
      </section>
    </main>
  );
}
