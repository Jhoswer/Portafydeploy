// src/components/admin/components/Definicion/DefinicionSelector.jsx
import {
  Globe, Lightbulb, Bookmark, BookOpen,
  GraduationCap, Building2, Layers, Eye, EyeOff,
} from "lucide-react";

export const OPCIONES = [
  { id: "pais",        label: "País",        Icon: Globe         },
  { id: "habilidad",   label: "Habilidad",   Icon: Lightbulb     },
  { id: "estado",      label: "Estado",      Icon: Bookmark      },
  { id: "universidad", label: "Universidad", Icon: BookOpen      },
  { id: "carrera",     label: "Carrera",     Icon: GraduationCap },
  { id: "compania",    label: "Compañía",    Icon: Building2     },
  { id: "area",        label: "Área",        Icon: Layers        },
];

// visible y onToggleVisible ahora vienen de Definicion.jsx (estado compartido)
export default function DefinicionSelector({ seleccionado, onSeleccionar, visible, onToggleVisible }) {
  return (
    <div className="def-selector">

      {/* ── Cabecera: ojo + etiqueta ── */}
      <div className="def-selector__header">
        <button
          type="button"
          className={`def-selector__item def-selector__item--eye${visible ? " def-selector__item--active" : ""}`}
          onClick={onToggleVisible}
          aria-label={visible ? "Cambiar a formulario" : "Cambiar a vista de registros"}
          aria-pressed={visible}
        >
          <span className="def-selector__icon">
            {visible
              ? <Eye    size={16} strokeWidth={2} />
              : <EyeOff size={16} strokeWidth={2} />}
          </span>
        </button>
        <p className="def-section-label" style={{ margin: 0 }}>
          {visible ? "Vista de registros activa" : "Selecciona una entidad para definir"}
        </p>
      </div>

      {/* ── Grilla de entidades (siempre visible) ── */}
      <div className="def-selector__grid">
        {OPCIONES.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`def-selector__item${seleccionado === id ? " def-selector__item--active" : ""}`}
            onClick={() => onSeleccionar(seleccionado === id ? null : id)}
            type="button"
            aria-pressed={seleccionado === id}
          >
            <span className="def-selector__icon">
              <Icon size={16} strokeWidth={2} />
            </span>
            <span className="def-selector__label">{label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}