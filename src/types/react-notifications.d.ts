declare module "react-notifications" {
  import type { ComponentType } from "react";
  import type { ReactNotificationOptions } from "react-notifications-component";
  export const NotificationContainer: ComponentType;
  export const NotificationManager: {
    create(options: ReactNotificationOptions): void;
  };
}
