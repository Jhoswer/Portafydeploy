import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { getCountries } from "../../../../services/definitionService";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = { id_country: "", name: "", state: "activate" };

export default function EstadoForm({ onGuardar, onCancelar }) {
  const { t } = useTranslation();
  const p = "admin.definicion.estadoForm";

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
    activate:   t(`${p}.stateActivate`),
    deactivate: t(`${p}.stateDeactivate`),
  };
  const countryLabel = countries.find((c) => String(c.id_country) === String(form.id_country))?.name ?? form.id_country;

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
        </div>

        <div className="def-form__row--full def-field">
          <label className="def-field__label">
            {t(`${p}.stateLabel`)} <span className="def-field__required">*</span>
          </label>
          <select className="def-field__select" name="state" value={form.state} onChange={handleChange}>
            <option value="activate">{t(`${p}.stateActivate`)}</option>
            <option value="deactivate">{t(`${p}.stateDeactivate`)}</option>
          </select>
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
          { label: t(`${p}.summaryName`),  value: form.name },
          { label: t(`${p}.summaryPais`),  value: countryLabel },
          { label: t(`${p}.summaryState`), value: STATE_LABEL[form.state] ?? form.state },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
