import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = { name: "", description: "" };

export default function AreaForm({ onGuardar, onCancelar }) {
  const { t } = useTranslation();
  const p = "admin.definicion.areaForm";
  const [form, setForm]     = useState(initialState);
  const [modal, setModal]   = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError]   = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setModal(true);
  };

  const handleConfirm = async () => {
    setIsBusy(true);
    setError("");

    try {
      await onGuardar?.(form);
      setModal(false);
      setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleReset = () => {
    setForm(initialState);
    onCancelar?.();
  };

  return (
    <>
      <form className="def-form" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="def-form__row--full def-field">
          <label className="def-field__label">
            {t("admin.definicion.areaForm.nameLabel")}
            <span className="def-field__required">
              {t("admin.definicion.areaForm.nameRequired")}
            </span>
          </label>
          <input
            className="def-field__input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t("admin.definicion.areaForm.namePlaceholder")}
            maxLength={255}
            required
          />
          <span className="def-field__hint">
            {t("admin.definicion.areaForm.nameHint")}
          </span>
        </div>

        <div className="def-form__row--full def-field">
          <label className="def-field__label">
            {t("admin.definicion.areaForm.descriptionLabel")}
            <span className="def-field__required">
              {t("admin.definicion.areaForm.descriptionRequired")}
            </span>
          </label>
          <textarea
            className="def-field__textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t("admin.definicion.areaForm.descriptionPlaceholder")}
            maxLength={255}
            required
          />
          <span className="def-field__hint">
            {t("admin.definicion.areaForm.descriptionHint")}
          </span>
        </div>

        <div className="def-form__actions">
          <button type="submit" className="def-btn def-btn--primary">
            <Save size={14} /> {t("admin.definicion.areaForm.saveButton")}
          </button>
        </div>
      </form>

      <DefinicionConfirmModal
        isOpen={modal}
        isBusy={isBusy}
        error={error}
        entidad={t(`${p}.entityName`)}
        resumen={[
          { label: t("admin.definicion.areaForm.nameLabel"),        value: form.name },
          { label: t("admin.definicion.areaForm.descriptionLabel"), value: form.description },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
