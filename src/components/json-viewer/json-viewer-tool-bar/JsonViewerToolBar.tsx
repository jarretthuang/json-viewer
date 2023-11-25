import { JsonViewerToolBarOption } from "./JsonViewerToolBarOption";
import "./JsonViewerToolBar.css";

function JsonViewerToolBar(props: { options: JsonViewerToolBarOption[] }) {
  return (
    <div className="JsonViewerToolBar">
      {props.options.map(
        (option) =>
          !option.hidden && (
            <button
              className="tool-bar-button text-powderBlue-500 enabled:hover:bg-powderBlue-200 enabled:hover:text-offWhite disabled:opacity-50 dark:text-slate-200 dark:enabled:hover:bg-powderBlue-600"
              onClick={option.onClick}
              key={option.label}
              disabled={option.disabled}
            >
              {option.icon}
              <div className="tool-bar-button-label">{option.label}</div>
            </button>
          )
      )}
    </div>
  );
}

export default JsonViewerToolBar;
