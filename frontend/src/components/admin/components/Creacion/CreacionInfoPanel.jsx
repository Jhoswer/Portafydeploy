// src/components/admin/components/Creacion/CreacionInfoPanel.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, FileText, Briefcase, Zap,
  ClipboardList, SendHorizonal, FolderKanban, Newspaper,
} from "lucide-react";
import CreacionFormCV          from "./CreacionFormCV";
import CreacionFormExperiencia from "./CreacionFormExperiencia";
import CreacionFormHabilidades from "./CreacionFormHabilidades";
import CreacionFormOferta      from "./CreacionFormOferta";
import CreacionFormPostulacion from "./CreacionFormPostulacion";
import CreacionFormProyecto    from "./CreacionFormProyecto";
import CreacionFormPublicacion from "./CreacionFormPublicacion";
import "../../../../styles/components/admin/components/Edicion/EdicionPanel.css";

const SECCION_ICONS = {
  cvs:           FileText,
  experiencias:  Briefcase,
  habilidades:   Zap,
  ofertas:       ClipboardList,
  postulaciones: SendHorizonal,
  proyectos:     FolderKanban,
  publicaciones: Newspaper,
};
const SECCION_KEYS = Object.keys(SECCION_ICONS);

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

export default function CreacionInfoPanel({ user, onBack }) {
  const { t } = useTranslation();
  const ip = "adminCreacion.infoPanel";

  const [activeModal, setActiveModal] = useState(null);

  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();
  const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const { bg, fg } = avatarColor(fullName);
  const profilePhoto = typeof user?.profile_photo === "string" ? user.profile_photo.trim() : "";
  const idProfile = user?.id_profile;

  const closeModal = () => setActiveModal(null);
  const handleSaved = (data) => { console.log("[CreacionInfoPanel] Registro creado:", data); closeModal(); };

  return (
    <div className="edicion-panel-wrapper">
      <div className="edicion-panel">

        {/* Header */}
        <div className="edicion-panel__header">
          <button className="edicion-panel__back" onClick={onBack}>
            <ArrowLeft size={15} />
            {t(`${ip}.backBtn`)}
          </button>

          <div className="edicion-panel__divider" />

          <div className="edicion-panel__user-info">
            <div className="edicion-panel__user-avatar" style={{ background: bg, color: fg }}>
              {profilePhoto ? <img src={profilePhoto} alt={fullName} /> : initials}
            </div>
            <div>
              <p className="edicion-panel__user-name">{fullName}</p>
              <p className="edicion-panel__user-role">
                {user?.role === "reclutador"
                  ? t(`${ip}.roleReclutador`)
                  : t(`${ip}.roleProfesional`)}
                {user?.email ? ` · ${user.email}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Título */}
        <p className="edicion-panel__section-title">{t(`${ip}.sectionTitle`)}</p>

        {/* Grid de burbujas */}
        <div className="edicion-panel__bubbles">
          {SECCION_KEYS.map((key) => {
            const Icon = SECCION_ICONS[key];
            return (
              <button key={key} className="edicion-bubble" onClick={() => setActiveModal(key)}>
                <span className="edicion-bubble__icon"><Icon size={14} /></span>
                {t(`${ip}.secciones.${key}.label`)}
              </button>
            );
          })}
        </div>

        {/* Modales */}
        {activeModal === "cvs"           && <CreacionFormCV           idProfile={idProfile} onClose={closeModal} onSaved={handleSaved} />}
        {activeModal === "experiencias"  && <CreacionFormExperiencia  idProfile={idProfile} onClose={closeModal} onSaved={handleSaved} />}
        {activeModal === "habilidades"   && <CreacionFormHabilidades  idProfile={idProfile} onClose={closeModal} onSaved={handleSaved} />}
        {activeModal === "ofertas"       && <CreacionFormOferta       idProfile={idProfile} onClose={closeModal} onSaved={handleSaved} />}
        {activeModal === "postulaciones" && <CreacionFormPostulacion  idProfile={idProfile} onClose={closeModal} onSaved={handleSaved} />}
        {activeModal === "proyectos"     && <CreacionFormProyecto     idProfile={idProfile} onClose={closeModal} onSaved={handleSaved} />}
        {activeModal === "publicaciones" && <CreacionFormPublicacion  idProfile={idProfile} onClose={closeModal} onSaved={handleSaved} />}
      </div>
    </div>
  );
}