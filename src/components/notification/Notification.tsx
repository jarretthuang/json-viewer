"use client";
import React, { useEffect, useState } from "react";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { ReactNotificationOptions } from "react-notifications-component";
import "react-notifications/lib/notifications.css";
import "./Notification.css";

export type WithNotification = {
  createNotification: (o: ReactNotificationOptions) => void;
};

function Notification(props: any) {
  const [currentNotification, updateNotification] = useState<
    ReactNotificationOptions | undefined
  >(undefined);
  const createNotification = (options: ReactNotificationOptions) => {
    NotificationManager.create(options);
  };

  useEffect(() => {
    if (props.notification && props.notification !== currentNotification) {
      createNotification(props.notification);
      updateNotification(props.notification);
    }
  }, [props.notification, currentNotification]);

  return (
    <div className="Notification">
      <NotificationContainer />
    </div>
  );
}

export default Notification;
