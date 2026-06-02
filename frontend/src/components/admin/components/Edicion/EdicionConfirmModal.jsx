// src/components/admin/components/Edicion/EdicionConfirmModal.jsx

import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, X, ChevronLeft, Save, Loader2 } from "lucide-react";

export default function EdicionConfirmModal({
  isOpen     = false,
  isBusy     = false,
  entidad    = "registro",
  accion     = "guardar",
  resumen    = [],
  error      = "",
  confirmLabel,
  busyLabel,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();
  const e = "adminEdicion.confirm";

  const resolvedConfirmLabel = confirmLabel ?? t(`${e}.saveLabel`);
  const resolvedBusyLabel    = busyLabel    ?? t(`${e}.savingLabel`);

  if (!isOpen) return null;

  return createPortal(
    <div className="ecm-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="ecm-modal" role="alertdialog" aria-modal="true"
        aria-labelledby="ecm-title" onClick={(ev) => ev.stopPropagation()}>

        <button className="ecm-close" onClick={onClose} disabled={isBusy}
          aria-label={t(`${e}.closeAriaLabel`)} type="button">
          <X size={16} />
        </button>

        <div className="ecm-icon-wrap">
          <AlertTriangle size={26} strokeWidth={2} />
        </div>

        <h3 className="ecm-title" id="ecm-title">
          ¿{resolvedConfirmLabel} {t(`${e}.bodyOf`)} {entidad}?
        </h3>

        <p className="ecm-text">
          {t(`${e}.bodyAction`)} <strong>{accion} {t(`${e}.bodyData`)}</strong>{" "}
          {t(`${e}.bodyOf`)} <strong>{entidad}</strong>.{" "}
          {t(`${e}.bodyWarning`)}
        </p>

        <p className="ecm-text ecm-text--secondary">
          {t(`${e}.bodyReview`)}
        </p>

        {resumen.length > 0 && (
          <div className="ecm-summary">
            <p className="ecm-summary__title">
              {resumen.length === 1
                ? t(`${e}.summaryOne`)
                : `${t(`${e}.summaryMany`)} (${resumen.length}):`}
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
            <p className="ecm-summary__title">{t(`${e}.noChanges`)}</p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              {t(`${e}.noChangesDesc`)}
            </p>
          </div>
        )}

        {error && <p className="ecm-error" role="alert">{error}</p>}

        <div className="ecm-actions">
          <button type="button" className="ecm-btn ecm-btn--cancel"
            onClick={onClose} disabled={isBusy}>
            <ChevronLeft size={14} />
            {t(`${e}.cancelLabel`)}
          </button>
          <button type="button" className="ecm-btn ecm-btn--confirm"
            onClick={onConfirm} disabled={isBusy}>
            {isBusy ? (
              <><Loader2 size={14} className="ecm-spinner" />{resolvedBusyLabel}</>
            ) : (
              <><Save size={14} />{resolvedConfirmLabel}</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}