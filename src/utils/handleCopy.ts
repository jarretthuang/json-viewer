import { ReactNotificationOptions } from "react-notifications-component";

/**
 * Handles copying text to clipboard
 */
export const copyTextToClipboard = (
  text: string,
  createNotification: (o: ReactNotificationOptions) => void,
  name: string = "Content"
) => {
  navigator.clipboard.writeText(text);
  const notification: ReactNotificationOptions = {
    title: "Copied to clipboard",
    type: "success",
    container: "top-center",
    message: `${name} has been successfully copied into your clipboard!`,
  };
  createNotification(notification);
};
