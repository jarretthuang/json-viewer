"use client";
import DataObjectIcon from "@mui/icons-material/DataObject";
import DataArrayIcon from "@mui/icons-material/DataArray";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip } from "../tooltip/Tooltip";
import { Fragment } from "react";
import _ from "lodash";

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
};

export default function JsonViewerTreeItemLabel(
  props: JsonViewerTreeItemLabelProps
) {
  const renderIcon = () => {
    if (props.type === "object") {
      return (
        <Tooltip title="Object">
          <DataObjectIcon className="label-icon" />
        </Tooltip>
      );
    } else if (props.type === "array") {
      return (
        <Tooltip title="Array">
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

  return (
    <div className="JsonViewerTreeItemLabel">
      <div className="label-content">
        <div className="label-name">{props.name}</div>
        {renderSeparator()}
        <div className="label-value">{getDisplayValue()}</div>
        {renderIcon()}
      </div>
      <div className="label-actions">{renderActions()}</div>
    </div>
  );
}
