import _, { Dictionary } from "lodash";
import {
  jsonViewerAppDescription,
} from "./appDescriptions";

export type Application = {
  name: string;
  themeColour?: string;
  isFullScreen?: boolean;
  isDarkTheme?: boolean;
  metadata?: ApplicationMetadata;
};

export type ApplicationMetadata = {
  displayName: string;
  description?: string;
};

export const JSON_VIEWER_APP: Application = {
  name: "json-viewer",
  themeColour: "#fdfeff",
  isFullScreen: true,
  metadata: {
    displayName: "JSON Viewer",
    description: jsonViewerAppDescription,
  },
};

export const applications = [JSON_VIEWER_APP];

export const applicationsMap: Dictionary<Application> = _.keyBy(
  applications,
  "name"
);

export const getAppByName = (appName: string) => {
  return applicationsMap[appName];
};
