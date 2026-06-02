import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";

import RoleSelector from "./RoleSelector";
import SocialAuthButtons from "./SocialAuthButtons";
import EmailRegisterForm from "./EmailRegisterForm";
import StepLabel from "./StepLabel";
import FieldError from "./FieldError";
import config from "../../config";

export default function RegisterForm() {
  const { t, i18n } = useTranslation();
  const recaptchaRef = useRef(null);

  const [role, setRole] = useState("PROFESIONAL");
  const [showForm, setShowForm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Detectar modo oscuro reactivo
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Resetear captcha cuando cambia el idioma
  useEffect(() => {
    resetCaptcha();
  }, [i18n.language]);

  const recaptchaEnabled = Boolean(config.recaptchaSiteKey);
  const captchaOk = !recaptchaEnabled || Boolean(captchaToken);
  const actionsEnabled = captchaOk && !loading;
  const stepActions = recaptchaEnabled ? 3 : 2;

  const resetCaptcha = () => {
    recaptchaRef.current?.reset();
    setCaptchaToken(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          {t("register.title")}
        </h1>
        <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
          {t("register.subtitle")}
        </p>
      </div>

      {/* Error general */}
      <AnimatePresence>
        {errors.general && (
          <motion.div className="flex items-center gap-2 text-sm text-red-400 mb-4">
            <AlertCircle size={14} /> {errors.general}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paso 1 — Tipo de cuenta */}
      <div className="mb-4">
        <StepLabel number={1} label={t("register.accountType")} />
        <RoleSelector
          value={role}
          onChange={(r) => {
            setRole(r);
            setShowForm(false);
            setErrors({});
          }}
        />
      </div>

      {/* Paso 2 — CAPTCHA */}
      {recaptchaEnabled && (
        <div className="mb-4">
          <StepLabel number={2} label={t("register.captchaLabel")} />

          <div
            className="
              border border-black/8 dark:border-white/8
              rounded-xl p-3
              bg-black/2 dark:bg-white/2
            "
          >
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={config.recaptchaSiteKey}
              theme={isDark ? "dark" : "light"}
              hl={i18n.language}
              onChange={(token) => {
                setCaptchaToken(token);
                setErrors((current) => ({
                  ...current,
                  captcha: undefined,
                }));
              }}
              onExpired={resetCaptcha}
            />
          </div>

          <FieldError message={errors.captcha} />
        </div>
      )}

      {/* Paso 3 — Acciones */}
      <div>
        <StepLabel
          number={stepActions}
          label={t("register.continueWith")}
        />

        <SocialAuthButtons
          disabled={!actionsEnabled}
          role={role}
        />

        {/* Divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-black/8 dark:bg-white/8" />

          <span className="text-xs text-gray-400 dark:text-slate-500">
            {t("register.orWith")}
          </span>

          <div className="flex-1 h-px bg-black/8 dark:bg-white/8" />
        </div>

        {/* Email toggle */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.button
              key="btn"
              onClick={() => actionsEnabled && setShowForm(true)}
              className="auth-submit"
            >
              {t("register.continueEmail")}
              <ChevronDown size={14} />
            </motion.button>
          ) : (
            <EmailRegisterForm
              key="form"
              role={role}
              setErrors={setErrors}
              loading={loading}
              setLoading={setLoading}
              captchaToken={captchaToken}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <p className="text-center text-sm mt-5 text-gray-500 dark:text-slate-400">
        {t("register.hasAccount")}{" "}
        <a
          href="/login"
          className="text-blue-500 dark:text-blue-400 font-medium hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          {t("register.loginLink")}
        </a>
      </p>
    </motion.div>
  );
}