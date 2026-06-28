"use client";
import { TreeView } from "@mui/x-tree-view";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import JsonViewerTreeItem from "./JsonViewerTreeItem";
import _ from "lodash";
import JsonViewerTreeItemLabel, {
  JsonValueType,
} from "./JsonViewerTreeItemLabel";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./JsonViewerTree.css";
import JsonViewerToolBar from "../json-viewer-tool-bar/JsonViewerToolBar";
import { JsonViewerToolBarOption } from "../json-viewer-tool-bar/JsonViewerToolBarOption";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import CodeOffIcon from "@mui/icons-material/CodeOff";
import UndoIcon from "@mui/icons-material/Undo";
import { removeJsonItemAtPath } from "../utils/jsonUtils";
import {
  ARRAY_CHILD_CHUNK_SIZE,
  MAX_EXPAND_ALL_NODE_COUNT,
  shouldAllowExpandAll,
} from "../utils/jsonPerformanceUtils";

type TreeMetadata = {
  nodeIds: string[];
  expandableNodeIds: string[];
  nodeCount: number;
  isCapped: boolean;
};

type ArrayChunk = {
  start: number;
  end: number;
};

function hasObjectChildren(value: Record<string, unknown>): boolean {
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return true;
    }
  }

  return false;
}

function collectTreeMetadata(
  json: any,
  key: string,
  nodeIdPrefix: string,
  shouldUnescape: boolean,
  nodeCountLimit: number = MAX_EXPAND_ALL_NODE_COUNT
): TreeMetadata {
  const nodeIds: string[] = [];
  const expandableIds: string[] = [];
  let nodeCount = 0;
  let isCapped = false;

  function visit(value: any, currentKey: string, currentNodeIdPrefix: string) {
    if (isCapped) return;

    nodeCount += 1;
    if (nodeCount > nodeCountLimit) {
      isCapped = true;
      return;
    }

    const nodeId = currentNodeIdPrefix + "." + currentKey;
    nodeIds.push(nodeId);
    let childValue = value;

    if (shouldUnescape && typeof value === "string") {
      try {
        const possibleJson = JSON.parse(value);
        if (typeof possibleJson === "object" && possibleJson !== null) {
          childValue = possibleJson;
        }
      } catch {}
    }

    if (_.isNull(childValue) || _.isUndefined(childValue)) {
      return;
    }

    if (typeof childValue !== "object") {
      return;
    }

    const hasChildren = Array.isArray(childValue)
      ? childValue.length > 0
      : hasObjectChildren(childValue);

    if (!hasChildren) {
      return;
    }

    expandableIds.push(nodeId);

    if (Array.isArray(childValue) && shouldChunkArray(childValue)) {
      for (const chunk of getArrayChunks(childValue.length)) {
        const chunkNodeId = getArrayChunkNodeId(nodeId, chunk);
        nodeCount += 1;
        if (nodeCount > nodeCountLimit) {
          isCapped = true;
          return;
        }
        nodeIds.push(chunkNodeId);
        expandableIds.push(chunkNodeId);

        for (let index = chunk.start; index <= chunk.end; index += 1) {
          visit(childValue[index], index.toString(), chunkNodeId);
          if (isCapped) return;
        }
      }
    } else if (Array.isArray(childValue)) {
      for (let index = 0; index < childValue.length; index += 1) {
        visit(childValue[index], index.toString(), nodeId);
        if (isCapped) return;
      }
    } else {
      for (const childKey in childValue) {
        if (Object.prototype.hasOwnProperty.call(childValue, childKey)) {
          visit(childValue[childKey], childKey, nodeId);
          if (isCapped) return;
        }
      }
    }
  }

  visit(json, key, nodeIdPrefix);

  return {
    nodeIds: isCapped ? [] : nodeIds,
    expandableNodeIds: isCapped ? [] : expandableIds,
    nodeCount,
    isCapped,
  };
}

function shouldChunkArray(value: unknown[]): boolean {
  return value.length > ARRAY_CHILD_CHUNK_SIZE;
}

