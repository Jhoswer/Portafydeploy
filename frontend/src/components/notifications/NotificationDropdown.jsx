import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotificationItem from "./NotificationItem";
import EmptyNotifications from "./EmptyNotifications";
import { NOTIFICATION_LIMIT } from "../../features/notifications/constants";

export default function NotificationDropdown({ onClose, notificationState }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } =
    notificationState ?? {
      notifications: [],
      loading: false,
      markAsRead: () => {},
      markAllAsRead: () => {},
      unreadCount: 0,
    };

  return (
    <div className="pf-notif__dropdown">
      <div className="pf-notif__dropdown-header">
        <span className="pf-notif__dropdown-title">
          {t("notificationBell.title")}
          {unreadCount > 0 && (
            <span className="pf-notif__dropdown-count">{unreadCount}</span>
          )}
        </span>
        {unreadCount > 0 && (
          <button type="button" className="pf-notif__mark-all" onClick={markAllAsRead}>
            {t("notificationBell.markAllRead")}
          </button>
        )}
      </div>

      <div className="pf-notif__dropdown-list">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="pf-notif__skeleton">
              <div className="pf-notif__skeleton-avatar" />
              <div className="pf-notif__skeleton-lines">
                <div className="pf-notif__skeleton-line pf-notif__skeleton-line--lg" />
                <div className="pf-notif__skeleton-line pf-notif__skeleton-line--sm" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          notifications.slice(0, NOTIFICATION_LIMIT).map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={markAsRead}
              onClose={onClose}
            />
          ))
        )}
      </div>

      <div className="pf-notif__dropdown-footer">
        <button
          type="button"
          className="pf-notif__ver-todas"
          onClick={() => { navigate("/notifications"); onClose(); }}
        >
          {t("notificationBell.viewAll")}
        </button>
      </div>
    </div>
  );
}