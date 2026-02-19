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
              className="tool-bar-button text-powderBlue-500 enabled:hover:bg-powderBlue-200 enabled:hover:text-offWhite disabled:opacity-50 dark:text-slate-200 dark:enabled:hover:bg-powderBlue-600"
              onClick={option.onClick}
              key={option.label}
              disabled={option.disabled}
            >
              {option.icon}
              <div className="tool-bar-button-label relative inline-flex">
                <div>{option.label}</div>
                {option.ping && (
                  <span className="absolute right-[-0.5rem] top-0 flex h-2 w-2 md:right-[-0.3rem] md:h-1 md:w-1">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-powderBlue-300 opacity-75 dark:bg-slate-200"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-powderBlue-400 dark:bg-slate-300 md:h-1 md:w-1"></span>
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
