// src/components/admin/components/Definicion/CarreraForm.jsx
import { useState } from "react";
import { Save } from "lucide-react";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = { name: "", description: "", state: "activate" };

const STATE_LABEL = { activate: "Activo", deactivate: "Desactivo" };

export default function CarreraForm({ onGuardar, onCancelar }) {
  const [form, setForm]     = useState(initialState);
  const [modal, setModal]   = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError]   = useState("");

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
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Nombre <span className="def-field__required">*</span></label>
            <input className="def-field__input" name="name" value={form.name}
              onChange={handleChange} placeholder="Ej: Ingeniería de Sistemas" maxLength={255} required />
            <span className="def-field__hint">Debe ser único en el sistema</span>
          </div>
          <div className="def-field">
            <label className="def-field__label">Estado <span className="def-field__required">*</span></label>
            <select className="def-field__select" name="state" value={form.state} onChange={handleChange}>
              <option value="activate">Activo</option>
              <option value="deactivate">Desactivo</option>
            </select>
          </div>
        </div>

        <div className="def-form__row--full def-field">
          <label className="def-field__label">Descripción <span className="def-field__required">*</span></label>
          <textarea className="def-field__textarea" name="description" value={form.description}
            onChange={handleChange} placeholder="Descripción general de la carrera..." maxLength={255} />
        </div>

        <div className="def-form__actions">
          <button type="submit" className="def-btn def-btn--primary"><Save size={14} /> Guardar Carrera</button>
        </div>
      </form>

      <DefinicionConfirmModal
        isOpen={modal} isBusy={isBusy} error={error} entidad="Carrera"
        resumen={[
          { label: "Nombre",      value: form.name },
          { label: "Estado",      value: STATE_LABEL[form.state] ?? form.state },
          { label: "Descripción", value: form.description },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
