import Echo   from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
  if (echoInstance) return echoInstance;

  const key = import.meta.env.VITE_REVERB_APP_KEY;

  // Si no hay key configurada, no inicializar
  if (!key) {
    console.warn("[Echo] VITE_REVERB_APP_KEY no configurada, WebSockets desactivados.");
    return null;
  }

  echoInstance = new Echo({
    broadcaster:       "reverb",
    key,
    wsHost:            import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    wsPort:            import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort:           import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS:          (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint:      "/broadcasting/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    },
  });

  return echoInstance;
}

export function disconnectEcho() {
  echoInstance?.disconnect();
  echoInstance = null;
}