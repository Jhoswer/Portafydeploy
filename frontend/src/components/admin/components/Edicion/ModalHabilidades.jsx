import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Zap, Loader2, Save, X } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminSkill,
  updateAdminSkill,
} from "../../../../services/adminProfileTableService";

function normalizeBool(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function normalizeSkillProfile(skill) {
  const s = skill ?? {};
  return { level: s.level ?? "", visibility: normalizeBool(s.visibility) };
}

function sameValue(left, right) {
  return String(left ?? "") === String(right ?? "");
}

export default function ModalHabilidades({
  idProfile, idSkillProfile, initialData, onClose, onSaved,
}) {
  const { t } = useTranslation();
  const e = "adminEdicion.habilidades";

  const LEVEL_OPTIONS = [
    { value: "junior", label: t(`${e}.levels.junior`) },
    { value: "mid",    label: t(`${e}.levels.mid`)    },
    { value: "senior", label: t(`${e}.levels.senior`) },
  ];

  const [formData,     setFormData]     = useState(() => normalizeSkillProfile(initialData ?? null));
  const [original,     setOriginal]     = useState(() => initialData ? normalizeSkillProfile(initialData) : null);
  const [isLoading,    setIsLoading]    = useState(!initialData);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const skillName = initialData?.skill_name ?? initialData?.name ?? `#${idSkillProfile}`;

  useEffect(() => {
    if (initialData) return;
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const data   = await getAdminSkill(idProfile, idSkillProfile);
        const loaded = normalizeSkillProfile(data.skill);
        setFormData(loaded); setOriginal(loaded);
      } catch (err) {
        setError(err?.message || t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    if (idProfile && idSkillProfile) load();
  }, [idProfile, idSkillProfile, initialData]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const buildResumen = () => {
    if (!original) return [];
    const changes = [];
    if (!sameValue(original.level, formData.level))
      changes.push({
        label: t(`${e}.resumen.level`),
        value: LEVEL_OPTIONS.find((o) => o.value === formData.level)?.label ?? formData.level,
      });
    if (!sameValue(original.visibility, formData.visibility))
      changes.push({
        label: t(`${e}.resumen.visibility`),
        value: formData.visibility ? t("adminEdicion.common.visible") : t("adminEdicion.common.hidden"),
      });
    return changes;
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const data   = await updateAdminSkill(idProfile, idSkillProfile, formData);
      const loaded = normalizeSkillProfile(data.skill);
      setFormData(loaded); setOriginal(loaded);
      setShowConfirm(false); onSaved?.(data); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && onClose?.()}>
          <div className="edicion-modal edicion-modal--personal">

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Zap size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">{skillName}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                aria-label={t("adminEdicion.common.close")}>
                <X size={16} />
              </button>
            </div>

            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${e}.loadingMsg`)}</span>
                </div>
              )}
              {error && !isLoading && <div className="edicion-modal__error">{error}</div>}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">
                  <div className="edicion-modal__row">
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.visibility}
                        onChange={(ev) => handleChange("visibility", ev.target.checked)} />
                      {t(`${e}.visibleLabel`)}
                    </label>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.levelLabel`)}</label>
                    <select className="edicion-modal__input" value={formData.level}
                      onChange={(ev) => handleChange("level", ev.target.value)}>
                      <option value="">{t(`${e}.levelPh`)}</option>
                      {LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t("adminEdicion.common.close")}
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || Boolean(error)}>
                <Save size={13} /> {t("adminEdicion.common.save")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm} isBusy={isSaving}
        entidad={`${t(`${e}.confirmEntity`)} "${skillName}"`} accion="actualizar"
        resumen={buildResumen()} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}