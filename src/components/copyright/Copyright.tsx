import { Tooltip } from "../tooltip/Tooltip";
import "./assets/css/Copyright.css";
import GitHubIcon from "@mui/icons-material/GitHub";
import CoffeeIcon from "@mui/icons-material/Coffee";

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

        <Tooltip
          title="🎉 JSON Viewer is now open-source!"
          placement="top-start"
          fontSize="0.4rem"
          padding="0.3rem"
        >
          <GitHubIcon
            className="h-4 hover:opacity-80 md:h-3"
            height="1rem"
            onClick={() =>
              window.open("https://github.com/jarretthuang/json-viewer")
            }
          />
        </Tooltip>
        <Tooltip
          title="☕ Buy me a coffee"
          placement="top-start"
          fontSize="0.4rem"
          padding="0.3rem"
        >
          <CoffeeIcon
            className="ml-[-10px] h-4 hover:opacity-80 md:h-3"
            height="1rem"
            onClick={() =>
              window.open("https://www.buymeacoffee.com/jarretthuang")
            }
          />
        </Tooltip>
      </div>
    </div>
  );
}

export default Copyright;
