import "./assets/css/Copyright.css";
import GitHubIcon from "@mui/icons-material/GitHub";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";

function Copyright() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="Copyright">
      <div className="copyright-banner flex flex-row items-center bg-white/20 font-medium uppercase shadow-subtle dark:shadow-subtleWhite">
        <span>
          <span className="copyright-header">Copyright</span> © {currentYear}{" "}
          <span className="hidden md:inline">Jarrett Huang</span>
          <span className="inline md:hidden">JH</span>
        </span>
        <div className="flex gap-1 pb-0.5 pl-0.5 pr-1 md:pb-0 md:pl-0">
          <a href="https://github.com/jarretthuang/json-viewer" target="_blank">
            <GitHubIcon
              className="copyright-icon ml-1 w-[20px] hover:opacity-70 md:w-2"
              fontSize="small"
            />
          </a>

          <a href="https://www.buymeacoffee.com/jarretthuang" target="_blank">
            <LocalCafeIcon
              className="copyright-icon w-[22px] hover:opacity-70 md:w-2"
              fontSize="small"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Copyright;
