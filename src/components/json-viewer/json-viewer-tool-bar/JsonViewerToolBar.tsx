import { JsonViewerToolBarOption } from "./JsonViewerToolBarOption";
import "./JsonViewerToolBar.css";

function JsonViewerToolBar(props: { options: JsonViewerToolBarOption[] }) {
  return (
    <div className="JsonViewerToolBar">
      {props.options.map((option) => (
        <div
          className="tool-bar-button"
          onClick={option.onClick}
          key={option.label}
        >
          {option.icon}
          <div className="tool-bar-button-label">
          {option.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default JsonViewerToolBar;
