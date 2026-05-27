// src/components/admin/components/Edicion/EdicionUserCard.jsx
//
// CAMBIO respecto a la versión anterior:
//   · Soporte para module="creacion":
//       - Botón primario muestra ícono PlusCircle + texto "Creación"
//       - onEdit(user) dispara el panel CreacionInfoPanel (gestionado por el padre)

import { Edit2, Eye, MapPin, Mail, Briefcase, Users, Trash2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/** Paleta de avatares por inicial */
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

/**
 * Props:
 *   user    — objeto de usuario
 *   onEdit  — callback(user) al pulsar el botón primario
 *   module  — "edicion" (default) | "eliminacion" | "creacion"
 */
export default function EdicionUserCard({ user, onEdit, module = "edicion" }) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);

  const fullName  = `${user.name ?? ""} ${user.last_name ?? ""}`.trim();
  const initials  = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { bg, fg }     = avatarColor(fullName);
  const isReclutador   = user.role === "reclutador";
  const profilePhoto   = typeof user.profile_photo === "string" ? user.profile_photo.trim() : "";
  const showProfilePhoto = profilePhoto && !imageFailed;

  /* ── Etiqueta e ícono del botón primario según módulo ── */
  const primaryBtnContent = (() => {
    switch (module) {
      case "eliminacion":
        return <><Trash2 size={13} /> Eliminar</>;
      case "creacion":
        return <><PlusCircle size={13} /> Creación</>;
      default:
        return <><Edit2 size={13} /> Editar</>;
    }
  })();

  return (
    <article className="edicion-card">
      {/* body ocupa toda la altura y usa flex-col para empujar los botones al fondo */}
      <div className="edicion-card__body">

        {/* ── Top: avatar + nombre + cargo ── */}
        <div className="edicion-card__top">
          <div
            className="edicion-card__avatar"
            style={{ background: bg, color: fg }}
          >
            {showProfilePhoto ? (
              <img
                src={profilePhoto}
                alt={fullName || "Usuario"}
                onError={() => setImageFailed(true)}
              />
            ) : (
              initials
            )}
          </div>

          <div className="edicion-card__meta">
            <strong className="edicion-card__name">{fullName}</strong>
            {user.job_title && (
              <p className="edicion-card__job">{user.job_title}</p>
            )}
          </div>
        </div>

        {/* ── Badge de rol ── */}
        <span className={`edicion-card__role edicion-card__role--${user.role}`}>
          {isReclutador ? <Briefcase size={11} /> : <Users size={11} />}
          {user.role === "profesional" ? "Profesional" : "Reclutador"}
        </span>

        {/* ── Email ── */}
        {user.email && (
          <p className="edicion-card__email">
            <Mail size={11} />
            {user.email}
          </p>
        )}

        {/* ── Ubicación ── */}
        {user.location && (
          <p className="edicion-card__location">
            <MapPin size={11} />
            {user.location}
          </p>
        )}

        {/* ── Skills (máx. 4) ── */}
        {user.skills?.length > 0 && (
          <div className="edicion-card__tags">
            {user.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="edicion-card__tag">
                {skill}
              </span>
            ))}
            {user.skills.length > 4 && (
              <span className="edicion-card__tag edicion-card__tag--more">
                +{user.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* ── Espaciador flexible: empuja los botones al pie ── */}
        <div className="edicion-card__spacer" />

        {/* ── Acciones siempre al pie ── */}
        <div className="edicion-card__actions">
          <button
            className="edicion-card__btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(user);
            }}
          >
            {primaryBtnContent}
          </button>

          <button
            className="edicion-card__btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/perfil-profesional?usuario=${user.id_profile}`);
            }}
          >
            <Eye size={13} />
            Ver
          </button>
        </div>

      </div>
    </article>
  );
}