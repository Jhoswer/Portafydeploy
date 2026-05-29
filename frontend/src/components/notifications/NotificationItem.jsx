import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, pt } from "date-fns/locale";
import { AtSign, Bell, BriefcaseBusiness, CalendarDays, Heart, MessageCircle, UserPlus } from "lucide-react";

const DATE_LOCALES = { es, en: enUS, pt };

const getOfferTitle  = (d, t) => d.offer_title ?? d.offer?.title ?? d.title_offer ?? d.title ?? d.position ?? t("notificationBell.messages.fallbackOffer");
const getPersonName  = (d, t) => d.actor_name ?? d.sender_name ?? t("notificationBell.messages.fallbackPerson");

const getCommentText = (d, t) => {
  const actorName = getPersonName(d, t);
  const rawText   = (d.preview ?? d.message ?? "").trim();
  if (!rawText) return t("notificationBell.messages.comment", { name: actorName });

  const normalized = rawText.replace(/\s+/g, " ").trim();
  if (actorName && normalized.toLowerCase().startsWith(actorName.toLowerCase())) {
    return normalized;
  }
  return t("notificationBell.messages.commentWithText", { name: actorName, text: normalized });
};

const TYPE_CONFIG = {
  like: {
    icon:     Heart,
    color:    "#EF4444",
    getText:  (d, t) => t("notificationBell.messages.like", { name: getPersonName(d, t) }),
    getRoute: (d)    => d.notifiable_id ? `/posts/${d.notifiable_id}` : `/feed`,
  },
  comment: {
    icon:     MessageCircle,
    color:    "#3B82F6",
    getText:  (d, t) => getCommentText(d, t),
    getRoute: (d)    => d.post_id ? `/posts/${d.post_id}${d.comment_id ? `#comment-${d.comment_id}` : ""}` : `/feed`,
  },
  follow: {
    icon:     UserPlus,
    color:    "#8B5CF6",
    getText:  (d, t) => t("notificationBell.messages.follow", { name: getPersonName(d, t) }),
    getRoute: (d)    => d.actor_id ? `/profile/${d.actor_id}` : `/feed`,
  },
  event: {
    icon:     CalendarDays,
    color:    "#F59E0B",
    getText:  (d, t) => t("notificationBell.messages.event", { title: d.event_title ?? "" }),
    getRoute: (d)    => d.event_id ? `/events/${d.event_id}` : `/feed`,
  },
  job_offer: {
    icon:     BriefcaseBusiness,
    color:    "#0EA5E9",
    getText:  (d, t) => t("notificationBell.messages.job_offer", { company: d.company_name ?? t("notificationBell.messages.fallbackCompany"), title: getOfferTitle(d, t) }),
    getRoute: (d)    => d.offer_id ? `/reclutador/ofertas/${d.offer_id}` : `/feed`,
  },
  postulation: {
    icon:     BriefcaseBusiness,
    color:    "#0EA5E9",
    getText:  (d, t) => t("notificationBell.messages.postulation", { name: getPersonName(d, t), title: getOfferTitle(d, t) }),
    getRoute: (d)    => d.offer_id ? `/reclutador/ofertas/${d.offer_id}` : `/feed`,
  },
  job_application: {
    icon:     BriefcaseBusiness,
    color:    "#0EA5E9",
    getText:  (d, t) => t("notificationBell.messages.job_application", { name: getPersonName(d, t), title: getOfferTitle(d, t) }),
    getRoute: (d)    => d.offer_id ? `/reclutador/ofertas/${d.offer_id}` : `/feed`,
  },
  mention: {
    icon:     AtSign,
    color:    "#10B981",
    getText:  (d, t) => `${getPersonName(d, t)} ${d.preview ?? ""}`,
    getRoute: (d)    => d.post_id ? `/posts/${d.post_id}` : `/feed`,
  },
};

const DEFAULT_CONFIG = {
  icon:     Bell,
  color:    "#6B7280",
  getText:  (_d, t) => t("notificationBell.messages.default"),
  getRoute: ()      => "/notifications",
};

export default function NotificationItem({ notification, onRead, onClose }) {
  const navigate     = useNavigate();
  const { t, i18n } = useTranslation();
  const { id, type, data = {}, read_at, created_at } = notification;

  const config   = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
  const Icon     = config.icon;
  const isUnread = !read_at;

  const typeLabel = t(`notificationBell.types.${type}`, { defaultValue: type?.replace(/_/g, " ") ?? null });

  const handleClick = () => {
    if (isUnread) onRead(id);
    if (onClose)  onClose();
    navigate(config.getRoute(data));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const handleReadClick = (event) => {
    event.stopPropagation();
    if (isUnread) onRead(id);
  };

  const avatarName   = data.actor_name ?? data.company_name;
  const dateLocale   = DATE_LOCALES[i18n.language] ?? DATE_LOCALES.es;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`pf-notif__item${isUnread ? " pf-notif__item--unread" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="pf-notif__item-avatar">
        {data.actor_avatar
          ? <img src={data.actor_avatar} alt={avatarName ?? t("notificationBell.item.altAvatar")} />
          : <span>{avatarName?.[0]?.toUpperCase() ?? "?"}</span>
        }
        <span className="pf-notif__item-type-icon" style={{ background: config.color }}>
          <Icon size={10} color="white" />
        </span>
      </div>

      <div className="pf-notif__item-body">
        <p className="pf-notif__item-text">{config.getText(data, t)}</p>
        {typeLabel ? (
          <span className="pf-notif__item-type-badge">{typeLabel}</span>
        ) : null}
        <span className="pf-notif__item-time">
          {formatDistanceToNow(new Date(created_at), { locale: dateLocale, addSuffix: true })}
        </span>
      </div>

      <button
        type="button"
        className={`pf-notif__item-status${isUnread ? " pf-notif__item-status--unread" : ""}`}
        onClick={handleReadClick}
        aria-label={isUnread ? t("notificationBell.item.markAsRead") : t("notificationBell.item.read")}
        title={isUnread ? t("notificationBell.item.markAsRead") : t("notificationBell.item.read")}
      />
    </div>
  );
}