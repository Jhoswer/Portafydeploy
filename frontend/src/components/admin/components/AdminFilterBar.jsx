import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Calendar, RotateCcw } from "lucide-react";
import { getReportRefTypeOptions, getReportTypeOptions } from "../../../services/reportService";
import AdminActionButton from "./AdminActionButton";
import "../../../styles/components/admin/Adminfilterbar.css";

export default function AdminFilterBar({
  activeType, onTypeChange, activeRefType, onRefTypeChange,
  dateFrom, dateTo, onDateFromChange, onDateToChange,
  onClear, onRefresh, onExport,
}) {
  const { t } = useTranslation();
  const f = "adminCommon.filterBar";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refTypeDropdownOpen, setRefTypeDropdownOpen] = useState(false);

  const reportTypeOptions = getReportTypeOptions(t);
  const reportRefTypeOptions = getReportRefTypeOptions(t);

  const selectedLabel =
    reportTypeOptions.find((option) => option.key === activeType)?.label ?? t("adminReports.reportTypes.todos");
  const selectedRefTypeLabel =
    reportRefTypeOptions.find((option) => option.key === activeRefType)?.label ?? t("adminReports.reportRefTypes.todos");

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
            onClick={() => setDropdownOpen((open) => !open)}>
            {selectedLabel}
            <ChevronDown size={14} className={dropdownOpen ? "adm-dropdown__chevron--open" : ""} />
          </button>
          {dropdownOpen && (
            <div className="adm-dropdown__menu">
              {reportTypeOptions.map((option) => (
                <div key={option.key}
                  className={`adm-dropdown__item${activeType === option.key ? " adm-dropdown__item--active" : ""}`}
                  onClick={() => { onTypeChange(option.key); setDropdownOpen(false); }}>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-dropdown">
          <button type="button" className="adm-dropdown__trigger"
            onClick={() => setRefTypeDropdownOpen((open) => !open)}>
            {selectedRefTypeLabel}
            <ChevronDown size={14} className={refTypeDropdownOpen ? "adm-dropdown__chevron--open" : ""} />
          </button>
          {refTypeDropdownOpen && (
            <div className="adm-dropdown__menu">
              {reportRefTypeOptions.map((option) => (
                <div key={option.key}
                  className={`adm-dropdown__item${activeRefType === option.key ? " adm-dropdown__item--active" : ""}`}
                  onClick={() => { onRefTypeChange(option.key); setRefTypeDropdownOpen(false); }}>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input type="date" value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)} />
        </div>

        <div className="adm-date-input">
          <Calendar size={14} className="adm-date-input__icon" />
          <input type="date" value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)} />
        </div>
      </div>

      <AdminActionButton className="adm-btn--ghost adm-btn--clear" onClick={onClear}>
        {t(`${f}.clearFilters`)}
      </AdminActionButton>
    </div>
  );
}
