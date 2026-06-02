import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Plus, X } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearCv } from "../../../../services/adminCreacionService";

const TEMPLATE_IDS = ["navy","slate","forest","crimson","bicolor","tech","minimal"];
const FONTS = [
  { id: "serif", value: "Georgia, 'Times New Roman', serif"    },
  { id: "sans",  value: "system-ui, -apple-system, sans-serif" },
  { id: "mono",  value: "'Courier New', Courier, monospace"    },
];
const TEXT_FIELD_KEYS = ["archive_pdf", "cv_url", "description"];

const EMPTY_FORM = {
  name_cv: "", template: "", font: "",
  archive_pdf: "", cv_url: "", description: "",
  state: false, visible: true,
};

export default function CreacionFormCV({ idProfile, onClose, onSaved }) {
  const { t } = useTranslation();
  const c = "adminCreacion.cv";

  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Construir catálogos con t() dentro del componente
  const TEMPLATES = TEMPLATE_IDS.map((id) => ({
    id,
    name:        t(`${c}.templates.${id}`),
    description: t(`${c}.templateDesc.${id}`),
  }));

  const TEXT_FIELDS = [
    { key: "archive_pdf", label: t(`${c}.fields.archive_pdf`), type: "url",      maxLength: 255 },
    { key: "cv_url",      label: t(`${c}.fields.cv_url`),      type: "url",      maxLength: 255 },
    { key: "description", label: t(`${c}.fields.description`), type: "textarea", maxLength: 255 },
  ];

  function buildResumen(form) {
    const templateLabel = TEMPLATES.find((tmpl) => tmpl.id === form.template)?.name ?? "";
    const fontLabel     = FONTS.find((f) => f.id === form.font)
      ? t(`${c}.fonts.${form.font}`) : "";
    return [
      { key: "name_cv",     label: t(`${c}.resumen.nameCv`),      value: form.name_cv     },
      { key: "template",    label: t(`${c}.resumen.template`),    value: templateLabel    },
      { key: "font",        label: t(`${c}.resumen.font`),        value: fontLabel        },
      { key: "archive_pdf", label: t(`${c}.resumen.archivePdf`),  value: form.archive_pdf },
      { key: "cv_url",      label: t(`${c}.resumen.cvUrl`),       value: form.cv_url      },
      { key: "description", label: t(`${c}.resumen.description`), value: form.description },
      { key: "state",       label: t(`${c}.resumen.active`),      value: form.state   ? t(`${c}.resumen.yes`) : t(`${c}.resumen.no`) },
      { key: "visible",     label: t(`${c}.resumen.visible`),     value: form.visible ? t(`${c}.resumen.yes`) : t(`${c}.resumen.no`) },
    ].filter(({ key, value }) => {
      if (key === "state")   return form.state;
      if (key === "visible") return form.visible;
      return value !== "" && value !== null && value !== undefined;
    });
  }

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const payload = {
        name_cv:     formData.name_cv     || null,
        template:    formData.template    || null,
        font:        formData.font        || null,
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
      setConfirmError(err?.message || t(`${c}.errorCreate`));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal edicion-modal--personal">

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <FileText size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${c}.headerTitle`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${c}.headerSubtitle`)}{idProfile}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t(`${c}.closeLabel`)}>
                <X size={16} />
              </button>
            </div>

            <div className="edicion-modal__body">
              {error && <div className="edicion-modal__error">{error}</div>}
              <div className="edicion-modal__fields">

                <div className="edicion-modal__row">
                  <label className="edicion-modal__check">
                    <input type="checkbox" checked={formData.state}
                      onChange={(e) => handleChange("state", e.target.checked)} />
                    {t(`${c}.checkActive`)}
                  </label>
                  <label className="edicion-modal__check">
                    <input type="checkbox" checked={formData.visible}
                      onChange={(e) => handleChange("visible", e.target.checked)} />
                    {t(`${c}.checkVisible`)}
                  </label>
                </div>

                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">{t(`${c}.fieldNameCv`)}</label>
                  <input className="edicion-modal__input" type="text"
                    value={formData.name_cv}
                    onChange={(e) => handleChange("name_cv", e.target.value)}
                    placeholder={t(`${c}.fieldNameCvPh`)} maxLength={255} />
                </div>

                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">{t(`${c}.fieldTemplate`)}</label>
                  <select className="edicion-modal__input" value={formData.template}
                    onChange={(e) => handleChange("template", e.target.value)}>
                    <option value="">{t(`${c}.templatePh`)}</option>
                    {TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name} — {tmpl.description}
                      </option>
                    ))}
                  </select>
                  {formData.template && (
                    <span className="edicion-modal__char-count">
                      {t(`${c}.templateSent`)} <strong>{formData.template}</strong>
                    </span>
                  )}
                </div>

                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">{t(`${c}.fieldFont`)}</label>
                  <select className="edicion-modal__input" value={formData.font}
                    onChange={(e) => handleChange("font", e.target.value)}>
                    <option value="">{t(`${c}.fontPh`)}</option>
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.id}>{f.id}</option>
                    ))}
                  </select>
                  {formData.font && (
                    <span className="edicion-modal__char-count"
                      style={{ fontFamily: FONTS.find((f) => f.id === formData.font)?.value }}>
                      {t(`${c}.fontPreview`)} {formData.font}
                    </span>
                  )}
                </div>

                {TEXT_FIELDS.map((field) => (
                  <div className="edicion-modal__field" key={field.key}>
                    <label className="edicion-modal__label">{field.label}</label>
                    {field.type === "textarea" ? (
                      <>
                        <textarea className="edicion-modal__textarea"
                          value={formData[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={`${field.label}…`}
                          rows={3} maxLength={field.maxLength} />
                        <span className="edicion-modal__char-count">
                          {formData[field.key]?.length ?? 0} / {field.maxLength}
                        </span>
                      </>
                    ) : (
                      <input className="edicion-modal__input" type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={`${field.label}…`} maxLength={field.maxLength} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t(`${c}.btnClose`)}
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving}>
                {isSaving
                  ? <><Loader2 size={13} className="edicion-modal__spinner" /> {t(`${c}.creating`)}</>
                  : <><Plus size={13} /> {t(`${c}.btnCreate`)}</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <CreacionModalConfirmacion
        isOpen={showConfirm} isBusy={isSaving} entidad="CV"
        resumen={buildResumen(formData)} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave} />
    </>
  );
}