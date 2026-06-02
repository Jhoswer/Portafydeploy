import { useTranslation } from "react-i18next";
import {
  Globe, Lightbulb, Bookmark, BookOpen,
  GraduationCap, Building2, Layers, Eye, EyeOff,
} from "lucide-react";

const OPCIONES_BASE = [
  { id: "pais",        Icon: Globe         },
  { id: "habilidad",   Icon: Lightbulb     },
  { id: "estado",      Icon: Bookmark      },
  { id: "universidad", Icon: BookOpen      },
  { id: "carrera",     Icon: GraduationCap },
  { id: "compania",    Icon: Building2     },
  { id: "area",        Icon: Layers        },
];

export default function DefinicionSelector({ seleccionado, onSeleccionar, visible, onToggleVisible }) {
  const { t } = useTranslation();
  const s = "admin.definicion.selector";

  return (
    <div className="def-selector">

      {/* ── Cabecera: ojo + etiqueta ── */}
      <div className="def-selector__header">
        <button
          type="button"
          className={`def-selector__item def-selector__item--eye${visible ? " def-selector__item--active" : ""}`}
          onClick={onToggleVisible}
          aria-label={visible ? t(`${s}.ariaEyeOn`) : t(`${s}.ariaEyeOff`)}
          aria-pressed={visible}
        >
          <span className="def-selector__icon">
            {visible
              ? <Eye    size={16} strokeWidth={2} />
              : <EyeOff size={16} strokeWidth={2} />}
          </span>
        </button>
        <p className="def-section-label" style={{ margin: 0 }}>
          {visible ? t(`${s}.labelRecords`) : t(`${s}.labelForm`)}
        </p>
      </div>

      {/* ── Grilla de entidades ── */}
      <div className="def-selector__grid">
        {OPCIONES_BASE.map(({ id, Icon }) => (
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
            <span className="def-selector__label">
              {t(`${s}.opciones.${id}`)}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}