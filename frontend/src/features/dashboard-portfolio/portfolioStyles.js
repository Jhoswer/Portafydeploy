import { dashboardShell } from "../../styles/components/dashboardShell";

export const heroCard = {
  ...dashboardShell.heroCard,
  padding: "20px 24px",
};

export const workspaceHero = {
  ...heroCard,
  padding: "14px 16px",
  position: "static",
  top: "auto",
  borderRadius: 18,
  boxShadow: "0 8px 22px rgba(14,30,60,.05)",
};

export const eyebrow = {
  ...dashboardShell.eyebrow,
  marginBottom: 10,
};

export const title = {
  ...dashboardShell.title,
  fontSize: "1.42rem",
  marginBottom: 6,
};

export const description = {
  ...dashboardShell.body,
  maxWidth: 720,
  fontSize: "0.88rem",
  lineHeight: 1.58,
};

export const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
};

export const portfolioUniverse = {
  position: "relative",
  display: "grid",
  gap: 18,
  padding: "clamp(12px, 1.8vw, 20px)",
  borderRadius: 32,
  overflow: "hidden",
  isolation: "isolate",
  background:
    "radial-gradient(circle at 8% 6%, rgba(251,146,60,.045) 0%, transparent 28%), radial-gradient(circle at 92% 10%, rgba(91,124,250,.07) 0%, transparent 30%), linear-gradient(180deg, rgba(251,253,255,.92) 0%, rgba(246,250,255,.78) 100%)",
  boxShadow: "0 14px 34px rgba(7,17,31,.045)",
};

export const portfolioUniverseGrid = {
  position: "absolute",
  inset: 0,
  zIndex: -1,
  pointerEvents: "none",
  opacity: 0.10,
  backgroundImage:
    "linear-gradient(rgba(79,140,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(79,140,255,.09) 1px, transparent 1px)",
  backgroundSize: "42px 42px",
  maskImage: "linear-gradient(180deg, rgba(0,0,0,.66) 0%, transparent 72%)",
};

export const missionHero = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.35fr) minmax(220px, .65fr)",
  gap: 22,
  alignItems: "stretch",
  padding: "clamp(22px, 3vw, 34px)",
  borderRadius: 32,
  overflow: "hidden",
  background:
    "linear-gradient(145deg, rgba(255,255,255,.86) 0%, rgba(248,252,255,.78) 52%, rgba(239,247,255,.66) 100%)",
  border: "1px solid rgba(255,255,255,.74)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.82), 0 16px 38px rgba(7,17,31,.07)",
  backdropFilter: "blur(18px)",
};

export const missionTitle = {
  margin: 0,
  fontFamily: "var(--f-title)",
  fontSize: "clamp(2rem, 4vw, 4.25rem)",
  lineHeight: 0.94,
  letterSpacing: "-0.075em",
  fontWeight: 900,
  color: "#07111f",
  maxWidth: 820,
};

export const missionDescription = {
  ...dashboardShell.body,
  maxWidth: 700,
  color: "rgba(38,52,75,.74)",
  fontSize: "0.96rem",
};

export const missionBadge = {
  width: "fit-content",
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(15,23,42,.06)",
  border: "1px solid rgba(15,23,42,.08)",
  color: "rgba(15,23,42,.58)",
  fontFamily: "var(--f-ui)",
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export const progressOrb = {
  minHeight: 250,
  borderRadius: 30,
  display: "grid",
  placeItems: "center",
  padding: 20,
  background:
    "linear-gradient(145deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,.06) 100%)",
  border: "1px solid rgba(255,255,255,.16)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.12)",
};

export const progressOrbCore = {
  width: 172,
  height: 172,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  boxShadow: "0 22px 50px rgba(0,0,0,.22), inset 0 0 0 13px rgba(255,255,255,.08)",
};

export const missionStats = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginTop: 20,
};

