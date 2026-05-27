import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import NotificationItem from "../../components/notifications/NotificationItem";
import EmptyNotifications from "../../components/notifications/EmptyNotifications";
import { useNotifications } from "../../hooks/useNotifications";
import "../../styles/components/notifications/Notifications.css";

const TYPE_OPTIONS = [
  { value: "all", label: "Todos los tipos" },
  { value: "like", label: "Likes" },
  { value: "comment", label: "Comentarios" },
  { value: "follow", label: "Seguimientos" },
  { value: "job_offer", label: "Ofertas" },
  { value: "postulation", label: "Postulaciones" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    unreadCount,
    page,
    lastPage,
    goToPage,
  } = useNotifications();

  const [statusFilter, setStatusFilter] = useState("all"); // all | unread | read
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = [...notifications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((n) => {
      if (statusFilter === "unread") return !n.read_at;
      if (statusFilter === "read") return !!n.read_at;
      return true;
    })
    .filter((n) => typeFilter === "all" || n.type === typeFilter);

  return (
    <div className="pf-notif-page">
      <div className="pf-notif-page__header">
        <button
          type="button"
          className="pf-notif-page__back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Volver
        </button>
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

      {/* Filtros */}
<div className="pf-notif-page__filters">
  <div className="pf-notif-page__filter-group">
    <button type="button" className={`pf-notif-page__filter-btn${statusFilter === "all"    ? " pf-notif-page__filter-btn--active" : ""}`} onClick={() => setStatusFilter("all")}>Todos</button>
    <button type="button" className={`pf-notif-page__filter-btn${statusFilter === "unread" ? " pf-notif-page__filter-btn--active" : ""}`} onClick={() => setStatusFilter("unread")}>No leídos</button>
    <button type="button" className={`pf-notif-page__filter-btn${statusFilter === "read"   ? " pf-notif-page__filter-btn--active" : ""}`} onClick={() => setStatusFilter("read")}>Leídos</button>
  </div>
  <div className="pf-notif-page__type-group">
    {TYPE_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className={`pf-notif-page__type-btn${typeFilter === opt.value ? " pf-notif-page__type-btn--active" : ""}`}
        onClick={() => setTypeFilter(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
</div>

      <div className="pf-notif-page__list">
        {loading ? (
          <p className="pf-notif-page__loading">Cargando...</p>
        ) : filtered.length === 0 ? (
          <EmptyNotifications />
        ) : (
          filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
          ))
        )}
      </div>

      {lastPage > 1 && (
        <div className="pf-notif-page__pagination">
          <button
            type="button"
            className="pf-notif-page__page-btn"
            disabled={page <= 1 || loading}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="pf-notif-page__page-info">
            Página {page} de {lastPage}
          </span>
          <button
            type="button"
            className="pf-notif-page__page-btn"
            disabled={page >= lastPage || loading}
            onClick={() => goToPage(page + 1)}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
