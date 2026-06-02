// src/components/admin/components/Eliminacion/EliminacionPanel.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, User, MessageCircle, FileText, Zap, Briefcase,
  SendHorizonal, FolderKanban, Newspaper, Bookmark,
} from "lucide-react";
import TablaComentarios   from "./TablaComentarios";
import TablaCvs           from "./TablaCvs";
import TablaHabilidades   from "./TablaHabilidades";
import TablaExperiencias  from "./TablaExperiencias";
import TablaOfertas       from "./TablaOfertas";
import TablaPostulaciones from "./TablaPostulaciones";
import TablaProyectos     from "./TablaProyectos";
import TablaPublicaciones from "./TablaPublicaciones";
import TablaGuardados     from "./TablaGuardados";
import ModalDatosPersonales from "./ModalDatosPersonales";

const SECCION_ICONS = {
  datos_personales: User,
  comentarios:      MessageCircle,
  cvs:              FileText,
  habilidades:      Zap,
  experiencias:     Briefcase,
  ofertas:          FileText,
  postulaciones:    SendHorizonal,
  proyectos:        FolderKanban,
  publicaciones:    Newspaper,
  guardados:        Bookmark,
};

const SECCION_TABLAS = {
  comentarios:   TablaComentarios,
  cvs:           TablaCvs,
  habilidades:   TablaHabilidades,
  experiencias:  TablaExperiencias,
  ofertas:       TablaOfertas,
  postulaciones: TablaPostulaciones,
  proyectos:     TablaProyectos,
  publicaciones: TablaPublicaciones,
  guardados:     TablaGuardados,
};

const SECCION_KEYS = Object.keys(SECCION_ICONS);
const MODAL_KEYS   = new Set(["datos_personales"]);

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

export default function EliminacionPanel({ user, onBack }) {
  const { t } = useTranslation();
  const ep = "adminEliminacion.panel";

  const [activeSection, setActiveSection] = useState(null);
  const [showModalDP,   setShowModalDP]   = useState(false);

  const idProfile = user?.id_profile ?? user?.id ?? null;
  const fullName  = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();
  const initials  = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const { bg, fg } = avatarColor(fullName);
  const profilePhoto = typeof user?.profile_photo === "string" ? user.profile_photo.trim() : "";

  const activeSec   = !MODAL_KEYS.has(activeSection) ? activeSection : null;
  const ActiveTabla = activeSec ? SECCION_TABLAS[activeSec] : null;

  const handleBubbleClick = (key) => {
    if (MODAL_KEYS.has(key)) { setShowModalDP(true); return; }
    setActiveSection((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <div className="edicion-panel-wrapper">
        <div className="edicion-panel">

          {/* Header */}
          <div className="edicion-panel__header">
            <button className="edicion-panel__back" onClick={onBack}>
              <ArrowLeft size={15} />
              {t(`${ep}.backBtn`)}
            </button>
            <div className="edicion-panel__divider" />
            <div className="edicion-panel__user-info">
              <div className="edicion-panel__user-avatar" style={{ background: bg, color: fg }}>
                {profilePhoto ? <img src={profilePhoto} alt={fullName} /> : initials}
              </div>
              <div>
                <p className="edicion-panel__user-name">{fullName}</p>
                <p className="edicion-panel__user-role">
                  {user?.role === "reclutador" ? t(`${ep}.roleReclutador`) : t(`${ep}.roleProfesional`)}
                  {user?.email ? ` · ${user.email}` : ""}
                </p>
              </div>
            </div>
          </div>

          <p className="edicion-panel__section-title">{t(`${ep}.sectionTitle`)}</p>

          {/* Burbujas */}
          <div className="edicion-panel__bubbles">
            {SECCION_KEYS.map((key) => {
              const Icon    = SECCION_ICONS[key];
              const isModal = MODAL_KEYS.has(key);
              return (
                <button
                  key={key}
                  className={[
                    "edicion-bubble",
                    activeSection === key ? "edicion-bubble--active" : "",
                    isModal ? "edicion-bubble--modal" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleBubbleClick(key)}
                >
                  <span className="edicion-bubble__icon"><Icon size={14} /></span>
                  {t(`${ep}.secciones.${key}.label`)}
                </button>
              );
            })}
          </div>

          {/* Tabla activa */}
          {activeSec && ActiveTabla && idProfile && (
            <div style={{ marginTop: 24 }}>
              <p className="edicion-panel__section-title">{t(`${ep}.selectRowsHint`)}</p>
              <ActiveTabla idProfile={idProfile} />
            </div>
          )}

          {/* Sin perfil */}
          {activeSection && !idProfile && (
            <div style={{
              marginTop: 16, padding: "12px 16px", background: "#fef3c7",
              border: "1.5px solid #fde68a", borderRadius: 7, fontSize: 13, color: "#92400e",
            }}>
              {t(`${ep}.noProfile`)}
            </div>
          )}
        </div>

        {showModalDP && idProfile && (
          <ModalDatosPersonales
            user={user}
            onClose={() => setShowModalDP(false)}
            onDeleted={() => setShowModalDP(false)}
          />
        )}
      </div>
    </>
  );
}