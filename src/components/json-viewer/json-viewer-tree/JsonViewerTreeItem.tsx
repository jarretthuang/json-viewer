"use client";
import { TreeItemProps, treeItemClasses } from "@mui/lab/TreeItem";
import { TreeItem } from "@mui/x-tree-view";
import { alpha, styled } from "@mui/material/styles";
import Collapse from "@mui/material/Collapse";
import { useSpring, animated } from "@react-spring/web";
import { TransitionProps } from "@mui/material/transitions";

export type JsonViewerTreeItemProps = TreeItemProps & {
  onItemClick: (nodeId: string) => void;
};

function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: "translate3d(20px,0,0)",
    },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

const JsonViewerTreeItem = styled(
  ({ onItemClick, ...props }: JsonViewerTreeItemProps) => (
    <TreeItem
      {...props}
      TransitionComponent={TransitionComponent}
      onClick={() => onItemClick(props.nodeId)}
    />
  )
)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    paddingLeft: "0.7rem",
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

export default JsonViewerTreeItem;
