import { Building2, FileText } from "lucide-react";
import { StepWrapper, IconCircle, FieldError, FieldHint, InputWrap, Actions } from "./Formui";

export default function StepIdentidad({ empresa, setEmpresa, descripcion, setDescripcion, errors, onNext }) {
  const inputStyle = (hasError) => ({ borderColor: hasError ? "#e24b4a" : undefined });

  return (
    <StepWrapper stepKey="paso-identidad">
      <IconCircle><Building2 size={24} color="#fff" /></IconCircle>

      <h2 className="forms-card__title" style={{ textAlign: "center" }}>
        Identidad básica
      </h2>
      <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
        Cuéntanos sobre la empresa que representas.
      </p>

      {/* Nombre */}
      <div className="forms-field">
        <label className="forms-label">Nombre de la empresa</label>
        <InputWrap icon={<Building2 size={15} />}>
          <input
            type="text"
            className="forms-input"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            placeholder="Ej. Acme Corp"
            style={inputStyle(errors.empresa)}
          />
        </InputWrap>
        {errors.empresa
          ? <FieldError msg={errors.empresa} />
          : <FieldHint msg="Nombre legal o comercial de la empresa" />
        }
      </div>

      {/* Descripción */}
      <div className="forms-field" style={{ marginTop: 12 }}>
        <label className="forms-label">Descripción</label>
        <InputWrap icon={<FileText size={15} />} textarea>
          <textarea
            className="forms-input"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Describe brevemente a qué se dedica la empresa, su misión y cultura de trabajo..."
            maxLength={300}
            rows={4}
            style={inputStyle(errors.descripcion)}
          />
        </InputWrap>
        {errors.descripcion && <FieldError msg={errors.descripcion} />}
        <p className="forms-char-count">
          {descripcion.length} / 300
        </p>
      </div>

      <Actions onNext={onNext} nextLabel="Continuar" />
    </StepWrapper>
  );
}