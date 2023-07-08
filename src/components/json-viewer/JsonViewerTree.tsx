"use client";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./assets/css/json-viewer-tree.css";
import JsonViewerTreeItem from "./JsonViewerTreeItem";
import _ from "lodash";
import JsonViewerTreeItemLabel, {
  JsonValueType,
} from "./JsonViewerTreeItemLabel";

function JsonViewerTree(props: any) {
  const populateTree = (json: Object) => {
    return (
      <TreeView
        aria-label="json viewer tree"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ flexGrow: 1, overflowY: "auto" }}
      >
        {populateTreeItems(json)}
      </TreeView>
    );
  };

  const populateTreeItems = (
    json: any,
    key: string = "JSON",
    nodeIdPrefix: string = ""
  ) => {
    const nodeId: string = nodeIdPrefix + "." + key;

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
            label={<JsonViewerTreeItemLabel type="array" name={key} />}
          >
            {json.map((itemInArray, index) =>
              populateTreeItems(itemInArray, index.toString(), nodeId)
            )}
          </JsonViewerTreeItem>
        );
      } else {
        return (
          <JsonViewerTreeItem
            nodeId={nodeId}
            key={nodeId}
            label={<JsonViewerTreeItemLabel type="object" name={key} />}
          >
            {Object.keys(json).map((key: string) =>
              populateTreeItems(json[key], key, nodeId)
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
  };

  return <div className="JsonViewerTree">{populateTree(props.json)}</div>;
}

export default JsonViewerTree;
