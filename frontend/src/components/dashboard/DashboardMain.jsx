import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Lightbulb,
  PenLine,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import { dashboardShell } from "../../styles/components/dashboardShell";
import { SuggestionModal, VerificationModal } from "./profile/ProfileTrustModals";
import {
  fetchVerificationStatus,
  sendSuggestion,
  submitVerification,
} from "../../services/profileTrustService";

const quickActions = [
  {
    title: "Pulir perfil",
    text: "Actualiza foto, titular y biografia para que tu primera impresion sea clara.",
    icon: UserRound,
    action: "profile",
    color: "#2563eb",
  },
  {
    title: "Mostrar trabajo",
    text: "Ordena tus proyectos y experiencias visibles para reforzar tu historia.",
    icon: FileCheck2,
    action: "portfolio",
    color: "#7c3aed",
  },
  {
    title: "Revisar alcance",
    text: "Mide visitas, clicks y senales de interes desde tus analiticas.",
    icon: BarChart3,
    action: "analytics",
    color: "#0d9488",
  },
];

const roadmap = [
  { label: "Identidad profesional", done: true },
  { label: "Portafolio con evidencias", done: true },
  { label: "Verificacion de confianza", done: false },
  { label: "Feedback para mejorar plataforma", done: false },
];

export default function DashboardMain() {
  const viewport = useViewport();
  const isTablet = viewport < 980;
  const isMobile = viewport < 720;
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestionBusy, setSuggestionBusy] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verification, setVerification] = useState(null);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  useEffect(() => {
    fetchVerificationStatus().then(setVerification).catch(() => {});
  }, []);

  const verificationCopy = useMemo(() => {
    const status = verification?.status || "none";
    if (status === "approved") return { label: "Cuenta verificada", tone: "#16a34a", text: "Tu perfil ya muestra el sello de confianza." };
    if (status === "pending") return { label: "Revision pendiente", tone: "#ca8a04", text: "Tu solicitud esta esperando revision del equipo." };
    if (status === "rejected") return { label: "Requiere ajuste", tone: "#dc2626", text: verification?.rejection_reason || "Revisa el motivo y vuelve a enviar tus documentos." };
    return { label: "Sin solicitud", tone: "#2563eb", text: "Envia tu documento y activa una senal de confianza en tu perfil." };
  }, [verification]);

  const submitSuggestion = async (payload) => {
    if (suggestionBusy) return;
    setSuggestionBusy(true);
    setSuggestionError("");
    try {
      await sendSuggestion(payload);
      setSuggestionOpen(false);
      setSuggestionMessage("Sugerencia enviada correctamente.");
      setTimeout(() => setSuggestionMessage(""), 2400);
    } catch (err) {
      setSuggestionError(err.message || "No se pudo enviar la sugerencia.");
    } finally {
      setSuggestionBusy(false);
    }
  };

  const sendVerification = async (formData) => {
    if (verificationBusy) return;
    setVerificationBusy(true);
    setVerificationError("");
    try {
      const payload = await submitVerification(formData);
      setVerification(payload.verification || payload);
    } catch (err) {
      setVerificationError(err.message || "No se pudo enviar la solicitud.");
    } finally {
      setVerificationBusy(false);
    }
  };

  const navigateDashboard = (section) => {
    window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: section }));
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ ...heroStyle, gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : "minmax(0, 1.15fr) 360px" }}>
        <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
          <span style={heroEyebrow}>
            <Sparkles size={16} />
            Inicio profesional
          </span>
          <div>
            <h1 style={heroTitle}>Construye una presencia que se entienda en segundos.</h1>
            <p style={heroText}>
              Gestiona tu perfil, mide el alcance de tu portafolio y envia senales de confianza desde un solo lugar.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={() => navigateDashboard("profile")} style={primaryHeroButton}>
              <PenLine size={16} />
              Mejorar mi perfil
            </button>
            <button type="button" onClick={() => navigateDashboard("analytics")} style={secondaryHeroButton}>
              <BarChart3 size={16} />
              Ver analytics
            </button>
          </div>
        </div>

        <div style={scorePanel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div style={panelEyebrow}>Estado de confianza</div>
              <div style={scoreTitle}>{verificationCopy.label}</div>
            </div>
            <span style={{ ...scoreIcon, color: verificationCopy.tone, background: `${verificationCopy.tone}14` }}>
              <ShieldCheck size={22} />
            </span>
          </div>
          <p style={{ ...smallText, margin: "4px 0 0" }}>{verificationCopy.text}</p>
          <div style={progressTrack}>
            <span style={{ ...progressBar, width: verification?.status === "approved" ? "100%" : verification?.status === "pending" ? "66%" : "38%", background: verificationCopy.tone }} />
          </div>
        </div>
      </section>

      <section style={{ ...actionGrid, gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))" }}>
        {quickActions.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.title} type="button" onClick={() => navigateDashboard(item.action)} style={quickActionCard(item.color)}>
              <span style={{ ...quickIcon, color: item.color, background: `${item.color}14` }}>
                <Icon size={18} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={quickTitle}>{item.title}</span>
                <span style={quickText}>{item.text}</span>
              </span>
              <ArrowRight size={17} style={{ color: item.color, flexShrink: 0 }} />
            </button>
          );
        })}
      </section>

      <section style={{ ...twoColumnGrid, gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : twoColumnGrid.gridTemplateColumns }}>
        <article style={trustCard}>
          <div style={cardHeader}>
            <span style={{ ...cardIcon, color: "#2563eb", background: "rgba(37,99,235,.10)" }}>
              <ShieldCheck size={19} />
            </span>
            <div>
              <div style={panelEyebrow}>Verificacion</div>
              <h2 style={cardTitle}>Haz que tu perfil inspire confianza</h2>
            </div>
          </div>
          <p style={cardText}>{verificationCopy.text}</p>
          <div style={statusPill(verificationCopy.tone)}>
            <span />
            {verificationCopy.label}
          </div>
          <button type="button" onClick={() => { setVerificationError(""); setVerificationOpen(true); }} style={widePrimary}>
            <ShieldCheck size={16} />
            {verification?.status === "pending" ? "Ver estado de solicitud" : "Enviar para verificar"}
          </button>
        </article>

        <article style={suggestionCard}>
          <div style={cardHeader}>
            <span style={{ ...cardIcon, color: "#e11d48", background: "rgba(225,29,72,.10)" }}>
              <Lightbulb size={19} />
            </span>
            <div>
              <div style={panelEyebrow}>Sugerencias</div>
              <h2 style={cardTitle}>Propone una mejora con contexto</h2>
            </div>
          </div>
          <p style={cardText}>
            Envia ideas sobre perfil, proyectos, experiencia o cualquier parte de PortaFy. El equipo recibe tipo, area y motivo.
          </p>
          {suggestionMessage ? <div style={successNote}>{suggestionMessage}</div> : null}
          <button type="button" onClick={() => { setSuggestionError(""); setSuggestionOpen(true); }} style={wideSecondary}>
            <Send size={16} />
            Enviar sugerencia
          </button>
        </article>
      </section>

      <section style={{ ...twoColumnGrid, gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : twoColumnGrid.gridTemplateColumns }}>
        <article style={panelCard}>
          <div style={cardHeader}>
            <span style={{ ...cardIcon, color: "#0d9488", background: "rgba(13,148,136,.10)" }}>
              <Target size={19} />
            </span>
            <div>
              <div style={panelEyebrow}>Ruta de perfil</div>
              <h2 style={cardTitle}>Prioridades de esta etapa</h2>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {roadmap.map((item) => (
              <div key={item.label} style={roadmapItem(item.done)}>
                <CheckCircle2 size={17} color={item.done ? "#16a34a" : "#94a3b8"} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article style={panelCard}>
          <div style={cardHeader}>
            <span style={{ ...cardIcon, color: "#7c3aed", background: "rgba(124,58,237,.10)" }}>
              <BarChart3 size={19} />
            </span>
            <div>
              <div style={panelEyebrow}>Lectura rapida</div>
              <h2 style={cardTitle}>Que mirar primero</h2>
            </div>
          </div>
          <div style={insightList}>
            <Insight title="Perfil" text="Nombre, titular y portada deben contar quien eres sin esfuerzo." />
            <Insight title="Portafolio" text="Los proyectos con demo, repositorio y tecnologias claras convierten mejor." />
            <Insight title="Confianza" text="La verificacion y los reportes bien canalizados hacen la plataforma mas seria." />
          </div>
        </article>
      </section>

      {suggestionOpen ? (
        <SuggestionModal busy={suggestionBusy} error={suggestionError} onClose={() => setSuggestionOpen(false)} onSubmit={submitSuggestion} />
      ) : null}

      {verificationOpen ? (
        <VerificationModal status={verification} busy={verificationBusy} error={verificationError} onClose={() => setVerificationOpen(false)} onSubmit={sendVerification} />
      ) : null}
    </div>
  );
}

function Insight({ title, text }) {
  return (
    <div style={insightItem}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function useViewport() {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

const heroStyle = {
  display: "grid",
  gap: 22,
  alignItems: "stretch",
  padding: 26,
  borderRadius: 28,
  color: "#fff",
  background:
    "linear-gradient(135deg, #10213f 0%, #1f4d8f 54%, #77c7ee 100%)",
  boxShadow: "0 24px 60px rgba(14,30,60,.18)",
  overflow: "hidden",
};

const heroEyebrow = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,.16)",
  border: "1px solid rgba(255,255,255,.28)",
  fontWeight: 900,
};

const heroTitle = {
  margin: 0,
  maxWidth: 720,
  fontFamily: "var(--f-title)",
  fontSize: "clamp(2rem, 4vw, 3.2rem)",
  lineHeight: 1.02,
  fontWeight: 950,
};

const heroText = {
  margin: "14px 0 0",
  maxWidth: 660,
  color: "rgba(255,255,255,.82)",
  fontFamily: "var(--f-body)",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const primaryHeroButton = {
  ...dashboardShell.primaryButton,
  minHeight: 46,
  borderRadius: 15,
  background: "#fff",
  color: "#14376d",
  boxShadow: "0 18px 34px rgba(0,0,0,.16)",
};

const secondaryHeroButton = {
  ...dashboardShell.secondaryButton,
  minHeight: 46,
  borderRadius: 15,
  background: "rgba(255,255,255,.13)",
  border: "1px solid rgba(255,255,255,.28)",
  color: "#fff",
};

const scorePanel = {
  display: "grid",
  alignContent: "space-between",
  gap: 16,
  padding: 20,
  borderRadius: 22,
  background: "rgba(255,255,255,.94)",
  color: "#0f172a",
  boxShadow: "0 22px 44px rgba(14,30,60,.16)",
};

const scoreTitle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.3rem",
  fontWeight: 950,
};

const scoreIcon = {
  width: 52,
  height: 52,
  borderRadius: 18,
  display: "grid",
  placeItems: "center",
};

const progressTrack = {
  height: 10,
  borderRadius: 999,
  background: "rgba(148,163,184,.18)",
  overflow: "hidden",
};

const progressBar = {
  display: "block",
  height: "100%",
  borderRadius: 999,
};

const actionGrid = {
  display: "grid",
  gap: 14,
};

const quickActionCard = (color) => ({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 14,
  padding: 18,
  borderRadius: 22,
  background: "#fff",
  border: `1px solid ${color}22`,
  boxShadow: `0 16px 34px ${color}12`,
  textAlign: "left",
  cursor: "pointer",
});

const quickIcon = {
  width: 46,
  height: 46,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
};

const quickTitle = {
  display: "block",
  fontFamily: "var(--f-title)",
  fontSize: "1rem",
  fontWeight: 950,
  color: "#0f172a",
};

const quickText = {
  display: "block",
  marginTop: 4,
  color: "#64748b",
  fontFamily: "var(--f-body)",
  fontSize: ".84rem",
  lineHeight: 1.45,
};

const twoColumnGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 18,
};

const panelCard = {
  ...dashboardShell.surfaceCard,
  borderRadius: 24,
  padding: 22,
  display: "grid",
  gap: 16,
};

const trustCard = {
  ...panelCard,
  border: "1px solid rgba(37,99,235,.18)",
  background: "linear-gradient(180deg, #fff 0%, #f8fbff 100%)",
};

const suggestionCard = {
  ...panelCard,
  border: "1px solid rgba(225,29,72,.16)",
  background: "linear-gradient(180deg, #fff 0%, #fff8fb 100%)",
};

const cardHeader = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
};

