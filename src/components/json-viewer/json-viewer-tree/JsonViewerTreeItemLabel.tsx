"use client";
import DataObjectIcon from "@mui/icons-material/DataObject";
import DataArrayIcon from "@mui/icons-material/DataArray";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip } from "../../tooltip/Tooltip";
import { Fragment } from "react";
import _ from "lodash";
import { withDiagnostics } from "react-diagnostics";
import CodeOffIcon from "@mui/icons-material/CodeOff";

export type JsonViewerTreeItemLabelType = "object" | "array" | "value";
export type JsonValueType =
  | "number"
  | "string"
  | "boolean"
  | "null"
  | "unknown";

export type JsonViewerTreeItemLabelProps = {
  type: JsonViewerTreeItemLabelType;
  name: string;
  value?: string;
  valueType?: JsonValueType;
  handleCopy?: (text: string) => void;
  isUnescapedContent?: boolean;
};

function JsonViewerTreeItemLabel(props: JsonViewerTreeItemLabelProps) {
  const renderIcon = () => {
    if (props.type === "object") {
      return (
        <Tooltip title="Object" placement="top">
          <DataObjectIcon className="label-icon" />
        </Tooltip>
      );
    } else if (props.type === "array") {
      return (
        <Tooltip title="Array" placement="top">
          <DataArrayIcon className="label-icon" />
        </Tooltip>
      );
    }
  };

  const renderSeparator = () => {
    if (!_.isUndefined(props.value)) {
      return <div className="label-separator">:</div>;
    }
  };

  const renderActions = () => {
    if (props.type === "value") {
      return (
        <Fragment>
          <Tooltip
            title="Copy"
            placement="top"
            onClick={() => props?.handleCopy?.(getLabelValueAsText())}
          >
            <ContentCopyIcon className="label-icon" />
          </Tooltip>
        </Fragment>
      );
    }
  };

  function getLabelValueAsText(): string {
    return props.name + " : " + getDisplayValue();
  }

  function getDisplayValue(): string | undefined {
    if (props.valueType === "string") {
      return '"' + props.value + '"';
    } else {
      return props.value;
    }
  }

  function renderIconForUnescapedContent() {
    if (props.isUnescapedContent && props.type !== "value") {
      return (
        <Tooltip title="💡 This is parsed from a nested JSON string via [unescape].">
          <CodeOffIcon className="label-icon" />
        </Tooltip>
      );
    }
  }

  return (
    <div className="JsonViewerTreeItemLabel">
      <div className="label-content">
        <div className="label-name text-slate-800 dark:text-offWhite">
          {props.name}
        </div>
        {renderSeparator()}
        <div className="label-value text-gray-700 dark:text-powderBlue-100">
          {getDisplayValue()}
        </div>
        {renderIcon()}
        {renderIconForUnescapedContent()}
      </div>
      <div className="label-actions">{renderActions()}</div>
    </div>
  );
}

export default withDiagnostics.detailed(JsonViewerTreeItemLabel);
