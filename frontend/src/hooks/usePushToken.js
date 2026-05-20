import { useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { registerPushToken } from "../services/notificationService";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? "";

export function usePushToken() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !VAPID_PUBLIC_KEY) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const register = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.register("/sw.js");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await registerPushToken({
          token:    JSON.stringify(subscription),
          platform: "web",
        });
      } catch (err) {
        console.warn("[usePushToken] no se pudo registrar push:", err.message);
      }
    };

    register();
  }, [user]);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}