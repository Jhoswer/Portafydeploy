import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Zap, Loader2, Save, X } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminSkill,
  updateAdminSkill,
} from "../../../../services/adminProfileTableService";

/* ── Opciones de nivel (según CHECK constraint de SKILL_PROFILE) */
const LEVEL_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "mid",    label: "Mid"    },
  { value: "senior", label: "Senior" },
];

/* ── Helpers ──────────────────────────────────────────────────── */
function normalizeBool(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

// Solo los campos editables de SKILL_PROFILE: level y visibility.
// name/description pertenecen a la tabla SKILL (solo lectura aquí).
function normalizeSkillProfile(skill) {
  const s = skill ?? {};
  return {
    level:      s.level      ?? "",
    visibility: normalizeBool(s.visibility),
  };
}

function sameValue(left, right) {
  return String(left ?? "") === String(right ?? "");
}

/* ── Componente ───────────────────────────────────────────────── */
export default function ModalHabilidades({
  idProfile,
  idSkillProfile,
  initialData,
  onClose,
  onSaved,
}) {
  const [formData,     setFormData]     = useState(() => normalizeSkillProfile(initialData ?? null));
  const [original,     setOriginal]     = useState(() => initialData ? normalizeSkillProfile(initialData) : null);
  const [isLoading,    setIsLoading]    = useState(!initialData);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Nombre de la habilidad para mostrar en el header (solo lectura, viene del JOIN con SKILL)
  const skillName = initialData?.skill_name ?? initialData?.name ?? `#${idSkillProfile}`;

  /* ── Carga (solo si no viene initialData) ── */
  useEffect(() => {
    if (initialData) return;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data   = await getAdminSkill(idProfile, idSkillProfile);
        const loaded = normalizeSkillProfile(data.skill);
        setFormData(loaded);
        setOriginal(loaded);
      } catch (err) {
        console.error("[ModalHabilidades] Error al cargar:", err);
        setError(err?.message || "No se pudo cargar la habilidad seleccionada.");
      } finally {
        setIsLoading(false);
      }
    };

    if (idProfile && idSkillProfile) load();
  }, [idProfile, idSkillProfile, initialData]);

  /* ── Handlers ── */
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  /* ── Resumen de cambios ── */
  const buildResumen = () => {
    if (!original) return [];
    const changes = [];

    if (!sameValue(original.level, formData.level)) {
      changes.push({
        label: "Nivel",
        value: LEVEL_OPTIONS.find((o) => o.value === formData.level)?.label ?? formData.level,
      });
    }

    if (!sameValue(original.visibility, formData.visibility)) {
      changes.push({
        label: "Visibilidad",
        value: formData.visibility ? "Visible" : "Oculto",
      });
    }

    return changes;
  };

  /* ── Guardar ── */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const data   = await updateAdminSkill(idProfile, idSkillProfile, formData);
      const loaded = normalizeSkillProfile(data.skill);
      setFormData(loaded);
      setOriginal(loaded);
      setShowConfirm(false);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("[ModalHabilidades] Error al guardar:", err);
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
                <Zap size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar Habilidad</h2>
                  <p className="edicion-modal__subtitle">{skillName}</p>
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
                  <span>Cargando habilidad...</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* Visibilidad — campo: visibility (BOOLEAN) */}
                  <div className="edicion-modal__row">
                    <label className="edicion-modal__check">
                      <input
                        type="checkbox"
                        checked={formData.visibility}
                        onChange={(e) => handleChange("visibility", e.target.checked)}
                      />
                      Visible
                    </label>
                  </div>

                  {/* Nivel — 'junior' | 'mid' | 'senior' */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Nivel</label>
                    <select
                      className="edicion-modal__input"
                      value={formData.level}
                      onChange={(e) => handleChange("level", e.target.value)}
                    >
                      <option value="">— Seleccionar nivel —</option>
                      {LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

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
        entidad={`Habilidad "${skillName}"`}
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}