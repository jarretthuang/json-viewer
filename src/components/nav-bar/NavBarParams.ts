import { Application } from "../../model/application/Application";

export type NavBarParams = {
  goHome?: () => void;
  currentApp?: Application;
  isDarkTheme?: boolean;
  backgroundColour?: string;
};
