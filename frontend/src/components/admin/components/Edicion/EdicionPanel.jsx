// src/components/admin/components/Edicion/EdicionPanel.jsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, User, KeyRound, FileText, Briefcase, Zap,
  ClipboardList, SendHorizonal, Sliders, GraduationCap,
  FolderKanban, Newspaper, ChevronRight,
} from "lucide-react";

import ModalDatosPersonales from "./ModalDatosPersonales";
import ModalCredenciales    from "./ModalCredenciales";
import TablaCV              from "./TablaCV";
import TablaExperiencias    from "./TablaExperiencias";
import TablaHabilidades     from "./TablaHabilidades";
import TablaOfertas         from "./TablaOfertas";
import TablaPostulacion     from "./TablaPostulacion";
import TablaProyectos       from "./TablaProyectos";
import TablaPublicacion     from "./TablaPublicacion";
import TablaPreferencias    from "./TablaPreferencias";
import ModalAcademico       from "./ModalAcademico";

const MODAL_SECTIONS = new Set(["datos_personales", "credenciales", "academico"]);
const TABLE_SECTIONS = new Set([
  "cvs", "experiencias", "habilidades", "ofertas",
  "postulaciones", "proyectos", "publicacion", "preferencias",
]);

const SECTION_ICONS = {
  datos_personales: User,
  credenciales:     KeyRound,
  cvs:              FileText,
  experiencias:     Briefcase,
  habilidades:      Zap,
  ofertas:          ClipboardList,
  postulaciones:    SendHorizonal,
  preferencias:     Sliders,
  academico:        GraduationCap,
  proyectos:        FolderKanban,
  publicacion:      Newspaper,
};

const SECTION_KEYS = Object.keys(SECTION_ICONS);

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

export default function EdicionPanel({ user, onBack }) {
  const { t } = useTranslation();
  const p = "adminEdicion.panel";

  const [activeSection, setActiveSection] = useState(null);
  const [openModal,     setOpenModal]     = useState(null);

  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();
  const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const { bg, fg }    = avatarColor(fullName);
  const profilePhoto  = typeof user?.profile_photo === "string" ? user.profile_photo.trim() : "";

  const handleBubbleClick = (key) => {
    if (MODAL_SECTIONS.has(key)) {
      setOpenModal(key); setActiveSection(key);
    } else if (TABLE_SECTIONS.has(key)) {
      setOpenModal(null);
      setActiveSection((prev) => (prev === key ? null : key));
    } else {
      setOpenModal(null);
      setActiveSection((prev) => (prev === key ? null : key));
    }
  };

  const showFooter = activeSection &&
    !TABLE_SECTIONS.has(activeSection) &&
    !MODAL_SECTIONS.has(activeSection);

  const activeSectionLabel = activeSection
    ? t(`${p}.sections.${activeSection}.label`)
    : "";
  const activeSectionDesc = activeSection
    ? t(`${p}.sections.${activeSection}.desc`)
    : "";
  const ActiveIcon = activeSection ? SECTION_ICONS[activeSection] : null;

  return (
    <div className="edicion-panel-wrapper">
      <div className="edicion-panel">

        <div className="edicion-panel__header">
          <button className="edicion-panel__back" onClick={onBack}>
            <ArrowLeft size={15} /> {t(`${p}.backBtn`)}
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
                  ? t(`${p}.roleReclutador`)
                  : t(`${p}.roleProfesional`)}
                {user?.email ? ` · ${user.email}` : ""}
              </p>
            </div>
          </div>
        </div>

        <p className="edicion-panel__section-title">{t(`${p}.sectionTitle`)}</p>

        <div className="edicion-panel__bubbles">
          {SECTION_KEYS.map((key) => {
            const Icon = SECTION_ICONS[key];
            return (
              <button key={key}
                className={["edicion-bubble", activeSection === key ? "edicion-bubble--active" : ""]
                  .filter(Boolean).join(" ")}
                onClick={() => handleBubbleClick(key)}>
                <span className="edicion-bubble__icon"><Icon size={14} /></span>
                {t(`${p}.sections.${key}.label`)}
              </button>
            );
          })}
        </div>

        {activeSection === "cvs"           && <TablaCV          idProfile={user?.id_profile} />}
        {activeSection === "experiencias"  && <TablaExperiencias idProfile={user?.id_profile} />}
        {activeSection === "habilidades"   && <TablaHabilidades  idProfile={user?.id_profile} />}
        {activeSection === "ofertas"       && <TablaOfertas      idProfile={user?.id_profile} />}
        {activeSection === "postulaciones" && <TablaPostulacion  idProfile={user?.id_profile} />}
        {activeSection === "proyectos"     && <TablaProyectos    idProfile={user?.id_profile} />}
        {activeSection === "publicacion"   && <TablaPublicacion  idProfile={user?.id_profile} />}
        {activeSection === "preferencias"  && <TablaPreferencias idProfile={user?.id_profile} />}

        {showFooter && (
          <div className="edicion-panel__footer">
            <div className="edicion-panel__footer-icon">
              {ActiveIcon && <ActiveIcon size={16} />}
            </div>
            <div className="edicion-panel__footer-text">
              <p className="edicion-panel__footer-label">{activeSectionLabel}</p>
              <p className="edicion-panel__footer-desc">{activeSectionDesc}</p>
            </div>
            <button className="edicion-panel__footer-action">
              {t(`${p}.openFormBtn`)} <ChevronRight size={14} />
            </button>
          </div>
        )}

        {showFooter && (
          <div className="edicion-panel__form-placeholder">
            <strong>{t(`${p}.formPlaceholder`)} {activeSectionLabel}</strong>
            <p>
              {t(`${p}.formDesc`)} <em>{activeSectionLabel}</em>{" "}
              {t(`${p}.formDescOf`)} <strong>{fullName}</strong>.
            </p>
          </div>
        )}

        {openModal === "datos_personales" && (
          <ModalDatosPersonales user={user}
            onClose={() => { setOpenModal(null); setActiveSection(null); }}
            onSave={(data) => console.log("[ModalDatosPersonales] Guardar:", data)} />
        )}
        {openModal === "credenciales" && (
          <ModalCredenciales user={user}
            onClose={() => { setOpenModal(null); setActiveSection(null); }}
            onSave={(data) => console.log("[ModalCredenciales] Guardar:", data)} />
        )}
        {openModal === "academico" && (
          <ModalAcademico idProfile={user?.id_profile} user={user}
            onClose={() => { setOpenModal(null); setActiveSection(null); }}
            onSave={(data) => console.log("[ModalAcademico] Guardado:", data)} />
        )}
      </div>
    </div>
  );
}