function getArrayChunks(length: number): ArrayChunk[] {
  const chunks: ArrayChunk[] = [];

  for (let start = 0; start < length; start += ARRAY_CHILD_CHUNK_SIZE) {
    chunks.push({
      start,
      end: Math.min(start + ARRAY_CHILD_CHUNK_SIZE - 1, length - 1),
    });
  }

  return chunks;
}

function getArrayChunkNodeId(parentNodeId: string, chunk: ArrayChunk): string {
  return `${parentNodeId}.[${chunk.start}...${chunk.end}]`;
}

function getArrayChunkLabel(chunk: ArrayChunk): string {
  return `[${chunk.start}...${chunk.end}]`;
}

function JsonViewerTree(props: any) {
  const [expanded, setExpanded]: [string[], any] = useState([]);
  const [unescaped, setUnescaped] = useState<boolean>(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
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

  function handleItemRemove(path: (string | number)[]) {
    if (!props.onJsonUpdate) return;
    const nextJson = removeJsonItemAtPath(props.json, path);
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
    expandableNodeIds.current.clear();
    return populateTreeItems(
      json,
      "JSON", // Root Key Name
      "",
      shouldUnescape,
      false,
      [],
      false // Root key not editable
    );
  }

  function populateTreeItems(
    json: any,
    key: string,
    nodeIdPrefix: string,
    shouldUnescape: boolean,
    isUnescapedContent: boolean = false,
    path: (string | number)[] = [],
    isKeyEditable: boolean = false
  ) {
    const isItemRemovable = path.length > 0 && !isUnescapedContent;
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
              isUnescapedContent={isUnescapedContent}
              path={path}
              onKeyChange={handleKeyChange}
              onValueChange={handleValueChange}
              isKeyEditable={isKeyEditable && !isUnescapedContent}
              isValueEditable={!isUnescapedContent}
              isRemovable={isItemRemovable}
              onRemove={handleItemRemove}
            />
          }
        />
      );
    } else if (typeof json === "object") {
      return populateObject(
        json,
        key,
        nodeId,
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
              isRemovable={isItemRemovable}
              onRemove={handleItemRemove}
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
    shouldUnescape: boolean,
    isUnescapedContent: boolean = false,
    path: (string | number)[] = [],
    isKeyEditable: boolean = false
  ) {
    const isExpanded = expanded.includes(nodeId);
    const hasChildren = Array.isArray(json)
      ? json.length > 0
      : hasObjectChildren(json);

    if (hasChildren) {
      expandableNodeIds.current.add(nodeId);
    }

    const childItems = isExpanded
      ? renderChildTreeItems(
          json,
          nodeId,
          shouldUnescape,
          isUnescapedContent,
          path
        )
      : hasChildren
        ? [
            <JsonViewerTreeItem
              key={`${nodeId}.__lazy-placeholder`}
              nodeId={`${nodeId}.__lazy-placeholder`}
              className="hidden"
            />,
          ]
        : null;

    if (Array.isArray(json)) {
      return (
        <JsonViewerTreeItem
          nodeId={nodeId}
          key={nodeId}
          label={
            <JsonViewerTreeItemLabel
              type="array"
              name={key}
              count={json.length}
              isUnescapedContent={isUnescapedContent}
              path={path}
              onKeyChange={handleKeyChange}
              isKeyEditable={isKeyEditable && !isUnescapedContent}
              isRemovable={path.length > 0 && !isUnescapedContent}
              onRemove={handleItemRemove}
            />
          }
        >
          {childItems}
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
              isRemovable={path.length > 0 && !isUnescapedContent}
              onRemove={handleItemRemove}
            />
          }
        >
          {childItems}
        </JsonViewerTreeItem>
      );
    }
  }

  function renderChildTreeItems(
    json: any,
    nodeId: string,
    shouldUnescape: boolean,
    isUnescapedContent: boolean,
    path: (string | number)[]
  ) {
    if (Array.isArray(json)) {
      if (shouldChunkArray(json)) {
        return getArrayChunks(json.length).map((chunk) =>
          populateArrayChunkTreeItem(
            json,
            chunk,
            nodeId,
            shouldUnescape,
            isUnescapedContent,
            path
          )
        );
      }

      return json.map((itemInArray, index) =>
        populateTreeItems(
          itemInArray,
          index.toString(),
          nodeId,
          shouldUnescape,
          isUnescapedContent,
          [...path, index],
          false // Array keys (indices) are not editable
        )
      );
    }

    return Object.keys(json).map((key) =>
      populateTreeItems(
        json[key],
        key,
        nodeId,
        shouldUnescape,
        isUnescapedContent,
        [...path, key],
        true // Object keys are editable
      )
    );
  }

  function populateArrayChunkTreeItem(
    json: any[],
    chunk: ArrayChunk,
    parentNodeId: string,
    shouldUnescape: boolean,
    isUnescapedContent: boolean,
    path: (string | number)[]
  ) {
    const nodeId = getArrayChunkNodeId(parentNodeId, chunk);
    const isExpanded = expanded.includes(nodeId);
    expandableNodeIds.current.add(nodeId);

    return (
      <JsonViewerTreeItem
        nodeId={nodeId}
        key={nodeId}
        label={
          <JsonViewerTreeItemLabel
            type="array"
            name={getArrayChunkLabel(chunk)}
            isSyntheticArrayChunk
            hideTypeIcon
            isUnescapedContent={isUnescapedContent}
            path={path}
            onKeyChange={handleKeyChange}
            isKeyEditable={false}
            isRemovable={false}
            onRemove={handleItemRemove}
          />
        }
      >
        {isExpanded
          ? renderArraySliceTreeItems(
              json,
              chunk,
              nodeId,
              shouldUnescape,
              isUnescapedContent,
              path
            )
          : [
              <JsonViewerTreeItem
                key={`${nodeId}.__lazy-placeholder`}
                nodeId={`${nodeId}.__lazy-placeholder`}
                className="hidden"
              />,
            ]}
      </JsonViewerTreeItem>
    );
  }

  function renderArraySliceTreeItems(
    json: any[],
    chunk: ArrayChunk,
    nodeId: string,
    shouldUnescape: boolean,
    isUnescapedContent: boolean,
    path: (string | number)[]
  ) {
    const items: ReactNode[] = [];

    for (let index = chunk.start; index <= chunk.end; index += 1) {
      items.push(
        populateTreeItems(
          json[index],
          index.toString(),
          nodeId,
          shouldUnescape,
          isUnescapedContent,
          [...path, index],
          false // Array keys (indices) are not editable
        )
      );
    }

    return items;
  }

  function renderToolBar() {
    const nodeCount = metadata.nodeCount;
    const allowExpandAll = !metadata.isCapped && shouldAllowExpandAll(nodeCount);
    const expandAllDisabled =
      !allowExpandAll ||
      metadata.expandableNodeIds.every((nodeId) => expanded.includes(nodeId));
    const expandAllTitle =
      metadata.isCapped || nodeCount > MAX_EXPAND_ALL_NODE_COUNT
        ? `Expand all is disabled for trees over ${MAX_EXPAND_ALL_NODE_COUNT.toLocaleString()} nodes.`
        : undefined;

    const options: JsonViewerToolBarOption[] = [
      {
        label: "Expand",
        onClick: () => {
          if (allowExpandAll) {
            setExpanded(metadata.nodeIds);
          }
        },
        icon: <OpenInFullIcon />,
        disabled: expandAllDisabled,
        title: expandAllTitle,
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

  const metadata = useMemo(
    () => collectTreeMetadata(props.json, "JSON", "", unescaped),
    [props.json, unescaped]
  );
  const tree = populateTree(props.json);

  return (
    <div className="JsonViewerTree">
      {renderToolBar()}
      {tree}
    </div>
  );
}

export default JsonViewerTree;
