import { useTranslation } from "react-i18next";
import { Phone, Globe } from "lucide-react";
import { StepWrapper, IconCircle, FieldError, FieldHint, InputWrap, OptionalBadge, Actions } from "./Formui";
import { PREFIJOS } from "./constants";

export default function StepContacto({
  prefijo, setPrefijo,
  telefono, setTelefono,
  sitio, setSitio,
  errors, serverError,
  onNext, onBack,
  loading,
}) {
  const { t } = useTranslation();
  const inputStyle = (hasError) => ({ borderColor: hasError ? "#e24b4a" : undefined });

  return (
    <StepWrapper stepKey="paso-contacto">
      <IconCircle><Phone size={24} color="#fff" /></IconCircle>

      <h2 className="forms-card__title" style={{ textAlign: "center" }}>
        {t("recruiterForms.stepContacto.title")}
      </h2>
      <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
        {t("recruiterForms.stepContacto.subtitle")}
      </p>

      <div className="forms-field">
        <label className="forms-label">
          {t("recruiterForms.stepContacto.telefono.label")}
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={prefijo}
            onChange={e => setPrefijo(e.target.value)}
            className="forms-input forms-input--no-icon"
            style={{ width: 100, flexShrink: 0 }}
          >
            {PREFIJOS.map(p => (
              <option key={p.code} value={p.code}>
                {p.flag} {p.code}
              </option>
            ))}
          </select>
          <InputWrap icon={<Phone size={15} />}>
            <input
              type="tel"
              className="forms-input"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder={t("recruiterForms.stepContacto.telefono.placeholder")}
              style={{ flex: 1, ...inputStyle(errors.telefono) }}
            />
          </InputWrap>
        </div>
        {errors.telefono
          ? <FieldError msg={errors.telefono} />
          : <FieldHint msg={t("recruiterForms.stepContacto.telefono.hint")} />
        }
      </div>

      <div className="forms-field" style={{ marginTop: 12 }}>
        <label className="forms-label">
          {t("recruiterForms.stepContacto.sitio.label")} <OptionalBadge />
        </label>
        <InputWrap icon={<Globe size={15} />}>
          <input
            type="url"
            className="forms-input"
            value={sitio}
            onChange={e => setSitio(e.target.value)}
            placeholder={t("recruiterForms.stepContacto.sitio.placeholder")}
            style={inputStyle(errors.sitio)}
          />
        </InputWrap>
        {errors.sitio
          ? <FieldError msg={errors.sitio} />
          : <FieldHint msg={t("recruiterForms.stepContacto.sitio.hint")} />
        }
      </div>

      {serverError && (
        <div className="forms-alert" style={{ marginTop: 12 }}>
          {serverError}
        </div>
      )}

      <Actions
        onNext={onNext}
        nextLabel={t("recruiterForms.stepContacto.submit")}
        onBack={onBack}
        backLabel={t("recruiterForms.common.back")}
        loading={loading}
      />
    </StepWrapper>
  );
}