import "./assets/css/Copyright.css";
import GitHubIcon from "@mui/icons-material/GitHub";

function Copyright() {
  const currentYear = new Date().getFullYear();

  function handleGithubClick(): void {
    window.location.assign("https://github.com/jarretthuang/json-viewer");
  }

  return (
    <div className="Copyright">
      <div className="copyright-banner flex flex-row items-center uppercase font-medium opacity-80">
        <span>
          <span className="copyright-header">Copyright</span> © {currentYear}{" "}
          Jarrett Huang
        </span>
        <GitHubIcon
          className="github-icon hover:opacity-80"
          onClick={handleGithubClick}
        />
      </div>
    </div>
  );
}

export default Copyright;
