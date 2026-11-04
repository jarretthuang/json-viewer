import type { ReactNode } from "react";
import Copyright from "@/components/copyright/Copyright";
import NavBar from "@/components/nav-bar/NavBar";

export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <NavBar
        actionVisibility={{
          back: false,
          forward: false,
          share: false,
          moreOptions: false,
        }}
      />
      <main className="mx-auto w-full max-w-[800px] flex-1 px-[24px] py-[40px] text-[16px] leading-relaxed text-mono-800 dark:text-mono-300">
        <h1 className="mb-[24px] text-[32px] font-bold text-slate-950 dark:text-offWhite">
          {title}
        </h1>
        <article className="space-y-[24px] [&_a:hover]:opacity-50 [&_a]:underline [&_h2]:mb-[8px] [&_h2]:text-[20px] [&_h2]:font-medium [&_p+p]:mt-[12px]">
          {children}
        </article>
      </main>
      <Copyright />
    </div>
  );
}
