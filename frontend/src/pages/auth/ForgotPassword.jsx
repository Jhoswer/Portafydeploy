import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "../../services/authService";
import AuthFieldError from "../../components/auth/AuthFieldError";

void motion;

export default function ForgotPassword() {
  const { t } = useTranslation();

  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const validate = () => {
    if (!email) return t("forgotPassword.errors.emailRequired");
    if (!email.includes("@") || !email.includes(".")) return t("forgotPassword.errors.emailInvalid");
    return null;
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

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message ?? t("forgotPassword.errors.default"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <Link
        to="/login"
        className="absolute top-7 left-7 flex items-center gap-2 text-sm transition-colors group"
        style={{ color: "var(--muted)", zIndex: 2 }}
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        {t("forgotPassword.back")}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}
      >
        <div className="auth-card">

          <AnimatePresence>
            {sent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-card--success"
              >
                <div className="auth-success-icon">
                  <CheckCircle2 size={32} />
                </div>

                <h2 className="auth-card__title">{t("forgotPassword.successTitle")}</h2>
                <p className="auth-card__sub">
                  {t("forgotPassword.successMsg")}
                </p>

                <Link to="/login" className="auth-link" style={{ marginTop: 12 }}>
                  {t("forgotPassword.backToLogin")}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {!sent && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h1 className="auth-card__title">{t("forgotPassword.title")}</h1>
                <p className="auth-card__sub">{t("forgotPassword.subtitle")}</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="auth-form">
                <div className={"auth-field" + (error ? " auth-field--error" : "")}>
                  <label className="auth-label">{t("forgotPassword.email")}</label>
                  <div className="auth-input-wrap">
                    <Mail size={15} className="auth-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder={t("forgotPassword.emailPlaceholder")}
                      className="auth-input"
                    />
                  </div>
                  <AuthFieldError message={error} />
                </div>

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? (
                    <span className="auth-spin" />
                  ) : t("forgotPassword.submit")}
                </button>
              </form>

              <p className="auth-switch">
                {t("forgotPassword.rememberPassword")}{" "}
                <Link to="/login" className="auth-switch__link">
                  {t("forgotPassword.loginLink")}
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
