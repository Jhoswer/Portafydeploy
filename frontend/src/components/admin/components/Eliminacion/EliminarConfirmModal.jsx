// src/components/admin/components/Eliminacion/EliminarConfirmModal.jsx
import { createPortal } from "react-dom";
import { Trash2, X, ChevronLeft, Loader2 } from "lucide-react";

/**
 * EliminarConfirmModal  –  Modal de confirmación reutilizable para eliminaciones.
 *
 * Props:
 *   isOpen    {boolean}  – controla visibilidad
 *   isBusy    {boolean}  – deshabilita botones y muestra spinner mientras elimina
 *   entidad   {string}   – nombre de la entidad a eliminar, ej. "Experiencia"
 *   resumen   {Array<{ label: string, value: string }>}
 *                        – datos del registro que se va a eliminar (solo lectura)
 *   error     {string}   – mensaje de error del backend (opcional)
 *   onClose   {fn}       – cierra sin confirmar
 *   onConfirm {fn}       – ejecuta la eliminación real contra el backend
 *
 * Uso mínimo:
 *   <EliminarConfirmModal
 *     isOpen={showDelete}
 *     entidad="Experiencia"
 *     resumen={[{ label: "Título", value: "Desarrollador" }]}
 *     onClose={() => setShowDelete(false)}
 *     onConfirm={handleConfirmedDelete}
 *   />
 */
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
    <div
      className="ecm-backdrop"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="ecm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="elim-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          /* Línea de acento roja en la parte superior */
          borderTop: "3px solid #ef4444",
        }}
      >
        {/* ── Cerrar ── */}
        <button
          className="ecm-close"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Cerrar"
          type="button"
        />

        {/* ── Icono (rojo) ── */}
        <div
          className="ecm-icon-wrap"
          style={{
            background:  "#fef2f2",
            borderColor: "#fecaca",
            color:       "#dc2626",
            boxShadow:   "0 2px 12px rgba(220, 38, 38, 0.18)",
          }}
        >
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

        {/* ── Resumen del registro a eliminar ── */}
        {resumen.length > 0 && (
          <div
            className="ecm-summary"
            style={{
              background:  "#fff5f5",
              borderColor: "#fecaca",
            }}
          >
            <p className="ecm-summary__title" style={{ color: "#b91c1c" }}>
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
          <div
            className="ecm-summary ecm-summary--empty"
            style={{
              background:  "#fff5f5",
              borderColor: "#fecaca",
            }}
          >
            <p className="ecm-summary__title" style={{ color: "#b91c1c" }}>
              Sin información adicional
            </p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              No hay datos adicionales para mostrar del registro seleccionado.
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
            style={{
              background:  "#dc2626",
              boxShadow:   "0 2px 8px rgba(220, 38, 38, 0.30)",
            }}
            onMouseEnter={(e) => {
              if (!isBusy) {
                e.currentTarget.style.background  = "#b91c1c";
                e.currentTarget.style.boxShadow   = "0 4px 14px rgba(185, 28, 28, 0.38)";
                e.currentTarget.style.transform   = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = "#dc2626";
              e.currentTarget.style.boxShadow   = "0 2px 8px rgba(220, 38, 38, 0.30)";
              e.currentTarget.style.transform   = "translateY(0)";
            }}
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