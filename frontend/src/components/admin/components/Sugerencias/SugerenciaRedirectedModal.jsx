import { useTranslation } from "react-i18next";
import { X, ArrowUpCircle } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

export default function SugerenciaRedirectedModal({
  sugerencia, isOpen, isBusy = false, error = "", onClose, onConfirm,
}) {
  const { t } = useTranslation();
  const e = "adminSugerencias.escalateModal";

  if (!isOpen || !sugerencia) return null;

  const postulantName = sugerencia.postulant?.name || t(`${e}.userFallback`);

  return (
    <div className="adm-report-modal__backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="adm-report-modal" role="dialog" aria-modal="true"
        onClick={(ev) => ev.stopPropagation()}>

        <button className="adm-report-modal__close" onClick={onClose}
          disabled={isBusy} aria-label={t(`${e}.closeLabel`)}>
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon"
          style={{ background: "#eff6ff", color: "#1d4ed8" }}>
          <ArrowUpCircle size={22} />
        </div>

        <h3 className="adm-report-modal__title">{t(`${e}.title`)}</h3>

        <p className="adm-report-modal__text">
          {t(`${e}.text`)}{" "}
          <strong>{postulantName}</strong>{" "}
          {t(`${e}.textSuffix`)}
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          {t(`${e}.textSecondary`)}
        </p>

        {error && <p className="adm-report-modal__error">{error}</p>}

        <div className="adm-report-modal__actions">
          <button className="adm-report-modal__button adm-report-modal__button--ghost"
            onClick={onClose} disabled={isBusy}>
            {t(`${e}.btnCancel`)}
          </button>
          <button className="adm-report-modal__button"
            style={{ background: "#2563eb", color: "#fff" }}
            onClick={onConfirm} disabled={isBusy}>
            {isBusy ? t(`${e}.processing`) : t(`${e}.btnConfirm`)}
          </button>
        </div>
      </div>
    </div>
  );
}