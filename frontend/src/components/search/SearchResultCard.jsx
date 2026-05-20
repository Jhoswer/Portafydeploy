import { ExternalLink, MapPin, User, FolderOpen, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TYPE_CONFIG = {
  usuario:   { label: "Usuario",   Icon: User,       colorClass: "badge--user" },
  proyecto:  { label: "Proyecto",  Icon: FolderOpen, colorClass: "badge--project" },
  habilidad: { label: "Habilidad", Icon: Zap,        colorClass: "badge--skill" },
};

const AVATAR_PALETTE = [
  { bg: "#FEE2E2", fg: "#B91C1C" },
  { bg: "#DBEAFE", fg: "#1D4ED8" },
  { bg: "#D1FAE5", fg: "#065F46" },
  { bg: "#EDE9FE", fg: "#6D28D9" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#FCE7F3", fg: "#9D174D" },
];

function avatarColor(name = "") {
  if (!name) return AVATAR_PALETTE[0];
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

export function SearchCard({ profile }) {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[profile.type] ?? TYPE_CONFIG.usuario;
  const { Icon } = cfg;
  const name = profile.name || "Usuario";
  const title = profile.title || "Perfil profesional";
  const { bg, fg } = avatarColor(name);
  const targetUrl = profile.profileUrl || `/perfil-profesional?usuario=${profile.id}`;

  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      className="search-card"
      onClick={() => navigate(targetUrl)}
    >
      <div className="search-card__body">

        {/* ── Top ── */}
        <div className="search-card__top">
          <div
            className="search-card__avatar"
            style={{ background: bg, color: fg }}
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={name}
                className="search-card__avatar-img"
              />
            ) : (
              initials
            )}
          </div>

          <div className="search-card__meta">
            <strong className="search-card__name">{name}</strong>
            <p className="search-card__title">{title}</p>
          </div>
        </div>

        {/* ── Tipo ── */}
        <span className={`badge ${cfg.colorClass}`}>
          <Icon size={11} />
          {cfg.label}
        </span>

        {/* ── Ubicación ── */}
        {profile.location && (
          <p className="search-card__location">
            <MapPin size={11} />
            {profile.location}
          </p>
        )}

        {/* ── Bio ── */}
        {profile.bio && (
          <p className="search-card__desc">{profile.bio}</p>
        )}

        {/* ── Skills ── */}
        {profile.skills?.length > 0 && (
          <div className="search-card__tags">
            {profile.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
            {profile.skills.length > 4 && (
              <span className="tag tag--more">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* ── Acción ── */}
        <div className="search-card__actions">
          <button
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(targetUrl);
            }}
          >
            <ExternalLink size={13} />
            Ver perfil
          </button>
        </div>

      </div>
    </article>
  );
}
