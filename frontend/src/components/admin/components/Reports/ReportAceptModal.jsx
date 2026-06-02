import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, CheckCircle, ChevronLeft } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";
import "../../../../styles/components/admin/ReportActionModal.css";

export default function ReportAceptModal({
  report, isOpen, isBusy = false, error = "", onClose, onBack, onConfirm,
}) {
  const { t } = useTranslation();
  const a = "adminReports.acceptModal";

  if (!isOpen || !report) return null;

  return createPortal(
    <div className="adm-report-modal__backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="adm-report-modal" role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}>

        <button className="adm-report-modal__close" onClick={onClose} disabled={isBusy}>
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon" style={{ background: "#e6fffa", color: "#047857" }}>
          <CheckCircle size={22} />
        </div>

        <h3 className="adm-report-modal__title">{t(`${a}.title`)}</h3>

        <p className="adm-report-modal__text">
          {t(`${a}.text`)}{" "}
          <strong>{report.reported_user?.name || t(`${a}.userFallback`)}</strong>.
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          {t(`${a}.textSecondary`)}
        </p>

        {error ? <p className="adm-report-modal__error">{error}</p> : null}

        <div className="adm-report-modal__actions">
          <button
            className="adm-report-modal__button adm-report-modal__button--ghost ram-btn ram-btn--back"
            onClick={onBack || onClose} disabled={isBusy}>
            <ChevronLeft size={14} /> {t(`${a}.btnBack`)}
          </button>
          <button
            className="adm-report-modal__button ram-btn ram-btn--accept"
            onClick={onConfirm} disabled={isBusy}>
            {isBusy ? t(`${a}.processing`) : t(`${a}.btnAccept`)}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
