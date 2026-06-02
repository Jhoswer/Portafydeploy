// src/components/admin/components/Creacion/CreacionProfesionalForm.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle, CheckCircle2, Eye, EyeOff,
  Lock, Mail, UserCircle2, User, X, ShieldCheck,
} from "lucide-react";
import { useThemeContext } from "../../../../context/ThemeContext";
import "../../../../styles/components/admin/components/Edicion/EdicionModalesTablas.css";
import CreacionModalConfirmacionAgregarUsuario from "./CreacionModalConfirmacionAgregarUsuario";
import { crearUsuarioDesdeRegistro } from "../../../../services/adminCreacionService";

const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
const PROFESSIONAL_FORM_FALLBACKS = {
  es: {
    headerTitle: "Nuevo Profesional",
    headerSubtitle: "Completa los datos para crear la cuenta",
    sectionPersonal: "Datos personales",
    sectionSecurity: "Seguridad",
    fieldName: "Nombre",
    fieldNamePh: "Juan",
    fieldLastName: "Apellido",
    fieldLastNamePh: "Perez",
    fieldEmail: "Correo electronico",
    fieldEmailPh: "juan@correo.com",
    fieldPassword: "Contrasena",
    fieldPasswordPh: "Minimo 8 caracteres",
    fieldConfirm: "Confirmar contrasena",
    fieldConfirmPh: "Repite la contrasena",
    terms: "Acepto los",
    termsLink1: "terminos y condiciones",
    termsAnd: "y la",
    termsLink2: "politica de privacidad",
    btnCancel: "Cancelar",
    btnCreate: "Crear Profesional",
    strengthWeak: "Debil",
    strengthMid: "Regular",
    strengthStrong: "Fuerte",
    errorName: "El nombre es obligatorio.",
    errorLastName: "El apellido es obligatorio.",
    errorEmail: "El correo es obligatorio.",
    errorEmailInvalid: "Correo electronico no valido.",
    errorPassword: "La contrasena es obligatoria.",
    errorPasswordMin: "Minimo 8 caracteres.",
    errorPasswordLetters: "Debe contener letras.",
    errorPasswordSymbol: "Debe contener un simbolo.",
    errorConfirm: "Confirma la contrasena.",
    errorConfirmMatch: "Las contrasenas no coinciden.",
    errorTerms: "Debes aceptar los terminos.",
    errorCreate: "No se pudo crear el profesional.",
    resumenName: "Nombre",
    resumenLastName: "Apellido",
    resumenEmail: "Correo",
    resumenPassword: "Contrasena",
  },
  en: {
    headerTitle: "New Professional",
    headerSubtitle: "Complete the information to create the account",
    sectionPersonal: "Personal information",
    sectionSecurity: "Security",
    fieldName: "First name",
    fieldNamePh: "John",
    fieldLastName: "Last name",
    fieldLastNamePh: "Smith",
    fieldEmail: "Email",
    fieldEmailPh: "john@email.com",
    fieldPassword: "Password",
    fieldPasswordPh: "Minimum 8 characters",
    fieldConfirm: "Confirm password",
    fieldConfirmPh: "Repeat the password",
    terms: "I accept the",
    termsLink1: "terms and conditions",
    termsAnd: "and the",
    termsLink2: "privacy policy",
    btnCancel: "Cancel",
    btnCreate: "Create Professional",
    strengthWeak: "Weak",
    strengthMid: "Medium",
    strengthStrong: "Strong",
    errorName: "First name is required.",
    errorLastName: "Last name is required.",
    errorEmail: "Email is required.",
    errorEmailInvalid: "Invalid email address.",
    errorPassword: "Password is required.",
    errorPasswordMin: "Minimum 8 characters.",
    errorPasswordLetters: "Must contain letters.",
    errorPasswordSymbol: "Must contain a symbol.",
    errorConfirm: "Confirm the password.",
    errorConfirmMatch: "Passwords do not match.",
    errorTerms: "You must accept the terms.",
    errorCreate: "Could not create the professional.",
    resumenName: "First name",
    resumenLastName: "Last name",
    resumenEmail: "Email",
    resumenPassword: "Password",
  },
  pt: {
    headerTitle: "Novo Profissional",
    headerSubtitle: "Complete os dados para criar a conta",
    sectionPersonal: "Dados pessoais",
    sectionSecurity: "Seguranca",
    fieldName: "Nome",
    fieldNamePh: "Joao",
    fieldLastName: "Sobrenome",
    fieldLastNamePh: "Silva",
    fieldEmail: "E-mail",
    fieldEmailPh: "joao@email.com",
    fieldPassword: "Senha",
    fieldPasswordPh: "Minimo de 8 caracteres",
    fieldConfirm: "Confirmar senha",
    fieldConfirmPh: "Repita a senha",
    terms: "Aceito os",
    termsLink1: "termos e condicoes",
    termsAnd: "e a",
    termsLink2: "politica de privacidade",
    btnCancel: "Cancelar",
    btnCreate: "Criar Profissional",
    strengthWeak: "Fraca",
    strengthMid: "Media",
    strengthStrong: "Forte",
    errorName: "O nome e obrigatorio.",
    errorLastName: "O sobrenome e obrigatorio.",
    errorEmail: "O e-mail e obrigatorio.",
    errorEmailInvalid: "E-mail invalido.",
    errorPassword: "A senha e obrigatoria.",
    errorPasswordMin: "Minimo de 8 caracteres.",
    errorPasswordLetters: "Deve conter letras.",
    errorPasswordSymbol: "Deve conter um simbolo.",
    errorConfirm: "Confirme a senha.",
    errorConfirmMatch: "As senhas nao coincidem.",
    errorTerms: "Voce deve aceitar os termos.",
    errorCreate: "Nao foi possivel criar o profissional.",
    resumenName: "Nome",
    resumenLastName: "Sobrenome",
    resumenEmail: "E-mail",
    resumenPassword: "Senha",
  },
};

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

