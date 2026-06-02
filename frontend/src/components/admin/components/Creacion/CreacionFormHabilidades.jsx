import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, X, Zap } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearHabilidad, getCatalogosHabilidades } from "../../../../services/adminCreacionService";

const EMPTY_FORM = { id_skill: "", level: "", visibility: true };

export default function CreacionFormHabilidades({ idProfile, onClose, onSaved }) {
  const { t } = useTranslation();
  const h = "adminCreacion.habilidades";

  const LEVEL_OPTIONS = [
    { value: "junior", label: "Junior" },
    { value: "mid",    label: "Mid"    },
    { value: "senior", label: "Senior" },
  ];

  function buildResumen(form, skills) {
    const entries = [];
    if (form.id_skill) {
      const s = skills.find((s) => String(s.value) === String(form.id_skill));
      entries.push({ label: t(`${h}.resumen.skill`), value: s?.label ?? `ID ${form.id_skill}` });
    }
    if (form.level) {
      entries.push({
        label: t(`${h}.resumen.level`),
        value: LEVEL_OPTIONS.find((o) => o.value === form.level)?.label ?? form.level,
      });
    }
    entries.push({ label: t(`${h}.resumen.visible`), value: form.visibility ? t(`${h}.resumen.yes`) : t(`${h}.resumen.no`) });
    return entries;
  }

  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [skills,       setSkills]       = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    getCatalogosHabilidades()
      .then(setSkills)
      .catch(() => setError(t(`${h}.errorLoad`)))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleConfirmedSave = async () => {
    if (!formData.id_skill) { setConfirmError(t(`${h}.errorRequired`)); return; }
    setIsSaving(true); setConfirmError("");
    try {
      const payload = { id_skill: Number(formData.id_skill), level: formData.level || null, visibility: formData.visibility };
      const data = await crearHabilidad(idProfile, payload);
      setShowConfirm(false); onSaved?.(data); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${h}.errorCreate`));
    } finally { setIsSaving(false); }
  };

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal edicion-modal--personal">

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Zap size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${h}.headerTitle`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${h}.headerSubtitle`)}{idProfile}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t(`${h}.closeLabel`)}>
                <X size={16} />
              </button>
            </div>

            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${h}.loading`)}</span>
                </div>
              )}
              {error && !isLoading && <div className="edicion-modal__error">{error}</div>}
              {!isLoading && !error && (
                <div className="edicion-modal__fields">
                  <div className="edicion-modal__row">
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.visibility}
                        onChange={(e) => handleChange("visibility", e.target.checked)} />
                      {t(`${h}.checkVisible`)}
                    </label>
                  </div>
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {t(`${h}.fieldSkill`)} <span className="edicion-modal__required">*</span>
                    </label>
                    <select className="edicion-modal__input" value={formData.id_skill}
                      onChange={(e) => handleChange("id_skill", e.target.value)}>
                      <option value="">{t(`${h}.skillPh`)}</option>
                      {skills.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    {skills.length === 0 && (
                      <span className="edicion-modal__char-count" style={{ color: "#f59e0b" }}>
                        {t(`${h}.skillEmpty`)}
                      </span>
                    )}
                  </div>
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${h}.fieldLevel`)}</label>
                    <select className="edicion-modal__input" value={formData.level}
                      onChange={(e) => handleChange("level", e.target.value)}>
                      <option value="">{t(`${h}.levelPh`)}</option>
                      {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t(`${h}.btnClose`)}
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || !formData.id_skill}>
                <Plus size={13} /> {t(`${h}.btnCreate`)}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <CreacionModalConfirmacion isOpen={showConfirm} isBusy={isSaving} entidad="Habilidad"
        resumen={buildResumen(formData, skills)} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave} />
    </>
  );
}