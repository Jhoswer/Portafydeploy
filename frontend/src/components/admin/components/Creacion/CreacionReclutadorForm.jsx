// src/components/admin/components/Creacion/CreacionReclutadorForm.jsx

import { useState } from "react";
import {
  AlertCircle, CheckCircle2, Eye, EyeOff,
  Lock, Mail, Briefcase, Building2, X, ShieldCheck,
} from "lucide-react";
import { useThemeContext } from "../../../../context/ThemeContext";
import "../../../../styles/components/admin/components/Edicion/EdicionModalesTablas.css";
import CreacionModalConfirmacionAgregarUsuario from "./CreacionModalConfirmacionAgregarUsuario";
import { crearUsuarioDesdeRegistro } from "../../../../services/adminCreacionService";

/* ── Barra de fuerza ─────────────────────────────────────── */
const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
const STRENGTH_LABELS = ["", "Débil", "Regular", "Regular", "Fuerte"];

function PasswordBar({ password }) {
  const { isDark } = useThemeContext();
  const strength = Math.min(Math.floor((password || "").length / 3), 4);
  if (!password) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {[1, 2, 3, 4].map((level) => (
          <div key={level} style={{
            height: 4, flex: 1, borderRadius: 9999,
            background: level <= strength
              ? STRENGTH_COLORS[strength - 1]
              : (isDark ? "#334155" : "#e2e8f0"),
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: STRENGTH_COLORS[strength - 1], minWidth: 40 }}>
        {STRENGTH_LABELS[strength]}
      </span>
    </div>
  );
}

/* ── Hint de error ───────────────────────────────────────── */
function FieldHint({ error }) {
  if (!error) return null;
  return (
    <p className="edicion-modal__field-hint edicion-modal__field-hint--error">
      <AlertCircle size={11} />{error}
    </p>
  );
}

/* ── Input reutilizable ──────────────────────────────────── */
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

/* ── Resumen para el modal de confirmación ───────────────── */
function buildResumen(fields) {
  return [
    { label: "Empresa",    value: fields.company },
    { label: "Correo",     value: fields.email },
    { label: "Contraseña", value: fields.password ? "••••••••" : "" },
  ].filter(({ value }) => value !== "" && value !== null && value !== undefined);
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════════ */
const EMPTY = { company: "", email: "", password: "", confirmPassword: "" };

export default function CreacionReclutadorForm({ onCancel }) {
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
    if (!fields.company.trim())        next.company = "El nombre de empresa es obligatorio.";
    else if (fields.company.trim().length < 2) next.company = "Mínimo 2 caracteres.";
    if (!fields.email)                 next.email = "El correo corporativo es obligatorio.";
    else if (!fields.email.includes("@") || !fields.email.includes("."))
      next.email = "Correo electrónico no válido.";
    if (!fields.password)              next.password = "La contraseña es obligatoria.";
    else if (fields.password.length < 8)           next.password = "Mínimo 8 caracteres.";
    else if (!/[A-Za-z]/.test(fields.password))    next.password = "Debe contener letras.";
    else if (!/[^A-Za-z0-9]/.test(fields.password)) next.password = "Debe contener un símbolo.";
    if (!fields.confirmPassword)       next.confirmPassword = "Confirma la contraseña.";
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = "Las contraseñas no coinciden.";
    if (!acceptTerms) next.terms = "Debes aceptar los términos.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) { setModalError(""); setShowModal(true); }
  };

  const handleConfirm = async () => {
    setIsBusy(true);
    setModalError("");
    try {
      await crearUsuarioDesdeRegistro({
        role: "RECLUTADOR",
        company: fields.company,
        email: fields.email,
        password: fields.password,
        password_confirmation: fields.confirmPassword,
      });
      setFields({ ...EMPTY });
      setAcceptTerms(false);
      setShowModal(false);
      onCancel?.();
    } catch (error) {
      setModalError(error?.message || "No se pudo crear el reclutador.");
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
      <div className="creacion-profesional-panel">

        {/* ── Franja de acento ── */}
        <div className="cpf-accent cpf-accent--violet" />

        {/* ── Cabecera ── */}
        <div className="cpf-header">
          <div className="cpf-header__icon-wrap cpf-header__icon-wrap--violet">
            <Briefcase size={22} color="#7c3aed" />
          </div>
          <div className="cpf-header__text">
            <h2 className="cpf-header__title">Nuevo Reclutador</h2>
            <p className="cpf-header__subtitle">Completa los datos para crear la cuenta</p>
          </div>
          {onCancel && (
            <button type="button" className="cpf-header__close" onClick={onCancel} title="Cerrar">
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} noValidate>

          <div className="cpf-body">

            {errors.general && (
              <div className="edicion-modal__error" style={{ marginBottom: 4 }}>
                {errors.general}
              </div>
            )}

            {/* Sección: Datos de empresa */}
            <div className="cpf-section">
              <div className="cpf-section__label">
                <Building2 size={11} />
                Datos de empresa
              </div>
              <InputField
                label="Nombre de empresa" value={fields.company} onChange={setField("company")}
                placeholder="Acme Inc." icon={Building2} error={errors.company}
                autoComplete="organization" required
              />
              <InputField
                label="Correo corporativo" type="email"
                value={fields.email} onChange={setField("email")}
                placeholder="tu@empresa.com" icon={Mail} error={errors.email}
                autoComplete="email" required
              />
            </div>

            {/* Sección: Seguridad */}
            <div className="cpf-section">
              <div className="cpf-section__label">
                <ShieldCheck size={11} />
                Seguridad
              </div>
              <div className="edicion-modal__row">
                <div>
                  <InputField
                    label="Contraseña" type={showPassword ? "text" : "password"}
                    value={fields.password} onChange={setField("password")}
                    placeholder="Mínimo 8 caracteres" icon={Lock} error={errors.password}
                    autoComplete="new-password" required
                    rightElement={eyeBtn(showPassword, () => setShowPassword((v) => !v))}
                  />
                  <PasswordBar password={fields.password} />
                </div>
                <InputField
                  label="Confirmar contraseña" type={showConfirm ? "text" : "password"}
                  value={fields.confirmPassword} onChange={setField("confirmPassword")}
                  placeholder="Repite la contraseña" icon={Lock} error={errors.confirmPassword}
                  autoComplete="new-password" required
                  rightElement={eyeBtn(showConfirm, () => setShowConfirm((v) => !v))}
                />
              </div>
            </div>

            {/* Términos */}
            <div className="cpf-terms">
              <label className="edicion-modal__check" style={{ width: "fit-content" }}>
                <input
                  type="checkbox" checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    setErrors((p) => ({ ...p, terms: undefined }));
                  }}
                />
                Acepto los{" "}
                <span style={{ color: "#7c3aed", textDecoration: "underline", cursor: "pointer" }}>
                  términos y condiciones
                </span>{" "}y la{" "}
                <span style={{ color: "#7c3aed", textDecoration: "underline", cursor: "pointer" }}>
                  política de privacidad
                </span>
              </label>
              <FieldHint error={errors.terms} />
            </div>

          </div>{/* /cpf-body */}

          {/* ── Footer / Botones ── */}
          <div className="cpf-footer">
            {onCancel && (
              <button type="button" className="edicion-modal__btn-cancel" onClick={onCancel}>
                Cancelar
              </button>
            )}
            <button type="submit" className="cpf-btn-create cpf-btn-create--violet" disabled={isBusy}>
              <CheckCircle2 size={14} />
              Crear Reclutador
            </button>
          </div>

        </form>
      </div>

      {/* ── Modal de confirmación ── */}
      <CreacionModalConfirmacionAgregarUsuario
        isOpen={showModal}
        isBusy={isBusy}
        tipoUsuario="reclutador"
        resumen={buildResumen(fields)}
        error={modalError}
        onClose={() => !isBusy && setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}