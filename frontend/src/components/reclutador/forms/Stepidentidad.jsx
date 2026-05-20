import { Building2, FileText } from "lucide-react";
import { StepWrapper, IconCircle, FieldError, FieldHint, InputWrap, Actions } from "./Formui";

export default function StepIdentidad({ empresa, setEmpresa, descripcion, setDescripcion, errors, onNext }) {
  const inputStyle = (hasError) => ({ borderColor: hasError ? "#e24b4a" : undefined });

  return (
    <StepWrapper stepKey="paso-identidad">
      <IconCircle><Building2 size={24} color="#FF6B6B" /></IconCircle>
      <h2 className="auth-card__title" style={{ textAlign: "center" }}>
        Identidad básica
      </h2>
      <p className="auth-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
        Cuéntanos sobre la empresa que representas.
      </p>

      {/* Nombre */}
      <div className="auth-field" style={{ width: "100%" }}>
        <label className="auth-label">Nombre de la empresa</label>
        <InputWrap icon={<Building2 size={15} />}>
          <input
            type="text"
            className="auth-input"
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
      <div className="auth-field" style={{ width: "100%", marginTop: 12 }}>
        <label className="auth-label">Descripción</label>
        <InputWrap icon={<FileText size={15} />}>
          <textarea
            className="auth-input"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Describe brevemente a qué se dedica la empresa, su misión y cultura de trabajo..."
            maxLength={300}
            rows={4}
            style={{
              paddingTop: 10, paddingBottom: 10,
              resize: "none", height: "auto",
              ...inputStyle(errors.descripcion),
            }}
          />
        </InputWrap>
        {errors.descripcion && <FieldError msg={errors.descripcion} />}
        <p style={{
          fontFamily: "var(--f-body)", fontSize: 12,
          color: "var(--muted)", textAlign: "right", marginTop: 4,
        }}>
          {descripcion.length} / 300
        </p>
      </div>

      <Actions onNext={onNext} nextLabel="Continuar" />
    </StepWrapper>
  );
}