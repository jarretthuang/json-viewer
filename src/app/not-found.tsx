import Link from "next/link";
import NavBar from "@/components/nav-bar/NavBar";

export default function NotFound() {
  return (
    <main className="min-h-[100svh] bg-[#fdfeff] text-slate-950 dark:bg-[#0a0a0a] dark:text-offWhite">
      <NavBar
        actionVisibility={{
          back: false,
          forward: false,
          share: false,
          themeToggle: false,
          moreOptions: false,
        }}
      />

      <section className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white/80 p-8 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          The link might be broken or the page may have moved. Let&apos;s get you
          back to the JSON viewer.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-slate-300 px-5 py-2 text-sm font-medium transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
