import { useState } from "react";
import { ChevronDown, Calendar, RotateCcw, Upload } from "lucide-react";
import { SUGERENCIA_TYPE_OPTIONS } from "../../../../services/sugerenciaService";
import AdminActionButton from "../AdminActionButton";
import "../../../../styles/components/admin/Adminfilterbar.css";

/**
 * Barra de filtros para el módulo de Sugerencias.
 *
 * Props:
 *  - activeType        string        Tipo activo (key de SUGERENCIA_TYPE_OPTIONS)
 *  - onTypeChange      fn(key)       Callback al cambiar tipo
 *  - dateFrom          string        Fecha inicio (YYYY-MM-DD)
 *  - dateTo            string        Fecha fin    (YYYY-MM-DD)
 *  - onDateFromChange  fn(value)
 *  - onDateToChange    fn(value)
 *  - onClear           fn()          Limpiar filtros
 *  - onRefresh         fn()          Refrescar lista
 *  - onExport          fn()          Exportar
 */
export default function SugerenciaFilterBar({
  activeType,
  onTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  onRefresh,
  onExport,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* Etiqueta del tipo activo */
  const selectedLabel =
    SUGERENCIA_TYPE_OPTIONS.find((opt) => opt.key === activeType)?.label ?? "Todos";

  return (
    <div className="adm-filterbar">

      {/* ── Fila superior: acciones ── */}
      <div className="adm-filterbar__toprow">
        <AdminActionButton className="adm-btn--outline" onClick={onRefresh}>
          <RotateCcw size={14} /> Actualizar
        </AdminActionButton>
        <AdminActionButton className="adm-btn--outline" onClick={onExport}>
          <Upload size={14} /> Exportar
        </AdminActionButton>
      </div>

      {/* ── Fila de filtros ── */}
      <div className="adm-filterbar__row">

        {/* Dropdown: Tipo de sugerencia */}
        <div className="adm-dropdown">
          <button
            type="button"
            className="adm-dropdown__trigger"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            {selectedLabel}
            <ChevronDown
              size={14}
              className={dropdownOpen ? "adm-dropdown__chevron--open" : ""}
            />
          </button>

          {dropdownOpen && (
            <div className="adm-dropdown__menu" role="listbox">
              {SUGERENCIA_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  role="option"
                  aria-selected={activeType === option.key}
                  className={`adm-dropdown__item${
                    activeType === option.key ? " adm-dropdown__item--active" : ""
                  }`}
                  onClick={() => {
                    onTypeChange(option.key);
                    setDropdownOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fecha desde */}
        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input
            type="date"
            aria-label="Fecha desde"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>

        {/* Fecha hasta */}
        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input
            type="date"
            aria-label="Fecha hasta"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>

      </div>

      {/* ── Limpiar filtros ── */}
      <AdminActionButton className="adm-btn--ghost adm-btn--clear" onClick={onClear}>
        Limpiar filtros
      </AdminActionButton>

    </div>
  );
}