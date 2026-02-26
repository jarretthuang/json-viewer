import { JsonViewerToolBarOption } from "./JsonViewerToolBarOption";
import "./JsonViewerToolBar.css";

function JsonViewerToolBar(props: { options: JsonViewerToolBarOption[] }) {
  return (
    <div className="JsonViewerToolBar">
      {props.options.map(
        (option) =>
          !option.hidden && (
            <button
              type="button"
              className="tool-bar-button"
              style={{
                color: "#246a73",
                opacity: option.disabled ? 0.5 : 1,
              }}
              onClick={option.onClick}
              key={option.label}
              disabled={option.disabled === true}
            >
              {option.icon}
              <div className="tool-bar-button-label" style={{ position: "relative", display: "inline-flex" }}>
                <div>{option.label}</div>
                {option.ping && (
                  <span
                    style={{
                      position: "absolute",
                      right: "-0.5rem",
                      top: 0,
                      display: "flex",
                      height: "0.5rem",
                      width: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        display: "inline-flex",
                        height: "100%",
                        width: "100%",
                        borderRadius: "9999px",
                        backgroundColor: "#3db2c0",
                        opacity: 0.75,
                      }}
                    ></span>
                    <span
                      style={{
                        position: "relative",
                        display: "inline-flex",
                        height: "0.5rem",
                        width: "0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "#318e99",
                      }}
                    ></span>
                  </span>
                )}
              </div>
            </button>
          )
      )}
    </div>
  );
}

export default JsonViewerToolBar;
