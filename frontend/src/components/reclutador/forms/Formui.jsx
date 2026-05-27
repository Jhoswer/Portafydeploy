import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

/* ── Wrapper animado de paso ────────────────────────────── */
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
    <div className="forms-icon-circle">
      {children}
    </div>
  );
}

/* ── Error de campo ─────────────────────────────────────── */
export function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: 11, color: "#e24b4a", marginTop: 4, fontFamily: "var(--font-body)" }}>
      {msg}
    </p>
  );
}

/* ── Hint de campo ──────────────────────────────────────── */
export function FieldHint({ msg }) {
  return (
    <p style={{ fontSize: 11, color: "var(--color-muted-text)", marginTop: 4, fontFamily: "var(--font-body)" }}>
      {msg}
    </p>
  );
}

/* ── Wrapper de input con ícono ─────────────────────────── */
export function InputWrap({ icon, textarea, children }) {
  return (
    <div className={`forms-input-wrap${textarea ? " forms-input-wrap--textarea" : ""}`}>
      {icon && <span className="forms-input-icon">{icon}</span>}
      {children}
    </div>
  );
}

/* ── Badge "opcional" ───────────────────────────────────── */
export function OptionalBadge() {
  return (
    <span style={{
      fontSize: 10,
      color: "var(--color-muted-text)",
      background: "rgba(162,214,249,.12)",
      borderRadius: 4,
      padding: "1px 6px",
      marginLeft: 6,
      fontFamily: "var(--font-body)",
      verticalAlign: "middle",
    }}>
      opcional
    </span>
  );
}

/* ── Botones de acción (siguiente / volver) ─────────────── */
export function Actions({ onNext, nextLabel, onBack, backLabel, loading }) {
  return (
    <div className="forms-actions">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="forms-back-btn"
        >
          <ArrowLeft size={13} /> {backLabel}
        </button>
      )}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        disabled={loading}
        className="forms-submit"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(255,255,255,.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
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
    <div className="forms-progress">
      {steps.map((_, i) => (
        <div
          key={i}
          className={`forms-progress__segment ${
            i < currentStep
              ? "forms-progress__segment--done"
              : i === currentStep
                ? "forms-progress__segment--active"
                : "forms-progress__segment--pending"
          }`}
        />
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
            fontSize: 10,
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            color: i === currentStep
              ? "var(--color-red)"
              : i < currentStep
                ? "var(--color-success)"
                : "var(--color-muted-text)",
            transition: "color .3s",
          }}>
            {i < currentStep ? "✓ " : ""}{s.label}
          </span>
        </div>
      ))}
    </div>
  );
}