import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  getNotifications,
  getUnreadCount,
  markOneAsRead,
  markAllRead,
} from "../services/notificationService";
import { getEcho } from "../lib/echo";

const CACHE_KEY = 'portafy_notifications';
const CACHE_TTL = 60 * 1000; // 1 minuto

function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore cache failures in private browsing or storage-limited environments.
  }
}

function invalidateCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

function normalizeNotifications(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  return [];
}

function uniqueNotifications(notifications) {
  const seen = new Set();
  return notifications.filter((item) => {
    const key = String(
      item.id ??
      item.data?.id ??
      item.data?.notification_id ??
      item.data?.notificationId ??
      item.data?.notifiable_id ??
      item.data?.reference_id ??
      item.data?.comment_id ??
      item.data?.event_id ??
      item.data?.offer_id ??
      "",
    );
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapApiNotification(n) {
  const rawData = n.data ?? {};
  const record = { ...n, ...rawData };
  const offer = record.offer ?? null;
  const referenceType = record.reference_type ?? record.referenceType;
  const referenceId = record.reference_id ?? record.referenceId;
  const notificationType = String(
    record.type ?? record.notification_type ?? record.notificationType ?? ""
  ).toLowerCase();
  const notificationId =
    record.id ??
    record.id_notification ??
    record.notification_id ??
    record.notificationId ??
    record.notifiable_id ??
    record.reference_id ??
    record.referenceId ??
    record.comment_id ??
    record.commentId ??
    record.event_id ??
    record.eventId ??
    record.offer_id ??
    record.id_offer ??
    undefined;
  const isOfferRelated =
    ["job_offer", "postulation", "job_application"].includes(notificationType) ||
    referenceType === "offer";
  const createdAt = record.created_at ?? record.createdAt;
  const isRead = record.read_at ?? record.readAt ?? (record.is_read ?? record.isRead ? createdAt : null);

  return {
    id: notificationId != null ? String(notificationId) : undefined,
    type: notificationType,
    created_at: createdAt,
    read_at: isRead,
    data: {
      ...rawData,
      actor_id: record.actor_id ?? record.sender_id ?? record.id_sender ?? record.idSender,
      actor_name:
        record.actor_name ?? record.sender_name ?? record.title ?? record.message ?? null,
      actor_avatar: record.actor_avatar ?? record.sender_avatar ?? null,
      preview: record.preview ?? record.message,
      notifiable_id: record.notifiable_id ?? record.reference_id ?? record.referenceId,
      post_id: record.post_id ?? (referenceType === "publication" ? referenceId : null),
      comment_id: record.comment_id ?? record.commentId ?? (referenceType === "comment" ? referenceId : null),
      event_id: record.event_id ?? record.eventId ?? (referenceType === "event" ? referenceId : null),
      offer_id:
        record.offer_id ?? record.id_offer ?? record.offerId ?? offer?.id_offer ??
        (referenceType === "offer" ? referenceId : null),
      offer_title:
        record.offer_title ?? record.title_offer ?? record.title ?? offer?.title ??
        record.offerTitle ?? record.title ?? (isOfferRelated ? record.title : undefined),
      company_name: record.company_name ?? record.companyName ?? offer?.company?.name,
    },
  };
}

function normalizeUnreadCount(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload?.count === "number") return payload.count;
  if (typeof payload?.unread_count === "number") return payload.unread_count;
  if (typeof payload?.data?.count === "number") return payload.data.count;
  if (typeof payload?.data?.unread_count === "number")
    return payload.data.unread_count;
  return 0;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    await Promise.resolve();

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const cached = getCache();
    if (cached) {
      setNotifications(uniqueNotifications(cached.notifications));
      setUnreadCount(cached.unreadCount);
      return;
    }

    setLoading(true);

    // 👇 declaradas AQUÍ, fuera de los if
    let newNotifs = [];
    let newCount = 0;

    const [notifResult, countResult] = await Promise.allSettled([
      getNotifications(),
      getUnreadCount(),
    ]);

    if (notifResult.status === "fulfilled") {
      newNotifs = uniqueNotifications(normalizeNotifications(notifResult.value).map(mapApiNotification));
      setNotifications(newNotifs);
    } else {
      setNotifications([]);
    }

    if (countResult.status === "fulfilled") {
      newCount = normalizeUnreadCount(countResult.value);
      setUnreadCount(newCount);
    } else {
      setUnreadCount(0);
    }

    setCache({ notifications: newNotifs, unreadCount: newCount });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const fetchTimer = globalThis.setTimeout(() => {
      fetchAll();
    }, 0);

    if (!user) {
      return () => globalThis.clearTimeout(fetchTimer);
    }

    const echo = getEcho();
    if (!echo) return undefined;

    const channelName = `App.Models.User.${user.id}`;
    const channel = echo.private(channelName);

    channel.notification((notification) => {
      setNotifications((prev) => uniqueNotifications([mapApiNotification(notification), ...prev]));
      setUnreadCount((prev) => prev + 1);
    });
    return () => {
      globalThis.clearTimeout(fetchTimer);
      echo.leave(channelName);
    };
  }, [user, fetchAll]);

  const markAsRead = useCallback(async (id) => {
    try {
      await markOneAsRead(id);
      invalidateCache();
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[useNotifications] markAsRead error:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllRead();
      invalidateCache();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("[useNotifications] markAllAsRead error:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchAll,
  };
}
