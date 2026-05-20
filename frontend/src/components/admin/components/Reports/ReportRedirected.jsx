import { X, CornerUpRight } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

export default function ReportRedirected({
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
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="adm-report-modal__close"
          onClick={onClose}
          disabled={isBusy}
        >
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
          <CornerUpRight size={22} />
        </div>

        <h3 className="adm-report-modal__title">
          Redirigir reporte
        </h3>

        <p className="adm-report-modal__text">
          Estás a punto de transferir este reporte a otro administrador para su revisión.
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          Esta acción notificará al nuevo responsable y quedará registrada. ¿Deseas continuar?
        </p>

        {error && <p className="adm-report-modal__error">{error}</p>}

        <div className="adm-report-modal__actions">
          <button
            className="adm-report-modal__button adm-report-modal__button--ghost"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancelar
          </button>

          <button
            className="adm-report-modal__button"
            style={{ background: "#2563eb", color: "#fff" }}
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Procesando..." : "Redirigir"}
          </button>
        </div>
      </div>
    </div>
  );
}