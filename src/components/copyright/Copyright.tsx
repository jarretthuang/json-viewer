import Link from "next/link";

function LegalLinks() {
  return (
    <>
      <Link
        className="underline active:opacity-50 md:hover:opacity-50"
        href="/privacy"
      >
        Privacy Policy
      </Link>
      <span aria-hidden="true">|</span>
      <Link
        className="underline active:opacity-50 md:hover:opacity-50"
        href="/terms"
      >
        Terms of Service
      </Link>
    </>
  );
}

function Copyright() {
  return (
    <footer className="flex h-36 w-full max-w-6xl shrink-0 items-center justify-center self-center px-10 text-[15px] text-mono-800 dark:text-mono-500 md:h-12 md:justify-end">
      <div className="hidden flex-row flex-wrap justify-end gap-1 md:flex">
        <span>Copyright © {new Date().getFullYear()}</span>
        <a
          className="underline active:opacity-50 md:hover:opacity-50"
          target="_blank"
          href="https://jhuang.ca"
        >
          Jarrett Huang
        </a>
        <span>|</span>
        <a
          className="underline active:opacity-50 md:hover:opacity-50"
          target="_blank"
          href="https://github.com/jarretthuang/json-viewer"
        >
          Github
        </a>
        <span>|</span>
        <a
          className="underline active:opacity-50 md:hover:opacity-50"
          href="https://www.buymeacoffee.com/jarretthuang"
          target="_blank"
        >
          Buy me a coffee
        </a>
        <span aria-hidden="true">|</span>
        <LegalLinks />
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
