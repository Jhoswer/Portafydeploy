import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import DefinicionConfirmModal from "./DefinicionConfirmModal";
import { getCountries } from "../../../../services/definitionService";

const initialState = {
  name: "", description: "", logo_url: "", industry: "", city: "",
  id_country: "", phone_prefix: "", phone: "", website: "",
  state: "active", banner_url: "", mission: "", vision: "",
};

export default function CompaniaForm({ onGuardar, onCancelar }) {
  const { t } = useTranslation();
  const p = "admin.definicion.companiaForm";

  const [form, setForm]     = useState(initialState);
  const [modal, setModal]   = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError]   = useState("");
  const [countries, setCountries]                   = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [countriesError, setCountriesError]         = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoadingCountries(true); setCountriesError("");
      try { const data = await getCountries(); if (isMounted) setCountries(data); }
      catch (err) { if (isMounted) setCountriesError(err.message); }
      finally { if (isMounted) setIsLoadingCountries(false); }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleChange  = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };
  const handleSubmit  = (e) => { e.preventDefault(); setModal(true); };
  const handleConfirm = async () => {
    setIsBusy(true); setError("");
    try { await onGuardar?.(form); setModal(false); setForm(initialState); }
    catch (err) { setError(err.message); }
    finally { setIsBusy(false); }
  };
  const handleReset = () => { setForm(initialState); onCancelar?.(); };

  const STATE_LABEL = {
    active:     t(`${p}.stateActive`),
    inactive:   t(`${p}.stateInactive`),
    suspended:  t(`${p}.stateSuspended`),
  };

  return (
    <>
      <form className="def-form" onSubmit={handleSubmit} onReset={handleReset}>

        <div className="def-form__divider">{t(`${p}.sectionPrincipal`)}</div>
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
              {t(`${p}.stateLabel`)} <span className="def-field__required">*</span>
            </label>
            <select className="def-field__select" name="state" value={form.state} onChange={handleChange} required>
              <option value="active">{t(`${p}.stateActive`)}</option>
              <option value="inactive">{t(`${p}.stateInactive`)}</option>
              <option value="suspended">{t(`${p}.stateSuspended`)}</option>
            </select>
          </div>
        </div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.industryLabel`)}</label>
            <input className="def-field__input" name="industry" value={form.industry}
              onChange={handleChange} placeholder={t(`${p}.industryPlaceholder`)} maxLength={255} />
          </div>
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.cityLabel`)} <span className="def-field__required">*</span>
            </label>
            <input className="def-field__input" name="city" value={form.city}
              onChange={handleChange} placeholder={t(`${p}.cityPlaceholder`)} maxLength={255} required />
          </div>
        </div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.paisLabel`)} <span className="def-field__required">*</span>
            </label>
            <select className="def-field__select" name="id_country" value={form.id_country}
              onChange={handleChange} disabled={isLoadingCountries} required>
              <option value="">{isLoadingCountries ? t(`${p}.paisLoading`) : t(`${p}.paisPlaceholder`)}</option>
              {countries.map((c) => (
                <option key={c.id_country} value={c.id_country}>{c.name}</option>
              ))}
            </select>
            <span className="def-field__hint">{countriesError || t(`${p}.paisHint`)}</span>
          </div>
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.websiteLabel`)}</label>
            <input className="def-field__input" name="website" value={form.website}
              onChange={handleChange} placeholder={t(`${p}.websitePlaceholder`)} maxLength={255} type="url" />
          </div>
        </div>

        <div className="def-form__divider">{t(`${p}.sectionContacto`)}</div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.prefixLabel`)}</label>
            <input className="def-field__input" name="phone_prefix" value={form.phone_prefix}
              onChange={handleChange} placeholder={t(`${p}.prefixPlaceholder`)} maxLength={10} />
          </div>
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.phoneLabel`)} <span className="def-field__required">*</span>
            </label>
            <input className="def-field__input" name="phone" value={form.phone}
              onChange={handleChange} placeholder={t(`${p}.phonePlaceholder`)} maxLength={30} required />
          </div>
        </div>

        <div className="def-form__divider">{t(`${p}.sectionVisual`)}</div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.logoLabel`)}</label>
            <input className="def-field__input" name="logo_url" value={form.logo_url}
              onChange={handleChange} placeholder={t(`${p}.logoPlaceholder`)} maxLength={255} />
          </div>
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.bannerLabel`)}</label>
            <input className="def-field__input" name="banner_url" value={form.banner_url}
              onChange={handleChange} placeholder={t(`${p}.bannerPlaceholder`)} maxLength={255} />
          </div>
        </div>

        <div className="def-form__divider">{t(`${p}.sectionDesc`)}</div>
        <div className="def-form__row--full def-field">
          <label className="def-field__label">{t(`${p}.descriptionLabel`)}</label>
          <textarea className="def-field__textarea" name="description" value={form.description}
            onChange={handleChange} placeholder={t(`${p}.descriptionPlaceholder`)} maxLength={500} />
          <span className="def-field__hint">{t(`${p}.descriptionHint`)}</span>
        </div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.misionLabel`)}</label>
            <textarea className="def-field__textarea" name="mission" value={form.mission}
              onChange={handleChange} placeholder={t(`${p}.misionPlaceholder`)} maxLength={500} />
          </div>
          <div className="def-field">
            <label className="def-field__label">{t(`${p}.visionLabel`)}</label>
            <textarea className="def-field__textarea" name="vision" value={form.vision}
              onChange={handleChange} placeholder={t(`${p}.visionPlaceholder`)} maxLength={500} />
          </div>
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
          { label: t(`${p}.summaryName`),     value: form.name },
          { label: t(`${p}.summaryIndustry`), value: form.industry },
          { label: t(`${p}.summaryCity`),     value: form.city },
          { label: t(`${p}.summaryPhone`),    value: `${form.phone_prefix} ${form.phone}`.trim() },
          { label: t(`${p}.summaryState`),    value: STATE_LABEL[form.state] ?? form.state },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
