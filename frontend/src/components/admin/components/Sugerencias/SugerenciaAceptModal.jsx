import { X, CheckCircle, ChevronLeft } from "lucide-react";
import "../../../../styles/components/admin/ReportDeleteModal.css";

/**
 * SugerenciaAceptModal
 * Confirma la ACEPTACIÓN de una sugerencia.
 * Inserta en ATTENDED con state='accepted' y elimina la sugerencia.
 *
 * Props:
 *   sugerencia  object   — objeto sugerencia normalizado
 *   isOpen      bool
 *   isBusy      bool
 *   error       string
 *   onClose     fn()
 *   onBack      fn()
 *   onConfirm   fn()     — dispara acceptSugerencia en el padre
 */
export default function SugerenciaAceptModal({
  sugerencia,
  isOpen,
  isBusy = false,
  error = "",
  onClose,
  onBack,
  onConfirm,
}) {
  if (!isOpen || !sugerencia) return null;

  const postulantName = sugerencia.postulant?.name || sugerencia.profile?.name || "este usuario";

  return (
    <div className="adm-report-modal__backdrop" onClick={isBusy ? undefined : onClose}>
      <div
        className="adm-report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sug-accept-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="adm-report-modal__close"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="adm-report-modal__icon" style={{ background: "#e6fffa", color: "#047857" }}>
          <CheckCircle size={22} />
        </div>

        <h3 id="sug-accept-title" className="adm-report-modal__title">
          Confirmar aceptación de la sugerencia
        </h3>

        <p className="adm-report-modal__text">
          Estás a punto de <strong>aceptar</strong> la sugerencia del usuario{" "}
          <strong>{postulantName}</strong>. 
          Se dará por concluida esta sugerencia aceptando las modificaciones sugeridas.
        </p>

        <p className="adm-report-modal__text adm-report-modal__text--secondary">
          Esta acción quedará registrada en el sistema junto a tu historial como administrador. ¿Estás seguro?
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
