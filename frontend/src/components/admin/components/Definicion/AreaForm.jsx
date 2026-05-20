// src/components/admin/components/Definicion/AreaForm.jsx
import { useState } from "react";
import { Save } from "lucide-react";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = { name: "", description: "" };

export default function AreaForm({ onGuardar, onCancelar }) {
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
        <div className="def-form__row--full def-field">
          <label className="def-field__label">Nombre <span className="def-field__required">*</span></label>
          <input className="def-field__input" name="name" value={form.name}
            onChange={handleChange} placeholder="Ej: Desarrollo de Software" maxLength={255} required />
          <span className="def-field__hint">Debe ser único en el sistema</span>
        </div>

        <div className="def-form__row--full def-field">
          <label className="def-field__label">Descripción <span className="def-field__required">*</span></label>
          <textarea className="def-field__textarea" name="description" value={form.description}
            onChange={handleChange} placeholder="Describe el área de conocimiento o trabajo..." maxLength={255} required />
          <span className="def-field__hint">Máx. 255 caracteres</span>
        </div>

        <div className="def-form__actions">
          <button type="submit" className="def-btn def-btn--primary"><Save size={14} /> Guardar Área</button>
        </div>
      </form>

      <DefinicionConfirmModal
        isOpen={modal} isBusy={isBusy} error={error} entidad="Área"
        resumen={[
          { label: "Nombre",      value: form.name },
          { label: "Descripción", value: form.description },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
