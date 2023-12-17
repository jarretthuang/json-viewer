"use client";
import JsonViewer from "@/components/json-viewer/JsonViewer";
import NavBar from "@/components/nav-bar/NavBar";
import { useState } from "react";
import { ReactNotificationOptions } from "react-notifications-component";
import Notification from "@/components/notification/Notification";

export default function App() {
  const [notification, createNotification] = useState<
    ReactNotificationOptions | undefined
  >(undefined);

  return (
    <main className="flex h-full flex-col justify-center">
      <NavBar createNotification={createNotification}/>
      <JsonViewer createNotification={createNotification}></JsonViewer>
      <Notification notification={notification}></Notification>
    </main>
  );
}
