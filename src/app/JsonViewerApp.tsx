"use client";

import JsonViewer from "@/components/json-viewer/JsonViewer";
import NavBar from "@/components/nav-bar/NavBar";
import DonationBanner from "@/components/donation-banner/DonationBanner";
import { Suspense, useState } from "react";
import { ReactNotificationOptions } from "react-notifications-component";
import Notification from "@/components/notification/Notification";

export default function JsonViewerApp() {
  const [notification, createNotification] = useState<
    ReactNotificationOptions | undefined
  >(undefined);

  return (
    <>
      <NavBar createNotification={createNotification} />
      <DonationBanner />
      <Suspense fallback={<div className="flex-1" />}>
        <JsonViewer createNotification={createNotification}></JsonViewer>
      </Suspense>
      <Notification notification={notification}></Notification>
    </>
  );
}
