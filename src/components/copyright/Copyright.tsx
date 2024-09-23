import "./assets/css/Copyright.css";
import GitHubIcon from "@mui/icons-material/GitHub";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";

function Copyright() {
  return (
    <footer className="text-mono-800 dark:text-mono-500 flex h-36 w-full max-w-6xl items-center justify-center self-center px-10 text-[15px] md:fixed md:bottom-0 md:h-12 md:justify-end">
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
        <span>MIT License</span>
        <span>|</span>
        <a
          className="underline active:opacity-50 md:hover:opacity-50"
          target="_blank"
          href="https://github.com/jarretthuang/json-viewer"
        >
          <GitHubIcon className="h-2 w-2" fontSize="small" />
        </a>
        <span>|</span>
        <a
          className="active:opacity-50 md:hover:opacity-50"
          href="https://www.buymeacoffee.com/jarretthuang"
          target="_blank"
        >
          <LocalCafeIcon className="h-2 w-2" fontSize="small" />
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
