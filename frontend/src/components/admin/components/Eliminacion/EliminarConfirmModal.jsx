// src/components/admin/components/Eliminacion/EliminarConfirmModal.jsx
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Trash2, X, ChevronLeft, Loader2 } from "lucide-react";

export default function EliminarConfirmModal({
  isOpen = false, isBusy = false, entidad = "registro",
  resumen = [], error = "", onClose, onConfirm,
}) {
  const { t } = useTranslation();
  const cm = "adminEliminacion.confirmModal";

  if (!isOpen) return null;

  return createPortal(
    <div className="ecm-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="ecm-modal ecm-modal--danger" role="alertdialog" aria-modal="true"
        aria-labelledby="elim-title" onClick={(e) => e.stopPropagation()}>

        <button className="ecm-close" onClick={onClose} disabled={isBusy}
          aria-label={t(`${cm}.closeLabel`)} type="button">
          <X size={14} />
        </button>

        <div className="ecm-icon-wrap ecm-icon-wrap--danger">
          <Trash2 size={26} strokeWidth={2} />
        </div>

        <h3 className="ecm-title" id="elim-title">
          {t(`${cm}.title`)} {entidad}{t(`${cm}.titleEnd`)}
        </h3>

        <p className="ecm-text">
          {t(`${cm}.text`)}{" "}
          <strong>{entidad}</strong>.{" "}
          {t(`${cm}.textEnd`)}
        </p>

        <p className="ecm-text ecm-text--secondary">{t(`${cm}.textSecondary`)}</p>

        {resumen.length > 0 && (
          <div className="ecm-summary ecm-summary--danger">
            <p className="ecm-summary__title ecm-summary__title--danger">
              {t(`${cm}.summaryTitle`)}
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
          <div className="ecm-summary ecm-summary--danger ecm-summary--empty">
            <p className="ecm-summary__title ecm-summary__title--danger">
              {t(`${cm}.summaryEmpty`)}
            </p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              {t(`${cm}.summaryEmptyDesc`)}
            </p>
          </div>
        )}

        {error && <p className="ecm-error" role="alert">{error}</p>}

        <div className="ecm-actions">
          <button type="button" className="ecm-btn ecm-btn--cancel"
            onClick={onClose} disabled={isBusy}>
            <ChevronLeft size={14} /> {t(`${cm}.btnCancel`)}
          </button>
          <button type="button" className="ecm-btn ecm-btn--confirm ecm-btn--confirm-danger"
            onClick={onConfirm} disabled={isBusy}>
            {isBusy
              ? <><Loader2 size={14} className="ecm-spinner" /> {t(`${cm}.deleting`)}</>
              : <><Trash2 size={14} /> {t(`${cm}.btnConfirm`)}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}