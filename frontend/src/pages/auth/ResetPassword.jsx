import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { resetPassword } from "../../services/authService";
import AuthFieldError from "../../components/auth/AuthFieldError";

void motion;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { t } = useTranslation();

  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [errors, setErrors]                   = useState({});
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);

  const validate = () => {
    const e = {};
    if (!password) e.password = t("resetPassword.errors.passwordRequired");
    else if (password.length < 8) e.password = t("resetPassword.errors.passwordShort");

    if (!confirmPassword) e.confirmPassword = t("resetPassword.errors.confirmRequired");
    else if (password !== confirmPassword) e.confirmPassword = t("resetPassword.errors.passwordMismatch");

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  useEffect(() => {
  const previousPadding = document.body.style.paddingTop;
  document.body.style.paddingTop = "0px";

  return () => {
    document.body.style.paddingTop = previousPadding;
  };
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      setSuccess(true);
      await new Promise((r) => setTimeout(r, 1200));
      navigate("/login");
    } catch (error) {
      setErrors({ general: error.message ?? t("resetPassword.errors.default") });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = Math.min(Math.floor(password.length / 3), 4);
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = [
    "",
    t("resetPassword.strength.weak"),
    t("resetPassword.strength.moderate"),
    t("resetPassword.strength.moderate"),
    t("resetPassword.strength.strong"),
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <Link
        to="/login"
        className="absolute top-7 left-7 flex items-center gap-2 text-sm transition-colors group"
        style={{ color: "var(--muted)", zIndex: 2 }}
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        {t("resetPassword.back")}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}
      >
        <div className="auth-card">

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-card--success"
              >
                <div className="auth-success-icon">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="auth-card__title">{t("resetPassword.success")}</h2>
                <p className="auth-card__sub">{t("resetPassword.redirecting")}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h1 className="auth-card__title">{t("resetPassword.title")}</h1>
                <p className="auth-card__sub">{t("resetPassword.subtitle")}</p>
              </div>

              <AuthFieldError message={errors.general} className="auth-alert" />

              <form onSubmit={handleSubmit} noValidate className="auth-form">
                <div className={"auth-field" + (errors.password ? " auth-field--error" : "")}>
                  <label className="auth-label">{t("resetPassword.password")}</label>
                  <div className="auth-input-wrap">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((p) => ({ ...p, password: undefined }));
                      }}
                      placeholder={t("resetPassword.passwordPlaceholder")}
                      className="auth-input auth-input--pass"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-eye"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <AuthFieldError message={errors.password} />
                </div>

                {password.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-strength">
                    <div className="auth-strength__bars">
                      {[1, 2, 3, 4].map((level) => {
                        return (
                          <div
                            key={level}
                            className="auth-strength__bar"
                            style={{
                              background: level <= passwordStrength
                                ? strengthColors[passwordStrength - 1]
                                : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                    <span
                      className="auth-strength__label"
                      style={{ color: strengthColors[passwordStrength - 1] }}
                    >
                      {strengthLabels[passwordStrength]}
                    </span>
                  </motion.div>
                )}

                <div className={"auth-field" + (errors.confirmPassword ? " auth-field--error" : "")}>
                  <label className="auth-label">{t("resetPassword.confirmPassword")}</label>
                  <div className="auth-input-wrap">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((p) => ({ ...p, confirmPassword: undefined }));
                      }}
                      placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                      className="auth-input auth-input--pass"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="auth-eye"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <AuthFieldError message={errors.confirmPassword} />
                </div>

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? (
                    <span className="auth-spin" />
                  ) : t("resetPassword.submit")}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
