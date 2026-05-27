// src/components/admin/components/Creacion/CreacionFormExperiencia.jsx
// Formulario de creación de experiencia — en blanco, POST /admin/profile/{profile}/experiences

import { useState } from "react";
import { createPortal } from "react-dom";
import { Briefcase, Loader2, Plus, X } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearExperiencia } from "../../../../services/adminCreacionService";

// ── Opciones de Tipo ──────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { value: "professional", label: "Profesional" },
  { value: "academic",     label: "Académica"   },
  { value: "freelance",    label: "Freelance"   },
];

/**
 * Mapa frontend → BD.
 * La tabla EXPERIENCE solo acepta 'labor' | 'academic'.
 *   - Profesional → labor
 *   - Freelance   → labor  (sin tipo propio en BD)
 *   - Académica   → academic
 */
const TYPE_TO_DB = {
  professional: "labor",
  freelance:    "labor",
  academic:     "academic",
};

const STATE_OPTIONS = [
  { value: "public",  label: "Público"  },
  { value: "private", label: "Privado"  },
];

// ── Catálogo de áreas y roles para Cargo / Título ─────────────────────────────
const CARGO_CATALOGO = {
  "Software y Tecnología": [
    "Desarrollador Frontend",
    "Desarrollador Backend",
    "Desarrollador Full Stack",
    "Desarrollador Mobile",
    "Ingeniero de Software",
    "QA Tester",
    "DevOps Engineer",
    "Data Engineer",
    "Analista de Datos",
    "Especialista en Ciberseguridad",
  ],
  "Diseño y Producto": [
    "Product Manager",
    "Product Owner",
    "UX Designer",
    "UI Designer",
    "UX Researcher",
    "Diseñador Gráfico",
  ],
  "Negocios y Marketing": [
    "Analista de Negocios",
    "Marketing Digital",
    "Community Manager",
    "Content Manager",
    "SEO Specialist",
    "Customer Success",
  ],
  "Operaciones y Gestión": [
    "Project Manager",
    "Scrum Master",
    "Coordinador de Operaciones",
    "Asistente Administrativo",
    "Recursos Humanos",
    "Soporte Técnico",
  ],
  "Académica": [
    "Auxiliar de Docencia",
    "Investigador Académico",
    "Tutor Académico",
    "Becario de Investigación",
    "Estudiante Investigador",
  ],
  "Freelance": [
    "Freelancer",
    "Consultor Independiente",
    "Desarrollador Freelance",
    "Diseñador Freelance",
    "Creador de Contenido Independiente",
    "Emprendedor",
  ],
};

const AREA_OPTIONS = Object.keys(CARGO_CATALOGO);

// ── Campos adicionales (sin title, que ahora es doble combobox) ───────────────
const EXP_FIELDS = [
  { key: "company",     label: "Empresa",         type: "text",     maxLength: 255  },
  { key: "start_date",  label: "Fecha de inicio", type: "date"                      },
  { key: "end_date",    label: "Fecha de fin",    type: "date"                      },
  { key: "description", label: "Descripción",     type: "textarea", maxLength: 1000 },
];

const EMPTY_FORM = {
  type:        "",
  state:       "public",
  cargo_area:  "",   // primer combobox (área)
  title:       "",   // segundo combobox (cargo concreto)
  company:     "",
  start_date:  "",
  end_date:    "",
  description: "",
};

