import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Briefcase, Loader2, Save, X } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminExperience,
  updateAdminExperience,
} from "../../../../services/adminProfileTableService";

/* ── Opciones de selects (según CHECK constraints de la BD) ───── */
const TYPE_OPTIONS = [
  { value: "labor",    label: "Laboral"   },
  { value: "academic", label: "Académica" },
];

const STATE_OPTIONS = [
  { value: "public",  label: "Público" },
  { value: "private", label: "Privado" },
];

/* ── Campos de texto / fecha / textarea ───────────────────────── */
const EXP_FIELDS = [
  { key: "title",       label: "Cargo / Título",  type: "text",     maxLength: 255  },
  { key: "company",     label: "Empresa",         type: "text",     maxLength: 255  },
  { key: "start_date",  label: "Fecha de inicio", type: "date",     maxLength: null },
  { key: "end_date",    label: "Fecha de fin",    type: "date",     maxLength: null },
  { key: "description", label: "Descripción",     type: "textarea", maxLength: 1000 },
];

/* ── Helpers ──────────────────────────────────────────────────── */
function normalizeExperience(exp) {
  const e = exp ?? {};
  return {
    type:        e.type        ?? "",
    title:       e.title       ?? "",
    company:     e.company     ?? "",
    start_date:  e.start_date  ?? "",
    end_date:    e.end_date    ?? "",
    description: e.description ?? "",
    state:       e.state       ?? "",  // 'public' | 'private'
  };
}

function sameValue(left, right) {
  return String(left ?? "") === String(right ?? "");
}

/* ── Componente ───────────────────────────────────────────────── */
export default function ModalExperiencias({
  idProfile,
  idExperience,
  initialData,
  onClose,
  onSaved,
}) {
  const [formData,     setFormData]     = useState(() => normalizeExperience(initialData ?? null));
  const [original,     setOriginal]     = useState(() => initialData ? normalizeExperience(initialData) : null);
  const [isLoading,    setIsLoading]    = useState(!initialData);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  /* ── Carga (solo si no viene initialData) ── */
  useEffect(() => {
    if (initialData) return;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data   = await getAdminExperience(idProfile, idExperience);
        const loaded = normalizeExperience(data.experience);
        setFormData(loaded);
        setOriginal(loaded);
      } catch (err) {
        console.error("[ModalExperiencias] Error al cargar:", err);
        setError(err?.message || "No se pudo cargar la experiencia seleccionada.");
      } finally {
        setIsLoading(false);
      }
    };

    if (idProfile && idExperience) load();
  }, [idProfile, idExperience, initialData]);

  /* ── Handlers ── */
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  /* ── Resumen de cambios ── */
  const buildResumen = () => {
    if (!original) return [];

    const LABELS = [
      { key: "type",        label: "Tipo"           },
      { key: "state",       label: "Estado"         },
      ...EXP_FIELDS,
    ];

    return LABELS.reduce((acc, { key, label }) => {
      if (!sameValue(original[key], formData[key])) {
        let display = formData[key];
        if (key === "type")  display = TYPE_OPTIONS.find((o) => o.value === display)?.label  ?? display;
        if (key === "state") display = STATE_OPTIONS.find((o) => o.value === display)?.label ?? display;
        acc.push({ label, value: display });
      }
      return acc;
    }, []);
  };

  /* ── Guardar ── */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const data   = await updateAdminExperience(idProfile, idExperience, formData);
      const loaded = normalizeExperience(data.experience);
      setFormData(loaded);
      setOriginal(loaded);
      setShowConfirm(false);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("[ModalExperiencias] Error al guardar:", err);
      setConfirmError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── JSX ── */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--personal">

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Briefcase size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar Experiencia</h2>
                  <p className="edicion-modal__subtitle">Experiencia #{idExperience}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>Cargando experiencia...</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* Tipo: 'labor' | 'academic' */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Tipo</label>
                    <select
                      className="edicion-modal__input"
                      value={formData.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                    >
                      <option value="">— Seleccionar tipo —</option>
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estado: 'public' | 'private' */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Estado</label>
                    <select
                      className="edicion-modal__input"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                    >
                      <option value="">— Seleccionar estado —</option>
                      {STATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Campos de texto, fecha y textarea */}
                  {EXP_FIELDS.map((field) => (
                    <div className="edicion-modal__field" key={field.key}>
                      <label className="edicion-modal__label">{field.label}</label>

                      {field.type === "textarea" ? (
                        <>
                          <textarea
                            className="edicion-modal__textarea"
                            value={formData[field.key]}
                            onChange={(e) => handleChange(field.key, e.target.value)}
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
                          maxLength={field.maxLength ?? undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                disabled={isSaving || isLoading || Boolean(error)}
              >
                <Save size={13} /> Guardar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Experiencia"
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}