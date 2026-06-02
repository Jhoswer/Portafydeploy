import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = { name: "", state: "activate" };

export default function PaisForm({ onGuardar, onCancelar }) {
  const { t } = useTranslation();
  const p = "admin.definicion.paisForm";

  const [form, setForm]     = useState(initialState);
  const [modal, setModal]   = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError]   = useState("");

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

  return (
    <>
      <form className="def-form" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.nameLabel`)} <span className="def-field__required">*</span>
            </label>
            <input className="def-field__input" name="name" value={form.name}
              onChange={handleChange} placeholder={t(`${p}.namePlaceholder`)}
              maxLength={255} required />
            <span className="def-field__hint">{t(`${p}.nameHint`)}</span>
          </div>
          <div className="def-field">
            <label className="def-field__label">
              {t(`${p}.stateLabel`)} <span className="def-field__required">*</span>
            </label>
            <select className="def-field__select" name="state" value={form.state}
              onChange={handleChange} required>
              <option value="activate">{t(`${p}.stateActivate`)}</option>
              <option value="deactivate">{t(`${p}.stateDeactivate`)}</option>
            </select>
            <span className="def-field__hint">{t(`${p}.stateHint`)}</span>
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
          { label: t(`${p}.summaryName`),  value: form.name },
          { label: t(`${p}.summaryState`), value: STATE_LABEL[form.state] ?? form.state },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
