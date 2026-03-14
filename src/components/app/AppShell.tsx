"use client";

import { Suspense, useState } from "react";
import { ReactNotificationOptions } from "react-notifications-component";

import JsonViewer from "@/components/json-viewer/JsonViewer";
import NavBar from "@/components/nav-bar/NavBar";
import Notification from "@/components/notification/Notification";

type AppShellProps = {
  initialText?: string;
};

export default function AppShell({ initialText }: AppShellProps) {
  const [notification, createNotification] = useState<
    ReactNotificationOptions | undefined
  >(undefined);

  return (
    <main className="flex h-full flex-col justify-center">
      <NavBar createNotification={createNotification} />
      <Suspense fallback={<div className="flex-1" />}>
        <JsonViewer
          createNotification={createNotification}
          initialTextOverride={initialText}
        />
      </Suspense>
      <Notification notification={notification} />
    </main>
  );
}
