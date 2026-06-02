import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, Loader2, Plus, X } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearExperiencia } from "../../../../services/adminCreacionService";

const TYPE_TO_DB = { professional: "labor", freelance: "labor", academic: "academic" };

const CARGO_CATALOGO = {
  "Software y Tecnología": ["Desarrollador Frontend","Desarrollador Backend","Desarrollador Full Stack","Desarrollador Mobile","Ingeniero de Software","QA Tester","DevOps Engineer","Data Engineer","Analista de Datos","Especialista en Ciberseguridad"],
  "Diseño y Producto":     ["Product Manager","Product Owner","UX Designer","UI Designer","UX Researcher","Diseñador Gráfico"],
  "Negocios y Marketing":  ["Analista de Negocios","Marketing Digital","Community Manager","Content Manager","SEO Specialist","Customer Success"],
  "Operaciones y Gestión": ["Project Manager","Scrum Master","Coordinador de Operaciones","Asistente Administrativo","Recursos Humanos","Soporte Técnico"],
  "Académica":             ["Auxiliar de Docencia","Investigador Académico","Tutor Académico","Becario de Investigación","Estudiante Investigador"],
  "Freelance":             ["Freelancer","Consultor Independiente","Desarrollador Freelance","Diseñador Freelance","Creador de Contenido Independiente","Emprendedor"],
};
const AREA_OPTIONS = Object.keys(CARGO_CATALOGO);

const EMPTY_FORM = { type: "", state: "public", cargo_area: "", title: "", company: "", start_date: "", end_date: "", description: "" };

export default function CreacionFormExperiencia({ idProfile, onClose, onSaved }) {
  const { t } = useTranslation();
  const x = "adminCreacion.experiencia";

  const TYPE_OPTIONS  = [
    { value: "professional", label: t(`${x}.types.professional`) },
    { value: "academic",     label: t(`${x}.types.academic`)     },
    { value: "freelance",    label: t(`${x}.types.freelance`)    },
  ];
  const STATE_OPTIONS = [
    { value: "public",  label: t(`${x}.states.public`)  },
    { value: "private", label: t(`${x}.states.private`) },
  ];
  const EXP_FIELDS = [
    { key: "company",     label: t(`${x}.fields.company`),     type: "text",     maxLength: 255  },
    { key: "start_date",  label: t(`${x}.fields.start_date`),  type: "date"                      },
    { key: "end_date",    label: t(`${x}.fields.end_date`),    type: "date"                      },
    { key: "description", label: t(`${x}.fields.description`), type: "textarea", maxLength: 1000 },
  ];

  function buildResumen(form) {
    const entries = [
      { key: "type",        label: t(`${x}.resumen.type`),        options: TYPE_OPTIONS  },
      { key: "state",       label: t(`${x}.resumen.state`),       options: STATE_OPTIONS },
      { key: "cargo_area",  label: t(`${x}.resumen.area`)                                },
      { key: "title",       label: t(`${x}.resumen.title`)                               },
      { key: "company",     label: t(`${x}.resumen.company`)                             },
      { key: "start_date",  label: t(`${x}.resumen.startDate`)                           },
      { key: "end_date",    label: t(`${x}.resumen.endDate`)                             },
      { key: "description", label: t(`${x}.resumen.description`)                         },
    ];
    return entries
      .filter(({ key }) => form[key] !== "" && form[key] !== null)
      .map(({ key, label, options }) => ({
        label,
        value: options ? options.find((o) => o.value === form[key])?.label ?? form[key] : form[key],
      }));
  }

  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleAreaChange = (area) => setFormData((prev) => ({ ...prev, cargo_area: area, title: "" }));
  const rolesDisponibles = formData.cargo_area ? CARGO_CATALOGO[formData.cargo_area] ?? [] : [];

  const handleConfirmedSave = async () => {
    if (!formData.type) { setConfirmError(t(`${x}.errorTypeRequired`)); return; }
    setIsSaving(true); setConfirmError("");
    try {
      const payload = {
        type:        TYPE_TO_DB[formData.type] ?? formData.type,
        state:       formData.state      || null,
        title:       formData.title      || null,
        company:     formData.company    || null,
        start_date:  formData.start_date || null,
        end_date:    formData.end_date   || null,
        description: formData.description|| null,
      };
      const data = await crearExperiencia(idProfile, payload);
      setShowConfirm(false); onSaved?.(data); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${x}.errorCreate`));
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
                <Briefcase size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${x}.headerTitle`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${x}.headerSubtitle`)}{idProfile}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t(`${x}.closeLabel`)}>
                <X size={16} />
              </button>
            </div>

            <div className="edicion-modal__body">
              {error && <div className="edicion-modal__error">{error}</div>}
              <div className="edicion-modal__fields">

                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">
                    {t(`${x}.fieldType`)} <span className="edicion-modal__required">*</span>
                  </label>
                  <select className="edicion-modal__input" value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}>
                    <option value="">{t(`${x}.typePh`)}</option>
                    {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">{t(`${x}.fieldState`)}</label>
                  <select className="edicion-modal__input" value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}>
                    <option value="">{t(`${x}.statePh`)}</option>
                    {STATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">{t(`${x}.fieldArea`)}</label>
                  <select className="edicion-modal__input" value={formData.cargo_area}
                    onChange={(e) => handleAreaChange(e.target.value)}>
                    <option value="">{t(`${x}.areaPh`)}</option>
                    {AREA_OPTIONS.map((area) => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>

                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">{t(`${x}.fieldCargo`)}</label>
                  <select className="edicion-modal__input" value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    disabled={!formData.cargo_area}>
                    <option value="">
                      {formData.cargo_area ? t(`${x}.cargoPh`) : t(`${x}.cargoAreaFirst`)}
                    </option>
                    {rolesDisponibles.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
                  </select>
                </div>

                {EXP_FIELDS.map((field) => (
                  <div className="edicion-modal__field" key={field.key}>
                    <label className="edicion-modal__label">{field.label}</label>
                    {field.type === "textarea" ? (
                      <>
                        <textarea className="edicion-modal__textarea" value={formData[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={`${field.label}…`} rows={4} maxLength={field.maxLength} />
                        <span className="edicion-modal__char-count">
                          {formData[field.key]?.length ?? 0} / {field.maxLength}
                        </span>
                      </>
                    ) : (
                      <input className="edicion-modal__input" type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.type !== "date" ? `${field.label}…` : undefined}
                        maxLength={field.maxLength ?? undefined} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t(`${x}.btnClose`)}
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || !formData.type}>
                <Plus size={13} /> {t(`${x}.btnCreate`)}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <CreacionModalConfirmacion isOpen={showConfirm} isBusy={isSaving} entidad="Experiencia"
        resumen={buildResumen(formData)} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave} />
    </>
  );
}