// src/components/admin/components/Creacion/CreacionModalConfirmacion.jsx
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, X, ChevronLeft, Plus, Loader2 } from "lucide-react";

export default function CreacionModalConfirmacion({
  isOpen    = false,
  isBusy    = false,
  entidad   = "registro",
  resumen   = [],
  error     = "",
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();
  const c = "adminCreacion.confirmacion";

  if (!isOpen) return null;

  return createPortal(
    <div className="ecm-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="ecm-modal" role="alertdialog" aria-modal="true"
        aria-labelledby="cmc-title" onClick={(e) => e.stopPropagation()}>

        <button className="ecm-close" onClick={onClose} disabled={isBusy}
          aria-label={t(`${c}.closeLabel`)} type="button">
          <X size={16} />
        </button>

        <div className="ecm-icon-wrap">
          <AlertTriangle size={26} strokeWidth={2} />
        </div>

        <h3 className="ecm-title" id="cmc-title">
          {t(`${c}.title`)} {entidad}{t(`${c}.titleEnd`)}
        </h3>

        <p className="ecm-text">
          {t(`${c}.text`)}{" "}
          <strong>{entidad}</strong>{" "}
          {t(`${c}.textEnd`)}
        </p>

        <p className="ecm-text ecm-text--secondary">{t(`${c}.textSecondary`)}</p>

        {resumen.length > 0 && (
          <div className="ecm-summary">
            <p className="ecm-summary__title">
              {resumen.length === 1
                ? t(`${c}.summaryOne`)
                : `${t(`${c}.summaryMany`)} (${resumen.length}):`}
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
            <p className="ecm-summary__title">{t(`${c}.summaryEmpty`)}</p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              {t(`${c}.summaryEmptyDesc`)}
            </p>
          </div>
        )}

        {error && <p className="ecm-error" role="alert">{error}</p>}

        <div className="ecm-actions">
          <button type="button" className="ecm-btn ecm-btn--cancel"
            onClick={onClose} disabled={isBusy}>
            <ChevronLeft size={14} /> {t(`${c}.btnCancel`)}
          </button>
          <button type="button" className="ecm-btn ecm-btn--confirm"
            onClick={onConfirm} disabled={isBusy}>
            {isBusy
              ? <><Loader2 size={14} className="ecm-spinner" /> {t(`${c}.creating`)}</>
              : <><Plus size={14} /> {t(`${c}.btnConfirm`)}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}