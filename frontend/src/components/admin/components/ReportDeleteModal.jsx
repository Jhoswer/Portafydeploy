import { X, AlertTriangle } from "lucide-react";
import "../../../styles/components/admin/ReportDeleteModal.css";

export default function ReportDeleteModal({
  report,
  isOpen,
  isBusy = false,
  error = "",
  onClose,
  onConfirm,
}) {
  if (!isOpen || !report) return null;

  return (
    <div className="adm-report-modal__backdrop" onClick={isBusy ? undefined : onClose}>
      <div
        className="adm-report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-report-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="adm-report-modal__close"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon">
          <AlertTriangle size={22} />
        </div>

        <h3 id="adm-report-modal-title" className="adm-report-modal__title">
          Advertencia de eliminacion
        </h3>

        <p className="adm-report-modal__text">
          Estas a punto de marcar este reporte como eliminado. Esta actividad se registrara en el sistema y tu historial como administrador que atendio el reporte de: <strong>{report.reported_user?.name || "este usuario"}</strong>.
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          Esta seguro con su decision?.
        </p>

        {error ? <p className="adm-report-modal__error">{error}</p> : null}

        <div className="adm-report-modal__actions">
          <button
            type="button"
            className="adm-report-modal__button adm-report-modal__button--ghost"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="adm-report-modal__button adm-report-modal__button--danger"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Procesando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}
