import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AtSign, Bell, BriefcaseBusiness, CalendarDays, Heart, MessageCircle, UserPlus } from "lucide-react";

const getOfferTitle = (d) =>
  d.offer_title ?? d.offer?.title ?? d.title_offer ?? d.title ?? d.position ?? "la oferta";

const getPersonName = (d) => d.actor_name ?? d.sender_name ?? "Alguien";

const getCommentText = (d) => {
  const actorName = getPersonName(d);
  const rawText = (d.preview ?? d.message ?? "").trim();
  if (!rawText) return `${actorName} comento`;

  const normalized = rawText.replace(/\s+/g, " ").trim();
  if (actorName && normalized.toLowerCase().startsWith(actorName.toLowerCase())) {
    return normalized;
  }

  return `${actorName} comento: "${normalized}"`;
};

const TYPE_CONFIG = {
  like: {
    icon:     Heart,
    color:    "#EF4444",
    getText:  (d) => `${getPersonName(d)} le dio like a tu publicacion`,
    getRoute: (d) => d.notifiable_id ? `/posts/${d.notifiable_id}` : `/feed`,
  },
  comment: {
    icon:     MessageCircle,
    color:    "#3B82F6",
    getText:  getCommentText,
    getRoute: (d) => d.post_id ? `/posts/${d.post_id}${d.comment_id ? `#comment-${d.comment_id}` : ""}` : `/feed`,
  },
  follow: {
    icon:     UserPlus,
    color:    "#8B5CF6",
    getText:  (d) => `${getPersonName(d)} comenzo a seguirte`,
    getRoute: (d) => d.actor_id ? `/profile/${d.actor_id}` : `/feed`,
  },
  event: {
    icon:     CalendarDays,
    color:    "#F59E0B",
    getText:  (d) => `Nuevo evento: ${d.event_title ?? ""}`,
    getRoute: (d) => d.event_id ? `/events/${d.event_id}` : `/feed`,
  },
  job_offer: {
    icon:     BriefcaseBusiness,
    color:    "#0EA5E9",
    getText:  (d) => `${d.company_name ?? "Empresa"} publico una oferta: ${getOfferTitle(d)}`,
    getRoute: (d) => d.offer_id ? `/reclutador/ofertas/${d.offer_id}` : `/feed`,
  },
  postulation: {
    icon:     BriefcaseBusiness,
    color:    "#0EA5E9",
    getText:  (d) => `${getPersonName(d)} se postulo a: ${getOfferTitle(d)}`,
    getRoute: (d) => d.offer_id ? `/reclutador/ofertas/${d.offer_id}` : `/feed`,
  },
  job_application: {
    icon:     BriefcaseBusiness,
    color:    "#0EA5E9",
    getText:  (d) => `${getPersonName(d)} se postulo a: ${getOfferTitle(d)}`,
    getRoute: (d) => d.offer_id ? `/reclutador/ofertas/${d.offer_id}` : `/feed`,
  },
  mention: {
    icon:     AtSign,
    color:    "#10B981",
    getText:  (d) => `${getPersonName(d)} ${d.preview ?? ""}`,
    getRoute: (d) => d.post_id ? `/posts/${d.post_id}` : `/feed`,
  },
};

const DEFAULT_CONFIG = {
  icon:     Bell,
  color:    "#6B7280",
  getText:  () => "Nueva notificacion",
  getRoute: () => "/notifications",
};

const TYPE_LABELS = {
  like:           "Like",
  comment:        "Comentario",
  follow:         "Seguimiento",
  event:          "Evento",
  job_offer:      "Oferta",
  postulation:    "Postulación",
  job_application:"Aplicación",
};

const getTypeLabel = (type) => {
  if (!type) return null;
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ");
};

export default function NotificationItem({ notification, onRead, onClose }) {
  const navigate = useNavigate();
  const { id, type, data = {}, read_at, created_at } = notification;

  const config   = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
  const Icon     = config.icon;
  const isUnread = !read_at;

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

  const avatarName = data.actor_name ?? data.company_name;

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
          ? <img src={data.actor_avatar} alt={avatarName ?? "Notificacion"} />
          : <span>{avatarName?.[0]?.toUpperCase() ?? "?"}</span>
        }
        <span className="pf-notif__item-type-icon" style={{ background: config.color }}>
          <Icon size={10} color="white" />
        </span>
      </div>

      <div className="pf-notif__item-body">
        <p className="pf-notif__item-text">{config.getText(data)}</p>
        {getTypeLabel(type) ? (
          <span className="pf-notif__item-type-badge">{getTypeLabel(type)}</span>
        ) : null}
        <span className="pf-notif__item-time">
          {formatDistanceToNow(new Date(created_at), { locale: es, addSuffix: true })}
        </span>
      </div>

      <button
        type="button"
        className={`pf-notif__item-status${isUnread ? " pf-notif__item-status--unread" : ""}`}
        onClick={handleReadClick}
        aria-label={isUnread ? "Marcar como leida" : "Notificacion leida"}
        title={isUnread ? "Marcar como leida" : "Leida"}
      />
    </div>
  );
}
