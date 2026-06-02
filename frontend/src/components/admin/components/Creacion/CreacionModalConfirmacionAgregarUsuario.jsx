// src/components/admin/components/Creacion/CreacionModalConfirmacionAgregarUsuario.jsx
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { UserPlus, X, ChevronLeft, Loader2, UserCircle2, Briefcase } from "lucide-react";

export default function CreacionModalConfirmacionAgregarUsuario({
  isOpen      = false,
  isBusy      = false,
  tipoUsuario = "profesional",
  resumen     = [],
  error       = "",
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();
  const cu = "adminCreacion.confirmacionUsuario";

  if (!isOpen) return null;

  const esProfesional = tipoUsuario === "profesional";
  const nombreTipo    = esProfesional
    ? t(`${cu}.nombreProfesional`)
    : t(`${cu}.nombreReclutador`);
  const accentColor = esProfesional ? "#3b82f6" : "#7c3aed";
  const bgColor     = esProfesional ? "#eff6ff" : "#f5f3ff";
  const borderColor = esProfesional ? "#bfdbfe" : "#ddd6fe";
  const IconTipo    = esProfesional ? UserCircle2 : Briefcase;

  return createPortal(
    <div className="ecm-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="ecm-modal" role="alertdialog" aria-modal="true"
        aria-labelledby="cmau-title" onClick={(e) => e.stopPropagation()}>

        <button className="ecm-close" onClick={onClose} disabled={isBusy}
          aria-label={t(`${cu}.closeLabel`)} type="button">
          <X size={16} />
        </button>

        <div className="ecm-icon-wrap"
          style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: 14 }}>
          <IconTipo size={26} strokeWidth={2} color={accentColor} />
        </div>

        <h3 className="ecm-title" id="cmau-title">
          {t(`${cu}.titlePre`)} {nombreTipo}{t(`${cu}.titleEnd`)}
        </h3>

        <p className="ecm-text">
          {t(`${cu}.text`)}{" "}
          <strong>{nombreTipo}</strong>{" "}
          {t(`${cu}.textEnd`)}
        </p>

        <p className="ecm-text ecm-text--secondary">{t(`${cu}.textSecondary`)}</p>

        {resumen.length > 0 && (
          <div className="ecm-summary">
            <p className="ecm-summary__title">
              {resumen.length === 1
                ? t(`${cu}.summaryOne`)
                : `${t(`${cu}.summaryMany`)} (${resumen.length}):`}
            </p>
            <ul className="ecm-summary__list">
              {resumen.map(({ label, value }) => (
                <li key={label} className="ecm-summary__item">
                  <span className="ecm-summary__label">{label}</span>
                  <span className="ecm-summary__value">
                    {value !== "" && value !== null && value !== undefined
                      ? String(value)
                      : <em className="ecm-summary__empty">—</em>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {resumen.length === 0 && (
          <div className="ecm-summary ecm-summary--empty">
            <p className="ecm-summary__title">{t(`${cu}.summaryEmpty`)}</p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              {t(`${cu}.summaryEmptyDesc`)}
            </p>
          </div>
        )}

        {error && <p className="ecm-error" role="alert">{error}</p>}

        <div className="ecm-actions">
          <button type="button" className="ecm-btn ecm-btn--cancel"
            onClick={onClose} disabled={isBusy}>
            <ChevronLeft size={14} /> {t(`${cu}.btnCancel`)}
          </button>
          <button type="button" className="ecm-btn ecm-btn--confirm"
            onClick={onConfirm} disabled={isBusy}
            style={{ background: accentColor, boxShadow: "0 2px 8px rgba(124,58,237,0.30)" }}>
            {isBusy
              ? <><Loader2 size={14} className="ecm-spinner" /> {t(`${cu}.creating`)}</>
              : <><UserPlus size={14} /> {t(`${cu}.btnConfirmPre`)} {nombreTipo}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}