import { ReactElement } from "react";

export type JsonViewerToolBarOption = {
  label: string;
  onClick: () => void;
  icon?: ReactElement;
  hidden?: boolean;
  disabled?: boolean;
  ping?: boolean;
};
