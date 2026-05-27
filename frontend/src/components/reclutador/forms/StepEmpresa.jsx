import { Building2, MapPin, ChevronDown, Search } from "lucide-react";
import { StepWrapper, IconCircle, FieldError, FieldHint, InputWrap, Actions } from "./Formui";
import { RUBROS, PAISES, PAISES_CIUDADES } from "./constants";

export default function StepEmpresa({
  rubro, setRubro,
  rubroSugs, setRubroSugs,
  ciudad, setCiudad,
  pais, setPais,
  errors, setErrors,
  onNext, onBack,
}) {
  const inputStyle = (hasError) => ({ borderColor: hasError ? "#e24b4a" : undefined });

  /* ── Rubro autocomplete ─────────────────────────────────── */
  const handleRubroChange = (val) => {
    setRubro(val);
    const q = val.toLowerCase();
    setRubroSugs(q ? RUBROS.filter(r => r.toLowerCase().includes(q)).slice(0, 5) : []);
  };

  const selectRubro = (val) => {
    setRubro(val);
    setRubroSugs([]);
    setErrors(e => ({ ...e, rubro: undefined }));
  };

  /* ── Cambio de país — resetea ciudad ────────────────────── */
  const handlePaisChange = (val) => {
    setPais(val);
    setCiudad("");
    setErrors(e => ({ ...e, pais: undefined, ciudad: undefined }));
  };

  const ciudadesDisponibles = pais ? PAISES_CIUDADES[pais] ?? [] : [];

  return (
    <StepWrapper stepKey="paso-empresa">
      <IconCircle><Search size={24} color="#fff" /></IconCircle>

      <h2 className="forms-card__title" style={{ textAlign: "center" }}>
        Información de la empresa
      </h2>
      <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
        Ayuda a los candidatos a entender el contexto de tu empresa.
      </p>

      {/* Rubro con autocompletado */}
      <div className="forms-field" style={{ position: "relative" }}>
        <label className="forms-label">Rubro o industria</label>
        <InputWrap icon={<Building2 size={15} />}>
          <input
            type="text"
            className="forms-input"
            value={rubro}
            onChange={e => handleRubroChange(e.target.value)}
            placeholder="Ej. Tecnología, Salud, Finanzas..."
            autoComplete="off"
            style={inputStyle(errors.rubro)}
          />
        </InputWrap>
        {errors.rubro
          ? <FieldError msg={errors.rubro} />
          : <FieldHint msg="Empieza a escribir para ver sugerencias" />
        }
        {rubroSugs.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "var(--color-surface)", zIndex: 10,
            border: "1.5px solid rgba(162,214,249,.40)",
            borderRadius: 12, overflow: "hidden", marginTop: 4,
          }}>
            {rubroSugs.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => selectRubro(s)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "10px 14px", background: "none", border: "none",
                  cursor: "pointer", fontSize: 13, color: "var(--color-text)",
                  fontFamily: "var(--font-body)", transition: "background .15s",
                }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(162,214,249,.10)"}
                onMouseOut={e => e.currentTarget.style.background = "none"}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* País */}
      <div className="forms-field" style={{ marginTop: 12 }}>
        <label className="forms-label">País</label>
        <InputWrap icon={<ChevronDown size={15} />}>
          <select
            className="forms-input"
            value={pais}
            onChange={e => handlePaisChange(e.target.value)}
            style={inputStyle(errors.pais)}
          >
            <option value="">Seleccionar país</option>
            {PAISES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </InputWrap>
        {errors.pais && <FieldError msg={errors.pais} />}
      </div>

      {/* Ciudad */}
      <div className="forms-field" style={{ marginTop: 12 }}>
        <label className="forms-label">Ciudad</label>
        <InputWrap icon={<MapPin size={15} />}>
          <select
            className="forms-input"
            value={ciudad}
            onChange={e => {
              setCiudad(e.target.value);
              setErrors(er => ({ ...er, ciudad: undefined }));
            }}
            disabled={!pais}
            style={{
              ...inputStyle(errors.ciudad),
              opacity: !pais ? 0.5 : 1,
              cursor: !pais ? "not-allowed" : "pointer",
            }}
          >
            <option value="">
              {pais ? "Seleccionar ciudad" : "Primero selecciona un país"}
            </option>
            {ciudadesDisponibles.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </InputWrap>
        {errors.ciudad
          ? <FieldError msg={errors.ciudad} />
          : !pais && <FieldHint msg="Selecciona un país para ver las ciudades disponibles" />
        }
      </div>

      <Actions onNext={onNext} nextLabel="Continuar" onBack={onBack} backLabel="Volver" />
    </StepWrapper>
  );
}