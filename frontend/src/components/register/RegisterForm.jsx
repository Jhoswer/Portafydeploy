import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Mail,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";

import RoleSelector from "./RoleSelector";
import SocialAuthButtons from "./SocialAuthButtons";
import EmailRegisterForm from "./EmailRegisterForm";
import StepLabel from "./StepLabel";
import FieldError from "./FieldError";

import config from "../../config";

export default function RegisterForm() {
  const { t } = useTranslation();
  const recaptchaRef = useRef(null);

  const [role, setRole] = useState("PROFESIONAL");
  const [showForm, setShowForm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
        <h1 className="text-2xl font-bold text-black">
          {t("register.title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("register.subtitle")}
        </p>
      </div>

      {/* Error general */}
      <AnimatePresence>
        {errors.general && (
          <motion.div className="text-red-400 mb-4">
            <AlertCircle size={14} /> {errors.general}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paso 1 */}
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

      {/* CAPTCHA */}
      {recaptchaEnabled && (
        <div className="mb-4">
          <StepLabel number={2} label={t("register.captchaLabel")} />

          <div className="border p-3 rounded-xl">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={config.recaptchaSiteKey}
              theme="white"
             onChange={(token) => {
            console.log("CAPTCHA TOKEN:", token); // 🔥 DEBUG
            setCaptchaToken(token);
            setErrors((c) => ({ ...c, captcha: undefined }));
            }}

              onExpired={resetCaptcha}
            />
          </div>

          <FieldError message={errors.captcha} />
        </div>
      )}

      {/* Paso acciones */}
      <div>
        <StepLabel number={stepActions} label={t("register.continueWith")} />

        {/* Social */}
        <SocialAuthButtons disabled={!actionsEnabled} role={role} />

        {/* Divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs">{t("register.orWith")}</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email */}
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
      <p className="text-center text-sm mt-5">
        {t("register.hasAccount")}{" "}
        <a href="/login" className="text-blue-400">
          {t("register.loginLink")}
        </a>
      </p>
    </motion.div>
  );
}
