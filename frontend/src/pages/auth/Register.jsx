import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  CheckCircle2,
  Code2,
  Shield,
  ShieldCheck,
  Users,
  Sparkles,
  TrendingUp,
  Check,
  Briefcase,
  UserCircle2,
  ChevronDown,
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import config from "../../config";
import { useAuth } from "../../context/useAuth";
import { fetchProfile, registerUser } from "../../services/authService";
import GitHubButton from "../../components/auth/GithubButton";
import LinkedInButton from "../../components/auth/LinkedInButton";
import GoogleButton from "../../components/auth/GoogleButton";
import { getPostAuthRedirectPath } from "../../utils/authNavigation";

void motion;

/* ─────────── Brand Panel ─────────── */

const BENEFITS = [
  { icon: Users,      title: "Conecta con profesionales", desc: "Red de talento verificado" },
  { icon: Sparkles,   title: "Encuentra oportunidades",   desc: "Ofertas curadas para ti" },
  { icon: TrendingUp, title: "Crece profesionalmente",    desc: "Recursos y mentoría" },
];

function BrandPanel() {
  return (
    <div className="relative h-full flex flex-col justify-between overflow-hidden p-8 xl:p-10 rounded-l-3xl">
      <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-violet-700 to-fuchsia-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.4),transparent_60%)]" />
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -left-10 w-72 h-72 bg-fuchsia-400/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Mi App</span>
        </Link>
      </div>

      <div className="relative z-10">
        <h2 className="text-white font-bold text-2xl xl:text-3xl leading-tight mb-2.5 tracking-tight">
          Únete a nuestra<br />comunidad profesional
        </h2>
        <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
          Conectamos el mejor talento con las empresas más innovadoras.
        </p>
        <div className="space-y-2.5">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/12 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[13px] leading-tight">{b.title}</p>
                  <p className="text-white/55 text-[11px] leading-tight mt-0.5">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-white/50 text-[11px]">
        <Shield size={11} />
        Datos protegidos · GDPR compliant
      </div>
    </div>
  );
}

/* ─────────── Role Selector ─────────── */

const ROLE_OPTIONS = [
  {
    value: "PROFESIONAL",
    title: "Profesional",
    subtitle: "Buscar empleo",
    icon: UserCircle2,
    accent: "from-blue-500 to-cyan-500",
    ring: "ring-blue-500/40 border-blue-500/60 bg-blue-500/8 shadow-blue-500/20",
  },
  {
    value: "RECLUTADOR",
    title: "Reclutador",
    subtitle: "Publicar ofertas",
    icon: Briefcase,
    accent: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-500/40 border-violet-500/60 bg-violet-500/8 shadow-violet-500/20",
  },
];

function RoleSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {ROLE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-200 ${
              isActive
                ? `${option.ring} ring-2 shadow-lg`
                : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5"
            }`}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-linear-to-br ${option.accent} flex items-center justify-center shadow`}
                >
                  <Check size={9} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                isActive
                  ? `bg-linear-to-br ${option.accent} shadow`
                  : "bg-white/5 border border-white/8"
              }`}>
                <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground"} />
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-sm leading-tight ${isActive ? "text-white" : "text-slate-300"}`}>
                  {option.title}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {option.subtitle}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────── Field Error ─────────── */

function FieldError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 text-red-400 text-[11px] mt-1"
        >
          <AlertCircle size={10} />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ─────────── Input ─────────── */

function Input({ label, type = "text", value, onChange, placeholder, icon: Icon, error, rightElement, autoComplete }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>
      <div className="relative">
        <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-10 pl-9 ${rightElement ? "pr-10" : "pr-3"} rounded-xl bg-background text-sm placeholder-muted-foreground border transition-all outline-none focus:ring-2 ${
            error
              ? "border-red-500/60 focus:ring-red-500/20"
              : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
          }`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
}

/* ─────────── Password Strength ─────────── */

function PasswordStrength({ password, labels, colors }) {
  const strength = Math.min(Math.floor(password.length / 3), 4);
  if (!password.length) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: level <= strength ? colors[strength - 1] : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium" style={{ color: colors[strength - 1] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

/* ─────────── Step Label ─────────── */

function StepLabel({ number, label, active = true }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold transition-colors ${
        active
          ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
          : "bg-white/3 border-white/10 text-muted-foreground"
      }`}>
        {number}
      </span>
      <p className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}>
        {label}
      </p>
    </div>
  );
}

/* ─────────── Main Component ─────────── */

