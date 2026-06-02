import { useTranslation } from "react-i18next";
import { X, CheckCircle, ChevronLeft } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

export default function SugerenciaAceptModal({
  sugerencia, isOpen, isBusy = false, error = "", onClose, onBack, onConfirm,
}) {
  const { t } = useTranslation();
  const a = "adminSugerencias.acceptModal";

  if (!isOpen || !sugerencia) return null;

  const postulantName = sugerencia.postulant?.name ||
    sugerencia.profile?.name || t(`${a}.userFallback`);

  return (
    <div className="adm-report-modal__backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="adm-report-modal" role="dialog" aria-modal="true"
        aria-labelledby="sug-accept-title" onClick={(e) => e.stopPropagation()}>

        <button className="adm-report-modal__close" onClick={onClose}
          disabled={isBusy} aria-label={t(`${a}.closeLabel`)}>
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon" style={{ background: "#e6fffa", color: "#047857" }}>
          <CheckCircle size={22} />
        </div>

        <h3 id="sug-accept-title" className="adm-report-modal__title">
          {t(`${a}.title`)}
        </h3>

        <p className="adm-report-modal__text">
          {t(`${a}.text`)}{" "}
          <strong>{postulantName}</strong>.{" "}
          {t(`${a}.textSuffix`)}
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
    </div>
  );
}