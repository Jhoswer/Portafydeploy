// src/components/admin/components/Creacion/CreacionReclutadorForm.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle, CheckCircle2, Eye, EyeOff,
  Lock, Mail, Briefcase, Building2, X, ShieldCheck,
} from "lucide-react";
import { useThemeContext } from "../../../../context/ThemeContext";
import "../../../../styles/components/admin/components/Edicion/EdicionModalesTablas.css";
import CreacionModalConfirmacionAgregarUsuario from "./CreacionModalConfirmacionAgregarUsuario";
import { crearUsuarioDesdeRegistro } from "../../../../services/adminCreacionService";

const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

function PasswordBar({ password, strengthLabels }) {
  const { isDark } = useThemeContext();
  const strength = Math.min(Math.floor((password || "").length / 3), 4);
  if (!password) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {[1, 2, 3, 4].map((level) => (
          <div key={level} style={{
            height: 4, flex: 1, borderRadius: 9999,
            background: level <= strength ? STRENGTH_COLORS[strength - 1] : (isDark ? "#334155" : "#e2e8f0"),
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: STRENGTH_COLORS[strength - 1], minWidth: 40 }}>
        {strengthLabels[strength]}
      </span>
    </div>
  );
}

function FieldHint({ error }) {
  if (!error) return null;
  return (
    <p className="edicion-modal__field-hint edicion-modal__field-hint--error">
      <AlertCircle size={11} />{error}
    </p>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, icon: Icon, error, rightElement, autoComplete, required }) {
  return (
    <div className="edicion-modal__field">
      <label className="edicion-modal__label">
        {label}{required && <span className="edicion-modal__required"> *</span>}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon size={13} style={{ position: "absolute", left: 11, top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        )}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className={`edicion-modal__input${error ? " edicion-modal__input--error" : ""}`}
          style={{ paddingLeft: Icon ? 34 : 12, paddingRight: rightElement ? 38 : 12 }} />
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

const EMPTY = { company: "", email: "", password: "", confirmPassword: "" };

export default function CreacionReclutadorForm({ onCancel }) {
  const { t } = useTranslation();
  const rf = "adminCreacion.reclutadorForm";

  const strengthLabels = ["", t(`adminCreacion.profesionalForm.strengthWeak`), t(`adminCreacion.profesionalForm.strengthMid`), t(`adminCreacion.profesionalForm.strengthMid`), t(`adminCreacion.profesionalForm.strengthStrong`)];

  function buildResumen(fields) {
    return [
      { label: t(`${rf}.resumenCompany`),  value: fields.company },
      { label: t(`${rf}.resumenEmail`),    value: fields.email },
      { label: t(`${rf}.resumenPassword`), value: fields.password ? "••••••••" : "" },
    ].filter(({ value }) => value !== "" && value !== null && value !== undefined);
  }

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
    if (!fields.company.trim())        next.company = t(`${rf}.errorCompany`);
    else if (fields.company.trim().length < 2) next.company = t(`${rf}.errorCompanyMin`);
    if (!fields.email)                 next.email = t(`${rf}.errorEmail`);
    else if (!fields.email.includes("@") || !fields.email.includes("."))
      next.email = t(`${rf}.errorEmailInvalid`);
    if (!fields.password)              next.password = t(`${rf}.errorPassword`);
    else if (fields.password.length < 8)           next.password = t(`${rf}.errorPasswordMin`);
    else if (!/[A-Za-z]/.test(fields.password))    next.password = t(`${rf}.errorPasswordLetters`);
    else if (!/[^A-Za-z0-9]/.test(fields.password)) next.password = t(`${rf}.errorPasswordSymbol`);
    if (!fields.confirmPassword)       next.confirmPassword = t(`${rf}.errorConfirm`);
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = t(`${rf}.errorConfirmMatch`);
    if (!acceptTerms) next.terms = t(`${rf}.errorTerms`);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) { setModalError(""); setShowModal(true); } };

  const handleConfirm = async () => {
    setIsBusy(true); setModalError("");
    try {
      await crearUsuarioDesdeRegistro({
        role: "RECLUTADOR", company: fields.company,
        email: fields.email, password: fields.password,
        password_confirmation: fields.confirmPassword,
      });
      setFields({ ...EMPTY }); setAcceptTerms(false); setShowModal(false); onCancel?.();
    } catch (error) {
      setModalError(error?.message || t(`${rf}.errorCreate`));
    } finally { setIsBusy(false); }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" className="edicion-modal__eye-btn" onClick={toggle} tabIndex={-1}>
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );

  return (
    <>
      <div className="creacion-profesional-panel">
        <div className="cpf-accent cpf-accent--violet" />

        <div className="cpf-header">
          <div className="cpf-header__icon-wrap cpf-header__icon-wrap--violet">
            <Briefcase size={22} color="#7c3aed" />
          </div>
          <div className="cpf-header__text">
            <h2 className="cpf-header__title">{t(`${rf}.headerTitle`)}</h2>
            <p className="cpf-header__subtitle">{t(`${rf}.headerSubtitle`)}</p>
          </div>
          {onCancel && (
            <button type="button" className="cpf-header__close" onClick={onCancel} title={t(`${rf}.btnCancel`)}>
              <X size={15} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="cpf-body">
            {errors.general && <div className="edicion-modal__error" style={{ marginBottom: 4 }}>{errors.general}</div>}

            <div className="cpf-section">
              <div className="cpf-section__label">
                <Building2 size={11} /> {t(`${rf}.sectionCompany`)}
              </div>
              <InputField label={t(`${rf}.fieldCompany`)} value={fields.company} onChange={setField("company")}
                placeholder={t(`${rf}.fieldCompanyPh`)} icon={Building2} error={errors.company}
                autoComplete="organization" required />
              <InputField label={t(`${rf}.fieldEmail`)} type="email" value={fields.email} onChange={setField("email")}
                placeholder={t(`${rf}.fieldEmailPh`)} icon={Mail} error={errors.email}
                autoComplete="email" required />
            </div>

            <div className="cpf-section">
              <div className="cpf-section__label">
                <ShieldCheck size={11} /> {t(`${rf}.sectionSecurity`)}
              </div>
              <div className="edicion-modal__row">
                <div>
                  <InputField label={t(`${rf}.fieldPassword`)} type={showPassword ? "text" : "password"}
                    value={fields.password} onChange={setField("password")}
                    placeholder={t(`${rf}.fieldPasswordPh`)} icon={Lock} error={errors.password}
                    autoComplete="new-password" required
                    rightElement={eyeBtn(showPassword, () => setShowPassword((v) => !v))} />
                  <PasswordBar password={fields.password} strengthLabels={strengthLabels} />
                </div>
                <InputField label={t(`${rf}.fieldConfirm`)} type={showConfirm ? "text" : "password"}
                  value={fields.confirmPassword} onChange={setField("confirmPassword")}
                  placeholder={t(`${rf}.fieldConfirmPh`)} icon={Lock} error={errors.confirmPassword}
                  autoComplete="new-password" required
                  rightElement={eyeBtn(showConfirm, () => setShowConfirm((v) => !v))} />
              </div>
            </div>

            <div className="cpf-terms">
              <label className="edicion-modal__check" style={{ width: "fit-content" }}>
                <input type="checkbox" checked={acceptTerms}
                  onChange={(e) => { setAcceptTerms(e.target.checked); setErrors((p) => ({ ...p, terms: undefined })); }} />
                {t(`${rf}.terms`)}{" "}
                <span style={{ color: "#7c3aed", textDecoration: "underline", cursor: "pointer" }}>
                  {t(`${rf}.termsLink1`)}
                </span>{" "}{t(`${rf}.termsAnd`)}{" "}
                <span style={{ color: "#7c3aed", textDecoration: "underline", cursor: "pointer" }}>
                  {t(`${rf}.termsLink2`)}
                </span>
              </label>
              <FieldHint error={errors.terms} />
            </div>
          </div>

          <div className="cpf-footer">
            {onCancel && (
              <button type="button" className="edicion-modal__btn-cancel" onClick={onCancel}>
                {t(`${rf}.btnCancel`)}
              </button>
            )}
            <button type="submit" className="cpf-btn-create cpf-btn-create--violet" disabled={isBusy}>
              <CheckCircle2 size={14} /> {t(`${rf}.btnCreate`)}
            </button>
          </div>
        </form>
      </div>

      <CreacionModalConfirmacionAgregarUsuario
        isOpen={showModal} isBusy={isBusy} tipoUsuario="reclutador"
        resumen={buildResumen(fields)} error={modalError}
        onClose={() => !isBusy && setShowModal(false)}
        onConfirm={handleConfirm} />
    </>
  );
}