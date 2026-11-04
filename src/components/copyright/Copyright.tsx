import Link from "next/link";

function LegalLinks({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <Link
        className="underline active:opacity-50 md:hover:opacity-50"
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
      >
        {compact ? "Privacy" : "Privacy Policy"}
      </Link>
      <span aria-hidden="true">{compact ? "·" : "|"}</span>
      <Link
        className="underline active:opacity-50 md:hover:opacity-50"
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        {compact ? "Terms" : "Terms of Service"}
      </Link>
    </>
  );
}

function Copyright() {
  return (
    <footer className="flex h-36 w-full max-w-6xl shrink-0 items-center justify-center self-center px-10 text-[15px] text-mono-800 dark:text-mono-500 md:h-16 md:justify-end">
      <div className="hidden flex-col items-end justify-end gap-1 md:flex">
        <div className="flex flex-wrap justify-end gap-1">
          <span>Copyright © {new Date().getFullYear()}</span>
          <a
            className="underline active:opacity-50 md:hover:opacity-50"
            target="_blank"
            href="https://jhuang.ca"
          >
            Jarrett Huang
          </a>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <a
            className="underline active:opacity-50 md:hover:opacity-50"
            target="_blank"
            href="https://github.com/jarretthuang/json-viewer"
          >
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <a
            className="underline active:opacity-50 md:hover:opacity-50"
            href="https://www.buymeacoffee.com/jarretthuang"
            target="_blank"
          >
            Buy me a coffee
          </a>
          <span aria-hidden="true">·</span>
          <LegalLinks compact />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 md:hidden">
        <div className="flex flex-wrap justify-center gap-1">
          <span>Copyright © {new Date().getFullYear()}</span>
          <a
            className="underline active:opacity-50 md:hover:opacity-50"
            target="_blank"
            href="https://jhuang.ca"
          >
            Jarrett Huang
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          <LegalLinks />
        </div>
      </div>
    </footer>
  );
}

export default Copyright;
