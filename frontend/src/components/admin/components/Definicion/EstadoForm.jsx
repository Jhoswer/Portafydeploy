// src/components/admin/components/Definicion/EstadoForm.jsx
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getCountries } from "../../../../services/definitionService";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = { id_country: "", name: "", state: "activate" };

const STATE_LABEL = { activate: "Activado", deactivate: "Desactivado" };

export default function EstadoForm({ onGuardar, onCancelar }) {
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
      try {
        const data = await getCountries();
        if (isMounted) setCountries(data);
      } catch (err) {
        if (isMounted) setCountriesError(err.message);
      } finally {
        if (isMounted) setIsLoadingCountries(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleChange  = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };
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

  const countryLabel = countries.find((c) => String(c.id_country) === String(form.id_country))?.name ?? form.id_country;

  return (
    <>
      <form className="def-form" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Nombre del Estado/Departamento <span className="def-field__required">*</span></label>
            <input className="def-field__input" name="name" value={form.name}
              onChange={handleChange} placeholder="Ej: Cochabamba" maxLength={255} required />
          </div>
          <div className="def-field">
            <label className="def-field__label">País <span className="def-field__required">*</span></label>
            <select className="def-field__select" name="id_country" value={form.id_country}
              onChange={handleChange} disabled={isLoadingCountries} required>
              <option value="">{isLoadingCountries ? "Cargando países..." : "Selecciona un país"}</option>
              {countries.map((c) => (
                <option key={c.id_country} value={c.id_country}>{c.name}</option>
              ))}
            </select>
            <span className="def-field__hint">{countriesError || "Referencia al país del estado"}</span>
          </div>
        </div>

        <div className="def-form__row--full def-field">
          <label className="def-field__label">Estado <span className="def-field__required">*</span></label>
          <select className="def-field__select" name="state" value={form.state} onChange={handleChange}>
            <option value="activate">Activado</option>
            <option value="deactivate">Desactivado</option>
          </select>
        </div>

        <div className="def-form__actions">
          <button type="submit" className="def-btn def-btn--primary"><Save size={14} /> Guardar Estado</button>
        </div>
      </form>

      <DefinicionConfirmModal
        isOpen={modal} isBusy={isBusy} error={error} entidad="Estado / Departamento"
        resumen={[
          { label: "Nombre", value: form.name },
          { label: "País",   value: countryLabel },
          { label: "Estado", value: STATE_LABEL[form.state] ?? form.state },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
