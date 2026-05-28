import { useState } from "react";
import { ChevronDown, Calendar, RotateCcw, Upload } from "lucide-react";
import { REPORT_TYPE_OPTIONS, REPORT_REF_TYPE_OPTIONS } from "../../../services/reportService";
import AdminActionButton from "./AdminActionButton";
import "../../../styles/components/admin/Adminfilterbar.css";

export default function AdminFilterBar({
  activeType,
  onTypeChange,
  activeRefType,
  onRefTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  onRefresh,
  onExport,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refTypeDropdownOpen, setRefTypeDropdownOpen] = useState(false);

  const selectedLabel =
    REPORT_TYPE_OPTIONS.find((option) => option.key === activeType)?.label ?? "Todos";

  const selectedRefTypeLabel =
    REPORT_REF_TYPE_OPTIONS.find((option) => option.key === activeRefType)?.label ?? "Todos";

  return (
    <div className="adm-filterbar">
      <div className="adm-filterbar__toprow">
        <AdminActionButton className="adm-btn--outline" onClick={onRefresh}>
          <RotateCcw size={14} /> Actualizar
        </AdminActionButton>
      </div>

      <div className="adm-filterbar__row">
        <div className="adm-dropdown">
          <button
            type="button"
            className="adm-dropdown__trigger"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            {selectedLabel}
            <ChevronDown
              size={14}
              className={dropdownOpen ? "adm-dropdown__chevron--open" : ""}
            />
          </button>

          {dropdownOpen && (
            <div className="adm-dropdown__menu">
              {REPORT_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  className={`adm-dropdown__item${activeType === option.key ? " adm-dropdown__item--active" : ""}`}
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

        <div className="adm-dropdown">
          <button
            type="button"
            className="adm-dropdown__trigger"
            onClick={() => setRefTypeDropdownOpen((open) => !open)}
          >
            {selectedRefTypeLabel}
            <ChevronDown
              size={14}
              className={refTypeDropdownOpen ? "adm-dropdown__chevron--open" : ""}
            />
          </button>

          {refTypeDropdownOpen && (
            <div className="adm-dropdown__menu">
              {REPORT_REF_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  className={`adm-dropdown__item${activeRefType === option.key ? " adm-dropdown__item--active" : ""}`}
                  onClick={() => {
                    onRefTypeChange(option.key);
                    setRefTypeDropdownOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
          />
        </div>

        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
          />
        </div>
      </div>

      <AdminActionButton className="adm-btn--ghost adm-btn--clear" onClick={onClear}>
        Limpiar filtros
      </AdminActionButton>
    </div>
  );
}
