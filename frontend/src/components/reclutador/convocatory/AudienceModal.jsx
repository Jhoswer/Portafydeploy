import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Globe, Users, SlidersHorizontal,
  ChevronRight, Check, ChevronDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Datos — Bolivia
───────────────────────────────────────────────────────────── */
export const PROFESSIONAL_AREAS = [
  { id: 1,  name: "Tecnología e Ingeniería",   careers: ["Ingeniería de Sistemas","Ingeniería Informática","Ingeniería de Software","Ingeniería Electrónica","Ingeniería Eléctrica","Ingeniería Industrial","Ingeniería Mecánica","Ingeniería Civil","Ingeniería Ambiental","Ingeniería de Telecomunicaciones"] },
  { id: 2,  name: "Ciencias Económicas",        careers: ["Administración de Empresas","Contaduría Pública","Economía","Auditoría","Finanzas","Comercio Internacional","Marketing","Gestión Pública"] },
  { id: 3,  name: "Ciencias de la Salud",       careers: ["Medicina","Enfermería","Odontología","Farmacia y Bioquímica","Fisioterapia y Kinesiología","Nutrición y Dietética","Optometría","Radiología e Imagen"] },
  { id: 4,  name: "Ciencias Jurídicas",         careers: ["Derecho","Ciencias Políticas","Relaciones Internacionales"] },
  { id: 5,  name: "Arquitectura y Construcción",careers: ["Arquitectura","Ingeniería Civil","Diseño de Interiores","Urbanismo"] },
  { id: 6,  name: "Ciencias de la Educación",   careers: ["Ciencias de la Educación","Educación Primaria","Educación Inicial","Educación Especial","Lingüística e Idiomas"] },
  { id: 7,  name: "Ciencias Sociales",          careers: ["Comunicación Social","Psicología","Trabajo Social","Sociología","Periodismo"] },
  { id: 8,  name: "Ciencias Exactas",           careers: ["Matemáticas","Física","Química","Estadística","Biología"] },
  { id: 9,  name: "Agropecuaria y Veterinaria", careers: ["Agronomía","Veterinaria y Zootecnia","Ingeniería Agronómica","Recursos Naturales y Medio Ambiente","Ingeniería Forestal"] },
  { id: 10, name: "Arte y Diseño",              careers: ["Diseño Gráfico","Diseño Industrial","Artes Plásticas","Música","Arquitectura de Interiores"] },
];

const MAIN_OPTIONS = [
  { val: "public",        Icon: Globe,             color: "#1a6fbd", bg: "#e6f1fb", title: "Todo el mundo",       sub: "Cualquier persona en Portafy puede verla" },
  { val: "followers",     Icon: Users,             color: "#534AB7", bg: "#EEEDFE", title: "Mis seguidores",      sub: "Solo las personas que te siguen"           },
  { val: "professionals", Icon: SlidersHorizontal, color: "#854F0B", bg: "#FAEEDA", title: "Tipo de profesional", sub: null },
];