const cardIcon = {
  width: 44,
  height: 44,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
};

const panelEyebrow = {
  fontFamily: "var(--f-ui)",
  fontSize: ".72rem",
  fontWeight: 900,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "#64748b",
};

const cardTitle = {
  margin: "3px 0 0",
  fontFamily: "var(--f-title)",
  fontSize: "1.22rem",
  lineHeight: 1.15,
  fontWeight: 950,
  color: "#0f172a",
};

const cardText = {
  margin: 0,
  color: "#64748b",
  fontFamily: "var(--f-body)",
  fontSize: ".92rem",
  lineHeight: 1.65,
};

const smallText = {
  color: "#64748b",
  fontFamily: "var(--f-body)",
  fontSize: ".88rem",
  lineHeight: 1.55,
};

const statusPill = (color) => ({
  width: "fit-content",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  color,
  background: `${color}12`,
  border: `1px solid ${color}22`,
  fontWeight: 900,
});

const widePrimary = {
  ...dashboardShell.primaryButton,
  minHeight: 46,
  justifyContent: "center",
  borderRadius: 15,
};

const wideSecondary = {
  ...dashboardShell.secondaryButton,
  minHeight: 46,
  justifyContent: "center",
  borderRadius: 15,
  color: "#e11d48",
  border: "1px solid rgba(225,29,72,.22)",
  background: "rgba(225,29,72,.06)",
};

const successNote = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(22,163,74,.08)",
  color: "#15803d",
  fontFamily: "var(--f-ui)",
  fontSize: ".84rem",
  fontWeight: 850,
};

const roadmapItem = (done) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 16,
  background: done ? "rgba(22,163,74,.07)" : "rgba(248,251,255,.92)",
  border: done ? "1px solid rgba(22,163,74,.16)" : "1px solid rgba(205,225,245,.72)",
  color: "#0f172a",
  fontFamily: "var(--f-ui)",
  fontSize: ".88rem",
  fontWeight: 850,
});

const insightList = {
  display: "grid",
  gap: 10,
};

const insightItem = {
  display: "grid",
  gap: 4,
  padding: "13px 14px",
  borderRadius: 16,
  border: "1px solid rgba(205,225,245,.72)",
  background: "#fbfdff",
  color: "#64748b",
  fontFamily: "var(--f-body)",
  fontSize: ".86rem",
  lineHeight: 1.5,
};
