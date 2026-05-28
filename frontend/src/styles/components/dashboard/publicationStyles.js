import { dashboardShell } from "../../../styles/components/dashboardShell";

export const shell = {
  display: "grid",
  gap: 16,
};

export const toolbar = {
  ...dashboardShell.surfaceCard,
  padding: "14px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  borderRadius: 18,
  background: "linear-gradient(135deg, var(--dashboard-card-bg, #ffffff) 0%, var(--dashboard-soft-bg, #f8fbff) 64%, var(--dashboard-soft-bg, #eef7ff) 100%)",
};

export const metricGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
  gap: 10,
};

export const metricCard = {
  ...dashboardShell.surfaceCard,
  padding: "11px 13px",
  display: "flex",
  alignItems: "center",
  gap: 10,
  borderRadius: 16,
  background: "linear-gradient(135deg, var(--dashboard-card-bg, #ffffff) 0%, var(--dashboard-soft-bg, #f7fbff) 100%)",
  minWidth: 0,
};

export const filterBar = {
  ...dashboardShell.surfaceCard,
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  borderRadius: 18,
};

export const sortField = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  color: "var(--muted)",
  fontFamily: "var(--f-ui)",
  fontSize: ".78rem",
  fontWeight: 900,
};

export const sortSelect = {
  minHeight: 38,
  padding: "0 34px 0 12px",
  border: "1px solid rgba(205,225,245,.9)",
  borderRadius: 12,
  background: "var(--dashboard-card-bg, #fff)",
  color: "var(--text)",
  fontFamily: "var(--f-ui)",
  fontWeight: 850,
  outline: "none",
};

export const pageSummary = {
  color: "var(--muted)",
  fontFamily: "var(--f-ui)",
  fontSize: ".78rem",
  fontWeight: 850,
};

export const pagination = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "4px 0",
};

export const pageButton = (disabled = false) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  minHeight: 36,
  padding: "0 12px",
  border: "1px solid rgba(36,86,191,.16)",
  borderRadius: 12,
  background: "var(--dashboard-card-bg, #fff)",
  color: disabled ? "#94a3b8" : "#2048a8",
  fontFamily: "var(--f-ui)",
  fontSize: ".78rem",
  fontWeight: 900,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.68 : 1,
});

export const pageCounter = {
  minWidth: 48,
  textAlign: "center",
  color: "var(--muted)",
  fontFamily: "var(--f-ui)",
  fontSize: ".78rem",
  fontWeight: 900,
};

export const workspace = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact ? "minmax(0, 1fr)" : "minmax(300px, 0.82fr) minmax(390px, 1.18fr)",
  gridTemplateAreas: isCompact ? `"detail" "list"` : `"list detail"`,
  gap: 16,
  alignItems: "start",
});

export const list = {
  display: "grid",
  gap: 10,
  gridArea: "list",
};

export const card = (active) => ({
  ...dashboardShell.surfaceCard,
  width: "100%",
  textAlign: "left",
  padding: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 0,
  borderRadius: 18,
  cursor: "pointer",
  color: "var(--text)",
  overflow: "hidden",
  border: active ? "1px solid rgba(36,86,191,.28)" : dashboardShell.surfaceCard.border,
  background: active ? "linear-gradient(135deg, rgba(36,86,191,.10), var(--dashboard-card-bg, rgba(255,255,255,.98)) 58%, rgba(127,198,243,.10))" : "linear-gradient(135deg, var(--dashboard-card-bg, #ffffff) 0%, var(--dashboard-soft-bg, #fbfdff) 100%)",
  boxShadow: active ? "0 16px 34px rgba(36,86,191,.11)" : dashboardShell.surfaceCard.boxShadow,
  transition: "transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease",
});

export const cardBody = {
  minWidth: 0,
  padding: 14,
  display: "grid",
  gap: 10,
};

export const thumb = {
  width: 86,
  height: "100%",
  minHeight: 118,
  objectFit: "cover",
  background: "linear-gradient(135deg, rgba(36,86,191,.10), rgba(127,198,243,.22))",
  borderLeft: "1px solid rgba(205,225,245,.72)",
};

export const fallbackThumb = {
  ...thumb,
  display: "grid",
  placeItems: "center",
  color: "#2048a8",
  fontFamily: "var(--f-title)",
  fontWeight: 900,
  fontSize: ".78rem",
  padding: 8,
  boxSizing: "border-box",
  textAlign: "center",
};

export const sidePanel = (isCompact = false) => ({
  ...dashboardShell.surfaceCard,
  borderRadius: 20,
  padding: 18,
  display: "grid",
  gap: 14,
  gridArea: "detail",
  position: isCompact ? "static" : "sticky",
  top: 18,
  overflow: "hidden",
  background: "linear-gradient(180deg, var(--dashboard-card-bg, #ffffff) 0%, var(--dashboard-soft-bg, #fbfdff) 100%)",
});

export const heroImage = {
  width: "100%",
  aspectRatio: "16 / 8",
  maxHeight: 260,
  objectFit: "cover",
  borderRadius: 16,
  border: "1px solid rgba(205,225,245,.78)",
  background: "linear-gradient(135deg, rgba(36,86,191,.10), rgba(127,198,243,.22))",
};

export const detailShell = {
  display: "grid",
  gap: 12,
};

export const contentBox = {
  display: "grid",
  gap: 10,
  padding: "13px 14px",
  borderRadius: 16,
  background: "linear-gradient(135deg, rgba(36,86,191,.065), var(--dashboard-card-bg, rgba(255,255,255,.98)) 58%, rgba(127,198,243,.10))",
  border: "1px solid rgba(205,225,245,.78)",
  boxShadow: "inset 3px 0 0 rgba(36,86,191,.42)",
};

export const contentHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

export const contentLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "var(--f-ui)",
  fontSize: ".72rem",
  fontWeight: 900,
  color: "#2048a8",
  textTransform: "uppercase",
};

export const contentToggle = {
  border: "1px solid rgba(36,86,191,.18)",
  background: "var(--dashboard-card-bg, #ffffff)",
  color: "#2048a8",
  borderRadius: 999,
  padding: "6px 10px",
  fontFamily: "var(--f-ui)",
  fontSize: ".72rem",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(36,86,191,.08)",
  flexShrink: 0,
};

export const contentText = (clamped = false) => ({
  ...dashboardShell.body,
  margin: 0,
  color: "var(--body, #243044)",
  fontSize: ".92rem",
  lineHeight: 1.72,
  whiteSpace: "pre-line",
  ...(clamped
    ? {
        display: "-webkit-box",
        WebkitLineClamp: 4,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }
    : {}),
});

export const commentsScroll = (isCompact = false) => ({
  display: "grid",
  gap: 9,
  maxHeight: isCompact ? "min(42vh, 360px)" : "min(44vh, 430px)",
  overflowY: "auto",
  paddingRight: 5,
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(127,198,243,.82) rgba(248,250,252,.8)",
});

export const commentCard = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gap: 10,
  padding: 12,
  borderRadius: 16,
  background: "linear-gradient(135deg, var(--dashboard-card-bg, #ffffff) 0%, var(--dashboard-soft-bg, rgba(248,250,252,.96)) 100%)",
  border: "1px solid rgba(226,232,240,.82)",
  boxShadow: "0 8px 18px rgba(14,30,60,.035)",
};

export const avatar = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  objectFit: "cover",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #2048a8, #7fc6f3)",
  color: "#fff",
  fontFamily: "var(--f-title)",
  fontSize: ".78rem",
  fontWeight: 850,
  flexShrink: 0,
};
