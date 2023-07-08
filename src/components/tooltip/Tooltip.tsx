import { styled } from "@mui/material";
import { default as MuiTooltip } from "@mui/material/Tooltip";
import { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";

export const Tooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip
    {...props}
    arrow
    placement={props.placement ?? "right"}
    classes={{ popper: className }}
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    fontSize: "0.4rem",
    userSelect: "none",
  },
}));
