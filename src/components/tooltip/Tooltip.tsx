import { styled } from "@mui/material";
import { default as MuiTooltip } from "@mui/material/Tooltip";
import { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";

type AdditionalProps = {
  fontSize?: string;
  backgroundColor?: string;
  fontColor?: string;
  padding?: string;
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
)<AdditionalProps>(
  ({ theme, fontSize, backgroundColor, fontColor, padding }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      boxShadow: theme.shadows[1],
      fontSize: fontSize ?? "clamp(0.4rem, 0.95vw, 1rem)",
      userSelect: "none",
      backgroundColor: backgroundColor,
      color: fontColor,
      padding: padding,
    },
  })
);
