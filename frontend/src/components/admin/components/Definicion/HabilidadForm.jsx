import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { getAreas } from "../../../../services/definitionService";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = {
  name: "", state: "activate", type: "hard",
  quantitative_level: "", qualitative_level: "",
  description: "", id_area: "",
};

export default function HabilidadForm({ onGuardar, onCancelar }) {
  const { t } = useTranslation();
  const p = "admin.definicion.habilidadForm";

  const [form, setForm]     = useState(initialState);
  const [modal, setModal]   = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError]   = useState("");
  const [areas, setAreas]   = useState([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [areasError, setAreasError]         = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoadingAreas(true); setAreasError("");
      try { const data = await getAreas(); if (isMounted) setAreas(data); }
      catch (err) { if (isMounted) setAreasError(err.message); }
      finally { if (isMounted) setIsLoadingAreas(false); }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleChange  = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };
  const handleSubmit  = (e) => { e.preventDefault(); setModal(true); };
  const handleConfirm = async () => {
    setIsBusy(true); setError("");
    try {
      await onGuardar?.({
        ...form,
        quantitative_level: form.quantitative_level || null,
        qualitative_level: form.qualitative_level === "" ? null : Number(form.qualitative_level),
      });
      setModal(false); setForm(initialState);
    } catch (err) { setError(err.message); }
    finally { setIsBusy(false); }
  };
  const handleReset = () => { setForm(initialState); onCancelar?.(); };

  const STATE_LABEL = { activate: t(`${p}.stateActivate`), deactivate: t(`${p}.stateDeactivate`) };
  const TYPE_LABEL  = { hard: t(`${p}.tipoHard`), soft: t(`${p}.tipoSoft`) };
  const areaLabel   = areas.find((a) => String(a.id_area) === String(form.id_area))?.name ?? form.id_area;

  return (
    <>
      <form className="def-form" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.nameLabel`)} <span className="def-field__required">*</span>
            </label>
            <input className="def-field__input" name="name" value={form.name}
              onChange={handleChange} placeholder={t(`${p}.namePlaceholder`)} maxLength={255} required />
          </div>
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.tipoLabel`)} <span className="def-field__required">*</span>
            </label>
            <select className="def-field__select" name="type" value={form.type} onChange={handleChange} required>
              <option value="hard">{t(`${p}.tipoHard`)}</option>
              <option value="soft">{t(`${p}.tipoSoft`)}</option>
            </select>
            <span className="def-field__hint">{t(`${p}.tipoHint`)}</span>
          </div>
        </div>

        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.stateLabel`)} <span className="def-field__required">*</span>
            </label>
            <select className="def-field__select" name="state" value={form.state} onChange={handleChange}>
              <option value="activate">{t(`${p}.stateActivate`)}</option>
              <option value="deactivate">{t(`${p}.stateDeactivate`)}</option>
            </select>
          </div>
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.areaLabel`)} <span className="def-field__required">*</span>
            </label>
            <select className="def-field__select" name="id_area" value={form.id_area}
              onChange={handleChange} disabled={isLoadingAreas} required>
              <option value="">{isLoadingAreas ? t(`${p}.areaLoading`) : t(`${p}.areaPlaceholder`)}</option>
              {areas.map((a) => (
                <option key={a.id_area} value={a.id_area}>{a.name}</option>
              ))}
            </select>
            <span className="def-field__hint">{areasError || t(`${p}.areaHint`)}</span>
          </div>
        </div>

        <div className="def-form__divider">{t(`${p}.competenciaTitle`)}</div>

        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.cualitativoLabel`)}</label>
            <input className="def-field__input" name="quantitative_level" value={form.quantitative_level}
              onChange={handleChange} placeholder={t(`${p}.cualitativoPlaceholder`)} maxLength={255} />
          </div>
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.cuantitativoLabel`)}</label>
            <input className="def-field__input" name="qualitative_level" value={form.qualitative_level}
              onChange={handleChange} placeholder={t(`${p}.cuantitativoPlaceholder`)} type="number" min={0} />
          </div>
        </div>

        <div className="def-form__row--full def-field">
          <label className="def-field__label">
            {t(`${p}.descriptionLabel`)} <span className="def-field__required">*</span>
          </label>
          <textarea className="def-field__textarea" name="description" value={form.description}
            onChange={handleChange} placeholder={t(`${p}.descriptionPlaceholder`)} maxLength={255} required />
        </div>

        <div className="def-form__actions">
          <button type="submit" className="def-btn def-btn--primary">
            <Save size={14} /> {t(`${p}.saveButton`)}
          </button>
        </div>
      </form>

      <DefinicionConfirmModal
        isOpen={modal} isBusy={isBusy} error={error} entidad={t(`${p}.entityName`)}
        resumen={[
          { label: t(`${p}.summaryName`),         value: form.name },
          { label: t(`${p}.summaryTipo`),         value: TYPE_LABEL[form.type]   ?? form.type  },
          { label: t(`${p}.summaryState`),        value: STATE_LABEL[form.state] ?? form.state },
          { label: t(`${p}.summaryArea`),         value: areaLabel },
          { label: t(`${p}.summaryCualitativo`),  value: form.quantitative_level },
          { label: t(`${p}.summaryCuantitativo`), value: form.qualitative_level  },
          { label: t(`${p}.summaryDescription`),  value: form.description },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
