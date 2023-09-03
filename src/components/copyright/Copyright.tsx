import { Tooltip } from "../tooltip/Tooltip";
import "./assets/css/Copyright.css";
import GitHubIcon from "@mui/icons-material/GitHub";

function Copyright() {
  const currentYear = new Date().getFullYear();

  function handleGithubClick(): void {
    window.location.assign("https://github.com/jarretthuang/json-viewer");
  }

  return (
    <div className="Copyright">
      <div className="copyright-banner flex flex-row items-center uppercase font-medium shadow-subtle">
        <span>
          <span className="copyright-header">Copyright</span> © {currentYear}{" "}
          Jarrett Huang
        </span>

        <Tooltip
          title="🎉 JSON Viewer is now open-source!"
          placement="top-start"
          fontSize="0.4rem"
          padding="0.3rem"
        >
          <GitHubIcon
            className="github-icon hover:opacity-80"
            onClick={handleGithubClick}
          />
        </Tooltip>
      </div>
    </div>
  );
}

export default Copyright;