export const missionStat = {
  padding: "13px 14px",
  borderRadius: 20,
  background: "rgba(255,255,255,.70)",
  border: "1px solid rgba(162,214,249,.18)",
  boxShadow: "0 10px 24px rgba(14,30,60,.045)",
};

export const overviewStage = {
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: 16,
  perspective: 1200,
};

export const card = {
  ...dashboardShell.surfaceCard,
  padding: "20px 18px",
};

export const portfolioCard = {
  position: "relative",
  minHeight: 264,
  gridColumn: "span 6",
  border: "1px solid rgba(255,255,255,.68)",
  borderRadius: 30,
  padding: "20px",
  overflow: "hidden",
  isolation: "isolate",
  background:
    "linear-gradient(145deg, rgba(255,255,255,.94) 0%, rgba(249,252,255,.88) 42%, rgba(239,247,255,.76) 100%)",
  boxShadow: "0 18px 42px rgba(14,30,60,.075), inset 0 1px 0 rgba(255,255,255,.92)",
  color: "var(--text)",
  backdropFilter: "blur(18px)",
};

export const portfolioCardChrome = {
  position: "absolute",
  inset: 0,
  zIndex: -1,
  pointerEvents: "none",
};

export const portfolioCardShine = {
  position: "absolute",
  inset: 1,
  borderRadius: 28,
  background:
    "linear-gradient(115deg, rgba(255,255,255,.88) 0%, rgba(255,255,255,.18) 36%, rgba(255,255,255,0) 58%)",
  opacity: 0.48,
};

export const portfolioCardGrid = {
  position: "absolute",
  inset: 0,
  opacity: 0.24,
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(15,23,42,.20) 1px, transparent 0)",
  backgroundSize: "22px 22px",
  maskImage: "linear-gradient(180deg, rgba(0,0,0,.85), transparent 76%)",
};

export const portfolioIconFrame = {
  width: 54,
  height: 54,
  borderRadius: 18,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,.76)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 16px 28px rgba(14,30,60,.08)",
};

export const portfolioCountPill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(15,23,42,.82)",
  border: "1px solid rgba(255,255,255,.22)",
  color: "#fff",
  fontFamily: "var(--f-ui)",
  fontSize: "0.74rem",
  fontWeight: 800,
  whiteSpace: "nowrap",
  boxShadow: "0 12px 24px rgba(15,23,42,.16)",
};

export const portfolioFooter = {
  marginTop: "auto",
  paddingTop: 16,
  borderTop: "1px solid rgba(162,214,249,.18)",
  display: "grid",
  gap: 12,
};

export const portfolioFooterRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

export const portfolioSignalTrack = {
  height: 7,
  borderRadius: 999,
  background: "rgba(15,23,42,.07)",
  overflow: "hidden",
};

export const cardTitle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.12rem",
  fontWeight: 800,
  color: "var(--text)",
  marginBottom: 10,
};

export const cardText = {
  fontFamily: "var(--f-body)",
  fontSize: "0.88rem",
  lineHeight: 1.62,
  color: "var(--body)",
};

export const singlePanel = { display: "grid" };

export const unifiedCard = {
  ...dashboardShell.surfaceCard,
  padding: "22px 20px",
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(155deg, rgba(255,255,255,.96) 0%, rgba(250,253,255,.94) 42%, rgba(241,248,255,.92) 100%)",
  boxShadow: "0 20px 48px rgba(14,30,60,.08)",
};

export const unifiedContent = {
  display: "grid",
  gridTemplateColumns: "0.92fr 1px 1.38fr",
  gap: 20,
  alignItems: "start",
};

export const listColumn = {
  paddingRight: 18,
  minWidth: 0,
  overflow: "hidden",
};

export const detailColumn = {
  display: "grid",
  gap: 18,
  minWidth: 0,
};

export const subtleDivider = {
  width: 1,
  minHeight: "100%",
  alignSelf: "stretch",
  background: "linear-gradient(180deg, rgba(162,214,249,.04) 0%, rgba(162,214,249,.32) 12%, rgba(162,214,249,.20) 88%, rgba(162,214,249,.04) 100%)",
  boxShadow: "0 0 0 8px rgba(162,214,249,.03)",
};

