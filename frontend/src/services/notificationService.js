import { apiClient } from "./http/httpClient";

// ── Notificaciones ────────────────────────────────────────────
export const getNotifications      = (page = 1) => apiClient.get(`/notifications?page=${page}`, { timeoutMs: 180000 });
export const getUnreadCount        = ()         => apiClient.get("/notifications/unread-count", { timeoutMs: 180000 });
export const markOneAsRead         = (id)       => apiClient.patch(`/notifications/${id}/read`);
export const markAllRead           = ()         => apiClient.patch("/notifications/read-all");

// ── Preferencias ──────────────────────────────────────────────
export const getNotificationPrefs  = ()         => apiClient.get("/notification-preferences");
export const saveNotificationPrefs = (prefs)    => apiClient.put("/notification-preferences", prefs);

// ── Push tokens ───────────────────────────────────────────────
export const registerPushToken     = (payload)  => apiClient.post("/push-tokens", payload);
