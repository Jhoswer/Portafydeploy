import { useState } from "react";
import { ExternalLink, MapPin, User, FolderOpen, Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TYPE_ICONS = {
  usuario:   User,
  proyecto:  FolderOpen,
  habilidad: Zap,
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

function ProfileModal({ profile, name, title, initials, bg, fg, targetUrl, onClose }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const Icon = TYPE_ICONS[profile.type] ?? User;
  const typeLabel = t(`portafySearch.card.types.${profile.type}`, { defaultValue: profile.type });
  const colorClass = `badge--${profile.type === "usuario" ? "user" : profile.type === "proyecto" ? "project" : "skill"}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-white)",
          borderRadius: "var(--radius-l)",
          border: "0.5px solid var(--color-glass-border)",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-float)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "var(--space-4)",
          borderBottom: "0.5px solid var(--color-blue-soft)",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              className="search-card__avatar"
              style={{ background: bg, color: fg, width: 56, height: 56, fontSize: 18 }}
            >
              {profile.avatar
                ? <img src={profile.avatar} alt={name} className="search-card__avatar-img" />
                : initials}
            </div>
            <div>
              <strong className="search-card__name" style={{ fontSize: 17 }}>{name}</strong>
              <p className="search-card__title">{title}</p>
              <span className={`badge ${colorClass}`} style={{ marginTop: 4 }}>
                <Icon size={11} />
                {typeLabel}
              </span>
            </div>
          </div>

          <button
            aria-label={t("portafySearch.modal.close")}
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted-text)", padding: 4, flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: 16 }}>
          {profile.location && (
            <p className="search-card__location">
              <MapPin size={12} />
              {profile.location}
            </p>
          )}

          {profile.bio && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted-text)", marginBottom: 6, fontFamily: "var(--font-ui)" }}>
                {t("portafySearch.card.sobreMi")}
              </p>
              <p style={{ fontSize: 13, color: "var(--color-body)", lineHeight: 1.65, fontFamily: "var(--font-body)", margin: 0 }}>
                {profile.bio}
              </p>
            </div>
          )}

          {profile.skills?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted-text)", marginBottom: 6, fontFamily: "var(--font-ui)" }}>
                {t("portafySearch.card.habilidades")}
              </p>
              <div className="search-card__tags">
                {profile.skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "var(--space-3) var(--space-4)", borderTop: "0.5px solid var(--color-blue-soft)" }}>
          <button
            className="btn-primary"
            style={{ width: "100%" }}
            onClick={() => navigate(targetUrl)}
          >
            <ExternalLink size={13} />
            {t("portafySearch.card.irAlPerfil")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SearchCard({ profile }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const Icon = TYPE_ICONS[profile.type] ?? User;
  const colorClass = `badge--${profile.type === "usuario" ? "user" : profile.type === "proyecto" ? "project" : "skill"}`;
  const typeLabel = t(`portafySearch.card.types.${profile.type}`, { defaultValue: profile.type });

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
    <>
      <article className="search-card" onClick={() => navigate(targetUrl)}>
        <div className="search-card__body" style={{ display: "flex", flexDirection: "column", height: "100%" }}>

          <div className="search-card__top">
            <div className="search-card__avatar" style={{ background: bg, color: fg }}>
              {profile.avatar
                ? <img src={profile.avatar} alt={name} className="search-card__avatar-img" />
                : initials}
            </div>
            <div className="search-card__meta">
              <strong className="search-card__name">{name}</strong>
              <p className="search-card__title">{title}</p>
            </div>
          </div>

          <span className={`badge ${colorClass}`}>
            <Icon size={11} />
            {typeLabel}
          </span>

          {profile.location && (
            <p className="search-card__location">
              <MapPin size={11} />
              {profile.location}
            </p>
          )}

          <div style={{ flex: 1 }}>
            {profile.bio && <p className="search-card__desc">{profile.bio}</p>}
          </div>

          {profile.skills?.length > 0 && (
            <div className="search-card__tags">
              {profile.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="tag">{skill}</span>
              ))}
              {profile.skills.length > 3 && (
                <span className="tag tag--more">+{profile.skills.length - 3}</span>
              )}
            </div>
          )}

          <div className="search-card__actions">
            <button
              className="btn-secondary"
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
            >
              {t("portafySearch.card.verDetalle")}
            </button>
            <button
              className="btn-primary"
              onClick={(e) => { e.stopPropagation(); navigate(targetUrl); }}
            >
              <ExternalLink size={13} />
              {t("portafySearch.card.verPerfil")}
            </button>
          </div>

        </div>
      </article>

      {modalOpen && (
        <ProfileModal
          profile={profile}
          name={name}
          title={title}
          initials={initials}
          bg={bg}
          fg={fg}
          targetUrl={targetUrl}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}