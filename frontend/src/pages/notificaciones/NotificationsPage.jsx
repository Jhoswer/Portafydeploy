import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/landing/Navbar";
import NotificationItem from "../../components/notifications/NotificationItem";
import EmptyNotifications from "../../components/notifications/EmptyNotifications";
import { useNotifications } from "../../hooks/useNotifications";
import "../../styles/components/notifications/Notifications.css";

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

  const TYPE_OPTIONS = [
    { value: "all",         label: t("notifications.type.all") },
    { value: "like",        label: t("notifications.type.like") },
    { value: "comment",     label: t("notifications.type.comment") },
    { value: "follow",      label: t("notifications.type.follow") },
    { value: "job_offer",   label: t("notifications.type.job_offer") },
    { value: "postulation", label: t("notifications.type.postulation") },
  ];

  const filtered = [...notifications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((n) => {
      if (statusFilter === "unread") return !n.read_at;
      if (statusFilter === "read") return !!n.read_at;
      return true;
    })
    .filter((n) => typeFilter === "all" || n.type === typeFilter);

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
          ) : filtered.length === 0 ? (
            <EmptyNotifications />
          ) : (
            filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
              />
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
              <ChevronLeft size={16} /> {t("notifications.pagination.previous")}
            </button>
            <span className="pf-notif-page__page-info">
              {t("notifications.pagination.pageInfo", { page, lastPage })}
            </span>
            <button
              type="button"
              className="pf-notif-page__page-btn"
              disabled={page >= lastPage || loading}
              onClick={() => goToPage(page + 1)}
            >
              {t("notifications.pagination.next")} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}