// src/components/admin/components/Edicion/EdicionConfirmModal.jsx
import { createPortal } from "react-dom";
import { AlertTriangle, X, ChevronLeft, Save, Loader2 } from "lucide-react";

/**
 * EdicionConfirmModal  –  Modal de confirmación reutilizable para ediciones.
 *
 * Props:
 *   isOpen   {boolean}  – controla visibilidad
 *   isBusy   {boolean}  – deshabilita botones y muestra spinner mientras guarda
 *   entidad  {string}   – nombre de la entidad editada, ej. "Datos Personales"
 *   accion   {string}   – descripción breve de la acción, ej. "actualizar"  (default: "guardar")
 *   resumen  {Array<{ label: string, value: string }>}
 *                       – pares campo / valor a mostrar en el resumen
 *   error    {string}   – mensaje de error del backend (opcional)
 *   onClose  {fn}       – cierra sin confirmar
 *   onConfirm{fn}       – ejecuta la operación real contra el backend
 *
 * Uso mínimo:
 *   <EdicionConfirmModal
 *     isOpen={showConfirm}
 *     entidad="Datos Personales"
 *     resumen={cambios}
 *     onClose={() => setShowConfirm(false)}
 *     onConfirm={handleConfirmedSave}
 *   />
 */
export default function EdicionConfirmModal({
  isOpen    = false,
  isBusy    = false,
  entidad   = "registro",
  accion    = "guardar",
  resumen   = [],
  error     = "",
  confirmLabel = "Guardar",
  busyLabel = "Guardando...",
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="ecm-backdrop"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="ecm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ecm-title"
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
          <X size={16} />
        </button>

        {/* ── Icono ── */}
        <div className="ecm-icon-wrap">
          <AlertTriangle size={26} strokeWidth={2} />
        </div>

        {/* ── Textos ── */}
        <h3 className="ecm-title" id="ecm-title">
          ¿{confirmLabel} en {entidad}?
        </h3>

        <p className="ecm-text">
          Estás a punto de <strong>{accion} los datos</strong> de{" "}
          <strong>{entidad}</strong>. Esta acción{" "}
          <strong>modificará la base de datos</strong> y no puede deshacerse
          fácilmente una vez confirmada.
        </p>

        <p className="ecm-text ecm-text--secondary">
          Revisa que los valores mostrados a continuación sean correctos antes
          de continuar. Un cambio incorrecto puede afectar el funcionamiento
          del sistema y los datos relacionados.
        </p>

        {/* ── Resumen de cambios ── */}
        {resumen.length > 0 && (
          <div className="ecm-summary">
            <p className="ecm-summary__title">
              {resumen.length === 1
                ? "Campo modificado:"
                : `Campos modificados (${resumen.length}):`}
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
          <div className="ecm-summary ecm-summary--empty">
            <p className="ecm-summary__title">Sin cambios detectados</p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              No se encontraron diferencias respecto a los datos actuales.
              ¿Deseas guardar de todas formas?
            </p>
          </div>
        )}

        {/* ── Error backend ── */}
        {error && (
          <p className="ecm-error" role="alert">
            {error}
          </p>
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
            className="ecm-btn ecm-btn--confirm"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 size={14} className="ecm-spinner" />
                {busyLabel}
              </>
            ) : (
              <>
                <Save size={14} />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

