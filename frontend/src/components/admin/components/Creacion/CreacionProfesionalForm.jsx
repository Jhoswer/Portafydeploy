// src/components/admin/components/Creacion/CreacionProfesionalForm.jsx
// Formulario inline de creación de Profesional — usa clases de EdicionModalesTablas.css

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserCircle2,
  User,
} from "lucide-react";
import "../../../../styles/components/admin/components/Edicion/EdicionModalesTablas.css";
import CreacionModalConfirmacionAgregarUsuario from "./CreacionModalConfirmacionAgregarUsuario";
import { crearUsuarioDesdeRegistro } from "../../../../services/adminCreacionService";

/* ── Barra de fuerza ─────────────────────────────────────── */
const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
const STRENGTH_LABELS = ["", "Débil", "Regular", "Regular", "Fuerte"];

function PasswordBar({ password }) {
  const strength = Math.min(Math.floor((password || "").length / 3), 4);
  if (!password) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {[1, 2, 3, 4].map((level) => (
          <div key={level} style={{
            height: 4, flex: 1, borderRadius: 9999,
            background: level <= strength ? STRENGTH_COLORS[strength - 1] : "#e2e8f0",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: STRENGTH_COLORS[strength - 1] }}>
        {STRENGTH_LABELS[strength]}
      </span>
    </div>
  );
}

/* ── Mensaje de error de campo ───────────────────────────── */
function FieldHint({ error }) {
  if (!error) return null;
  return (
    <p className="edicion-modal__field-hint edicion-modal__field-hint--error">
      <AlertCircle size={11} />{error}
    </p>
  );
}

/* ── Campo de input reutilizable ─────────────────────────── */
function InputField({ label, type = "text", value, onChange, placeholder, icon: Icon, error, rightElement, autoComplete, required }) {
  return (
    <div className="edicion-modal__field">
      <label className="edicion-modal__label">
        {label}{required && <span className="edicion-modal__required"> *</span>}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon size={13} style={{
            position: "absolute", left: 11, top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none",
          }} />
        )}
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className={`edicion-modal__input${error ? " edicion-modal__input--error" : ""}`}
          style={{ paddingLeft: Icon ? 34 : 12, paddingRight: rightElement ? 38 : 12 }}
        />
        {rightElement && (
          <div style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)" }}>
            {rightElement}
          </div>
        )}
      </div>
      <FieldHint error={error} />
    </div>
  );
}

