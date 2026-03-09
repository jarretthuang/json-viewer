import Link from "next/link";
import NavBar from "@/components/nav-bar/NavBar";

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
        <div className="m-auto flex max-w-[500px] flex-col items-center rounded-3xl border border-slate-200/80 bg-powderBlue-100/10 p-12 text-center shadow-sm backdrop-blur dark:border-slate-700/40 dark:bg-powderBlue-600/20 md:rounded-2xl md:p-8">
          <p className="text-[40px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            404
          </p>
          <span className="text-[24px] font-semibold">Page not found</span>
          <span className="text-[16px] text-slate-600 dark:text-slate-300">
            The link might be broken or the page may have been removed.
          </span>
          <Link
            href="/"
            className="w-fit px-5 py-2 text-[16px] font-medium underline hover:opacity-80"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