export const workspaceTopRow = {
  display: "grid",
  gap: 12,
};

export const workspaceCopy = {
  minWidth: 0,
  display: "grid",
  gap: 6,
};

export const workspaceAside = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  minWidth: "fit-content",
  gap: 12,
  flexWrap: "wrap",
};

export const workspaceStats = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

export const statPill = {
  ...dashboardShell.badge,
};

export const workspaceShell = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 16,
  alignItems: "start",
};

export const listHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
  gap: 12,
};

export const panelEyebrow = {
  fontFamily: "var(--f-ui)",
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 6,
};

export const panelTitle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.05rem",
  fontWeight: 800,
  color: "var(--text)",
};

export const itemMainButton = {
  flex: 1,
  display: "grid",
  gap: 5,
  width: "100%",
  background: "transparent",
  border: "none",
  padding: 0,
  textAlign: "left",
  minWidth: 0,
  cursor: "pointer",
};

export const itemTitle = {
  fontFamily: "var(--f-title)",
  fontSize: "0.98rem",
  fontWeight: 800,
  color: "var(--text)",
  minWidth: 0,
  overflowWrap: "anywhere",
  lineHeight: 1.3,
};

export const itemSubtitle = {
  fontFamily: "var(--f-body)",
  fontSize: "0.84rem",
  color: "var(--muted)",
  minWidth: 0,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  lineHeight: 1.55,
};

export const iconAction = {
  width: 32,
  height: 32,
  borderRadius: 9,
  border: "1px solid rgba(162,214,249,.16)",
  background: "rgba(255,255,255,.78)",
  color: "var(--body)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease",
};

export const iconDelete = {
  ...iconAction,
  color: "#d53638",
  border: "1px solid rgba(213,54,56,.14)",
  background: "rgba(232,72,74,.04)",
};

export const detailHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

export const detailTitle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.32rem",
  fontWeight: 800,
  color: "var(--text)",
  marginBottom: 6,
  minWidth: 0,
  overflowWrap: "anywhere",
};

export const detailMeta = {
  fontFamily: "var(--f-body)",
  fontSize: "0.88rem",
  color: "var(--muted)",
  minWidth: 0,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  lineHeight: 1.6,
};

export const statusBadge = {
  padding: "7px 10px",
  borderRadius: 999,
  fontFamily: "var(--f-ui)",
  fontSize: "0.76rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
  color: "var(--blue-mid)",
  background: "rgba(127,198,243,.12)",
  border: "1px solid rgba(162,214,249,.18)",
};

export const detailBlock = {
  padding: "16px",
  borderRadius: 18,
  background: "rgba(248,250,252,.92)",
  border: "1px solid rgba(162,214,249,.2)",
  minWidth: 0,
  overflow: "hidden",
};

export const detailLabel = {
  fontFamily: "var(--f-ui)",
  fontSize: "0.74rem",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted)",
  marginBottom: 8,
};

export const detailText = {
  fontFamily: "var(--f-body)",
  fontSize: "0.92rem",
  color: "var(--body)",
  lineHeight: 1.75,
  minWidth: 0,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

export const detailActions = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  flexWrap: "wrap",
};

export const fieldLabel = {
  fontFamily: "var(--f-ui)",
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "var(--body)",
};

export const input = {
  width: "100%",
  border: "1.5px solid rgba(162,214,249,.35)",
  borderRadius: 12,
  background: "#fff",
  color: "var(--text)",
  fontFamily: "var(--f-body)",
  fontSize: "0.9rem",
  padding: "11px 13px",
  outline: "none",
};

export const textarea = {
  ...input,
  resize: "vertical",
  minHeight: 110,
};

export const helperText = {
  fontFamily: "var(--f-body)",
  fontSize: "0.78rem",
  color: "var(--muted)",
  lineHeight: 1.5,
};

