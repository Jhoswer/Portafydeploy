import { useTranslation } from "react-i18next";
import { X, AlertTriangle } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

export default function SugerenciaDeleteModal({
  sugerencia, isOpen, isBusy = false, error = "", onClose, onConfirm,
}) {
  const { t } = useTranslation();
  const d = "adminSugerencias.deleteModal";

  if (!isOpen || !sugerencia) return null;

  const postulantName = sugerencia.postulant?.name || t(`${d}.userFallback`);

  return (
    <div className="adm-report-modal__backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="adm-report-modal" role="dialog" aria-modal="true"
        aria-labelledby="sug-delete-title" onClick={(e) => e.stopPropagation()}>

        <button type="button" className="adm-report-modal__close"
          onClick={onClose} disabled={isBusy} aria-label={t(`${d}.closeLabel`)}>
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon"><AlertTriangle size={22} /></div>

        <h3 id="sug-delete-title" className="adm-report-modal__title">
          {t(`${d}.title`)}
        </h3>

        <p className="adm-report-modal__text">
          {t(`${d}.text`)}{" "}
          <strong>{postulantName}</strong>.{" "}
          {t(`${d}.textSuffix`)}
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          {t(`${d}.textSecondary`)}
        </p>

        {error && <p className="adm-report-modal__error">{error}</p>}

        <div className="adm-report-modal__actions">
          <button type="button"
            className="adm-report-modal__button adm-report-modal__button--ghost"
            onClick={onClose} disabled={isBusy}>
            {t(`${d}.btnCancel`)}
          </button>
          <button type="button"
            className="adm-report-modal__button adm-report-modal__button--danger"
            onClick={onConfirm} disabled={isBusy}>
            {isBusy ? t(`${d}.processing`) : t(`${d}.btnConfirm`)}
          </button>
        </div>
      </div>
    </div>
  );
}