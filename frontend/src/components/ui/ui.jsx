// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, style = {} }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        padding: "2px 10px",
        borderRadius: 99,
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = "default", onClick, style = {}, disabled = false }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "0.5px solid",
    transition: "background 0.15s, opacity 0.15s",
    opacity: disabled ? 0.5 : 1,
    fontFamily: "inherit",
  };

  const variants = {
    default: {
      background: "#fff",
      borderColor: "#c7c9cc",
      color: "#1a1a1a",
    },
    primary: {
      background: "#185FA5",
      borderColor: "#185FA5",
      color: "#E6F1FB",
    },
    danger: {
      background: "#fff",
      borderColor: "#A32D2D",
      color: "#A32D2D",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "0.5px solid #e0e0e0",
        borderRadius: 12,
        padding: "16px",
        cursor: onClick ? "pointer" : "default",
        transition: onClick ? "border-color 0.15s, box-shadow 0.15s" : undefined,
        ...style,
      }}
      onMouseEnter={onClick ? (e) => (e.currentTarget.style.borderColor = "#b0b0b0") : undefined}
      onMouseLeave={onClick ? (e) => (e.currentTarget.style.borderColor = "#e0e0e0") : undefined}
    >
      {children}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ nombre, size = 32, bg = "#E6F1FB", color = "#185FA5" }) {
  const initials = nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── ToggleSwitch ─────────────────────────────────────────────────────────────
export function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 36,
        height: 20,
        borderRadius: 99,
        background: checked ? "#185FA5" : "#D3D1C7",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
        padding: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 19 : 3,
          width: 14,
          height: 14,
          background: "#fff",
          borderRadius: "50%",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = "#185FA5" }) {
  return (
    <div style={{ height: 4, background: "#e5e5e5", borderRadius: 2, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(value, 100)}%`,
          background: color,
          borderRadius: 2,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, badgeText, badgeStyle, onClick }) {
  return (
    <Card onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div style={{ fontSize: 24, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      {badgeText && (
        <Badge style={{ ...badgeStyle, fontSize: 11 }}>{badgeText}</Badge>
      )}
    </Card>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1a1a1a", margin: 0 }}>{title}</h2>
      {action}
    </div>
  );
}
