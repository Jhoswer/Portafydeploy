import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Calendar, RotateCcw, Upload } from "lucide-react";
import { getSugerenciaTypeOptions } from "../../../../services/sugerenciaService";
import AdminActionButton from "../AdminActionButton";
import "../../../../styles/components/admin/Adminfilterbar.css";

export default function SugerenciaFilterBar({
  activeType, onTypeChange, dateFrom, dateTo,
  onDateFromChange, onDateToChange, onClear, onRefresh, onExport,
}) {
  const { t } = useTranslation();
  const f = "adminSugerencias.filterBar";

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const SUGERENCIA_TYPE_OPTIONS = getSugerenciaTypeOptions(t);
  const selectedLabel =
    SUGERENCIA_TYPE_OPTIONS.find((opt) => opt.key === activeType)?.label ?? t(`${f}.refresh`);

  return (
    <div className="adm-filterbar">
      <div className="adm-filterbar__toprow">
        <AdminActionButton className="adm-btn--outline" onClick={onRefresh}>
          <RotateCcw size={14} /> {t(`${f}.refresh`)}
        </AdminActionButton>
      </div>

      <div className="adm-filterbar__row">
        <div className="adm-dropdown">
          <button type="button" className="adm-dropdown__trigger"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-haspopup="listbox" aria-expanded={dropdownOpen}>
            {selectedLabel}
            <ChevronDown size={14}
              className={dropdownOpen ? "adm-dropdown__chevron--open" : ""} />
          </button>
          {dropdownOpen && (
            <div className="adm-dropdown__menu" role="listbox">
              {SUGERENCIA_TYPE_OPTIONS.map((option) => (
                <div key={option.key} role="option"
                  aria-selected={activeType === option.key}
                  className={`adm-dropdown__item${activeType === option.key ? " adm-dropdown__item--active" : ""}`}
                  onClick={() => { onTypeChange(option.key); setDropdownOpen(false); }}>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input type="date" aria-label={t(`${f}.dateFrom`)}
            value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
        </div>

        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input type="date" aria-label={t(`${f}.dateTo`)}
            value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
        </div>
      </div>

      <AdminActionButton className="adm-btn--ghost adm-btn--clear" onClick={onClear}>
        {t(`${f}.clearFilters`)}
      </AdminActionButton>
    </div>
  );
}