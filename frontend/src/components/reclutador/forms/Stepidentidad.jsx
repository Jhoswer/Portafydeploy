import { useTranslation } from "react-i18next";
import { Building2, FileText } from "lucide-react";
import { StepWrapper, IconCircle, FieldError, FieldHint, InputWrap, Actions } from "./Formui";

export default function StepIdentidad({ empresa, setEmpresa, descripcion, setDescripcion, errors, onNext }) {
  const { t } = useTranslation();
  const inputStyle = (hasError) => ({ borderColor: hasError ? "#e24b4a" : undefined });

  return (
    <StepWrapper stepKey="paso-identidad">
      <IconCircle><Building2 size={24} color="#fff" /></IconCircle>

      <h2 className="forms-card__title" style={{ textAlign: "center" }}>
        {t("recruiterForms.stepIdentidad.title")}
      </h2>
      <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
        {t("recruiterForms.stepIdentidad.subtitle")}
      </p>

      <div className="forms-field">
        <label className="forms-label">
          {t("recruiterForms.stepIdentidad.empresa.label")}
        </label>
        <InputWrap icon={<Building2 size={15} />}>
          <input
            type="text"
            className="forms-input"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            placeholder={t("recruiterForms.stepIdentidad.empresa.placeholder")}
            style={inputStyle(errors.empresa)}
          />
        </InputWrap>
        {errors.empresa
          ? <FieldError msg={errors.empresa} />
          : <FieldHint msg={t("recruiterForms.stepIdentidad.empresa.hint")} />
        }
      </div>

      <div className="forms-field" style={{ marginTop: 12 }}>
        <label className="forms-label">
          {t("recruiterForms.stepIdentidad.descripcion.label")}
        </label>
        <InputWrap icon={<FileText size={15} />} textarea>
          <textarea
            className="forms-input"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder={t("recruiterForms.stepIdentidad.descripcion.placeholder")}
            maxLength={300}
            rows={4}
            style={inputStyle(errors.descripcion)}
          />
        </InputWrap>
        {errors.descripcion && <FieldError msg={errors.descripcion} />}
        <p className="forms-char-count">
          {t("recruiterForms.stepIdentidad.descripcion.charCount", {
            current: descripcion.length,
            max: 300,
          })}
        </p>
      </div>

      <Actions
        onNext={onNext}
        nextLabel={t("recruiterForms.common.continue")}
      />
    </StepWrapper>
  );
}