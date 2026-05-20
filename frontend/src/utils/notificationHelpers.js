import { Heart, MessageCircle, UserPlus, CalendarDays, Bell } from "lucide-react";

// ── Ícono y color por tipo ────────────────────────────────────
export const NOTIFICATION_ICONS = {
  like:    { icon: Heart,          color: "#EF4444" },
  comment: { icon: MessageCircle,  color: "#3B82F6" },
  follow:  { icon: UserPlus,       color: "#8B5CF6" },
  event:   { icon: CalendarDays,   color: "#F59E0B" },
  default: { icon: Bell,           color: "#6B7280" },
};

// ── Texto legible por tipo ────────────────────────────────────
export const getNotificationText = (type, data) => {
  switch (type) {
    case "like":
      return `${data.actor_name} le dio like a tu publicación`;
    case "comment":
      return `${data.actor_name} comentó: "${data.preview}"`;
    case "follow":
      return `${data.actor_name} comenzó a seguirte`;
    case "event":
      return `Nuevo evento: ${data.event_title}`;
    default:
      return "Nueva notificación";
  }
};

// ── Ruta de redirección por tipo ──────────────────────────────
export const getNotificationRoute = (type, data) => {
  switch (type) {
    case "like":
      return `/posts/${data.notifiable_id}`;
    case "comment":
      return `/posts/${data.post_id}#comment-${data.comment_id}`;
    case "follow":
      return `/profile/${data.actor_id}`;
    case "event":
      return `/events/${data.event_id}`;
    default:
      return "/notifications";
  }
};

// ── Categoría legible ─────────────────────────────────────────
export const getNotificationCategory = (type) => {
  const map = {
    like:    "social",
    comment: "social",
    follow:  "social",
    event:   "portfolio",
  };
  return map[type] ?? "admin";
};