export default function Register() {
  const navigate = useNavigate();
  const { user, loginWithGoogle, loginWithGitHub, loginWithLinkedIn, updateUser } = useAuth();
  const { t } = useTranslation();
  const recaptchaRef = useRef(null);

  const [role, setRole]                   = useState("PROFESIONAL");
  const [showForm, setShowForm]           = useState(false);
  const [fields, setFields]               = useState({ name: "", lastName: "", company: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [acceptTerms, setAcceptTerms]     = useState(false);
  const [captchaToken, setCaptchaToken]   = useState(null);
  const [errors, setErrors]               = useState({});
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);

  const recaptchaEnabled = Boolean(config.recaptchaSiteKey);

  useEffect(() => {
    if (!user) return;
    navigate(getPostAuthRedirectPath(user), { replace: true });
  }, [navigate, user]);

  useEffect(() => {
    const prev = document.body.style.paddingTop;
    document.body.style.paddingTop = "0px";
    return () => { document.body.style.paddingTop = prev; };
  }, []);

  const setField = (key) => (value) => {
    setFields((c) => ({ ...c, [key]: value }));
    setErrors((c) => ({ ...c, [key]: undefined }));
  };

  const resetCaptcha = () => {
    recaptchaRef.current?.reset();
    setCaptchaToken(null);
  };

  /* ── Validación original ── */
  const validate = () => {
    const next = {};

    if (role === "PROFESIONAL") {
      if (!fields.name.trim())     next.name     = t("register.errors.nameRequired");
      if (!fields.lastName.trim()) next.lastName = t("register.errors.lastNameRequired");
    } else {
      if (!fields.company.trim())                  next.company = t("register.errors.companyRequired") || "El nombre de empresa es obligatorio";
      else if (fields.company.trim().length < 2)   next.company = "Mínimo 2 caracteres";
    }

    if (!fields.email)
      next.email = t("register.errors.emailRequired");
    else if (!fields.email.includes("@") || !fields.email.includes("."))
      next.email = t("register.errors.emailInvalid");

    if (!fields.password)
      next.password = t("register.errors.passwordRequired");
    else if (fields.password.length < 8)
      next.password = t("register.errors.passwordShort");
    else if (!/[A-Za-z]/.test(fields.password))
      next.password = t("register.errors.passwordLetter");
    else if (!/[^A-Za-z0-9]/.test(fields.password))
      next.password = t("register.errors.passwordSymbol");

    if (!fields.confirmPassword)
      next.confirmPassword = t("register.errors.confirmRequired");
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = t("register.errors.passwordMismatch");

    if (!acceptTerms)
      next.terms = t("register.errors.termsRequired");
    if (recaptchaEnabled && !captchaToken)
      next.captcha = t("register.errors.captchaRequired");

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── Social providers ── */
  const handleProviderSuccess = async (data, loginWithProvider) => {
    const nextUser = loginWithProvider(data);
    try {
      const profile = await fetchProfile();
      const resolvedUser = updateUser((current) => ({
        ...current,
        ...profile,
        perfil_completado: Boolean(profile?.perfil_completado),
      }));
      navigate(getPostAuthRedirectPath(resolvedUser || nextUser || data?.user));
    } catch {
      navigate(getPostAuthRedirectPath(nextUser || data?.user));
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        email:    fields.email,
        password: fields.password,
        captchaToken,
        role,
        ...(role === "PROFESIONAL"
          ? { name: fields.name, lastName: fields.lastName }
          : { company: fields.company }),
      };
      await registerUser(payload);
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 1200));
      navigate("/login");
    } catch (error) {
      setErrors({ general: error.message });
      if (recaptchaEnabled) resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = [
    "",
    t("register.strength.weak"),
    t("register.strength.moderate"),
    t("register.strength.moderate"),
    t("register.strength.strong"),
  ];

  const captchaOk      = !recaptchaEnabled || Boolean(captchaToken);
  const actionsEnabled = captchaOk && !loading;
  const stepActions    = recaptchaEnabled ? 3 : 2;

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">

      {/* Ambient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-125 h-125 bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-112.5 h-112.5 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-fuchsia-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-5 left-5 sm:top-6 sm:left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group z-20"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        {t("register.back")}
      </Link>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-5xl bg-card/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden grid lg:grid-cols-[42%_1fr]"
      >
        {/* Left brand panel */}
        <div className="hidden lg:block">
          <BrandPanel />
        </div>

        {/* Right panel */}
        <div className="relative p-6 sm:p-8 lg:p-9 min-h-160 flex flex-col">
          <AnimatePresence mode="wait">

            {/* Success state */}
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-5 shadow-2xl shadow-green-500/30"
                >
                  <CheckCircle2 size={32} className="text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">{t("register.success")}</h2>
                <p className="text-muted-foreground text-sm">{t("register.redirecting")}</p>
              </motion.div>

            ) : (

              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Header */}
                <div className="mb-5">
                  <h1 className="text-2xl font-bold tracking-tight text-white">{t("register.title")}</h1>
                  <p className="text-muted-foreground text-sm mt-1">{t("register.subtitle")}</p>
                </div>

                {/* General error */}
                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm mb-4"
                    >
                      <AlertCircle size={15} />
                      {errors.general}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── PASO 1: Tipo de cuenta ── */}
                <div className="mb-4">
                  <StepLabel number={1} label={t("register.accountType") || "Tipo de cuenta"} />
                  <RoleSelector
                    value={role}
                    onChange={(r) => {
                      setRole(r);
                      setErrors({});
                      setShowForm(false); // colapsa el form si cambia el rol
                    }}
                  />
                </div>

                {/* ── PASO 2: CAPTCHA ── */}
                {recaptchaEnabled && (
                  <div className="mb-4">
                    <StepLabel number={2} label={t("register.captchaLabel") || "Verificación de seguridad"} />
                    <div className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border-2 bg-white/3 transition-all ${
                      errors.captcha
                        ? "border-red-500/40"
                        : captchaToken
                        ? "border-green-500/40 bg-green-500/5"
                        : "border-white/10"
                    }`}>
                      <div className="flex-1">
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={config.recaptchaSiteKey}
                          theme="dark"
                          onChange={(token) => {
                            setCaptchaToken(token);
                            setErrors((c) => ({ ...c, captcha: undefined }));
                          }}
                          onExpired={resetCaptcha}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0 text-[9px] text-muted-foreground/70 leading-tight pl-3 border-l border-white/8">
                        <ShieldCheck size={18} className="text-blue-400 mb-0.5" />
                        <span className="font-semibold tracking-tight">reCAPTCHA</span>
                        <span>Privacidad</span>
                      </div>
                    </div>
                    <FieldError message={errors.captcha} />
                  </div>
                )}

                {/* ── PASO 3 (o 2): Continuar con ── */}
                <div>
                  <StepLabel
                    number={stepActions}
                    label={t("register.continueWith") || "Continuar con"}
                    active={actionsEnabled}
                  />

                  {/* Hint captcha pendiente */}
                  <AnimatePresence>
                    {!actionsEnabled && recaptchaEnabled && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-[11px] text-amber-400/80 mb-2.5 overflow-hidden"
                      >
                        <AlertCircle size={11} />
                        Completa el CAPTCHA para habilitar las opciones de registro
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={{ opacity: actionsEnabled ? 1 : 0.45 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2"
                  >
                    {/* Social buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <GoogleButton
                        label={t("register.continueGoogle")}
                        disabled={!actionsEnabled}
                        onSuccess={(data) => { if (!actionsEnabled) return; handleProviderSuccess(data, loginWithGoogle); }}
                      />
                      <GitHubButton
                        label={t("register.continueGitHub")}
                        disabled={!actionsEnabled}
                        onSuccess={(data) => { if (!actionsEnabled) return; handleProviderSuccess(data, loginWithGitHub); }}
                      />
                      <LinkedInButton
                        label={t("register.continueLinkedIn")}
                        disabled={!actionsEnabled}
                        onSuccess={(data) => { if (!actionsEnabled) return; handleProviderSuccess(data, loginWithLinkedIn); }}
                      />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-0.5">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t("register.orWith")}
                      </span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>

                    {/* Botón correo / formulario expandible */}
                    <AnimatePresence initial={false} mode="wait">
                      {!showForm ? (
                        <motion.button
                          key="email-btn"
                          type="button"
                          onClick={() => { if (actionsEnabled) setShowForm(true); }}
                          disabled={!actionsEnabled}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          whileTap={actionsEnabled ? { scale: 0.98 } : {}}
                          className="w-full h-11 bg-linear-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                        >
                          <Mail size={15} />
                          {t("register.continueEmail") || "Continuar con correo"}
                          <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        </motion.button>
                      ) : (
                        <motion.form
                          key="email-form"
                          onSubmit={handleSubmit}
                          noValidate
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.32, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 pt-1">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={role}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="space-y-3"
                              >
                                {/* Campos según rol */}
                                {role === "PROFESIONAL" ? (
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <Input
                                      label={t("register.name")}
                                      value={fields.name}
                                      onChange={setField("name")}
                                      placeholder={t("register.namePlaceholder")}
                                      icon={User}
                                      error={errors.name}
                                      autoComplete="given-name"
                                    />
                                    <Input
                                      label={t("register.lastName")}
                                      value={fields.lastName}
                                      onChange={setField("lastName")}
                                      placeholder={t("register.lastNamePlaceholder")}
                                      icon={User}
                                      error={errors.lastName}
                                      autoComplete="family-name"
                                    />
                                  </div>
                                ) : (
                                  <Input
                                    label={t("register.company") || "Nombre de empresa"}
                                    value={fields.company}
                                    onChange={setField("company")}
                                    placeholder={t("register.companyPlaceholder") || "Acme Inc."}
                                    icon={Building2}
                                    error={errors.company}
                                    autoComplete="organization"
                                  />
                                )}

                                {/* Email */}
                                <Input
                                  label={role === "RECLUTADOR" ? (t("register.corporateEmail") || "Correo corporativo") : t("register.email")}
                                  type="email"
                                  value={fields.email}
                                  onChange={setField("email")}
                                  placeholder={role === "RECLUTADOR" ? "tu@empresa.com" : t("register.emailPlaceholder")}
                                  icon={Mail}
                                  error={errors.email}
                                  autoComplete="email"
                                />

                                {/* Contraseñas */}
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <Input
                                      label={t("register.password")}
                                      type={showPassword ? "text" : "password"}
                                      value={fields.password}
                                      onChange={setField("password")}
                                      placeholder={t("register.passwordPlaceholder")}
                                      icon={Lock}
                                      error={errors.password}
                                      autoComplete="new-password"
                                      rightElement={
                                        <button
                                          type="button"
                                          onClick={() => setShowPassword((v) => !v)}
                                          className="text-muted-foreground hover:text-foreground transition-colors"
                                          tabIndex={-1}
                                        >
                                          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                      }
                                    />
                                    <PasswordStrength
                                      password={fields.password}
                                      labels={strengthLabels}
                                      colors={strengthColors}
                                    />
                                  </div>
                                  <Input
                                    label={t("register.confirmPassword")}
                                    type={showConfirm ? "text" : "password"}
                                    value={fields.confirmPassword}
                                    onChange={setField("confirmPassword")}
                                    placeholder={t("register.confirmPasswordPlaceholder")}
                                    icon={Lock}
                                    error={errors.confirmPassword}
                                    autoComplete="new-password"
                                    rightElement={
                                      <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                      >
                                        {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                                      </button>
                                    }
                                  />
                                </div>
                              </motion.div>
                            </AnimatePresence>

                            {/* Términos */}
                            <div>
                              <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                                <div className="relative shrink-0 mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => {
                                      setAcceptTerms(e.target.checked);
                                      setErrors((c) => ({ ...c, terms: undefined }));
                                    }}
                                    className="sr-only"
                                  />
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    acceptTerms
                                      ? "bg-blue-500 border-blue-500"
                                      : errors.terms
                                      ? "border-red-500/60 bg-background"
                                      : "border-white/25 bg-background group-hover:border-white/40"
                                  }`}>
                                    {acceptTerms && (
                                      <motion.svg
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        width="9" height="9" viewBox="0 0 10 10" fill="none"
                                      >
                                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                      </motion.svg>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground leading-snug">
                                  {t("register.terms")}{" "}
                                  <a href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                                    {t("register.termsLink")}
                                  </a>{" "}
                                  {t("register.and")}{" "}
                                  <a href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                                    {t("register.privacyLink")}
                                  </a>
                                </span>
                              </label>
                              <FieldError message={errors.terms} />
                            </div>

                            {/* Submit */}
                            <motion.button
                              type="submit"
                              disabled={loading}
                              whileTap={{ scale: 0.98 }}
                              className="w-full h-11 bg-linear-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                              {loading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                />
                              ) : (
                                t("register.submit") || `Crear cuenta como ${role === "PROFESIONAL" ? "profesional" : "reclutador"}`
                              )}
                            </motion.button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-5 pt-5 border-t border-white/8">
                  {t("register.hasAccount")}{" "}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    {t("register.loginLink")}
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}