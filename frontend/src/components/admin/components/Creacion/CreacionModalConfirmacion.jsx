// src/components/admin/components/Creacion/CreacionModalConfirmacion.jsx
// Modal de confirmación para el módulo Creación.
// Idéntico en estructura a EdicionConfirmModal pero orientado a "crear".

import { createPortal } from "react-dom";
import { AlertTriangle, X, ChevronLeft, Plus, Loader2 } from "lucide-react";

/**
 * CreacionModalConfirmacion
 *
 * Props:
 *   isOpen       {boolean}                               – controla visibilidad
 *   isBusy       {boolean}                               – muestra spinner mientras crea
 *   entidad      {string}                                – nombre del recurso, ej. "CV"
 *   resumen      {Array<{ label: string, value: string }>} – campos que se crearán
 *   error        {string}                                – error del backend (opcional)
 *   onClose      {fn}                                    – cierra sin confirmar
 *   onConfirm    {fn}                                    – ejecuta el POST real
 */
export default function CreacionModalConfirmacion({
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
        aria-labelledby="cmc-title"
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
        <h3 className="ecm-title" id="cmc-title">
          ¿Crear nuevo {entidad}?
        </h3>

        <p className="ecm-text">
          Estás a punto de <strong>insertar un nuevo registro</strong> de tipo{" "}
          <strong>{entidad}</strong> en la base de datos. Esta acción{" "}
          <strong>no puede deshacerse</strong> fácilmente una vez confirmada.
        </p>

        <p className="ecm-text ecm-text--secondary">
          Revisa que los datos mostrados a continuación sean correctos antes de
          continuar. Un registro incorrecto puede afectar el funcionamiento del
          sistema y los datos relacionados.
        </p>

        {/* ── Resumen de campos a crear ── */}
        {resumen.length > 0 && (
          <div className="ecm-summary">
            <p className="ecm-summary__title">
              {resumen.length === 1
                ? "Campo a registrar:"
                : `Campos a registrar (${resumen.length}):`}
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
            <p className="ecm-summary__title">Sin datos ingresados</p>
            <p className="ecm-text ecm-text--secondary" style={{ margin: 0 }}>
              No se detectaron campos con valor. ¿Deseas crear el registro de
              todas formas?
            </p>
          </div>
        )}

        {/* ── Error del backend ── */}
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
                Creando…
              </>
            ) : (
              <>
                <Plus size={14} />
                Crear
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}