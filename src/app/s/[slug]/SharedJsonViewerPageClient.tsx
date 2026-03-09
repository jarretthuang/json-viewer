"use client";

import { useState } from "react";
import { ReactNotificationOptions } from "react-notifications-component";
import NavBar from "@/components/nav-bar/NavBar";
import JsonViewer from "@/components/json-viewer/JsonViewer";
import Notification from "@/components/notification/Notification";

export default function SharedJsonViewerPageClient({ jsonText }: { jsonText: string }) {
  const [notification, createNotification] = useState<
    ReactNotificationOptions | undefined
  >(undefined);

  return (
    <main className="flex h-full flex-col justify-center">
      <NavBar createNotification={createNotification} />
      <JsonViewer createNotification={createNotification} initialTextOverride={jsonText} />
      <Notification notification={notification}></Notification>
    </main>
  );
}