export const tagList = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

export const tagChip = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(127,198,243,.10)",
  border: "1px solid rgba(162,214,249,.18)",
  fontFamily: "var(--f-ui)",
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "var(--blue-mid)",
};

export const chipButton = {
  border: "none",
  background: "transparent",
  color: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  cursor: "pointer",
};

export const inlineFieldRow = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "end",
};

export const fieldCard = {
  padding: "12px 12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(205,225,245,.76)",
  background: "linear-gradient(180deg, #fbfdff 0%, #f7fbff 100%)",
  display: "grid",
  gap: 10,
};

export const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,.34)",
  display: "grid",
  placeItems: "center",
  padding: 20,
  zIndex: 50,
};

export const modalCard = {
  width: "min(100%, 420px)",
  background: "#ffffff",
  border: "1px solid rgba(205,225,245,.76)",
  borderRadius: 22,
  boxShadow: "0 24px 60px rgba(14,30,60,.16)",
  padding: "22px 20px",
  display: "grid",
  gap: 14,
};

export const modalTitle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.08rem",
  fontWeight: 800,
  color: "var(--text)",
};

export const modalText = {
  fontFamily: "var(--f-body)",
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "var(--body)",
};

export const backButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  width: "fit-content",
  border: "1px solid rgba(162,214,249,.28)",
  background: "rgba(255,255,255,.88)",
  color: "var(--text)",
  borderRadius: 999,
  padding: "9px 14px",
  fontFamily: "var(--f-ui)",
  fontWeight: 700,
  fontSize: "0.82rem",
};

export const primaryButton = {
  ...dashboardShell.primaryButton,
  borderRadius: 999,
  padding: "10px 15px",
  transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease",
};

export const miniPrimaryButton = {
  ...dashboardShell.primaryButton,
  gap: 6,
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: "0.78rem",
  whiteSpace: "nowrap",
  transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease",
};

export const secondaryButton = {
  ...dashboardShell.secondaryButton,
  borderRadius: 999,
  padding: "10px 14px",
  color: "var(--text)",
  transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease",
};

export const ghostButton = secondaryButton;

export const dangerButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  padding: "10px 14px",
  border: "1px solid rgba(213,54,56,.18)",
  background: "rgba(232,72,74,.08)",
  color: "#d53638",
  fontFamily: "var(--f-ui)",
  fontSize: "0.82rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease",
};

export const rowLayout = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  minWidth: 0,
};

export const rowActions = {
  display: "flex",
  gap: 8,
  flexShrink: 0,
};

export const heroHint = {
  marginTop: 8,
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(127,198,243,.09)",
  border: "1px solid rgba(162,214,249,.18)",
  fontFamily: "var(--f-ui)",
  fontSize: "0.73rem",
  fontWeight: 700,
  color: "var(--blue-mid)",
};

export const breadcrumb = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 16,
  padding: 0,
  borderRadius: 0,
  background: "transparent",
  border: "none",
  boxShadow: "none",
  width: "fit-content",
};

export const breadcrumbMain = {
  fontFamily: "var(--f-ui)",
  fontSize: "0.8rem",
  fontWeight: 800,
  color: "var(--text)",
};

export const breadcrumbLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid rgba(49,87,213,.16)",
  background: "rgba(49,87,213,.08)",
  padding: "9px 13px",
  borderRadius: 999,
  fontFamily: "var(--f-ui)",
  fontSize: "0.82rem",
  fontWeight: 900,
  color: "#1f3f9a",
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.72)",
  transition: "transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease",
};

export const breadcrumbSep = {
  fontFamily: "var(--f-ui)",
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "var(--muted)",
  opacity: 0.8,
};

export const breadcrumbCurrent = {
  fontFamily: "var(--f-ui)",
  fontSize: "0.8rem",
  fontWeight: 800,
  color: "rgba(15,23,42,.66)",
};
