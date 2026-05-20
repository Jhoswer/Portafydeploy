import { X, ArrowUpCircle } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

/**
 * SugerenciaRedirectedModal
 * Confirma la acción de ESCALAR una sugerencia.
 * Inserta en ATTENDED con state='higher'. NO elimina la sugerencia.
 *
 * Props:
 *   sugerencia  object   — objeto sugerencia normalizado
 *   isOpen      bool
 *   isBusy      bool
 *   error       string
 *   onClose     fn()
 *   onConfirm   fn()     — dispara escalateSugerencia en el padre
 */
export default function SugerenciaRedirectedModal({
  sugerencia,
  isOpen,
  isBusy = false,
  error  = "",
  onClose,
  onConfirm,
}) {
  if (!isOpen || !sugerencia) return null;

  const postulantName = sugerencia.postulant?.name || "este usuario";

  return (
    <div
      className="adm-report-modal__backdrop"
      onClick={isBusy ? undefined : onClose}
    >
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
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div
          className="adm-report-modal__icon"
          style={{ background: "#eff6ff", color: "#1d4ed8" }}
        >
          <ArrowUpCircle size={22} />
        </div>

        <h3 className="adm-report-modal__title">
          Escalar sugerencia
        </h3>

        <p className="adm-report-modal__text">
          Estás a punto de <strong>escalar</strong> la sugerencia de{" "}
          <strong>{postulantName}</strong> a un nivel superior de revisión.
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          La sugerencia permanecerá activa y quedará registrada como escalada.
          La nota que hayas escrito se adjuntará al registro. ¿Deseas continuar?
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
            {isBusy ? "Procesando..." : "Escalar"}
          </button>
        </div>
      </div>
    </div>
  );
}