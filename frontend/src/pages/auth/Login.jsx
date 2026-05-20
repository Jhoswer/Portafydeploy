import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import { fetchProfile } from "../../services/authService";
import GoogleButton from "../../components/auth/GoogleButton";
import LinkedInButton from "../../components/auth/LinkedInButton";
import GitHubButton from "../../components/auth/GithubButton";
import AuthBrand from "../../components/auth/AuthBrand";
import AuthFieldError from "../../components/auth/AuthFieldError";
import { getPostAuthRedirectPath } from "../../utils/authNavigation";

void motion;

export default function Login() {
  const navigate = useNavigate();
  const { user, login, loginWithGoogle, loginWithLinkedIn, loginWithGitHub, updateUser } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate(getPostAuthRedirectPath(user), { replace: true });
  }, [navigate, user]);
  useEffect(() => {
  const previousPadding = document.body.style.paddingTop;
  document.body.style.paddingTop = "0px";

  return () => {
    document.body.style.paddingTop = previousPadding;
  };
}, []);

  const validate = () => {
    const nextErrors = {};

    if (!email) nextErrors.email = t("login.errors.emailRequired");
    else if (!email.includes("@") || !email.includes(".")) {
      nextErrors.email = t("login.errors.emailInvalid");
    }

    if (!password) nextErrors.password = t("login.errors.passwordRequired");
    else if (password.length < 6) nextErrors.password = t("login.errors.passwordShort");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

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
      return;
    } catch {
      navigate(getPostAuthRedirectPath(nextUser || data?.user));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.ok) {
        setErrors({ password: result.error || t("login.errors.invalid") });
        return;
      }

      navigate(getPostAuthRedirectPath(result.user), {
        state: {
        role: result.user.rol
      }
      });
    } catch {
      setErrors({ password: t("login.errors.connection") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <Link
        to="/"
        className="absolute top-7 left-7 flex items-center gap-2 text-sm transition-colors group"
        style={{ color: "var(--muted)", zIndex: 2 }}
      >
        <ArrowLeft
          size={15}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        {t("login.back")}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="auth-card">
          <AuthBrand title={t("login.title")} subtitle={t("login.welcome")} />

          <div className="auth-social">
            <GoogleButton
              label={t("login.continueGoogle")}
              disabled={loading}
              onSuccess={(data) => handleAuthSuccess(data, loginWithGoogle)}
            />
            <GitHubButton
              label={t("login.continueGitHub")}
              disabled={loading}
              onSuccess={(data) => handleAuthSuccess(data, loginWithGitHub)}
            />
            <LinkedInButton
              label={t("login.continueLinkedIn")}
              disabled={loading}
              onSuccess={(data) => handleAuthSuccess(data, loginWithLinkedIn)}
            />
          </div>

          <div className="auth-divider">
            <div className="auth-divider__line" />
            <span className="auth-divider__text">{t("login.orWith")}</span>
            <div className="auth-divider__line" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div
              className={
                `auth-field${errors.email ? " auth-field--error" : ""}`
              }
            >
              <label className="auth-label">{t("login.email")}</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({ ...current, email: undefined }));
                  }}
                  placeholder={t("login.emailPlaceholder")}
                  className="auth-input"
                />
              </div>
              <AuthFieldError message={errors.email} />
            </div>

            <div
              className={
                `auth-field${errors.password ? " auth-field--error" : ""}`
              }
            >
              <label className="auth-label">{t("login.password")}</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  placeholder={t("login.passwordPlaceholder")}
                  className="auth-input auth-input--pass"
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword((current) => !current)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Link to="/forgot-password" className="auth-forgot">
                {t("login.forgotPassword")}
              </Link>
              <AuthFieldError message={errors.password} />
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <span
                  className="auth-spin"
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                t("login.submit")
              )}
            </button>
          </form>

          <p className="auth-switch">
            {t("login.noAccount")}
            <Link to="/register" className="auth-switch__link">
              {t("login.registerLink")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
