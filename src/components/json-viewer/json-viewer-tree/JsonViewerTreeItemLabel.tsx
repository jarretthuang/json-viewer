"use client";
import DataObjectIcon from "@mui/icons-material/DataObject";
import DataArrayIcon from "@mui/icons-material/DataArray";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Tooltip } from "../../tooltip/Tooltip";
import { Fragment, useState, useEffect } from "react";
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
  path?: (string | number)[];
  onKeyChange?: (
    path: (string | number)[],
    oldKey: string,
    newKey: string
  ) => void;
  onValueChange?: (path: (string | number)[], newValue: any) => void;
  isKeyEditable?: boolean;
  isValueEditable?: boolean;
  canDelete?: boolean;
  onDelete?: (path: (string | number)[]) => void;
};

function JsonViewerTreeItemLabel(props: JsonViewerTreeItemLabelProps) {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editedKey, setEditedKey] = useState(props.name);
  const [editedValue, setEditedValue] = useState("");

  useEffect(() => {
    setEditedKey(props.name);
  }, [props.name]);

  const startEditingValue = (e: React.MouseEvent) => {
    if (!props.isValueEditable) return;
    e.stopPropagation();

    // Prepare value for editing (add quotes if string)
    let val = props.value || "";
    if (props.valueType === "string") {
      val = `"${val}"`;
    } else if (props.value === "null" && props.valueType === "null") {
      val = "null";
    }
    setEditedValue(val);
    setIsEditingValue(true);
  };

  const commitKeyEdit = () => {
    if (
      isEditingKey &&
      props.onKeyChange &&
      props.path &&
      editedKey !== props.name
    ) {
      props.onKeyChange(props.path, props.name, editedKey);
    }
    setIsEditingKey(false);
  };

  const commitValueEdit = () => {
    if (!isEditingValue) return;

    let finalValue: any = editedValue;
    try {
      finalValue = JSON.parse(editedValue);
    } catch {
      // If parsing fails, treat as string for now.
      finalValue = editedValue;
    }

    if (props.onValueChange && props.path) {
      props.onValueChange(props.path, finalValue);
    }
    setIsEditingValue(false);
  };

  const cancelKeyEdit = () => {
    setEditedKey(props.name);
    setIsEditingKey(false);
  };

  const cancelValueEdit = () => {
    setIsEditingValue(false);
  };

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.canDelete && props.path && props.onDelete) {
      props.onDelete(props.path);
    }
  };

  const renderActions = () => {
    if (isEditingKey || isEditingValue) return null;

    return (
      <Fragment>
        {props.type === "value" && (
          <Tooltip
            title="Copy"
            placement="top"
            onClick={() => props?.handleCopy?.(getLabelValueAsText())}
          >
            <ContentCopyIcon className="label-icon" />
          </Tooltip>
        )}
        {props.canDelete && (
          <Tooltip title="Delete" placement="top" onClick={handleDelete}>
            <DeleteOutlineIcon className="label-icon" />
          </Tooltip>
        )}
      </Fragment>
    );
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
    <div
      className="JsonViewerTreeItemLabel"
      data-is-editing={isEditingKey || isEditingValue}
    >
      <div className="label-content">
        {isEditingKey ? (
          <input
            className="rounded border border-gray-300 bg-white px-1 text-black outline-none dark:border-gray-600 dark:bg-neutral-800 dark:text-white"
            value={editedKey}
            onChange={(e) => setEditedKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitKeyEdit();
              if (e.key === "Escape") cancelKeyEdit();
              e.stopPropagation(); // Avoid tree navigation on arrow keys?
            }}
            onClick={(e) => e.stopPropagation()}
            onBlur={commitKeyEdit}
            autoFocus
          />
        ) : (
          <div
            className={`label-name text-slate-800 dark:text-offWhite ${
              props.isKeyEditable
                ? "cursor-pointer hover:rounded hover:bg-black/5 hover:dark:bg-white/10"
                : ""
            }`}
            onClick={(e) => {
              if (props.isKeyEditable) {
                e.stopPropagation();
                setIsEditingKey(true);
              }
            }}
          >
            {props.name}
          </div>
        )}

        {renderSeparator()}

        {!_.isUndefined(props.value) &&
          (isEditingValue ? (
            <input
              className="flex-1 ml-1 rounded border border-gray-300 bg-white px-1 text-black outline-none dark:border-gray-600 dark:bg-neutral-800 dark:text-white"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitValueEdit();
                if (e.key === "Escape") cancelValueEdit();
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              onBlur={commitValueEdit}
              autoFocus
            />
          ) : (
            <div
              className={`label-value text-gray-700 dark:text-powderBlue-100 ${
                props.isValueEditable
                  ? "cursor-pointer hover:rounded hover:bg-black/5 hover:dark:bg-white/10"
                  : ""
              }`}
              onClick={startEditingValue}
            >
              {getDisplayValue()}
            </div>
          ))}

        {renderIcon()}
        {renderIconForUnescapedContent()}
      </div>
      <div className="label-actions">{renderActions()}</div>
    </div>
  );
}

export default withDiagnostics.detailed(JsonViewerTreeItemLabel);
