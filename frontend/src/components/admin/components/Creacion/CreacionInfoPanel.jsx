// src/components/admin/components/Creacion/CreacionInfoPanel.jsx

import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Briefcase,
  Zap,
  ClipboardList,
  SendHorizonal,
  FolderKanban,
  Newspaper,
} from "lucide-react";

/* ── Formularios de creación ── */
import CreacionFormCV           from "./CreacionFormCV";
import CreacionFormExperiencia  from "./CreacionFormExperiencia";
import CreacionFormHabilidades  from "./CreacionFormHabilidades";
import CreacionFormOferta       from "./CreacionFormOferta";
import CreacionFormPostulacion  from "./CreacionFormPostulacion";
import CreacionFormProyecto     from "./CreacionFormProyecto";
import CreacionFormPublicacion  from "./CreacionFormPublicacion";

/* ── Estilos reutilizados de Edicion ── */
import "../../../../styles/components/admin/components/Edicion/EdicionPanel.css";

/* ─────────────────────────────────────────────────────────────
   Secciones disponibles
───────────────────────────────────────────────────────────── */
const SECCIONES = [
  { key: "cvs",           label: "CVs",           Icon: FileText,      desc: "Currículos creados: nombre, plantilla, visibilidad y URL."            },
  { key: "experiencias",  label: "Experiencias",  Icon: Briefcase,     desc: "Experiencias laborales y académicas registradas."                     },
  { key: "habilidades",   label: "Habilidades",   Icon: Zap,           desc: "Skills del perfil: tipo, nivel (junior / mid / senior) y visibilidad." },
  { key: "ofertas",       label: "Ofertas",       Icon: ClipboardList, desc: "Convocatorias publicadas por el usuario reclutador."                  },
  { key: "postulaciones", label: "Postulaciones", Icon: SendHorizonal, desc: "Postulaciones enviadas a ofertas laborales."                          },
  { key: "proyectos",     label: "Proyectos",     Icon: FolderKanban,  desc: "Proyectos creados: título, descripción, estado y repositorio."        },
  { key: "publicaciones", label: "Publicaciones", Icon: Newspaper,     desc: "Publicaciones del feed: descripción, visibilidad y estado."           },
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

/* ═══════════════════════════════════════════════════════════
   CreacionInfoPanel
   Props:
     user   — objeto usuario seleccionado
     onBack — fn() → vuelve a Vista 1 (Creacion.jsx)
═══════════════════════════════════════════════════════════ */
export default function CreacionInfoPanel({ user, onBack }) {
  const [activeModal, setActiveModal] = useState(null); // key de la sección abierta

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

  const idProfile = user?.id_profile;

  const closeModal = () => setActiveModal(null);

  const handleSaved = (data) => {
    console.log("[CreacionInfoPanel] Registro creado:", data);
    closeModal();
  };

  return (
    <div className="edicion-panel">

      {/* ── Header ─────────────────────────────────────────── */}
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

      {/* ── Título ─────────────────────────────────────────── */}
      <p className="edicion-panel__section-title">
        ¿Qué información deseas crear?
      </p>

      {/* ── Grid de burbujas ───────────────────────────────── */}
      <div className="edicion-panel__bubbles">
        {SECCIONES.map(({ key, label, Icon }) => (
          <button
            key={key}
            className="edicion-bubble"
            onClick={() => setActiveModal(key)}
          >
            <span className="edicion-bubble__icon">
              <Icon size={14} />
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* ── Modales de creación ────────────────────────────── */}
      {activeModal === "cvs" && (
        <CreacionFormCV
          idProfile={idProfile}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "experiencias" && (
        <CreacionFormExperiencia
          idProfile={idProfile}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "habilidades" && (
        <CreacionFormHabilidades
          idProfile={idProfile}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "ofertas" && (
        <CreacionFormOferta
          idProfile={idProfile}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "postulaciones" && (
        <CreacionFormPostulacion
          idProfile={idProfile}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "proyectos" && (
        <CreacionFormProyecto
          idProfile={idProfile}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {activeModal === "publicaciones" && (
        <CreacionFormPublicacion
          idProfile={idProfile}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

    </div>
  );
}