import { createPortal } from "react-dom";
import { Trash2, X, ChevronLeft, Loader2 } from "lucide-react";

export default function EliminarConfirmModal({
  isOpen    = false,
  isBusy    = false,
  entidad   = "registro",
  resumen   = [],
  error     = "",
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="ecm-backdrop" onClick={isBusy ? undefined : onClose}>
      <div
        className="ecm-modal ecm-modal--danger"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="elim-title"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Cerrar ── */}
        <button
          className="ecm-close"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Cerrar"
          type="button"
        >
          <X size={14} />
        </button>

        {/* ── Icono (rojo) ── */}
        <div className="ecm-icon-wrap ecm-icon-wrap--danger">
          <Trash2 size={26} strokeWidth={2} />
        </div>

        {/* ── Textos ── */}
        <h3 className="ecm-title" id="elim-title">
          ¿Eliminar {entidad}?
        </h3>

        <p className="ecm-text">
          Estás a punto de <strong>eliminar permanentemente</strong> este
          registro de <strong>{entidad}</strong>. Esta acción{" "}
          <strong>no puede deshacerse</strong> una vez confirmada.
        </p>

        <p className="ecm-text ecm-text--secondary">
          Verifica que el registro mostrado a continuación sea el correcto.
          La eliminación puede afectar datos relacionados en el sistema.
        </p>

        {/* ── Resumen ── */}
        {resumen.length > 0 && (
          <div className="ecm-summary ecm-summary--danger">
            <p className="ecm-summary__title ecm-summary__title--danger">
              Registro que se eliminará:
            </p>
            <ul className="ecm-summary__list">
              {resumen.map(({ label, value }) => (
                <li key={label} className="ecm-summary__item">
                  <span className="ecm-summary__label">{label}</span>
                  <span className="ecm-summary__value">
                    {value !== "" && value !== null && value !== undefined ? (
                      String(value)
                    ) : (
                      <em className="ecm-summary__empty">—</em>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {resumen.length === 0 && (
          <div className="ecm-summary ecm-summary--danger ecm-summary--empty">
            <p className="ecm-summary__title ecm-summary__title--danger">
              Sin información adicional
            </p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              No hay datos adicionales para mostrar del registro seleccionado.
            </p>
          </div>
        )}

        {/* ── Error backend ── */}
        {error && (
          <p className="ecm-error" role="alert">{error}</p>
        )}

        {/* ── Acciones ── */}
        <div className="ecm-actions">
          <button
            type="button"
            className="ecm-btn ecm-btn--cancel"
            onClick={onClose}
            disabled={isBusy}
          >
            <ChevronLeft size={14} />
            Cancelar
          </button>
          <button
            type="button"
            className="ecm-btn ecm-btn--confirm ecm-btn--confirm-danger"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 size={14} className="ecm-spinner" />
                Eliminando…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Eliminar
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}