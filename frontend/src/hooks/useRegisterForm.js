import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

export function useRegisterForm(role, setGlobalErrors, captchaToken) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    name: "",
    lastName: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const setField = (key) => (value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};

    if (role === "PROFESIONAL") {
      if (!fields.name.trim()) next.name = t("register.errors.nameRequired");
      if (!fields.lastName.trim()) next.lastName = t("register.errors.lastNameRequired");
    } else {
      if (!fields.company.trim()) next.company = t("register.errors.companyRequired");
    }

    if (!fields.email) next.email = t("register.errors.emailRequired");

    if (!fields.password) next.password = t("register.errors.passwordRequired");

    if (fields.password.length < 8) {
      next.password = t("register.errors.passwordShort");
    }

    if (fields.password !== fields.confirmPassword) {
      next.confirmPassword = t("register.errors.passwordMismatch");
    }

    if (!acceptTerms) next.terms = t("register.errors.termsRequired");

    if (!captchaToken) {
      next.captcha = t("register.errors.captchaRequired");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("CLICK SUBMIT");

    const isValid = validate();
    console.log("VALID?", isValid);

    if (!isValid) return;

    setLoading(true);

    try {
      const payload = {
        email: fields.email,
        password: fields.password,
        password_confirmation: fields.confirmPassword,
        captcha_token: captchaToken,
        role,
        ...(role === "PROFESIONAL"
          ? { name: fields.name, lastName: fields.lastName }
          : { company: fields.company }),
      };

      const response = await registerUser(payload);

      console.log("RESPUESTA:", response);

      const user = response.user || response;
      const token = response.token || user.token;

      // guardar token
      localStorage.setItem("token", token);

      // redirigir a login
      navigate("/login");

    } catch (error) {
      if (setGlobalErrors) {
        setGlobalErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    fields,
    errors,
    loading,
    acceptTerms,
    setField,
    setAcceptTerms,
    handleSubmit
  };
}