// src/components/admin/components/Edicion/EdicionPanel.jsx

import { useState } from "react";
import {
  ArrowLeft,
  User,
  KeyRound,
  FileText,
  Briefcase,
  Zap,
  ClipboardList,
  SendHorizonal,
  LayoutGrid,
  Sliders,
  Building2,
  GraduationCap,
  FolderKanban,
  PlugZap,
  Newspaper,
  Bookmark,
  MonitorSmartphone,
  ChevronRight,
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
import ModalAcademico from "./ModalAcademico"; 

/* ─────────────────────────────────────────────────────────────
   Categorías de comportamiento al hacer click en la burbuja
   MODAL  → se sobrepone como overlay
   TABLE  → aparece debajo de las burbujas, en línea
   OTHER  → muestra el footer placeholder existente
───────────────────────────────────────────────────────────── */
const MODAL_SECTIONS  = new Set(["datos_personales", "credenciales", "academico",]);
const TABLE_SECTIONS  = new Set([
  "cvs",
  "experiencias",
  "habilidades",
  "ofertas",
  "postulaciones",
  "proyectos",
  "publicacion",
  "preferencias",
]);

/* ─────────────────────────────────────────────────────────────
   Definición de secciones
───────────────────────────────────────────────────────────── */
const SECCIONES = [
  {
    key: "datos_personales",
    label: "Datos Personales",
    Icon: User,
    desc: "Nombre, apellido, biografía, fecha de nacimiento y fotos.",
  },
  {
    key: "credenciales",
    label: "Credenciales",
    Icon: KeyRound,
    desc: "Contraseña actual, nueva contraseña y clave de recuperación.",
  },
  {
    key: "cvs",
    label: "CVs",
    Icon: FileText,
    desc: "Currículos creados: nombre, plantilla, visibilidad y URL.",
  },
  {
    key: "experiencias",
    label: "Experiencias",
    Icon: Briefcase,
    desc: "Experiencias laborales y académicas registradas.",
  },
  {
    key: "habilidades",
    label: "Habilidades",
    Icon: Zap,
    desc: "Skills del perfil: tipo, nivel (junior / mid / senior) y visibilidad.",
  },
  {
    key: "ofertas",
    label: "Ofertas",
    Icon: ClipboardList,
    desc: "Convocatorias publicadas por el usuario reclutador.",
  },
  {
    key: "postulaciones",
    label: "Postulaciones",
    Icon: SendHorizonal,
    desc: "Postulaciones enviadas a ofertas laborales.",
  },
  {
    key: "preferencias",
    label: "Preferencias",
    Icon: Sliders,
    desc: "Configuración de privacidad, color y personalización.",
  },
  {
    key: "academico",
    label: "Académico",
    Icon: GraduationCap,
    desc: "Título profesional y carrera universitaria (institución, fechas de estudio).",
  },
  {
    key: "proyectos",
    label: "Proyectos",
    Icon: FolderKanban,
    desc: "Proyectos creados: título, descripción, estado y repositorio.",
  },
  {
    key: "publicacion",
    label: "Publicación",
    Icon: Newspaper,
    desc: "Publicaciones del feed: descripción, visibilidad y estado.",
  },
];

/* ── Paleta avatar ── */
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

/* ─────────────────────────────────────────────────────────────
   EdicionPanel
───────────────────────────────────────────────────────────── */
export default function EdicionPanel({ user, onBack }) {
  const [activeSection, setActiveSection] = useState(null);
  const [openModal,     setOpenModal]     = useState(null);

  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { bg, fg }   = avatarColor(fullName);
  const profilePhoto =
    typeof user?.profile_photo === "string" ? user.profile_photo.trim() : "";

  /* ── Handler de burbuja ── */
  const handleBubbleClick = (key) => {
    if (MODAL_SECTIONS.has(key)) {
      setOpenModal(key);
      setActiveSection(key);
    } else if (TABLE_SECTIONS.has(key)) {
      setOpenModal(null);
      setActiveSection((prev) => (prev === key ? null : key));
    } else {
      setOpenModal(null);
      setActiveSection((prev) => (prev === key ? null : key));
    }
  };

  const activeSec = SECCIONES.find((s) => s.key === activeSection);

  const showFooter =
    activeSec &&
    !TABLE_SECTIONS.has(activeSection) &&
    !MODAL_SECTIONS.has(activeSection);

  return (
    <div className="edicion-panel">

      {/* ── Header ── */}
      <div className="edicion-panel__header">
        <button className="edicion-panel__back" onClick={onBack}>
          <ArrowLeft size={15} />
          Volver
        </button>

        <div className="edicion-panel__divider" />

        <div className="edicion-panel__user-info">
          <div
            className="edicion-panel__user-avatar"
            style={{ background: bg, color: fg }}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt={fullName} />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="edicion-panel__user-name">{fullName}</p>
            <p className="edicion-panel__user-role">
              {user?.role === "reclutador" ? "Reclutador" : "Profesional"}
              {user?.email ? ` · ${user.email}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Título sección ── */}
      <p className="edicion-panel__section-title">¿Qué deseas editar?</p>

      {/* ── Grid de burbujas ── */}
      <div className="edicion-panel__bubbles">
        {SECCIONES.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={[
              "edicion-bubble",
              activeSection === key ? "edicion-bubble--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleBubbleClick(key)}
          >
            <span className="edicion-bubble__icon">
              <Icon size={14} />
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* ── Tablas inline ── */}
      {activeSection === "cvs"           && <TablaCV           idProfile={user?.id_profile} />}
      {activeSection === "experiencias"  && <TablaExperiencias  idProfile={user?.id_profile} />}
      {activeSection === "habilidades"   && <TablaHabilidades   idProfile={user?.id_profile} />}
      {activeSection === "ofertas"       && <TablaOfertas       idProfile={user?.id_profile} />}
      {activeSection === "postulaciones" && <TablaPostulacion   idProfile={user?.id_profile} />}
      {activeSection === "proyectos"     && <TablaProyectos     idProfile={user?.id_profile} />}
      {activeSection === "publicacion"   && <TablaPublicacion   idProfile={user?.id_profile} />}
      {activeSection === "preferencias"  && <TablaPreferencias  idProfile={user?.id_profile} />}

      {/* ── Footer genérico ── */}
      {showFooter && (
        <div className="edicion-panel__footer">
          <div className="edicion-panel__footer-icon">
            <activeSec.Icon size={16} />
          </div>
          <div className="edicion-panel__footer-text">
            <p className="edicion-panel__footer-label">{activeSec.label}</p>
            <p className="edicion-panel__footer-desc">{activeSec.desc}</p>
          </div>
          <button className="edicion-panel__footer-action">
            Abrir formulario
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {showFooter && (
        <div className="edicion-panel__form-placeholder">
          <strong>Formulario de {activeSec.label}</strong>
          <p>
            Aquí se integrará el formulario de edición para{" "}
            <em>{activeSec.label}</em> del usuario <strong>{fullName}</strong>.
          </p>
        </div>
      )}

      {/* ── Modales (overlay) ── */}
      {openModal === "datos_personales" && (
        <ModalDatosPersonales
          user={user}
          onClose={() => { setOpenModal(null); setActiveSection(null); }}
          onSave={(data) => {
            console.log("[ModalDatosPersonales] Guardar:", data);
          }}
        />
      )}

      {openModal === "credenciales" && (
        <ModalCredenciales
          user={user}
          onClose={() => { setOpenModal(null); setActiveSection(null); }}
          onSave={(data) => {
            console.log("[ModalCredenciales] Guardar:", data);
          }}
        />
      )}

      {(openModal === "academico") && (
        <ModalAcademico
          idProfile={user?.id_profile}
          user={user}
          onClose={() => { setOpenModal(null); setActiveSection(null); }}
          onSave={(data) => {
            console.log("[ModalAcademico] Guardado:", data);
          }}
        />
      )}

    </div>
  );
}