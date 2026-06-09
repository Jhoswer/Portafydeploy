import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/landing/Navbar";
import NotificationItem from "../../components/notifications/NotificationItem";
import EmptyNotifications from "../../components/notifications/EmptyNotifications";
import { useNotifications } from "../../hooks/useNotifications";
import "../../styles/components/notifications/Notifications.css";

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const { t } = useTranslation();
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

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  // CAMBIO: página local para la vista filtrada
  const [filteredPage, setFilteredPage] = useState(1);

  const TYPE_OPTIONS = [
    { value: "all",         label: t("notifications.type.all") },
    { value: "like",        label: t("notifications.type.like") },
    { value: "comment",     label: t("notifications.type.comment") },
    { value: "follow",      label: t("notifications.type.follow") },
    { value: "job_offer",   label: t("notifications.type.job_offer") },
    { value: "postulation", label: t("notifications.type.postulation") },
  ];

  // CAMBIO: resetear filteredPage a 1 cuando cambia cualquier filtro
  useEffect(() => {
    setFilteredPage(1);
  }, [statusFilter, typeFilter]);

  // CAMBIO: aplicar filtros sobre TODAS las notificaciones cargadas
  const allFiltered = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .filter((n) => {
        if (statusFilter === "unread") return !n.read_at;
        if (statusFilter === "read")   return !!n.read_at;
        return true;
      })
      .filter((n) => typeFilter === "all" || n.type === typeFilter);
  }, [notifications, statusFilter, typeFilter]);

  // CAMBIO: determinar si hay filtros activos
  const hasActiveFilter = statusFilter !== "all" || typeFilter !== "all";

  // CAMBIO: calcular paginación según contexto
  // - Sin filtros: usar paginación real del backend (lastPage, goToPage)
  // - Con filtros: paginar localmente sobre allFiltered
  const filteredLastPage = useMemo(() => {
    if (!hasActiveFilter) return lastPage;
    return Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));
  }, [hasActiveFilter, allFiltered.length, lastPage]);

  const currentPage   = hasActiveFilter ? filteredPage : page;
  const currentLastPage = filteredLastPage;

  // CAMBIO: slice para paginación local cuando hay filtros
  const displayed = useMemo(() => {
    if (!hasActiveFilter) return allFiltered;
    const start = (filteredPage - 1) * PAGE_SIZE;
    return allFiltered.slice(start, start + PAGE_SIZE);
  }, [hasActiveFilter, allFiltered, filteredPage]);

  function handlePageChange(newPage) {
    if (hasActiveFilter) {
      setFilteredPage(newPage);
    } else {
      goToPage(newPage);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <Navbar />

      <div className="pf-notif-page">
        <div className="pf-notif-page__header">
          <button
            type="button"
            className="pf-notif-page__back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> {t("notifications.back")}
          </button>
          <h1 className="pf-notif-page__title">{t("notifications.title")}</h1>
          {unreadCount > 0 && (
            <button
              type="button"
              className="pf-notif__mark-all"
              onClick={markAllAsRead}
            >
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>

        <div className="pf-notif-page__filters">
          <div className="pf-notif-page__filter-group">
            {["all", "unread", "read"].map((s) => (
              <button
                key={s}
                type="button"
                className={`pf-notif-page__filter-btn${statusFilter === s ? " pf-notif-page__filter-btn--active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {t(`notifications.filter.${s}`)}
              </button>
            ))}
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
            <p className="pf-notif-page__loading">{t("notifications.loading")}</p>
          ) : displayed.length === 0 ? (
            <EmptyNotifications />
          ) : (
            displayed.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
              />
            ))
          )}
        </div>

        {/* CAMBIO: paginación usa currentPage y currentLastPage */}
        {currentLastPage > 1 && (
          <div className="pf-notif-page__pagination">
            <button
              type="button"
              className="pf-notif-page__page-btn"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={16} /> {t("notifications.pagination.previous")}
            </button>
            <span className="pf-notif-page__page-info">
              {t("notifications.pagination.pageInfo", { page: currentPage, lastPage: currentLastPage })}
            </span>
            <button
              type="button"
              className="pf-notif-page__page-btn"
              disabled={currentPage >= currentLastPage || loading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {t("notifications.pagination.next")} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}