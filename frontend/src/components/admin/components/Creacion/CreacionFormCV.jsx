// src/components/admin/components/Creacion/CreacionFormCV.jsx

import { useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Loader2, Plus, X } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearCv } from "../../../../services/adminCreacionService";

/* ── Catálogos de plantilla y fuente ─────────────────────────── */
const TEMPLATES = [
  { id: "navy",    name: "Clásico Navy",  description: "Profesional y elegante"    },
  { id: "slate",   name: "Slate Moderno", description: "Limpio y contemporáneo"    },
  { id: "forest",  name: "Forest",        description: "Natural y sobrio"          },
  { id: "crimson", name: "Crimson",       description: "Audaz y memorable"         },
  { id: "bicolor", name: "Bicolor",       description: "Sidebar oscuro + contenido"},
  { id: "tech",    name: "Tech / Dev",    description: "Dark mode, estilo terminal"},
  { id: "minimal", name: "Minimalista",   description: "Elegante y limpio"         },
];

const FONTS = [
  { id: "serif", label: "Serif", value: "Georgia, 'Times New Roman', serif"         },
  { id: "sans",  label: "Sans",  value: "system-ui, -apple-system, sans-serif"      },
  { id: "mono",  label: "Mono",  value: "'Courier New', Courier, monospace"         },
];

/* ── Campos de texto / URL / textarea (sin template ni font) ── */
const TEXT_FIELDS = [
  { key: "archive_pdf", label: "PDF (URL)",   type: "url",      maxLength: 255 },
  { key: "cv_url",      label: "URL CV",      type: "url",      maxLength: 255 },
  { key: "description", label: "Descripción", type: "textarea", maxLength: 255 },
];

const EMPTY_FORM = {
  name_cv:     "",
  template:    "",   // guarda el id de TEMPLATES (ej. "navy")
  font:        "",   // guarda el id de FONTS (ej. "serif")
  archive_pdf: "",
  cv_url:      "",
  description: "",
  state:       false,
  visible:     true,
};

/* ── Resumen para el modal de confirmación ───────────────────── */
function buildResumen(form) {
  const templateLabel = TEMPLATES.find((t) => t.id === form.template)?.name ?? "";
  const fontLabel     = FONTS.find((f) => f.id === form.font)?.label ?? "";

  return [
    { key: "name_cv",     label: "Nombre CV",  value: form.name_cv     },
    { key: "template",    label: "Plantilla",  value: templateLabel    },
    { key: "font",        label: "Fuente",     value: fontLabel        },
    { key: "archive_pdf", label: "PDF (URL)",  value: form.archive_pdf },
    { key: "cv_url",      label: "URL CV",     value: form.cv_url      },
    { key: "description", label: "Descripción",value: form.description },
    { key: "state",       label: "Activo",     value: form.state   ? "Sí" : "No" },
    { key: "visible",     label: "Visible",    value: form.visible ? "Sí" : "No" },
  ].filter(({ key, value }) => {
    if (key === "state")   return form.state;
    if (key === "visible") return form.visible;
    return value !== "" && value !== null && value !== undefined;
  });
}

/* ════════════════════════════════════════════════════════════════
   COMPONENTE
════════════════════════════════════════════════════════════════ */
export default function CreacionFormCV({ idProfile, onClose, onSaved }) {
  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        name_cv:     formData.name_cv     || null,
        template:    formData.template    || null,   // envía "navy", "slate", etc.
        font:        formData.font        || null,   // envía "serif", "sans" o "mono"
        archive_pdf: formData.archive_pdf || null,
        cv_url:      formData.cv_url      || null,
        description: formData.description || null,
        state:       formData.state,
        visible:     formData.visible,
      };
      const data = await crearCv(idProfile, payload);
      setShowConfirm(false);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("[CreacionFormCV] Error al crear:", err);
      setConfirmError(err?.message || "No se pudo crear el CV.");
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

            {/* ── Header ── */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <FileText size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Nuevo CV</h2>
                  <p className="edicion-modal__subtitle">
                    Crear CV para el perfil #{idProfile}
                  </p>
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

            {/* ── Body ── */}
            <div className="edicion-modal__body">
              {error && <div className="edicion-modal__error">{error}</div>}

              <div className="edicion-modal__fields">

                {/* Checkboxes Activo / Visible */}
                <div className="edicion-modal__row">
                  <label className="edicion-modal__check">
                    <input
                      type="checkbox"
                      checked={formData.state}
                      onChange={(e) => handleChange("state", e.target.checked)}
                    />
                    Activo
                  </label>
                  <label className="edicion-modal__check">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => handleChange("visible", e.target.checked)}
                    />
                    Visible
                  </label>
                </div>

                {/* Nombre CV */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">Nombre CV</label>
                  <input
                    className="edicion-modal__input"
                    type="text"
                    value={formData.name_cv}
                    onChange={(e) => handleChange("name_cv", e.target.value)}
                    placeholder="Nombre del CV…"
                    maxLength={255}
                  />
                </div>

                {/* Plantilla — combobox con nombre visible, envía id */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">Plantilla</label>
                  <select
                    className="edicion-modal__input"
                    value={formData.template}
                    onChange={(e) => handleChange("template", e.target.value)}
                  >
                    <option value="">— Seleccionar plantilla —</option>
                    {TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.description}
                      </option>
                    ))}
                  </select>
                  {formData.template && (
                    <span className="edicion-modal__char-count">
                      Valor enviado al backend: <strong>{formData.template}</strong>
                    </span>
                  )}
                </div>

                {/* Fuente — combobox con 3 opciones */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">Fuente</label>
                  <select
                    className="edicion-modal__input"
                    value={formData.font}
                    onChange={(e) => handleChange("font", e.target.value)}
                  >
                    <option value="">— Seleccionar fuente —</option>
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  {formData.font && (
                    <span
                      className="edicion-modal__char-count"
                      style={{
                        fontFamily:
                          FONTS.find((f) => f.id === formData.font)?.value,
                      }}
                    >
                      Vista previa: Texto en {FONTS.find((f) => f.id === formData.font)?.label}
                    </span>
                  )}
                </div>

                {/* Resto de campos (URL / textarea) */}
                {TEXT_FIELDS.map((field) => (
                  <div className="edicion-modal__field" key={field.key}>
                    <label className="edicion-modal__label">{field.label}</label>
                    {field.type === "textarea" ? (
                      <>
                        <textarea
                          className="edicion-modal__textarea"
                          value={formData[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={`${field.label}…`}
                          rows={3}
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
                        placeholder={`${field.label}…`}
                        maxLength={field.maxLength}
                      />
                    )}
                  </div>
                ))}

              </div>
            </div>

            {/* ── Footer ── */}
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
                disabled={isSaving}
              >
                {isSaving
                  ? <><Loader2 size={13} className="edicion-modal__spinner" /> Creando…</>
                  : <><Plus size={13} /> Crear CV</>}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="CV"
        resumen={buildResumen(formData)}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}
