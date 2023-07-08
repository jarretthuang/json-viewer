import { styled } from "@mui/material";
import { default as MuiTooltip } from "@mui/material/Tooltip";
import { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";

type AdditionalProps = {
  fontSize?: string;
};

export const Tooltip = styled(
  ({ className, fontSize, ...props }: TooltipProps & AdditionalProps) => (
    <MuiTooltip
      {...props}
      arrow
      placement={props.placement ?? "right"}
      classes={{ popper: className }}
    />
  )
)<AdditionalProps>(({ theme, fontSize }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    fontSize: fontSize ?? "0.4rem",
    userSelect: "none",
  },
}));