const EMPTY = { name: "", lastName: "", email: "", password: "", confirmPassword: "" };

export default function CreacionProfesionalForm({ onCancel }) {
  const { t, i18n } = useTranslation();
  const pf = "adminCreacion.profesionalForm";
  const currentLang = (i18n.resolvedLanguage || i18n.language || "es").split("-")[0];
  const fallback = PROFESSIONAL_FORM_FALLBACKS[currentLang] || PROFESSIONAL_FORM_FALLBACKS.es;
  const tf = (key) => t(`${pf}.${key}`, { defaultValue: fallback[key] || key });

  const strengthLabels = ["", tf("strengthWeak"), tf("strengthMid"), tf("strengthMid"), tf("strengthStrong")];

  function buildResumen(fields) {
    return [
      { label: tf("resumenName"),     value: fields.name },
      { label: tf("resumenLastName"), value: fields.lastName },
      { label: tf("resumenEmail"),    value: fields.email },
      { label: tf("resumenPassword"), value: fields.password ? "••••••••" : "" },
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
    if (!fields.name.trim())     next.name     = tf("errorName");
    if (!fields.lastName.trim()) next.lastName = tf("errorLastName");
    if (!fields.email)           next.email    = tf("errorEmail");
    else if (!fields.email.includes("@") || !fields.email.includes("."))
      next.email = tf("errorEmailInvalid");
    if (!fields.password)        next.password = tf("errorPassword");
    else if (fields.password.length < 8)           next.password = tf("errorPasswordMin");
    else if (!/[A-Za-z]/.test(fields.password))    next.password = tf("errorPasswordLetters");
    else if (!/[^A-Za-z0-9]/.test(fields.password)) next.password = tf("errorPasswordSymbol");
    if (!fields.confirmPassword) next.confirmPassword = tf("errorConfirm");
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = tf("errorConfirmMatch");
    if (!acceptTerms) next.terms = tf("errorTerms");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) { setModalError(""); setShowModal(true); } };

  const handleConfirm = async () => {
    setIsBusy(true); setModalError("");
    try {
      await crearUsuarioDesdeRegistro({
        role: "PROFESIONAL", name: fields.name, lastName: fields.lastName,
        email: fields.email, password: fields.password,
        password_confirmation: fields.confirmPassword,
      });
      setFields({ ...EMPTY }); setAcceptTerms(false); setShowModal(false); onCancel?.();
    } catch (error) {
      setModalError(error?.message || tf("errorCreate"));
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
        <div className="cpf-accent" />

        <div className="cpf-header">
          <div className="cpf-header__icon-wrap">
            <UserCircle2 size={23} color="#3b82f6" />
          </div>
          <div className="cpf-header__text">
            <h2 className="cpf-header__title">{tf("headerTitle")}</h2>
            <p className="cpf-header__subtitle">{tf("headerSubtitle")}</p>
          </div>
          {onCancel && (
            <button type="button" className="cpf-header__close" onClick={onCancel} title={tf("btnCancel")}>
              <X size={15} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="cpf-body">
            {errors.general && <div className="edicion-modal__error" style={{ marginBottom: 4 }}>{errors.general}</div>}

            <div className="cpf-section">
              <div className="cpf-section__label">
                <User size={11} /> {tf("sectionPersonal")}
              </div>
              <div className="edicion-modal__row">
                <InputField label={tf("fieldName")} value={fields.name} onChange={setField("name")}
                  placeholder={tf("fieldNamePh")} icon={User} error={errors.name}
                  autoComplete="given-name" required />
                <InputField label={tf("fieldLastName")} value={fields.lastName} onChange={setField("lastName")}
                  placeholder={tf("fieldLastNamePh")} icon={User} error={errors.lastName}
                  autoComplete="family-name" required />
              </div>
              <InputField label={tf("fieldEmail")} type="email" value={fields.email} onChange={setField("email")}
                placeholder={tf("fieldEmailPh")} icon={Mail} error={errors.email}
                autoComplete="email" required />
            </div>

            <div className="cpf-section">
              <div className="cpf-section__label">
                <ShieldCheck size={11} /> {tf("sectionSecurity")}
              </div>
              <div className="edicion-modal__row">
                <div>
                  <InputField label={tf("fieldPassword")} type={showPassword ? "text" : "password"}
                    value={fields.password} onChange={setField("password")}
                    placeholder={tf("fieldPasswordPh")} icon={Lock} error={errors.password}
                    autoComplete="new-password" required
                    rightElement={eyeBtn(showPassword, () => setShowPassword((v) => !v))} />
                  <PasswordBar password={fields.password} strengthLabels={strengthLabels} />
                </div>
                <InputField label={tf("fieldConfirm")} type={showConfirm ? "text" : "password"}
                  value={fields.confirmPassword} onChange={setField("confirmPassword")}
                  placeholder={tf("fieldConfirmPh")} icon={Lock} error={errors.confirmPassword}
                  autoComplete="new-password" required
                  rightElement={eyeBtn(showConfirm, () => setShowConfirm((v) => !v))} />
              </div>
            </div>

            <div className="cpf-terms">
              <label className="edicion-modal__check" style={{ width: "fit-content" }}>
                <input type="checkbox" checked={acceptTerms}
                  onChange={(e) => { setAcceptTerms(e.target.checked); setErrors((p) => ({ ...p, terms: undefined })); }} />
                {tf("terms")}{" "}
                <span style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}>
                  {tf("termsLink1")}
                </span>{" "}{tf("termsAnd")}{" "}
                <span style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}>
                  {tf("termsLink2")}
                </span>
              </label>
              <FieldHint error={errors.terms} />
            </div>
          </div>

          <div className="cpf-footer">
            {onCancel && (
              <button type="button" className="edicion-modal__btn-cancel" onClick={onCancel}>
                {tf("btnCancel")}
              </button>
            )}
            <button type="submit" className="cpf-btn-create" disabled={isBusy}>
              <CheckCircle2 size={14} /> {tf("btnCreate")}
            </button>
          </div>
        </form>
      </div>

      <CreacionModalConfirmacionAgregarUsuario
        isOpen={showModal} isBusy={isBusy} tipoUsuario="profesional"
        resumen={buildResumen(fields)} error={modalError}
        onClose={() => !isBusy && setShowModal(false)}
        onConfirm={handleConfirm} />
    </>
  );
}
