// src/components/admin/components/Edicion/EdicionUserCard.jsx

import { useTranslation } from "react-i18next";
import { Edit2, Eye, MapPin, Mail, Briefcase, Users, Trash2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

export default function EdicionUserCard({ user, onEdit, module = "edicion" }) {
  const { t } = useTranslation();
  const e = "adminEdicion.userCard";
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);

  const fullName  = `${user.name ?? ""} ${user.last_name ?? ""}`.trim();
  const initials  = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const { bg, fg }     = avatarColor(fullName);
  const isReclutador   = user.role === "reclutador";
  const profilePhoto   = typeof user.profile_photo === "string" ? user.profile_photo.trim() : "";
  const showProfilePhoto = profilePhoto && !imageFailed;

  const primaryBtnContent = (() => {
    switch (module) {
      case "eliminacion": return <><Trash2 size={13} /> {t(`${e}.deleteBtn`)}</>;
      case "creacion":    return <><PlusCircle size={13} /> {t(`${e}.createBtn`)}</>;
      default:            return <><Edit2 size={13} /> {t(`${e}.editBtn`)}</>;
    }
  })();

  return (
    <article className="edicion-card">
      <div className="edicion-card__body">
        <div className="edicion-card__top">
          <div className="edicion-card__avatar" style={{ background: bg, color: fg }}>
            {showProfilePhoto ? (
              <img src={profilePhoto} alt={fullName || "Usuario"}
                onError={() => setImageFailed(true)} />
            ) : initials}
          </div>
          <div className="edicion-card__meta">
            <strong className="edicion-card__name">{fullName}</strong>
            {user.job_title && <p className="edicion-card__job">{user.job_title}</p>}
          </div>
        </div>

        <span className={`edicion-card__role edicion-card__role--${user.role}`}>
          {isReclutador ? <Briefcase size={11} /> : <Users size={11} />}
          {isReclutador ? t(`${e}.reclutadorRole`) : t(`${e}.profesionalRole`)}
        </span>

        {user.email && (
          <p className="edicion-card__email"><Mail size={11} />{user.email}</p>
        )}
        {user.location && (
          <p className="edicion-card__location"><MapPin size={11} />{user.location}</p>
        )}
        {user.skills?.length > 0 && (
          <div className="edicion-card__tags">
            {user.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="edicion-card__tag">{skill}</span>
            ))}
            {user.skills.length > 4 && (
              <span className="edicion-card__tag edicion-card__tag--more">
                +{user.skills.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="edicion-card__spacer" />

        <div className="edicion-card__actions">
          <button className="edicion-card__btn-primary"
            onClick={(ev) => { ev.stopPropagation(); onEdit?.(user); }}>
            {primaryBtnContent}
          </button>
          <button className="edicion-card__btn-secondary"
            onClick={(ev) => { ev.stopPropagation(); navigate(`/perfil-profesional?usuario=${user.id_profile}`); }}>
            <Eye size={13} /> {t(`${e}.viewBtn`)}
          </button>
        </div>
      </div>
    </article>
  );
}