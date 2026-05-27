// src/components/admin/components/Creacion/CreacionModalConfirmacionAgregarUsuario.jsx
// Modal de confirmación para crear un nuevo usuario (Profesional o Reclutador).
// El botón "Confirmar" está preparado pero no ejecuta ninguna acción aún.

import { createPortal } from "react-dom";
import { UserPlus, X, ChevronLeft, Loader2, UserCircle2, Briefcase } from "lucide-react";

/**
 * CreacionModalConfirmacionAgregarUsuario
 *
 * Props:
 *   isOpen    {boolean}                                 – controla visibilidad
 *   isBusy    {boolean}                                 – muestra spinner mientras crea
 *   tipoUsuario {string}                                – "profesional" | "reclutador"
 *   resumen   {Array<{ label: string, value: string }>} – campos que se crearán
 *   error     {string}                                  – error del backend (opcional)
 *   onClose   {fn}                                      – cierra sin confirmar
 *   onConfirm {fn}                                      – TODO: conectar con servicio
 */
export default function CreacionModalConfirmacionAgregarUsuario({
  isOpen      = false,
  isBusy      = false,
  tipoUsuario = "profesional",
  resumen     = [],
  error       = "",
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  const esProfesional = tipoUsuario === "profesional";
  const nombreTipo    = esProfesional ? "Profesional" : "Reclutador";
  const accentColor   = esProfesional ? "#3b82f6" : "#7c3aed";
  const bgColor       = esProfesional ? "#eff6ff" : "#f5f3ff";
  const borderColor   = esProfesional ? "#bfdbfe" : "#ddd6fe";
  const IconTipo      = esProfesional ? UserCircle2 : Briefcase;

  return createPortal(
    <div
      className="ecm-backdrop"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="ecm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cmau-title"
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

        {/* ── Icono tipo usuario ── */}
        <div
          className="ecm-icon-wrap"
          style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: 14 }}
        >
          <IconTipo size={26} strokeWidth={2} color={accentColor} />
        </div>

        {/* ── Textos ── */}
        <h3 className="ecm-title" id="cmau-title">
          ¿Crear nuevo {nombreTipo}?
        </h3>

        <p className="ecm-text">
          Estás a punto de <strong>registrar una nueva cuenta</strong> de tipo{" "}
          <strong>{nombreTipo}</strong> en el sistema. Una vez creada, el usuario
          recibirá acceso a la plataforma con las credenciales ingresadas.
        </p>

        <p className="ecm-text ecm-text--secondary">
          Revisa que los datos sean correctos antes de confirmar. La contraseña
          no podrá ser recuperada desde este panel; asegúrate de comunicársela
          al usuario si es necesario.
        </p>

        {/* ── Resumen de campos ── */}
        {resumen.length > 0 && (
          <div className="ecm-summary">
            <p className="ecm-summary__title">
              {resumen.length === 1
                ? "Dato a registrar:"
                : `Datos a registrar (${resumen.length}):`}
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
              No se detectaron campos con valor. Completa el formulario antes de
              continuar.
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

          {/* TODO: conectar onConfirm con el servicio de creación de usuarios */}
          <button
            type="button"
            className="ecm-btn ecm-btn--confirm"
            onClick={onConfirm}
            disabled={isBusy}
            style={{ background: accentColor, boxShadow: "0 2px 8px rgba(124,58,237,0.30)" }}
          >
            {isBusy ? (
              <>
                <Loader2 size={14} className="ecm-spinner" />
                Creando…
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Crear {nombreTipo}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
