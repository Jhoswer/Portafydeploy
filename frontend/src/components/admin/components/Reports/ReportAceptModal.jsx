import { X, CheckCircle, ChevronLeft } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";
import "../../../../styles/components/admin/ReportActionModal.css";

export default function ReportAceptModal({
  report,
  isOpen,
  isBusy = false,
  error = "",
  onClose,
  onBack,
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

        <div className="adm-report-modal__icon" style={{ background: "#e6fffa", color: "#047857" }}>
          <CheckCircle size={22} />
        </div>

        <h3 className="adm-report-modal__title">
          Confirmar aceptacion del reporte
        </h3>

        <p className="adm-report-modal__text">
          Estas a punto de aprobar este reporte y aceptar las acciones aplicadas sobre el usuario:{" "}
          <strong>{report.reporter_user?.name || "este usuario"}</strong>.
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          Esta accion quedara registrada en el sistema. Deseas continuar?
        </p>

        {error ? <p className="adm-report-modal__error">{error}</p> : null}

        <div className="adm-report-modal__actions">
          <button
            className="adm-report-modal__button adm-report-modal__button--ghost ram-btn ram-btn--back"
            onClick={onBack || onClose}
            disabled={isBusy}
          >
            <ChevronLeft size={14} /> Atras
          </button>

          <button
            className="adm-report-modal__button ram-btn ram-btn--accept"
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