// ── Resumen para el modal de confirmación ─────────────────────────────────────
function buildResumen(form) {
  const entries = [
    { key: "type",        label: "Tipo",            options: TYPE_OPTIONS  },
    { key: "state",       label: "Estado",          options: STATE_OPTIONS },
    { key: "cargo_area",  label: "Área"                                    },
    { key: "title",       label: "Cargo / Título"                          },
    { key: "company",     label: "Empresa"                                 },
    { key: "start_date",  label: "Fecha de inicio"                         },
    { key: "end_date",    label: "Fecha de fin"                            },
    { key: "description", label: "Descripción"                             },
  ];
  return entries
    .filter(({ key }) => form[key] !== "" && form[key] !== null)
    .map(({ key, label, options }) => ({
      label,
      value: options
        ? options.find((o) => o.value === form[key])?.label ?? form[key]
        : form[key],
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CreacionFormExperiencia({ idProfile, onClose, onSaved }) {
  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Al cambiar el área se resetea el cargo seleccionado
  const handleAreaChange = (area) => {
    setFormData((prev) => ({ ...prev, cargo_area: area, title: "" }));
  };

  const rolesDisponibles = formData.cargo_area
    ? CARGO_CATALOGO[formData.cargo_area] ?? []
    : [];

  const handleConfirmedSave = async () => {
    if (!formData.type) {
      setConfirmError("El campo Tipo es obligatorio.");
      return;
    }
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        type:        TYPE_TO_DB[formData.type] ?? formData.type,
        state:       formData.state       || null,
        title:       formData.title       || null,
        company:     formData.company     || null,
        start_date:  formData.start_date  || null,
        end_date:    formData.end_date    || null,
        description: formData.description || null,
      };
      const data = await crearExperiencia(idProfile, payload);
      setShowConfirm(false);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("[CreacionFormExperiencia] Error al crear:", err);
      setConfirmError(err?.message || "No se pudo crear la experiencia.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--personal">

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Briefcase size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Nueva Experiencia</h2>
                  <p className="edicion-modal__subtitle">Perfil #{idProfile}</p>
                </div>
              </div>
              <button
                className="edicion-modal__close"
                onClick={onClose}
                disabled={isSaving}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              {error && <div className="edicion-modal__error">{error}</div>}

              <div className="edicion-modal__fields">

                {/* ── Tipo ─────────────────────────────────────────────────── */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">
                    Tipo <span className="edicion-modal__required">*</span>
                  </label>
                  <select
                    className="edicion-modal__input"
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="">— Seleccionar tipo —</option>
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* ── Estado ───────────────────────────────────────────────── */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">Estado</label>
                  <select
                    className="edicion-modal__input"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                  >
                    <option value="">— Seleccionar estado —</option>
                    {STATE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* ── Cargo / Título — Combobox 1: Área ────────────────────── */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">Área</label>
                  <select
                    className="edicion-modal__input"
                    value={formData.cargo_area}
                    onChange={(e) => handleAreaChange(e.target.value)}
                  >
                    <option value="">— Seleccionar área —</option>
                    {AREA_OPTIONS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* ── Cargo / Título — Combobox 2: Rol (depende del área) ─── */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">Cargo / Título</label>
                  <select
                    className="edicion-modal__input"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    disabled={!formData.cargo_area}
                  >
                    <option value="">
                      {formData.cargo_area
                        ? "— Seleccionar cargo —"
                        : "— Primero selecciona un área —"}
                    </option>
                    {rolesDisponibles.map((rol) => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                </div>

                {/* ── Resto de campos (empresa, fechas, descripción) ────────── */}
                {EXP_FIELDS.map((field) => (
                  <div className="edicion-modal__field" key={field.key}>
                    <label className="edicion-modal__label">{field.label}</label>
                    {field.type === "textarea" ? (
                      <>
                        <textarea
                          className="edicion-modal__textarea"
                          value={formData[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={`${field.label}…`}
                          rows={4}
                          maxLength={field.maxLength}
                        />
                        <span className="edicion-modal__char-count">
                          {formData[field.key]?.length ?? 0} / {field.maxLength}
                        </span>
                      </>
                    ) : (
                      <input
                        className="edicion-modal__input"
                        type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.type !== "date" ? `${field.label}…` : undefined}
                        maxLength={field.maxLength ?? undefined}
                      />
                    )}
                  </div>
                ))}

              </div>
            </div>

            {/* Footer */}
            <div className="edicion-modal__footer">
              <button
                className="edicion-modal__btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                <X size={13} /> Cerrar
              </button>
              <button
                className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || !formData.type}
              >
                <Plus size={13} /> Crear Experiencia
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Experiencia"
        resumen={buildResumen(formData)}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}