"use client";
import TreeView from "@mui/lab/TreeView";
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

function JsonViewerTree(props: any) {
  const [expanded, setExpanded]: [string[], any] = useState([]);
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
        {renderTreeItems(json)}
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

  function renderTreeItems(json: any) {
    const nodeIdSet = new Set<string>();
    const result = populateTreeItems(json, "JSON", "", nodeIdSet);
    allNodeIds.current = Array.from(nodeIdSet);
    return result;
  }

  function populateTreeItems(
    json: any,
    key: string,
    nodeIdPrefix: string,
    nodeIdSet: Set<string>
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
            />
          }
        />
      );
    } else if (typeof json === "object") {
      if (Array.isArray(json)) {
        return (
          <JsonViewerTreeItem
            nodeId={nodeId}
            key={nodeId}
            onItemClick={handleItemClick}
            label={<JsonViewerTreeItemLabel type="array" name={key} />}
          >
            {json.map((itemInArray, index) =>
              populateTreeItems(
                itemInArray,
                index.toString(),
                nodeId,
                nodeIdSet
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
            label={<JsonViewerTreeItemLabel type="object" name={key} />}
          >
            {Object.keys(json).map((key: string) =>
              populateTreeItems(json[key], key, nodeId, nodeIdSet)
            )}
          </JsonViewerTreeItem>
        );
      }
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
            />
          }
        />
      );
    }
  }

  function renderToolBar() {
    const options = [
      {
        label: "Expand",
        onClick: () => {
          console.log("test");
        },
      },
      {
        label: "Collapse",
        onClick: () => {
          console.log("test");
        },
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
