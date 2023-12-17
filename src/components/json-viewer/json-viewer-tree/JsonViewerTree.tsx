"use client";
import { TreeView } from "@mui/x-tree-view";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./../assets/css/json-viewer-tree.css";
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

function JsonViewerTree(props: any) {
  const [expanded, setExpanded]: [string[], any] = useState([]);
  const [unescaped, setUnescaped] = useState<boolean>(false);
  const allNodeIds = useRef<string[]>([]);

  function populateTree(json: Object) {
    return (
      <TreeView
        className="main-tree-view"
        aria-label="json viewer tree"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ flexGrow: 1, overflowY: "auto" }}
        expanded={expanded}
      >
        {renderTreeItems(json, unescaped)}
      </TreeView>
    );
  }

  function handleItemClick(nodeId: string): void {
    const expandedSet = new Set(expanded);
    if (expandedSet.has(nodeId)) {
      expandedSet.delete(nodeId);
      setExpanded(Array.from(expandedSet));
    } else {
      const newExpandedSet = expandedSet.add(nodeId);
      setExpanded(Array.from(newExpandedSet));
    }
  }

  function renderTreeItems(json: any, shouldUnescape: boolean) {
    const nodeIdSet = new Set<string>();
    const result = populateTreeItems(
      json,
      "JSON",
      "",
      nodeIdSet,
      shouldUnescape
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
    isUnescapedContent: boolean = false
  ) {
    const nodeId: string = nodeIdPrefix + "." + key;
    nodeIdSet.add(nodeId);

    if (_.isNull(json) || _.isUndefined(json)) {
      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          onItemClick={handleItemClick}
          label={
            <JsonViewerTreeItemLabel
              type="value"
              name={key}
              value="null"
              valueType="null"
              handleCopy={props.handleCopy}
              isUnescapedContent={isUnescapedContent}
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
        isUnescapedContent
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
              true
            );
          }
        } catch (e) {}
      }

      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          onItemClick={handleItemClick}
          label={
            <JsonViewerTreeItemLabel
              type="value"
              name={key}
              value={stringValue}
              valueType={valueType}
              handleCopy={props.handleCopy}
              isUnescapedContent={isUnescapedContent}
            />
          }
        />
      );
    }
  }

  function populateObject(
    json: object,
    key: string,
    nodeId: string,
    nodeIdSet: Set<string>,
    shouldUnescape: boolean,
    isUnescapedContent: boolean = false
  ) {
    if (Array.isArray(json)) {
      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          onItemClick={handleItemClick}
          label={
            <JsonViewerTreeItemLabel
              type="array"
              name={key}
              isUnescapedContent={isUnescapedContent}
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
              isUnescapedContent
            )
          )}
        </JsonViewerTreeItem>
      );
    } else {
      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          onItemClick={handleItemClick}
          label={
            <JsonViewerTreeItemLabel
              type="object"
              name={key}
              isUnescapedContent={isUnescapedContent}
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
              isUnescapedContent
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
