
function Copyright() {
  return (
    <footer className="flex h-36 w-full max-w-6xl items-center justify-center self-center px-10 text-[15px] text-mono-800 dark:text-mono-500 md:fixed md:bottom-0 md:h-12 md:justify-end">
      <div className="hidden flex-row gap-1 md:flex">
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
      </div>
      <div className="flex flex-row gap-1 md:hidden">
        <span>Copyright © {new Date().getFullYear()}</span>
        <a
          className="underline active:opacity-50 md:hover:opacity-50"
          target="_blank"
          href="https://jhuang.ca"
        >
          Jarrett Huang
        </a>
      </div>
    </footer>
  );
}

export default Copyright;
