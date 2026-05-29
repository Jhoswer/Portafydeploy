// src/components/admin/components/Eliminacion/EliminacionPanel.jsx

import { useState } from "react";
import {
  ArrowLeft,
  User,
  MessageCircle,
  FileText,
  Zap,
  Briefcase,
  SendHorizonal,
  FolderKanban,
  Newspaper,
  Bookmark,
} from "lucide-react";

/* ── Tablas por sección ── */
import TablaComentarios from "./TablaComentarios";
import TablaCvs from "./TablaCvs";
import TablaHabilidades from "./TablaHabilidades";
import TablaExperiencias from "./TablaExperiencias";
import TablaOfertas from "./TablaOfertas";
import TablaPostulaciones from "./TablaPostulaciones";
import TablaProyectos from "./TablaProyectos";
import TablaPublicaciones from "./TablaPublicaciones";
import TablaGuardados from "./TablaGuardados";

/* ── Modal especial para Datos Personales ── */
import ModalDatosPersonales from "./ModalDatosPersonales";

/* ─────────────────────────────────────────────────────────────
   Definición de secciones
   isModal: true  → abre modal en lugar de mostrar tabla inline
───────────────────────────────────────────────────────────── */
const SECCIONES = [
  {
    key: "datos_personales",
    label: "Datos Personales",
    Icon: User,
    desc: "Eliminar proveedores, compañía, redes sociales, título y estudios del perfil.",
    isModal: true,
    Tabla: null,
  },
  {
    key: "comentarios",
    label: "Comentarios",
    Icon: MessageCircle,
    desc: "Eliminar todos los comentarios realizados por el usuario.",
    Tabla: TablaComentarios,
  },
  {
    key: "cvs",
    label: "CVs",
    Icon: FileText,
    desc: "Eliminar currículos creados.",
    Tabla: TablaCvs,
  },
  {
    key: "habilidades",
    label: "Habilidades",
    Icon: Zap,
    desc: "Eliminar todas las habilidades y skills del perfil.",
    Tabla: TablaHabilidades,
  },
  {
    key: "experiencias",
    label: "Experiencias",
    Icon: Briefcase,
    desc: "Eliminar todas las experiencias laborales y académicas.",
    Tabla: TablaExperiencias,
  },
  {
    key: "ofertas",
    label: "Ofertas",
    Icon: FileText,
    desc: "Eliminar convocatorias publicadas.",
    Tabla: TablaOfertas,
  },
  {
    key: "postulaciones",
    label: "Postulaciones",
    Icon: SendHorizonal,
    desc: "Eliminar postulaciones enviadas.",
    Tabla: TablaPostulaciones,
  },
  {
    key: "proyectos",
    label: "Proyectos",
    Icon: FolderKanban,
    desc: "Eliminar proyectos creados.",
    Tabla: TablaProyectos,
  },
  {
    key: "publicaciones",
    label: "Publicaciones",
    Icon: Newspaper,
    desc: "Eliminar publicaciones del feed.",
    Tabla: TablaPublicaciones,
  },
  {
    key: "guardados",
    label: "Guardados",
    Icon: Bookmark,
    desc: "Eliminar todos los elementos guardados.",
    Tabla: TablaGuardados,
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
   EliminacionPanel
───────────────────────────────────────────────────────────── */
export default function EliminacionPanel({ user, onBack }) {
  const [activeSection, setActiveSection] = useState(null);
  /* Modal de datos personales (separado del flujo de tablas) */
  const [showModalDP, setShowModalDP] = useState(false);

  /* ── Derivar idProfile ── */
  const idProfile = user?.id_profile ?? user?.id ?? null;

  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { bg, fg } = avatarColor(fullName);
  const profilePhoto =
    typeof user?.profile_photo === "string" ? user.profile_photo.trim() : "";

  /* ── Sección activa (solo secciones con tabla) ── */
  const activeSec = SECCIONES.find((s) => s.key === activeSection && !s.isModal);

  /* ── Click en burbuja ── */
  const handleBubbleClick = (key) => {
    const sec = SECCIONES.find((s) => s.key === key);

    /* Secciones con modal propio → abrir modal */
    if (sec?.isModal) {
      setShowModalDP(true);
      return;
    }

    /* Secciones con tabla → toggle inline */
    setActiveSection((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <div className="edicion-panel-wrapper">
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

          <p className="edicion-panel__section-title">¿Qué deseas eliminar?</p>

          {/* ── Burbujas de sección ── */}
          <div className="edicion-panel__bubbles">
            {SECCIONES.map(({ key, label, Icon, isModal }) => (
              <button
                key={key}
                className={[
                  "edicion-bubble",
                  activeSection === key ? "edicion-bubble--active" : "",
                  /* La burbuja de datos personales usa acento diferente */
                  isModal ? "edicion-bubble--modal" : "",
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

          {/* ── Tabla de la sección activa (secciones sin modal) ── */}
          {activeSection && activeSec && idProfile && (
            <div style={{ marginTop: 24 }}>
              {/* Aviso de acción irreversible */}
              <p className="edicion-panel__section-title">Selecciona las filas que deseas eliminar.</p>
              {/* Componente tabla correspondiente */}
              <activeSec.Tabla idProfile={idProfile} />
            </div>
          )}

          {/* Sin perfil */}
          {activeSection && !idProfile && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "#fef3c7",
                border: "1.5px solid #fde68a",
                borderRadius: 7,
                fontSize: 13,
                color: "#92400e",
              }}
            >
              No se pudo determinar el perfil del usuario.
            </div>
          )}
        </div>

        {/* ── Modal Datos Personales ── */}
        {showModalDP && idProfile && (
          <ModalDatosPersonales
            user={user}
            onClose={() => setShowModalDP(false)}
            onDeleted={() => {
              /* Aquí puedes notificar al padre si es necesario */
              setShowModalDP(false);
            }}
          />
        )}
      </div>
    </>
  );
}