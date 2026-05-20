// src/components/admin/components/Definicion/DefinicionConfirmModal.jsx
import { createPortal } from "react-dom";
import { AlertTriangle, X, ChevronLeft, Save } from "lucide-react";
import "../../../../styles/components/admin/components/Definicion/DefinicionConfirmModal.css";

export default function DefinicionConfirmModal({
  isOpen,
  isBusy = false,
  entidad = "",
  resumen = [],
  error = "",
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="dcm-backdrop"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="dcm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dcm-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Cerrar ── */}
        <button
          className="dcm-close"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Cerrar"
          type="button"
        >
          <X size={16} />
        </button>

        {/* ── Icono ── */}
        <div className="dcm-icon-wrap">
          <AlertTriangle size={26} strokeWidth={2} />
        </div>

        {/* ── Textos ── */}
        <h3 className="dcm-title" id="dcm-title">
          ¿Confirmar registro de {entidad}?
        </h3>

        <p className="dcm-text">
          Estás a punto de <strong>guardar un nuevo registro</strong> en el
          sistema. Esta acción <strong>modificará la base de datos</strong> y
          no puede deshacerse fácilmente una vez confirmada.
        </p>

        <p className="dcm-text dcm-text--secondary">
          Verifica que los datos ingresados sean correctos antes de continuar.
          Un registro incorrecto puede afectar el funcionamiento del sistema y
          los datos relacionados.
        </p>

        {/* ── Resumen de campos ── */}
        {resumen.length > 0 && (
          <div className="dcm-summary">
            <p className="dcm-summary__title">Datos a registrar:</p>
            <ul className="dcm-summary__list">
              {resumen.map(({ label, value }) => (
                <li key={label} className="dcm-summary__item">
                  <span className="dcm-summary__label">{label}</span>
                  <span className="dcm-summary__value">
                    {value !== "" && value !== null && value !== undefined
                      ? String(value)
                      : <em className="dcm-summary__empty">—</em>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="dcm-text dcm-text--secondary" role="alert">
            {error}
          </p>
        )}

        {/* ── Acciones ── */}
        <div className="dcm-actions">
          <button
            type="button"
            className="dcm-btn dcm-btn--cancel"
            onClick={onClose}
            disabled={isBusy}
          >
            <ChevronLeft size={14} /> Cancelar
          </button>
          <button
            type="button"
            className="dcm-btn dcm-btn--confirm"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy
              ? "Guardando..."
              : <><Save size={14} /> Confirmar registro</>}
          </button>
        </div>
      </div>
    </div>,
    document.body   // ← se monta fuera de cualquier contenedor padre
  );
}
