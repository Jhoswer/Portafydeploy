
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";


export function StepWrapper({ children, stepKey }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Círculo de ícono ───────────────────────────────────── */
export function IconCircle({ children }) {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: "var(--red)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 20px rgba(255,107,107,.25)",
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

/* ── Error de campo ─────────────────────────────────────── */
export function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: 11, color: "#e24b4a", marginTop: 4, fontFamily: "var(--f-body)" }}>
      {msg}
    </p>
  );
}

/* ── Hint de campo ──────────────────────────────────────── */
export function FieldHint({ msg }) {
  return (
    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontFamily: "var(--f-body)" }}>
      {msg}
    </p>
  );
}

/* ── Wrapper de input con ícono ─────────────────────────── */
export function InputWrap({ icon, children }) {
  return (
    <div className="auth-input-wrap">
      {icon && <span className="auth-input-icon">{icon}</span>}
      {children}
    </div>
  );
}

/* ── Badge "opcional" ───────────────────────────────────── */
export function OptionalBadge() {
  return (
    <span style={{
      fontSize: 10, color: "var(--muted)", background: "rgba(162,214,249,.12)",
      borderRadius: 4, padding: "1px 6px", marginLeft: 6,
      fontFamily: "var(--f-body)", verticalAlign: "middle",
    }}>
      opcional
    </span>
  );
}

/* ── Botones de acción (siguiente / volver) ─────────────── */
export function Actions({ onNext, nextLabel, onBack, backLabel, loading }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 28, width: "100%" }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--f-ui)", fontSize: 13, fontWeight: 600,
            color: "var(--muted)", marginBottom: 4, padding: 0,
            transition: "color .2s",
          }}
          onMouseOver={e => e.currentTarget.style.color = "var(--body)"}
          onMouseOut={e => e.currentTarget.style.color = "var(--muted)"}
        >
          <ArrowLeft size={13} /> {backLabel}
        </button>
      )}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        disabled={loading}
        className="auth-submit"
        style={{ marginTop: 0 }}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{
              width: 16, height: 16,
              border: "2px solid rgba(255,255,255,.3)",
              borderTopColor: "#fff", borderRadius: "50%",
            }}
          />
        ) : nextLabel}
      </motion.button>
    </div>
  );
}

/* ── Barra de progreso ──────────────────────────────────── */
export function ProgressBar({ steps, currentStep }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 8, width: "100%" }}>
      {steps.map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 99,
          background: i < currentStep
            ? "#27ae60"
            : i === currentStep
              ? "var(--red)"
              : "rgba(162,214,249,.25)",
          transition: "background .3s",
        }} />
      ))}
    </div>
  );
}

/* ── Labels de pasos ────────────────────────────────────── */
export function StepLabels({ steps, currentStep }) {
  return (
    <div style={{ display: "flex", marginBottom: 28, width: "100%" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <span style={{
            fontSize: 10, fontFamily: "var(--f-ui)", fontWeight: 600,
            color: i === currentStep ? "var(--red)" : i < currentStep ? "#27ae60" : "var(--muted)",
            transition: "color .3s",
          }}>
            {i < currentStep ? "✓ " : ""}{s.label}
          </span>
        </div>
      ))}
    </div>
  );
}