import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ChevronLeft, Save, X } from "lucide-react";
import "../../../../styles/components/admin/components/Definicion/DefinicionConfirmModal.css";

export default function DefinicionConfirmModal({
  isOpen, isBusy = false, entidad = "",
  resumen = [], error = "", onClose, onConfirm,
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return createPortal(
    <div className="dcm-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="dcm-modal" role="alertdialog" aria-modal="true"
        aria-labelledby="dcm-title" onClick={(e) => e.stopPropagation()}>

        <button className="dcm-close" onClick={onClose} disabled={isBusy}
          aria-label={t("admin.definicion.confirmModal.closeLabel")} type="button">
          <X size={16} />
        </button>

        <div className="dcm-icon-wrap">
          <AlertTriangle size={26} strokeWidth={2} />
        </div>

        <h3 className="dcm-title" id="dcm-title">
          {t("admin.definicion.confirmModal.title", { entidad })}
        </h3>

        <p className="dcm-text"
          dangerouslySetInnerHTML={{
            __html: t("admin.definicion.confirmModal.text1")
          }}
        />
        <p className="dcm-text dcm-text--secondary"
          dangerouslySetInnerHTML={{
            __html: t("admin.definicion.confirmModal.text2")
          }}
        />

        {resumen.length > 0 && (
          <div className="dcm-summary">
            <p className="dcm-summary__title">
              {t("admin.definicion.confirmModal.summaryTitle")}
            </p>
            <ul className="dcm-summary__list">
              {resumen.map(({ label, value }) => (
                <li key={label} className="dcm-summary__item">
                  <span className="dcm-summary__label">{label}</span>
                  <span className="dcm-summary__value">
                    {value !== "" && value !== null && value !== undefined
                      ? String(value)
                      : <em className="dcm-summary__empty">
                          {t("admin.definicion.confirmModal.emptyValue")}
                        </em>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="dcm-text dcm-text--secondary" role="alert">{error}</p>
        )}

        <div className="dcm-actions">
          <button type="button" className="dcm-btn dcm-btn--cancel"
            onClick={onClose} disabled={isBusy}>
            <ChevronLeft size={14} /> {t("admin.definicion.confirmModal.cancel")}
          </button>
          <button type="button" className="dcm-btn dcm-btn--confirm"
            onClick={onConfirm} disabled={isBusy}>
            {isBusy
              ? t("admin.definicion.confirmModal.saving")
              : <><Save size={14} /> {t("admin.definicion.confirmModal.confirm")}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
