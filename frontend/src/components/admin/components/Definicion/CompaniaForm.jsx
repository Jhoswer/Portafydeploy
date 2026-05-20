// src/components/admin/components/Definicion/CompaniaForm.jsx
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import DefinicionConfirmModal from "./DefinicionConfirmModal";
import { getCountries } from "../../../../services/definitionService";

const initialState = {
  name: "", description: "", logo_url: "", industry: "", city: "",
  id_country: "", phone_prefix: "", phone: "", website: "",
  state: "active", banner_url: "", mission: "", vision: "",
};

const STATE_LABEL = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido" };

export default function CompaniaForm({ onGuardar, onCancelar }) {
  const [form, setForm]     = useState(initialState);
  const [modal, setModal]   = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCountries() {
      setIsLoadingCountries(true);
      setCountriesError("");

      try {
        const data = await getCountries();
        if (isMounted) setCountries(data);
      } catch (error) {
        if (isMounted) setCountriesError(error.message);
      } finally {
        if (isMounted) setIsLoadingCountries(false);
      }
    }

    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange  = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); };
  const handleSubmit  = (e) => { e.preventDefault(); setModal(true); };
  const handleConfirm = async () => {
    setIsBusy(true); setError("");
    try {
      await onGuardar?.(form);
      setModal(false); setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  };
  const handleReset = () => { setForm(initialState); onCancelar?.(); };

  return (
    <>
      <form className="def-form" onSubmit={handleSubmit} onReset={handleReset}>

        <div className="def-form__divider">Información principal</div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Nombre <span className="def-field__required">*</span></label>
            <input className="def-field__input" name="name" value={form.name}
              onChange={handleChange} placeholder="Ej: Tech Solutions SRL" maxLength={255} required />
          </div>
          <div className="def-field">
            <label className="def-field__label">Estado <span className="def-field__required">*</span></label>
            <select className="def-field__select" name="state" value={form.state} onChange={handleChange} required>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>
        </div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Industria</label>
            <input className="def-field__input" name="industry" value={form.industry}
              onChange={handleChange} placeholder="Ej: Tecnología" maxLength={255} />
          </div>
          <div className="def-field">
            <label className="def-field__label">Ciudad <span className="def-field__required">*</span></label>
            <input className="def-field__input" name="city" value={form.city}
              onChange={handleChange} placeholder="Ej: Cochabamba" maxLength={255} required />
          </div>
        </div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">País<span className="def-field__required">*</span></label>
            <select
              className="def-field__select"
              name="id_country"
              value={form.id_country}
              onChange={handleChange}
              disabled={isLoadingCountries}
              required
            >
              <option value="">
                {isLoadingCountries ? "Cargando paises..." : "Selecciona un pais"}
              </option>
              {countries.map((country) => (
                <option key={country.id_country} value={country.id_country}>
                  {country.name}
                </option>
              ))}
            </select>
            <span className="def-field__hint">
              {countriesError || "Referencia al pais de la compania"}
            </span>
          </div>
          <div className="def-field">
            <label className="def-field__label">Sitio Web</label>
            <input className="def-field__input" name="website" value={form.website}
              onChange={handleChange} placeholder="https://empresa.com" maxLength={255} type="url" />
          </div>
        </div>

        <div className="def-form__divider">Contacto telefónico</div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Prefijo</label>
            <input className="def-field__input" name="phone_prefix" value={form.phone_prefix}
              onChange={handleChange} placeholder="+591" maxLength={10} />
          </div>
          <div className="def-field">
            <label className="def-field__label">Teléfono <span className="def-field__required">*</span></label>
            <input className="def-field__input" name="phone" value={form.phone}
              onChange={handleChange} placeholder="70000000" maxLength={30} required />
          </div>
        </div>

        <div className="def-form__divider">Recursos visuales</div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">URL del Logo</label>
            <input className="def-field__input" name="logo_url" value={form.logo_url}
              onChange={handleChange} placeholder="https://cdn.empresa.com/logo.png" maxLength={255} />
          </div>
          <div className="def-field">
            <label className="def-field__label">URL del Banner</label>
            <input className="def-field__input" name="banner_url" value={form.banner_url}
              onChange={handleChange} placeholder="https://cdn.empresa.com/banner.jpg" maxLength={255} />
          </div>
        </div>

        <div className="def-form__divider">Descripción y valores</div>
        <div className="def-form__row--full def-field">
          <label className="def-field__label">Descripción</label>
          <textarea className="def-field__textarea" name="description" value={form.description}
            onChange={handleChange} placeholder="Descripción general..." maxLength={500} />
          <span className="def-field__hint">Máx. 500 caracteres</span>
        </div>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Misión</label>
            <textarea className="def-field__textarea" name="mission" value={form.mission}
              onChange={handleChange} placeholder="Misión de la empresa..." maxLength={500} />
          </div>
          <div className="def-field">
            <label className="def-field__label">Visión</label>
            <textarea className="def-field__textarea" name="vision" value={form.vision}
              onChange={handleChange} placeholder="Visión de la empresa..." maxLength={500} />
          </div>
        </div>

        <div className="def-form__actions">
          <button type="submit" className="def-btn def-btn--primary"><Save size={14} /> Guardar Compañía</button>
        </div>
      </form>

      <DefinicionConfirmModal
        isOpen={modal} isBusy={isBusy} error={error} entidad="Compañía"
        resumen={[
          { label: "Nombre",    value: form.name },
          { label: "Industria", value: form.industry },
          { label: "Ciudad",    value: form.city },
          { label: "Teléfono",  value: `${form.phone_prefix} ${form.phone}`.trim() },
          { label: "Estado",    value: STATE_LABEL[form.state] ?? form.state },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
