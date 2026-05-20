export const dashboardShell = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, rgba(246,250,255,.42) 0%, rgba(240,248,255,.58) 52%, rgba(234,245,252,.74) 100%)",
  },
  container: {
    width: "100%",
    maxWidth: 1360,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  railCard: {
    background: "#ffffff",
    border: "none",
    borderRadius: 20,
    padding: "18px",
    boxShadow: "0 8px 28px rgba(14,30,60,.06)",
    overflow: "hidden",
  },
  surfaceCard: {
    background: "#ffffff",
    border: "1px solid rgba(205, 225, 245, 0.6)",
    borderRadius: 22,
    boxShadow: "0 6px 20px rgba(14,30,60,.05)",
  },
  softPanel: {
    background: "#fbfdff",
    border: "1px solid rgba(205, 225, 245, 0.7)",
    borderRadius: 18,
    boxShadow: "0 4px 16px rgba(14,30,60,.035)",
  },
  heroCard: {
    background: "#ffffff",
    border: "1px solid rgba(205,225,245,.68)",
    borderRadius: 24,
    boxShadow: "0 6px 22px rgba(14,30,60,.05)",
  },
  sectionLabel: {
    fontSize: "0.7rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--muted)",
    fontFamily: "var(--f-ui)",
  },
  sidebarCardTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--color-text, var(--text))",
    marginBottom: 14,
    letterSpacing: "-0.2px",
    fontFamily: "var(--font-title, var(--f-title))",
  },
  eyebrow: {
    fontSize: "0.74rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--muted)",
    fontFamily: "var(--f-ui)",
  },
  title: {
    margin: 0,
    fontFamily: "var(--f-title)",
    fontSize: "1.92rem",
    fontWeight: 800,
    color: "var(--text)",
  },
  body: {
    margin: 0,
    fontFamily: "var(--f-body)",
    fontSize: "0.92rem",
    lineHeight: 1.65,
    color: "var(--body)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#fbfdff",
    border: "1px solid rgba(205,225,245,.76)",
    fontFamily: "var(--f-ui)",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "var(--body)",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #ef5759 0%, #E8484A 50%, #d53638 100%)",
    color: "#fff",
    fontFamily: "var(--f-ui)",
    fontSize: ".84rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(232,72,74,.18)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(205,225,245,.8)",
    background: "#ffffff",
    color: "#2048a8",
    fontFamily: "var(--f-ui)",
    fontSize: ".84rem",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(239,246,255,.82)",
    border: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.72), 0 6px 16px rgba(14,30,60,.04)",
    flexShrink: 0,
    color: "#1f2937",
  },
  softRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
  },
  softDivider: {
    height: 1,
    background: "rgba(162,214,249,.22)",
    margin: "12px 0",
  },
  sidebarTitle: {
    fontFamily: "var(--f-title)",
    fontSize: "0.92rem",
    fontWeight: 800,
    color: "var(--text)",
    marginBottom: 2,
  },
  sidebarText: {
    fontFamily: "var(--f-body)",
    fontSize: "0.8rem",
    lineHeight: 1.5,
    color: "var(--body)",
  },
  tabButton: (active) => ({
    padding: "10px 14px",
    border: "none",
    borderBottom: active ? "2px solid #ef5759" : "2px solid transparent",
    background: "transparent",
    color: active ? "var(--text)" : "var(--muted)",
    fontFamily: "var(--f-ui)",
    fontSize: ".84rem",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
};

export function dashboardNavButton(active) {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px 10px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontFamily: "var(--f-ui)",
    fontSize: "0.84rem",
    fontWeight: 700,
    transition: "all 0.18s ease",
    background: active ? "rgba(232,72,74,.075)" : "transparent",
    color: active ? "#ef5759" : "var(--text)",
    border: "none",
    boxShadow: active ? "0 8px 22px rgba(232,72,74,.075)" : "none",
  };
}

export function dashboardMessageTone(color) {
  if (color === "green") {
    return {
      background: "rgba(34,197,94,.08)",
      border: "1px solid rgba(34,197,94,.14)",
      color: "#15803d",
    };
  }

  if (color === "red") {
    return {
      background: "rgba(255,75,95,.08)",
      border: "1px solid rgba(255,75,95,.14)",
      color: "#d62839",
    };
  }

  return {
    background: "rgba(36,86,191,.08)",
    border: "1px solid rgba(36,86,191,.14)",
    color: "#2048a8",
  };
}
