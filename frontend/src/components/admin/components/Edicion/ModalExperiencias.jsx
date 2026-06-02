import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, Loader2, Save, X } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminExperience,
  updateAdminExperience,
} from "../../../../services/adminProfileTableService";

function normalizeExperience(exp) {
  const e = exp ?? {};
  return {
    type: e.type ?? "", title: e.title ?? "", company: e.company ?? "",
    start_date: e.start_date ?? "", end_date: e.end_date ?? "",
    description: e.description ?? "", state: e.state ?? "",
  };
}

function sameValue(left, right) {
  return String(left ?? "") === String(right ?? "");
}

export default function ModalExperiencias({
  idProfile, idExperience, initialData, onClose, onSaved,
}) {
  const { t } = useTranslation();
  const e = "adminEdicion.experiencias";

  const TYPE_OPTIONS = [
    { value: "labor",    label: t(`${e}.types.labor`)    },
    { value: "academic", label: t(`${e}.types.academic`) },
  ];

  const STATE_OPTIONS = [
    { value: "public",  label: t(`${e}.states.public`)  },
    { value: "private", label: t(`${e}.states.private`) },
  ];

  const EXP_FIELDS = [
    { key: "title",       label: t(`${e}.fields.title`),      type: "text",     maxLength: 255  },
    { key: "company",     label: t(`${e}.fields.company`),    type: "text",     maxLength: 255  },
    { key: "start_date",  label: t(`${e}.fields.start_date`), type: "date",     maxLength: null },
    { key: "end_date",    label: t(`${e}.fields.end_date`),   type: "date",     maxLength: null },
    { key: "description", label: t(`${e}.fields.description`),type: "textarea", maxLength: 1000 },
  ];

  const [formData,     setFormData]     = useState(() => normalizeExperience(initialData ?? null));
  const [original,     setOriginal]     = useState(() => initialData ? normalizeExperience(initialData) : null);
  const [isLoading,    setIsLoading]    = useState(!initialData);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (initialData) return;
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const data   = await getAdminExperience(idProfile, idExperience);
        const loaded = normalizeExperience(data.experience);
        setFormData(loaded); setOriginal(loaded);
      } catch (err) {
        setError(err?.message || t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    if (idProfile && idExperience) load();
  }, [idProfile, idExperience, initialData]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const buildResumen = () => {
    if (!original) return [];
    const LABELS = [
      { key: "type",  label: t(`${e}.fields.type`)  },
      { key: "state", label: t(`${e}.fields.state`) },
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

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const data   = await updateAdminExperience(idProfile, idExperience, formData);
      const loaded = normalizeExperience(data.experience);
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
                <Briefcase size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${e}.subtitle`)}{idExperience}</p>
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
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.typeLabel`)}</label>
                    <select className="edicion-modal__input" value={formData.type}
                      onChange={(ev) => handleChange("type", ev.target.value)}>
                      <option value="">{t(`${e}.typePh`)}</option>
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.stateLabel`)}</label>
                    <select className="edicion-modal__input" value={formData.state}
                      onChange={(ev) => handleChange("state", ev.target.value)}>
                      <option value="">{t(`${e}.statePh`)}</option>
                      {STATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {EXP_FIELDS.map((field) => (
                    <div className="edicion-modal__field" key={field.key}>
                      <label className="edicion-modal__label">{field.label}</label>
                      {field.type === "textarea" ? (
                        <>
                          <textarea className="edicion-modal__textarea"
                            value={formData[field.key]}
                            onChange={(ev) => handleChange(field.key, ev.target.value)}
                            rows={4} maxLength={field.maxLength} />
                          <span className="edicion-modal__char-count">
                            {formData[field.key]?.length ?? 0} / {field.maxLength}
                          </span>
                        </>
                      ) : (
                        <input className="edicion-modal__input" type={field.type}
                          value={formData[field.key]}
                          onChange={(ev) => handleChange(field.key, ev.target.value)}
                          maxLength={field.maxLength ?? undefined} />
                      )}
                    </div>
                  ))}
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
        entidad={t(`${e}.confirmEntity`)} accion="actualizar"
        resumen={buildResumen()} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}