import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/useAuth";
import { fetchProfile } from "../../services/authService";
import { getPostAuthRedirectPath } from "../../utils/authNavigation";

import Input from "../register/Input";
import FieldError from "../register/FieldError";
import SocialAuthButtons from "../register/SocialAuthButtons";
import StepLabel from "../register/StepLabel";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithLinkedIn, loginWithGitHub, updateUser } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);

  /* ── Validación ─────────────────────────────────────────── */
  const validate = () => {
    const next = {};
    if (!email)
      next.email = t("login.errors.emailRequired");
    else if (!email.includes("@") || !email.includes("."))
      next.email = t("login.errors.emailInvalid");

    if (!password)
      next.password = t("login.errors.passwordRequired");
    else if (password.length < 6)
      next.password = t("login.errors.passwordShort");

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── Auth social ────────────────────────────────────────── */
  const handleAuthSuccess = async (data, loginWithProvider) => {
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

  /* ── Submit email/pass ──────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setErrors({ general: result.error || t("login.errors.invalid") });
        return;
      }
      navigate(getPostAuthRedirectPath(result.user));
    } catch {
      setErrors({ general: t("login.errors.connection") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-black">
          {t("login.title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("login.welcome")}
        </p>
      </div>

      {/* Error general */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="login-error-banner"
          >
            <AlertCircle size={14} />
            {errors.general}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paso 1 — Social */}
      <div className="mb-4">
        <StepLabel number={1} label={t("login.continueWith")} />
        <SocialAuthButtons
          disabled={loading}
          onGoogleSuccess={(data) => handleAuthSuccess(data, loginWithGoogle)}
          onGitHubSuccess={(data) => handleAuthSuccess(data, loginWithGitHub)}
          onLinkedInSuccess={(data) => handleAuthSuccess(data, loginWithLinkedIn)}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">{t("login.orWith")}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Paso 2 — Email + Password */}
      <div>
        <StepLabel number={2} label={t("login.withEmail")} />

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* Email */}
          <Input
            label={t("login.email")}
            type="email"
            value={email}
            onChange={(val) => {
              setEmail(val);
              setErrors((c) => ({ ...c, email: undefined, general: undefined }));
            }}
            placeholder={t("login.emailPlaceholder")}
            icon={Mail}
            error={errors.email}
            autoComplete="email"
          />

          {/* Password */}
          <div>
            <Input
              label={t("login.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(val) => {
                setPassword(val);
                setErrors((c) => ({ ...c, password: undefined, general: undefined }));
              }}
              placeholder={t("login.passwordPlaceholder")}
              icon={Lock}
              error={errors.password}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {/* Forgot password */}
            <div className="flex justify-end mt-1.5">
              <Link to="/forgot-password" className="login-forgot">
                {t("login.forgotPassword")}
              </Link>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="auth-submit"
          >
            {loading ? <span className="login-spinner" /> : t("login.submit")}
          </motion.button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm mt-5">
        {t("login.noAccount")}{" "}
        <Link to="/register" className="login-switch-link">
          {t("login.registerLink")}
        </Link>
      </p>
    </motion.div>
  );
}