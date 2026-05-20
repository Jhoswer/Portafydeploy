import NotificationItem from "../../components/notifications/NotificationItem";
import EmptyNotifications from "../../components/notifications/EmptyNotifications";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  return (
    <div className="pf-notif-page">
      <div className="pf-notif-page__header">
        <h1 className="pf-notif-page__title">Notificaciones</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            className="pf-notif__mark-all"
            onClick={markAllAsRead}
          >
            Marcar todas como leidas
          </button>
        )}
      </div>

      <div className="pf-notif-page__list">
        {notifications.length === 0 && !loading ? (
          <EmptyNotifications />
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
          ))
        )}
        {loading && <p className="pf-notif-page__loading">Cargando...</p>}
      </div>
    </div>
  );
}
