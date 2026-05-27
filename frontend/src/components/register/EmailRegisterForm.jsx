import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useRegisterForm } from "../../hooks/useRegisterForm";
import Input from "./Input";
import PasswordStrength from "./PasswordStrength";
import FieldError from "./FieldError";

export default function EmailRegisterForm({ role, setErrors, captchaToken }) {
  const { t } = useTranslation();
  const { fields, errors, loading, acceptTerms, setField, setAcceptTerms, handleSubmit } =
    useRegisterForm(role, setErrors, captchaToken);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = ["", t("register.strength.weak"), t("register.strength.moderate"), t("register.strength.moderate"), t("register.strength.strong")];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 mt-2"
    >
      {/* Campos según rol */}
      <AnimatePresence mode="wait">
        {role === "PROFESIONAL" ? (
          <motion.div key="prof" className="grid grid-cols-2 gap-2">
            <Input label={t("register.name")}     value={fields.name}     onChange={setField("name")}     placeholder={t("register.namePlaceholder")}     icon={User}  error={errors.name} />
            <Input label={t("register.lastName")} value={fields.lastName} onChange={setField("lastName")} placeholder={t("register.lastNamePlaceholder")} icon={User}  error={errors.lastName} />
          </motion.div>
        ) : (
          <Input label={t("register.company")} value={fields.company} onChange={setField("company")} placeholder={t("register.companyPlaceholder")} icon={Building2} error={errors.company} />
        )}
      </AnimatePresence>

      {/* Email */}
      <Input
        label={role === "RECLUTADOR" ? t("register.corporateEmail") : t("register.email")}
        type="email"
        value={fields.email}
        onChange={setField("email")}
        placeholder={t("register.emailPlaceholder")}
        icon={Mail}
        error={errors.email}
      />

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Input
            label={t("register.password")}
            type={showPassword ? "text" : "password"}
            value={fields.password}
            onChange={setField("password")}
            placeholder={t("register.passwordPlaceholder")}
            icon={Lock}
            error={errors.password}
            rightElement={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <PasswordStrength password={fields.password} labels={strengthLabels} colors={strengthColors} />
        </div>

        <Input
          label={t("register.confirmPassword")}
          type={showConfirm ? "text" : "password"}
          value={fields.confirmPassword}
          onChange={setField("confirmPassword")}
          placeholder={t("register.confirmPasswordPlaceholder")}
          icon={Lock}
          error={errors.confirmPassword}
          rightElement={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
      </div>

      {/* Términos */}
      <div>
        <label className="flex gap-2 text-xs items-start">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 accent-blue-500"
          />
          <span className="text-gray-500 dark:text-slate-400">
            {t("register.terms")}{" "}
            <a href="/terms" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors">
              {t("register.termsLink")}
            </a>
            {" "}{t("register.and")}{" "}
            <a href="/privacy" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors">
              {t("register.privacyLink")}
            </a>
          </span>
        </label>
        <FieldError message={errors.terms} />
      </div>

      {/* Submit */}
      <motion.button type="submit" disabled={loading} className="auth-submit">
        {loading ? "..." : t("register.submit")}
      </motion.button>
    </motion.form>
  );
}