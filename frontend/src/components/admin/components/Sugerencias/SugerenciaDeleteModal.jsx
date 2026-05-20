import { X, AlertTriangle } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

/**
 * SugerenciaDeleteModal
 * Confirma el RECHAZO de una sugerencia.
 * Inserta en ATTENDED con state='rejected' y elimina la sugerencia.
 *
 * Props:
 *   sugerencia  object   — objeto sugerencia normalizado
 *   isOpen      bool
 *   isBusy      bool
 *   error       string
 *   onClose     fn()
 *   onConfirm   fn()     — dispara rejectSugerencia en el padre
 */
export default function SugerenciaDeleteModal({
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
        aria-labelledby="sug-delete-title"
        onClick={(e) => e.stopPropagation()}
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

        <h3 id="sug-delete-title" className="adm-report-modal__title">
          Confirmar rechazo de la sugerencia
        </h3>

        <p className="adm-report-modal__text">
          Estás a punto de <strong>rechazar</strong> la sugerencia del usuario{" "}
          <strong>{postulantName}</strong>. Esta acción quedará registrada en el
          sistema junto a tu historial como administrador.
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          La nota que hayas escrito se adjuntará al registro. ¿Estás seguro?
        </p>

        {error && <p className="adm-report-modal__error">{error}</p>}

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
            {isBusy ? "Procesando..." : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}