/* ── Construye el resumen para el modal ──────────────────── */
function buildResumen(fields) {
  return [
    { label: "Nombre",   value: fields.name },
    { label: "Apellido", value: fields.lastName },
    { label: "Correo",   value: fields.email },
    { label: "Contraseña", value: fields.password ? "••••••••" : "" },
  ].filter(({ value }) => value !== "" && value !== null && value !== undefined);
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════════ */
const EMPTY = { name: "", lastName: "", email: "", password: "", confirmPassword: "" };

export default function CreacionProfesionalForm({ onCancel }) {
  const [fields,       setFields]       = useState({ ...EMPTY });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [acceptTerms,  setAcceptTerms]  = useState(false);
  const [errors,       setErrors]       = useState({});
  const [showModal,    setShowModal]    = useState(false);
  const [isBusy,       setIsBusy]       = useState(false);
  const [modalError,   setModalError]   = useState("");

  const setField = (key) => (value) => {
    setFields((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!fields.name.trim())     next.name     = "El nombre es obligatorio.";
    if (!fields.lastName.trim()) next.lastName = "El apellido es obligatorio.";
    if (!fields.email)
      next.email = "El correo es obligatorio.";
    else if (!fields.email.includes("@") || !fields.email.includes("."))
      next.email = "Correo electrónico no válido.";
    if (!fields.password)
      next.password = "La contraseña es obligatoria.";
    else if (fields.password.length < 8)
      next.password = "Mínimo 8 caracteres.";
    else if (!/[A-Za-z]/.test(fields.password))
      next.password = "Debe contener letras.";
    else if (!/[^A-Za-z0-9]/.test(fields.password))
      next.password = "Debe contener un símbolo.";
    if (!fields.confirmPassword)
      next.confirmPassword = "Confirma la contraseña.";
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = "Las contraseñas no coinciden.";
    if (!acceptTerms) next.terms = "Debes aceptar los términos.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* Al hacer submit — valida primero, luego abre el modal */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setModalError("");
      setShowModal(true);
    }
  };

  const handleConfirm = async () => {
    setIsBusy(true);
    setModalError("");
    try {
      await crearUsuarioDesdeRegistro({
        role: "PROFESIONAL",
        name: fields.name,
        lastName: fields.lastName,
        email: fields.email,
        password: fields.password,
        password_confirmation: fields.confirmPassword,
      });
      setFields({ ...EMPTY });
      setAcceptTerms(false);
      setShowModal(false);
      onCancel?.();
    } catch (error) {
      setModalError(error?.message || "No se pudo crear el profesional.");
    } finally {
      setIsBusy(false);
    }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" className="edicion-modal__eye-btn" onClick={toggle} tabIndex={-1}>
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );

  return (
    <>
      <div style={{ width: "100%", padding: "28px 32px 16px" }}>

        {/* ── Cabecera ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: "#eff6ff", border: "1.5px solid #bfdbfe",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <UserCircle2 size={22} color="#3b82f6" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
              Nuevo Profesional
            </h2>
            <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
              Completa los datos para crear la cuenta
            </p>
          </div>
        </div>

        {/* ── Error general ── */}
        {errors.general && (
          <div className="edicion-modal__error" style={{ marginBottom: 20 }}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="edicion-modal__fields">

            {/* Nombre + Apellido */}
            <div className="edicion-modal__row">
              <InputField label="Nombre" value={fields.name} onChange={setField("name")}
                placeholder="Juan" icon={User} error={errors.name} autoComplete="given-name" required />
              <InputField label="Apellido" value={fields.lastName} onChange={setField("lastName")}
                placeholder="Pérez" icon={User} error={errors.lastName} autoComplete="family-name" required />
            </div>

            {/* Email */}
            <InputField label="Correo electrónico" type="email"
              value={fields.email} onChange={setField("email")}
              placeholder="juan@correo.com" icon={Mail} error={errors.email}
              autoComplete="email" required />

            <hr className="edicion-modal__divider" />

            {/* Contraseñas */}
            <div className="edicion-modal__row">
              <div>
                <InputField label="Contraseña" type={showPassword ? "text" : "password"}
                  value={fields.password} onChange={setField("password")}
                  placeholder="Mínimo 8 caracteres" icon={Lock} error={errors.password}
                  autoComplete="new-password" required
                  rightElement={eyeBtn(showPassword, () => setShowPassword((v) => !v))} />
                <PasswordBar password={fields.password} />
              </div>
              <InputField label="Confirmar contraseña" type={showConfirm ? "text" : "password"}
                value={fields.confirmPassword} onChange={setField("confirmPassword")}
                placeholder="Repite la contraseña" icon={Lock} error={errors.confirmPassword}
                autoComplete="new-password" required
                rightElement={eyeBtn(showConfirm, () => setShowConfirm((v) => !v))} />
            </div>

            <hr className="edicion-modal__divider" />

            {/* Términos */}
            <div className="edicion-modal__field">
              <label className="edicion-modal__check" style={{ width: "fit-content" }}>
                <input type="checkbox" checked={acceptTerms}
                  onChange={(e) => { setAcceptTerms(e.target.checked); setErrors((p) => ({ ...p, terms: undefined })); }} />
                Acepto los{" "}
                <span style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}>
                  términos y condiciones
                </span>{" "}y la{" "}
                <span style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}>
                  política de privacidad
                </span>
              </label>
              <FieldHint error={errors.terms} />
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 6 }}>
              {onCancel && (
                <button type="button" className="edicion-modal__btn-cancel" onClick={onCancel}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="edicion-modal__btn-save"
                style={{ background: "#e43f3f", boxShadow: "0 2px 8px rgba(124,58,237,0.30)" }}>
                <CheckCircle2 size={14} />
                Crear Profesional
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* ── Modal de confirmación ── */}
      <CreacionModalConfirmacionAgregarUsuario
        isOpen={showModal}
        isBusy={isBusy}
        tipoUsuario="profesional"
        resumen={buildResumen(fields)}
        error={modalError}
        onClose={() => !isBusy && setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
