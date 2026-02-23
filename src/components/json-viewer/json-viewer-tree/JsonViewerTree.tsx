"use client";
import { TreeView } from "@mui/x-tree-view";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import JsonViewerTreeItem from "./JsonViewerTreeItem";
import _ from "lodash";
import JsonViewerTreeItemLabel, {
  JsonValueType,
} from "./JsonViewerTreeItemLabel";
import { useRef, useState } from "react";
import "./JsonViewerTree.css";
import JsonViewerToolBar from "../json-viewer-tool-bar/JsonViewerToolBar";
import { JsonViewerToolBarOption } from "../json-viewer-tool-bar/JsonViewerToolBarOption";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import CodeOffIcon from "@mui/icons-material/CodeOff";
import UndoIcon from "@mui/icons-material/Undo";
import { removeArrayItemAtPath } from "../utils/jsonUtils";

function JsonViewerTree(props: any) {
  const [expanded, setExpanded]: [string[], any] = useState([]);
  const [unescaped, setUnescaped] = useState<boolean>(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const allNodeIds = useRef<string[]>([]);
  const expandableNodeIds = useRef<Set<string>>(new Set());

  function handleValueChange(path: (string | number)[], newValue: any) {
    if (!props.onJsonUpdate) return;
    const newJson = _.cloneDeep(props.json);
    if (path.length === 0) {
      props.onJsonUpdate(newValue);
    } else {
      _.set(newJson, path, newValue);
      props.onJsonUpdate(newJson);
    }
  }

  function handleKeyChange(
    path: (string | number)[],
    oldKey: string,
    newKey: string
  ) {
    if (!props.onJsonUpdate) return;
    if (oldKey === newKey) return;
    const newJson = _.cloneDeep(props.json);
    const parentPath = path.slice(0, -1);
    const parentObj =
      parentPath.length === 0 ? newJson : _.get(newJson, parentPath);

    if (Array.isArray(parentObj)) return;

    const value = parentObj[oldKey];
    delete parentObj[oldKey];
    parentObj[newKey] = value;

    props.onJsonUpdate(newJson);
  }

  function handleArrayItemRemove(path: (string | number)[]) {
    if (!props.onJsonUpdate) return;
    const nextJson = removeArrayItemAtPath(props.json, path);
    props.onJsonUpdate(nextJson);
  }

  function populateTree(json: Object) {
    return (
      <TreeView
        className="main-tree-view"
        aria-label="json viewer tree"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ flexGrow: 1, overflowY: "auto" }}
        expanded={expanded}
        onNodeFocus={(_, nodeId) => {
          setFocusedNodeId(nodeId);
        }}
        onNodeToggle={(_, nodeIds) => {
          setExpanded(nodeIds);
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && focusedNodeId) {
            if (expandableNodeIds.current.has(focusedNodeId)) {
              e.preventDefault();
              e.stopPropagation();
              setExpanded((previous: string[]) => {
                const expandedSet = new Set(previous);
                if (expandedSet.has(focusedNodeId)) {
                  expandedSet.delete(focusedNodeId);
                } else {
                  expandedSet.add(focusedNodeId);
                }
                return Array.from(expandedSet);
              });
            }
          }
        }}
      >
        {renderTreeItems(json, unescaped)}
      </TreeView>
    );
  }

  function renderTreeItems(json: any, shouldUnescape: boolean) {
    const nodeIdSet = new Set<string>();
    expandableNodeIds.current.clear();
    const result = populateTreeItems(
      json,
      "JSON", // Root Key Name
      "",
      nodeIdSet,
      shouldUnescape,
      false,
      [],
      false // Root key not editable
    );
    allNodeIds.current = Array.from(nodeIdSet);
    return result;
  }

  function populateTreeItems(
    json: any,
    key: string,
    nodeIdPrefix: string,
    nodeIdSet: Set<string>,
    shouldUnescape: boolean,
    isUnescapedContent: boolean = false,
    path: (string | number)[] = [],
    isKeyEditable: boolean = false
  ) {
    const lastPathPart = path[path.length - 1];
    const isArrayItemRemovable =
      typeof lastPathPart === "number" && !isUnescapedContent;
    const nodeId: string = nodeIdPrefix + "." + key;
    nodeIdSet.add(nodeId);

    if (_.isNull(json) || _.isUndefined(json)) {
      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          label={
            <JsonViewerTreeItemLabel
              type="value"
              name={key}
              value="null"
              valueType="null"
              handleCopy={props.handleCopy}
              isUnescapedContent={isUnescapedContent}
              path={path}
              onKeyChange={handleKeyChange}
              onValueChange={handleValueChange}
              isKeyEditable={isKeyEditable && !isUnescapedContent}
              isValueEditable={!isUnescapedContent}
              isRemovable={isArrayItemRemovable}
              onRemove={handleArrayItemRemove}
            />
          }
        />
      );
    } else if (typeof json === "object") {
      return populateObject(
        json,
        key,
        nodeId,
        nodeIdSet,
        shouldUnescape,
        isUnescapedContent,
        path,
        isKeyEditable
      );
    } else {
      const stringValue: string = json.toString();
      let valueType: JsonValueType = "unknown";
      switch (typeof json) {
        case "string":
          valueType = "string";
          break;
        case "number":
          valueType = "number";
          break;
      }

      if (valueType == "string" && shouldUnescape) {
        try {
          const possibleJson = JSON.parse(stringValue);
          if (typeof possibleJson === "object") {
            return populateObject(
              possibleJson,
              key,
              nodeId,
              nodeIdSet,
              shouldUnescape,
              true,
              [], // Path lost for unescaped content
              false // Not editable
            );
          }
        } catch (e) {}
      }

      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          label={
            <JsonViewerTreeItemLabel
              type="value"
              name={key}
              value={stringValue}
              valueType={valueType}
              handleCopy={props.handleCopy}
              isUnescapedContent={isUnescapedContent}
              path={path}
              onKeyChange={handleKeyChange}
              onValueChange={handleValueChange}
              isKeyEditable={isKeyEditable && !isUnescapedContent}
              isValueEditable={!isUnescapedContent}
              isRemovable={isArrayItemRemovable}
              onRemove={handleArrayItemRemove}
            />
          }
        />
      );
    }
  }

  function populateObject(
    json: any,
    key: string,
    nodeId: string,
    nodeIdSet: Set<string>,
    shouldUnescape: boolean,
    isUnescapedContent: boolean = false,
    path: (string | number)[] = [],
    isKeyEditable: boolean = false
  ) {
    expandableNodeIds.current.add(nodeId);

    if (Array.isArray(json)) {
      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          label={
            <JsonViewerTreeItemLabel
              type="array"
              name={key}
              isUnescapedContent={isUnescapedContent}
              path={path}
              onKeyChange={handleKeyChange}
              isKeyEditable={isKeyEditable && !isUnescapedContent}
              isRemovable={typeof path[path.length - 1] === "number" && !isUnescapedContent}
              onRemove={handleArrayItemRemove}
            />
          }
        >
          {json.map((itemInArray, index) =>
            populateTreeItems(
              itemInArray,
              index.toString(),
              nodeId,
              nodeIdSet,
              shouldUnescape,
              isUnescapedContent,
              [...path, index],
              false // Array keys (indices) are not editable
            )
          )}
        </JsonViewerTreeItem>
      );
    } else {
      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          label={
            <JsonViewerTreeItemLabel
              type="object"
              name={key}
              isUnescapedContent={isUnescapedContent}
              path={path}
              onKeyChange={handleKeyChange}
              isKeyEditable={isKeyEditable && !isUnescapedContent}
              isRemovable={typeof path[path.length - 1] === "number" && !isUnescapedContent}
              onRemove={handleArrayItemRemove}
            />
          }
        >
          {Object.keys(json).map((key: string) =>
            populateTreeItems(
              json[key],
              key,
              nodeId,
              nodeIdSet,
              shouldUnescape,
              isUnescapedContent,
              [...path, key],
              true // Object keys are editable
            )
          )}
        </JsonViewerTreeItem>
      );
    }
  }

  function renderToolBar() {
    const options: JsonViewerToolBarOption[] = [
      {
        label: "Expand",
        onClick: () => {
          setExpanded(allNodeIds.current);
        },
        icon: <OpenInFullIcon />,
        disabled: expanded.length === allNodeIds.current.length,
      },
      {
        label: "Collapse",
        onClick: () => {
          setExpanded([]);
        },
        icon: <CloseFullscreenIcon />,
        disabled: expanded.length === 0,
      },
      {
        label: "Unescape",
        onClick: () => {
          setUnescaped(true);
        },
        icon: <CodeOffIcon />,
        hidden: unescaped,
      },
      {
        label: "Undo Unescape",
        onClick: () => {
          setUnescaped(false);
        },
        icon: <UndoIcon />,
        hidden: !unescaped,
      },
    ];
    return <JsonViewerToolBar options={options} />;
  }

  return (
    <div className="JsonViewerTree">
      {renderToolBar()}
      {populateTree(props.json)}
    </div>
  );
}

export default JsonViewerTree;
