import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, User, Mail, Lock, Eye, EyeOff, MapPin,
  CheckCircle2, X, AlertCircle, Hash,
} from "lucide-react";
import { crearAdministrador } from "../../../services/adminService";
import { LATIN_AMERICA_LOCATIONS, getCitiesForCountry } from "../../../data/locations/latinAmericaLocations";

void motion;

/* ─── Dark-mode CSS injected once ─────────────────────────────────────────── */
const DARK_STYLE_ID = "agregar-admin-dark";
if (typeof document !== "undefined" && !document.getElementById(DARK_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = DARK_STYLE_ID;
  style.textContent = `
    /* Selectors: class="dark" on <html>/<body> OR data-theme="dark" on <html> */
    .dark .aa-card,
    [data-theme="dark"] .aa-card {
      background: #1e2535 !important;
      border-color: rgba(99,132,174,0.18) !important;
      box-shadow: 0 4px 24px rgba(0,0,0,.30) !important;
    }

    .dark .aa-modal-backdrop,
    [data-theme="dark"] .aa-modal-backdrop {
      background: rgba(4, 8, 18, 0.75) !important;
    }

    .dark .aa-modal,
    [data-theme="dark"] .aa-modal {
      background: #1e2535 !important;
      border-color: rgba(99,132,174,0.15) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,.55), 0 4px 16px rgba(0,0,0,.30) !important;
    }

    .dark .aa-summary,
    [data-theme="dark"] .aa-summary {
      background: #151c2c !important;
      border-color: rgba(99,132,174,0.18) !important;
    }

    .dark .aa-summary-row-even,
    [data-theme="dark"] .aa-summary-row-even {
      background: #151c2c !important;
    }

    .dark .aa-summary-row-odd,
    [data-theme="dark"] .aa-summary-row-odd {
      background: #1a2133 !important;
    }

    .dark .aa-summary-row-border,
    [data-theme="dark"] .aa-summary-row-border {
      border-bottom-color: rgba(99,132,174,0.15) !important;
    }

    .dark .aa-summary-label,
    [data-theme="dark"] .aa-summary-label {
      color: #94a3b8 !important;
    }

    .dark .aa-summary-value,
    [data-theme="dark"] .aa-summary-value {
      color: #e2e8f0 !important;
    }

    .dark .aa-cancel-btn,
    [data-theme="dark"] .aa-cancel-btn {
      background: #252f42 !important;
      border-color: rgba(99,132,174,0.25) !important;
      color: #94a3b8 !important;
    }

    .dark .aa-cancel-btn:hover,
    [data-theme="dark"] .aa-cancel-btn:hover {
      border-color: rgba(99,132,174,0.45) !important;
      color: #e2e8f0 !important;
    }

    .dark .aa-title,
    [data-theme="dark"] .aa-title {
      color: #e2e8f0 !important;
    }

    .dark .aa-subtitle,
    [data-theme="dark"] .aa-subtitle {
      color: #94a3b8 !important;
    }

    .dark .aa-success-title,
    [data-theme="dark"] .aa-success-title {
      color: #e2e8f0 !important;
    }

    .dark .aa-success-text,
    [data-theme="dark"] .aa-success-text {
      color: #94a3b8 !important;
    }

    .dark .aa-region-hint,
    [data-theme="dark"] .aa-region-hint {
      color: #64748b !important;
    }
  `;
  document.head.appendChild(style);
}
/* ─────────────────────────────────────────────────────────────────────────── */

const DEFAULT_REGION = "Por defecto";

export default function AgregarAdmin() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    last_name: "",
    email: "",
    number: "",
    pais: "",
    ciudad: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleCountryChange = (e) => {
    const nextCountry = e.target.value;
    setForm((current) => ({
      ...current,
      pais: nextCountry,
      ciudad: nextCountry === DEFAULT_REGION ? DEFAULT_REGION : "",
    }));
    if (error) setError("");
  };

  const validate = () => {
    if (!form.name.trim())        return t("agregarAdmin.errorNombre");
    if (!form.last_name.trim())   return t("agregarAdmin.errorApellido");
    if (!form.email.trim())       return t("agregarAdmin.errorCorreo");
    if (!/\S+@\S+\.\S+/.test(form.email)) return t("agregarAdmin.errorCorreoValido");
    if (form.number && !/^\d+$/.test(form.number)) return t("agregarAdmin.errorNumero");
    if (!form.pais.trim())        return t("agregarAdmin.errorPais");
    if (!form.ciudad.trim())      return t("agregarAdmin.errorCiudad");
    if (!form.password)           return t("agregarAdmin.errorContrasena");
    if (form.password.length < 8) return t("agregarAdmin.errorContrasenaCorta");
    if (form.password !== form.confirmPassword) return t("agregarAdmin.errorContrasenaNoCoincide");
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError("");
    try {
      await crearAdministrador({
        name: form.name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        number: form.number.trim() || undefined,
        pais: form.pais.trim(),
        ciudad: form.ciudad.trim(),
        password: form.password,
      });
      setSuccess(true);
    } catch (e) {
      setError(e?.data?.message || e.message || t("agregarAdmin.errorGenerico"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      last_name: "",
      email: "",
      number: "",
      pais: "",
      ciudad: "",
      password: "",
      confirmPassword: "",
    });
    setSuccess(false);
    setError("");
    setConfirmOpen(false);
  };

  const fields = [
    { name: "name",      label: t("agregarAdmin.nombre"),   icon: <User size={15} />, type: "text",  placeholder: t("agregarAdmin.nombrePlaceholder")  },
    { name: "last_name", label: t("agregarAdmin.apellido"), icon: <User size={15} />, type: "text",  placeholder: t("agregarAdmin.apellidoPlaceholder") },
    { name: "email",     label: t("agregarAdmin.correo"),   icon: <Mail size={15} />, type: "email", placeholder: t("agregarAdmin.correoPlaceholder")   },
    { name: "number",    label: t("agregarAdmin.numero"),   icon: <Hash size={15} />, type: "text",  placeholder: t("agregarAdmin.numeroPlaceholder")   },
  ];

  const isDefaultRegion = form.pais === DEFAULT_REGION;
  const selectedRegionLabel =
    form.pais === DEFAULT_REGION
      ? t("agregarAdmin.porDefecto")
      : form.ciudad && form.pais
        ? `${form.ciudad}, ${form.pais}`
        : t("agregarAdmin.seleccionaCiudad");

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg, #ef5759, #d94547)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(239,87,89,.30)", flexShrink: 0,
        }}>
          <UserPlus size={20} color="white" />
        </div>
        <div>
          <h2 className="aa-title" style={{
            fontSize: 20, fontWeight: 700,
            fontFamily: "var(--f-ui, sans-serif)",
            color: "var(--text, #0f172a)",
            margin: 0, lineHeight: 1.2,
          }}>
            {t("agregarAdmin.titulo")}
          </h2>
          <p className="aa-subtitle" style={{
            fontSize: 13, color: "var(--muted, #64748b)",
            fontFamily: "var(--f-body, sans-serif)",
            margin: 0, marginTop: 2,
          }}>
            {t("agregarAdmin.subtitulo")}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="aa-card" style={{
        background: "var(--card, #fff)",
        border: "1.5px solid rgba(162,214,249,.35)",
        borderRadius: 18, padding: "28px 28px 24px",
        boxShadow: "0 4px 24px rgba(0,0,0,.05)",
      }}>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "24px 0" }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(39,174,96,.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <CheckCircle2 size={32} color="#27ae60" />
              </div>
              <h3 className="aa-success-title" style={{
                fontSize: 18, fontWeight: 700,
                fontFamily: "var(--f-ui, sans-serif)",
                color: "var(--text, #0f172a)", marginBottom: 8,
              }}>
                {t("agregarAdmin.successTitulo")}
              </h3>
              <p
                className="aa-success-text"
                style={{
                  fontSize: 14, color: "var(--muted, #64748b)",
                  fontFamily: "var(--f-body, sans-serif)", marginBottom: 24,
                }}
                dangerouslySetInnerHTML={{
                  __html: t("agregarAdmin.successMensaje", {
                    nombre: form.name,
                    apellido: form.last_name,
                  }),
                }}
              />
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 24px", borderRadius: 12,
                  background: "linear-gradient(135deg, #ef5759, #d94547)",
                  color: "white", border: "none", cursor: "pointer",
                  fontFamily: "var(--f-ui, sans-serif)", fontWeight: 600, fontSize: 14,
                  boxShadow: "0 4px 14px rgba(239,87,89,.30)", transition: "opacity .2s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = ".85"; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {t("agregarAdmin.agregarNuevo")}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {fields.slice(0, 2).map((field) => (
                  <Field key={field.name} {...field} value={form[field.name]} onChange={handleChange} />
                ))}
              </div>
              <Field {...fields[2]} value={form.email} onChange={handleChange} />
              <Field {...fields[3]} value={form.number} onChange={handleChange} />

              {/* País / Ciudad */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="auth-field">
                  <label className="auth-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    {t("agregarAdmin.pais")}
                  </label>
                  <div className="auth-input-wrap" style={{ display: "flex", alignItems: "center" }}>
                    <span className="auth-input-icon" style={{ flexShrink: 0 }}>
                      <MapPin size={15} />
                    </span>
                    <select
                      name="pais"
                      value={form.pais}
                      onChange={handleCountryChange}
                      className="auth-input"
                      style={{ flex: 1, appearance: "none" }}
                    >
                      <option value={DEFAULT_REGION}>{t("agregarAdmin.porDefecto")}</option>
                      <option value="">{t("agregarAdmin.seleccionaPais")}</option>
                      {LATIN_AMERICA_LOCATIONS.map((item) => (
                        <option key={item.country} value={item.country}>
                          {item.country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    {t("agregarAdmin.ciudad")}
                  </label>
                  <div className="auth-input-wrap" style={{ display: "flex", alignItems: "center" }}>
                    <span className="auth-input-icon" style={{ flexShrink: 0 }}>
                      <MapPin size={15} />
                    </span>
                    <select
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      className="auth-input"
                      style={{ flex: 1, appearance: "none" }}
                      disabled={!form.pais || isDefaultRegion}
                    >
                      <option value="">
                        {!form.pais
                          ? t("agregarAdmin.primeroPais")
                          : isDefaultRegion
                            ? t("agregarAdmin.porDefecto")
                            : t("agregarAdmin.seleccionaCiudad")}
                      </option>
                      {isDefaultRegion ? (
                        <option value={DEFAULT_REGION}>{t("agregarAdmin.porDefecto")}</option>
                      ) : getCitiesForCountry(form.pais).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <p className="aa-region-hint" style={{ fontSize: 12, color: "var(--muted, #64748b)", margin: "-6px 0 0" }}>
                {t("agregarAdmin.regionAsignada", { region: selectedRegionLabel })}
              </p>

              <Field
                name="password"
                label={t("agregarAdmin.contrasena")}
                icon={<Lock size={15} />}
                type={showPassword ? "text" : "password"}
                placeholder={t("agregarAdmin.contrasenaPlaceholder")}
                value={form.password}
                onChange={handleChange}
                suffix={
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted, #64748b)", display: "flex", padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <Field
                name="confirmPassword"
                label={t("agregarAdmin.confirmarContrasena")}
                icon={<Lock size={15} />}
                type={showConfirm ? "text" : "password"}
                placeholder={t("agregarAdmin.confirmarPlaceholder")}
                value={form.confirmPassword}
                onChange={handleChange}
                suffix={
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted, #64748b)", display: "flex", padding: 0 }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 14px", borderRadius: 10,
                      background: "rgba(239,87,89,.08)",
                      border: "1.5px solid rgba(239,87,89,.25)",
                    }}
                  >
                    <AlertCircle size={15} color="#ef5759" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: "#ef5759", margin: 0, fontFamily: "var(--f-body, sans-serif)" }}>
                      {error}
                    </p>
                    <button onClick={() => setError("")}
                      style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#ef5759", display: "flex", padding: 0 }}>
                      <X size={13} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="auth-submit"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }}
                  />
                ) : (
                  <><UserPlus size={15} /> {t("agregarAdmin.crearBtn")}</>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal
        open={confirmOpen}
        loading={loading}
        form={form}
        selectedRegionLabel={selectedRegionLabel}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}

function Field({ name, label, icon, type, placeholder, value, onChange, suffix }) {
  return (
    <div className="auth-field">
      <label htmlFor={name} className="auth-label"
        style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      <div className="auth-input-wrap" style={{ display: "flex", alignItems: "center" }}>
        <span className="auth-input-icon" style={{ flexShrink: 0 }}>{icon}</span>
        <input
          id={name} name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder}
          className="auth-input" style={{ flex: 1 }}
        />
        {suffix && <span style={{ paddingRight: 12, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ConfirmModal({ open, loading, form, selectedRegionLabel, onCancel, onConfirm }) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="aa-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            padding: 20,
            background: "rgba(8, 14, 28, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            className="aa-modal"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid rgba(148, 163, 184, 0.20)",
              boxShadow: "0 24px 64px rgba(8, 14, 28, 0.28), 0 4px 16px rgba(8, 14, 28, 0.10)",
              overflow: "hidden",
            }}
          >
            {/* Body */}
            <div style={{ padding: "26px 26px 18px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "rgba(239,87,89,.10)",
                border: "1px solid rgba(239,87,89,.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <UserPlus size={22} color="#ef5759" />
              </div>

              <h3 className="aa-title" style={{
                margin: 0, fontSize: 18, fontWeight: 700,
                color: "#0f172a",
                fontFamily: "var(--f-ui, sans-serif)",
                lineHeight: 1.3,
              }}>
                {t("agregarAdmin.confirmarTitulo")}
              </h3>

              <p className="aa-subtitle" style={{
                margin: "8px 0 20px", fontSize: 14, lineHeight: 1.6,
                color: "#64748b",
                fontFamily: "var(--f-body, sans-serif)",
              }}>
                {t("agregarAdmin.confirmarSubtitulo")}
              </p>

              {/* Resumen */}
              <div className="aa-summary" style={{
                display: "grid", gap: 0,
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}>
                {[
                  { label: t("agregarAdmin.nombre"),    value: form.name },
                  { label: t("agregarAdmin.filaApellido"), value: form.last_name },
                  { label: t("agregarAdmin.filaCorreo"),   value: form.email },
                  { label: t("agregarAdmin.filaNumero"),   value: form.number || t("agregarAdmin.noEspecificado") },
                  { label: t("agregarAdmin.filaRegion"),   value: selectedRegionLabel },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={[
                      i % 2 === 0 ? "aa-summary-row-even" : "aa-summary-row-odd",
                      i < arr.length - 1 ? "aa-summary-row-border" : "",
                    ].join(" ")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      padding: "11px 16px",
                      borderBottom: i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
                      background: i % 2 === 0 ? "#f8fafc" : "#f1f5f9",
                    }}
                  >
                    <span className="aa-summary-label" style={{
                      fontSize: 13, fontWeight: 600,
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}>
                      {row.label}
                    </span>
                    <span className="aa-summary-value" style={{
                      fontSize: 13, fontWeight: 500,
                      color: "#0f172a",
                      textAlign: "right",
                      wordBreak: "break-word",
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 10,
              padding: "0 26px 26px",
            }}>
              <button
                type="button"
                className="aa-cancel-btn"
                onClick={onCancel}
                disabled={loading}
                style={{
                  padding: "11px 20px", borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600, fontSize: 14,
                  fontFamily: "var(--f-ui, sans-serif)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "border-color .15s, color .15s",
                }}
              >
                {t("agregarAdmin.cancelar")}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                style={{
                  minWidth: 172, padding: "11px 20px", borderRadius: 12,
                  border: "none",
                  background: loading
                    ? "rgba(239,87,89,.55)"
                    : "linear-gradient(135deg, #ef5759 0%, #d94547 100%)",
                  color: "#fff",
                  fontWeight: 700, fontSize: 14,
                  fontFamily: "var(--f-ui, sans-serif)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  boxShadow: loading ? "none" : "0 8px 24px rgba(239,87,89,.30)",
                  transition: "box-shadow .2s, opacity .2s",
                }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.opacity = ".88"; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%" }}
                  />
                ) : (
                  <><UserPlus size={15} /> {t("agregarAdmin.confirmarCrear")}</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}