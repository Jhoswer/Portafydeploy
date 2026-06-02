import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, CornerUpRight } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

export default function ReportRedirected({
  report, isOpen, isBusy = false, error = "", onClose, onConfirm,
}) {
  const { t } = useTranslation();
  const rd = "adminReports.redirectModal";

  if (!isOpen || !report) return null;

  return createPortal(
    <div className="adm-report-modal__backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="adm-report-modal" role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}>

        <button className="adm-report-modal__close" onClick={onClose} disabled={isBusy}>
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
          <CornerUpRight size={22} />
        </div>

        <h3 className="adm-report-modal__title">{t(`${rd}.title`)}</h3>
        <p className="adm-report-modal__text">{t(`${rd}.text`)}</p>
        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          {t(`${rd}.textSecondary`)}
        </p>

        {error && <p className="adm-report-modal__error">{error}</p>}

        <div className="adm-report-modal__actions">
          <button className="adm-report-modal__button adm-report-modal__button--ghost"
            onClick={onClose} disabled={isBusy}>
            {t(`${rd}.btnCancel`)}
          </button>
          <button className="adm-report-modal__button"
            style={{ background: "#2563eb", color: "#fff" }}
            onClick={onConfirm} disabled={isBusy}>
            {isBusy ? t(`${rd}.processing`) : t(`${rd}.btnRedirect`)}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
