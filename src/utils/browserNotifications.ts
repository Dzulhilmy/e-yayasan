export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") {
    return "granted" as const;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Notification permission request failed", error);
    return "denied" as const;
  }
}

export function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return false;
  }

  try {
    if (Notification.permission !== "granted") {
      return false;
    }

    new Notification(title, {
      body,
      icon: "/logo-yp.png",
      silent: false,
    });
    return true;
  } catch (error) {
    console.error("Browser notification failed", error);
    return false;
  }
}

export function browserNotificationsSupported() {
  return typeof window !== "undefined" && typeof Notification !== "undefined";
}