/* ── Dropdown genérico reutilizable ─────────────────────────── */
function Dropdown({ label, placeholder, value, options, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="aud-cascade-field" ref={ref}>
      <label className="aud-field-label">{label}</label>
      <button
        type="button"
        disabled={disabled}
        className={`aud-cascade-trigger ${open ? "aud-cascade-trigger--open" : ""} ${disabled ? "aud-cascade-trigger--disabled" : ""}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        <span className={value ? "aud-cascade-value" : "aud-cascade-placeholder"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`aud-cascade-chevron ${open ? "aud-cascade-chevron--open" : ""}`} />
      </button>

      {open && (
        <div className="aud-cascade-menu">
          {options.map(opt => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                className={`aud-cascade-option ${isSelected ? "aud-cascade-option--selected" : ""}`}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                <span>{opt}</span>
                {isSelected && <Check size={14} color="#854F0B" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Modal principal
───────────────────────────────────────────────────────────── */
export default function AudienceModal({
  currentAudience = "public",
  currentFilters  = { id_professional_area: null, career: null },
  onClose,
  onConfirm,
}) {
  const [view,         setView]         = useState("main");
  const [selected,     setSelected]     = useState(currentAudience);
  const [selectedArea, setSelectedArea] = useState(
    currentFilters.id_professional_area
      ? PROFESSIONAL_AREAS.find(a => a.id === currentFilters.id_professional_area) ?? null
      : null
  );
  const [selectedCareer, setSelectedCareer] = useState(currentFilters.career ?? null);

  const handleAreaChange = (areaName) => {
    const area = PROFESSIONAL_AREAS.find(a => a.name === areaName);
    setSelectedArea(area ?? null);
    setSelectedCareer(null); // resetear carrera al cambiar área
  };

  const profSummary = () => {
    if (!selectedArea) return "Filtra por área y carrera";
    if (!selectedCareer) return selectedArea.name;
    return `${selectedArea.name} · ${selectedCareer}`;
  };

  const handleConfirmProfessional = () => {
    setSelected("professionals");
    setView("main");
  };

  const handleBack = () => {
    if (view === "professionals") { setView("main"); return; }
    onClose();
  };

  const handleDone = () => {
    onConfirm({
      audience: selected,
      filters: selected === "professionals"
        ? { id_professional_area: selectedArea?.id ?? null, career: selectedCareer }
        : null,
    });
  };

  return (
    <div className="aud-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="aud-modal">

        {/* Header */}
        <div className="aud-header">
          <button type="button" className="aud-back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
          </button>
          <div className="aud-header-text">
            <h2>{view === "main" ? "Audiencia de la convocatoria" : "Tipo de profesional"}</h2>
            <p>{view === "main" ? "¿Quién puede ver y postularse?" : "Filtra por área y carrera"}</p>
          </div>
        </div>

        {/* ══ Vista principal ══ */}
        {view === "main" && (
          <>
            <div className="aud-list">
              {MAIN_OPTIONS.map(({ val, Icon, color, bg, title, sub }) => {
                const isSelected      = selected === val;
                const isProfessionals = val === "professionals";
                return (
                  <div
                    key={val}
                    className={`aud-item ${isSelected ? "aud-item--selected" : ""}`}
                    onClick={() => isProfessionals ? setView("professionals") : setSelected(val)}
                  >
                    <div className="aud-icon" style={{ background: bg, color }}>
                      <Icon size={22} />
                    </div>
                    <div className="aud-text">
                      <div className="aud-title">{title}</div>
                      <div className="aud-sub">{isProfessionals ? profSummary() : sub}</div>
                    </div>
                    {isProfessionals
                      ? <ChevronRight size={16} color="#aaa" />
                      : <div className={`aud-radio ${isSelected ? "aud-radio--checked" : ""}`} />
                    }
                  </div>
                );
              })}
            </div>
            <div className="aud-footer">
              <button type="button" className="aud-btn-done" onClick={handleDone}>
                Listo
              </button>
            </div>
          </>
        )}

        {/* ══ Vista profesional — dos dropdowns en cascada ══ */}
        {view === "professionals" && (
          <>
            <div className="aud-cascade-body">

              {/* Dropdown 1: Área */}
              <Dropdown
                label="Área"
                placeholder="Selecciona un área..."
                value={selectedArea?.name ?? null}
                options={PROFESSIONAL_AREAS.map(a => a.name)}
                onChange={handleAreaChange}
              />

              {/* Dropdown 2: Carrera — deshabilitado hasta elegir área */}
              <Dropdown
                label="Carrera"
                placeholder={selectedArea ? "Selecciona una carrera..." : "Primero elige un área"}
                value={selectedCareer}
                options={selectedArea?.careers ?? []}
                onChange={setSelectedCareer}
                disabled={!selectedArea}
              />

              {/* Preview cuando hay selección */}
              {selectedArea && (
                <div className="aud-cascade-preview">
                  <SlidersHorizontal size={13} color="#854F0B" />
                  <span>
                    {selectedCareer
                      ? `${selectedArea.name} · ${selectedCareer}`
                      : `Toda el área de ${selectedArea.name}`}
                  </span>
                </div>
              )}

            </div>

            <div className="aud-footer">
              <button
                type="button"
                className="aud-btn-done aud-btn-done--professional"
                onClick={handleConfirmProfessional}
                disabled={!selectedArea}
              >
                {!selectedArea
                  ? "Elige un área para continuar"
                  : selectedCareer
                    ? `Aplicar · ${selectedCareer}`
                    : `Aplicar · ${selectedArea.name}`}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}