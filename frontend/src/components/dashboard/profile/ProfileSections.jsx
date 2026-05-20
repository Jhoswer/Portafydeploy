import { useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Eye,
  GraduationCap,
  Dribbble,
  ExternalLink,
  Facebook,
  FolderKanban,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Newspaper,
  Palette,
  Send,
  Sparkles,
  SquareCode,
  Tv,
  Users,
  X,
} from "lucide-react";
import { assetUrl, formatDate } from "../../../features/dashboard-profile/profileUtils";
import { profileUi as ui } from "../../../styles/components/dashboard/profileStyles";
import { dashboardMessageTone, dashboardShell } from "../../../styles/components/dashboardShell";

function socialIcon(platform) {
  const value = String(platform || "").toLowerCase();
  if (value.includes("github")) return <Github size={15} />;
  if (value.includes("linkedin")) return <Linkedin size={15} />;
  if (value.includes("instagram")) return <Instagram size={15} />;
  if (value.includes("facebook")) return <Facebook size={15} />;
  if (value.includes("dribbble")) return <Dribbble size={15} />;
  if (value.includes("behance")) return <Palette size={15} />;
  if (value.includes("youtube")) return <Tv size={15} />;
  if (value === "x" || value.includes("twitter")) return <X size={15} />;
  if (value.includes("medium")) return <Newspaper size={15} />;
  if (value.includes("stack")) return <SquareCode size={15} />;
  if (value.includes("portafolio") || value.includes("portfolio")) return <Globe size={15} />;
  return <Globe size={15} />;
}

function socialPalette(platform) {
  const value = String(platform || "").toLowerCase();

  if (value.includes("instagram")) return { accent: "#db2777", soft: "rgba(219,39,119,.10)", border: "rgba(219,39,119,.24)" };
  if (value.includes("linkedin")) return { accent: "#0a66c2", soft: "rgba(10,102,194,.10)", border: "rgba(10,102,194,.24)" };
  if (value.includes("github")) return { accent: "#24292f", soft: "rgba(36,41,47,.08)", border: "rgba(36,41,47,.18)" };
  if (value.includes("facebook")) return { accent: "#1877f2", soft: "rgba(24,119,242,.10)", border: "rgba(24,119,242,.24)" };
  if (value.includes("youtube")) return { accent: "#dc2626", soft: "rgba(220,38,38,.10)", border: "rgba(220,38,38,.24)" };
  if (value === "x" || value.includes("twitter")) return { accent: "#111827", soft: "rgba(17,24,39,.08)", border: "rgba(17,24,39,.18)" };
  if (value.includes("dribbble") || value.includes("behance")) return { accent: "#8b5cf6", soft: "rgba(139,92,246,.10)", border: "rgba(139,92,246,.24)" };

  return { accent: "#2048a8", soft: "rgba(79,140,255,.10)", border: "rgba(79,140,255,.22)" };
}

function compactUrl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return String(url).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function skillDotCount(skill) {
  if (Number(skill?.levelDots || skill?.level_dots || skill?.nivel_puntos)) {
    return Number(skill.levelDots || skill.level_dots || skill.nivel_puntos);
  }

  if (skill?.level === "Senior") return 3;
  if (skill?.level === "Mid") return 2;
  return 1;
}

function skillPalette(skill) {
  const key = String(skill?.category || skill?.name || "general").toLowerCase();
  const categoryPalettes = [
    { test: ["blanda", "soft"], accent: "#0ea5e9", soft: "rgba(14,165,233,.11)", border: "rgba(14,165,233,.25)", text: "#0369a1" },
    { test: ["base", "datos", "database", "sql", "mongo"], accent: "#2563eb", soft: "rgba(37,99,235,.11)", border: "rgba(37,99,235,.25)", text: "#1d4ed8" },
    { test: ["dise", "design", "ui", "ux"], accent: "#9333ea", soft: "rgba(147,51,234,.11)", border: "rgba(147,51,234,.25)", text: "#7e22ce" },
    { test: ["frontend", "front"], accent: "#0891b2", soft: "rgba(8,145,178,.11)", border: "rgba(8,145,178,.25)", text: "#0e7490" },
    { test: ["backend", "back"], accent: "#4f46e5", soft: "rgba(79,70,229,.11)", border: "rgba(79,70,229,.25)", text: "#4338ca" },
    { test: ["mobile", "movil", "android", "ios"], accent: "#f97316", soft: "rgba(249,115,22,.12)", border: "rgba(249,115,22,.28)", text: "#c2410c" },
    { test: ["cloud", "devops", "docker", "aws", "azure"], accent: "#0ea5e9", soft: "rgba(14,165,233,.11)", border: "rgba(14,165,233,.25)", text: "#0369a1" },
    { test: ["datos", "bi", "data"], accent: "#2563eb", soft: "rgba(37,99,235,.11)", border: "rgba(37,99,235,.25)", text: "#1d4ed8" },
    { test: ["ia", "automat", "machine", "prompt"], accent: "#7c3aed", soft: "rgba(124,58,237,.11)", border: "rgba(124,58,237,.25)", text: "#6d28d9" },
    { test: ["ciber", "seguridad", "owasp", "pentest"], accent: "#dc2626", soft: "rgba(220,38,38,.10)", border: "rgba(220,38,38,.24)", text: "#b91c1c" },
    { test: ["qa", "testing", "test"], accent: "#ca8a04", soft: "rgba(202,138,4,.12)", border: "rgba(202,138,4,.26)", text: "#a16207" },
    { test: ["producto", "gestion", "scrum", "kanban"], accent: "#db2777", soft: "rgba(219,39,119,.10)", border: "rgba(219,39,119,.24)", text: "#be185d" },
    { test: ["idioma", "ingles", "portugues", "frances", "aleman"], accent: "#475569", soft: "rgba(71,85,105,.10)", border: "rgba(71,85,105,.22)", text: "#334155" },
    { test: ["herramient", "tool"], accent: "#b45309", soft: "rgba(245,158,11,.14)", border: "rgba(245,158,11,.30)", text: "#92400e" },
  ];
  const matched = categoryPalettes.find((palette) =>
    palette.test.some((term) => key.includes(term)),
  );

  if (matched) return matched;

  const palettes = [
    { accent: "#3157d5", soft: "rgba(79,140,255,.12)", border: "rgba(79,140,255,.24)", text: "#2447ad" },
    { accent: "#0284c7", soft: "rgba(2,132,199,.11)", border: "rgba(2,132,199,.24)", text: "#075985" },
    { accent: "#8b5cf6", soft: "rgba(139,92,246,.12)", border: "rgba(139,92,246,.24)", text: "#6d28d9" },
    { accent: "#b45309", soft: "rgba(245,158,11,.14)", border: "rgba(245,158,11,.28)", text: "#92400e" },
    { accent: "#db2777", soft: "rgba(219,39,119,.10)", border: "rgba(219,39,119,.22)", text: "#be185d" },
  ];
  const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return palettes[index];
}

function SkillLevelDots({ skill }) {
  const count = skillDotCount(skill);

  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: index < count ? "#4f8cff" : "rgba(162,214,249,.38)",
          }}
        />
      ))}
    </span>
  );
}

export function MetaItem({ icon, text }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--f-ui)", fontSize: ".84rem", color: "var(--muted)" }}>{icon}{text}</span>;
}

export function Card({ title, children }) {
  return <section style={ui.section}><div style={{ marginBottom: 16, ...ui.title }}>{title}</div>{children}</section>;
}

export function MessageBox({ color, text, fit = false }) {
  const palette = dashboardMessageTone(color);

  return <div style={{ display: "inline-flex", width: fit ? "fit-content" : "auto", padding: "10px 12px", borderRadius: 14, fontFamily: "var(--f-ui)", fontSize: ".82rem", fontWeight: 700, ...palette }}>{text}</div>;
}

export function StatCard({ label, value, onClick = null }) {
  const Component = onClick ? "button" : "div";
  const stat = statMeta(label);
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick || undefined}
      style={{
        width: "100%",
        minHeight: 104,
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        alignItems: "center",
        gap: 14,
        padding: "18px 20px",
        borderRadius: 20,
        background: "linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(248,251,255,.96) 100%)",
        border: "1px solid rgba(255,255,255,.84)",
        boxShadow: onClick ? `0 16px 34px ${stat.shadow}` : "0 12px 26px rgba(14,30,60,.05)",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          color: stat.color,
          background: stat.soft,
          border: `1px solid ${stat.border}`,
        }}
      >
        <stat.icon size={18} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", marginBottom: 6, fontFamily: "var(--f-ui)", fontSize: ".78rem", fontWeight: 900, color: "#334155" }}>
          {label}
        </span>
        <span style={{ display: "block", fontFamily: "var(--f-title)", fontSize: "1.8rem", lineHeight: 1, fontWeight: 950, color: "#0f1a33" }}>
          {value}
        </span>
      </span>
    </Component>
  );
}

function statMeta(label) {
  const key = String(label || "").toLowerCase();
  if (key.includes("seguidor") || key.includes("seguido")) {
    return { icon: Users, color: "#2563eb", soft: "rgba(37,99,235,.10)", border: "rgba(37,99,235,.22)", shadow: "rgba(37,99,235,.10)" };
  }
  if (key.includes("visita")) {
    return { icon: Eye, color: "#0d9488", soft: "rgba(13,148,136,.10)", border: "rgba(13,148,136,.22)", shadow: "rgba(13,148,136,.10)" };
  }
  if (key.includes("proyecto")) {
    return { icon: FolderKanban, color: "#7c3aed", soft: "rgba(124,58,237,.10)", border: "rgba(124,58,237,.22)", shadow: "rgba(124,58,237,.10)" };
  }
  if (key.includes("exp")) {
    return { icon: CalendarClock, color: "#ea580c", soft: "rgba(234,88,12,.10)", border: "rgba(234,88,12,.22)", shadow: "rgba(234,88,12,.10)" };
  }
  if (key.includes("empresa")) {
    return { icon: Building2, color: "#be123c", soft: "rgba(190,18,60,.09)", border: "rgba(190,18,60,.20)", shadow: "rgba(190,18,60,.09)" };
  }
  return { icon: Sparkles, color: "#475569", soft: "rgba(71,85,105,.09)", border: "rgba(71,85,105,.18)", shadow: "rgba(71,85,105,.08)" };
}

export function SocialItem({ item }) {
  const [hovered, setHovered] = useState(false);
  const platformName = item.platformName || item.displayName || item.platform || "Enlace";
  const palette = socialPalette(platformName);
  const accent = item.platformColor || palette.accent;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        padding: "11px 12px",
        borderRadius: 14,
        background: hovered
          ? `linear-gradient(135deg, ${palette.soft} 0%, rgba(255,255,255,.96) 52%, rgba(247,251,255,.94) 100%)`
          : "linear-gradient(180deg, #fbfdff 0%, #f7fbff 100%)",
        border: `1px solid ${hovered ? palette.border : "rgba(205,225,245,.76)"}`,
        boxShadow: hovered ? `0 14px 28px ${accent}1f` : "0 8px 18px rgba(14,30,60,.04)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease",
        outline: "none",
      }}
    >
      <span style={{ ...dashboardShell.iconBadge, color: accent, background: `${accent}16`, border: `1px solid ${accent}22` }}>
        {socialIcon(platformName)}
      </span>
      <span style={{ minWidth: 0, display: "grid", gap: 2 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--f-ui)", fontSize: ".88rem", fontWeight: 850, color: "var(--text)" }}>
          {platformName}
        </span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--f-body)", fontSize: ".74rem", color: "var(--muted)" }}>
          {compactUrl(item.url)}
        </span>
      </span>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          color: hovered ? accent : "var(--muted)",
          background: hovered ? `${accent}12` : "rgba(255,255,255,.62)",
          transition: "color .16s ease, background .16s ease",
        }}
      >
        <ExternalLink size={14} />
      </span>
    </a>
  );
}

export function SkillChip({ skill }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const chipRef = useRef(null);
  const levelLabel = skill.levelLabel || skill.nivel_label || skill.level || "Nivel";
  const palette = skillPalette(skill);
  const openTooltip = () => {
    const rect = chipRef.current?.getBoundingClientRect();
    const estimatedTooltipHeight = 190;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    setPlacement(rect && rect.bottom + estimatedTooltipHeight > viewportHeight - 22 ? "top" : "bottom");
    setOpen(true);
  };

  return (
    <span
      ref={chipRef}
      onMouseEnter={openTooltip}
      onMouseLeave={() => setOpen(false)}
      onFocus={openTooltip}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      style={{
        ...ui.chip,
        background: palette.soft,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        position: "relative",
        zIndex: open ? 1000 : 0,
        isolation: open ? "isolate" : "auto",
        cursor: "pointer",
        outline: "none",
        transform: open ? "translateY(-1px)" : "translateY(0)",
        boxShadow: open ? `0 10px 24px ${palette.accent}16` : "none",
        transition: "transform .16s ease, box-shadow .16s ease, background .16s ease",
      }}
    >
      {skill.name}
      {open ? (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: 0,
            top: placement === "bottom" ? "calc(100% + 10px)" : "auto",
            bottom: placement === "top" ? "calc(100% + 10px)" : "auto",
            zIndex: 1001,
            width: 250,
            maxWidth: "min(250px, 78vw)",
            display: "grid",
            gap: 10,
            padding: 13,
            borderRadius: 16,
            background: "#ffffff",
            border: `1px solid ${palette.accent}44`,
            boxShadow: "0 30px 60px rgba(14,30,60,.34), 0 12px 24px rgba(14,30,60,.18), inset 0 1px 0 rgba(255,255,255,.96)",
            color: "var(--body)",
            whiteSpace: "normal",
            backdropFilter: "none",
            pointerEvents: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 18,
              top: placement === "bottom" ? -7 : "auto",
              bottom: placement === "top" ? -7 : "auto",
              width: 12,
              height: 12,
              transform: "rotate(45deg)",
              background: "#ffffff",
              borderLeft: placement === "bottom" ? `1px solid ${palette.accent}44` : "none",
              borderTop: placement === "bottom" ? `1px solid ${palette.accent}44` : "none",
              borderRight: placement === "top" ? `1px solid ${palette.accent}44` : "none",
              borderBottom: placement === "top" ? `1px solid ${palette.accent}44` : "none",
            }}
          />
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ minWidth: 0, display: "grid", gap: 2 }}>
              <span style={{ fontFamily: "var(--f-ui)", fontSize: ".84rem", fontWeight: 950, color: "var(--text)", overflowWrap: "anywhere" }}>
                {skill.name}
              </span>
              <span style={{ fontFamily: "var(--f-ui)", fontSize: ".68rem", fontWeight: 850, color: palette.text, textTransform: "uppercase" }}>
                {skill.category || "General"}
              </span>
            </span>
            <span style={{ width: 28, height: 28, borderRadius: 10, display: "grid", placeItems: "center", background: palette.soft, color: palette.text }}>
              <Sparkles size={14} />
            </span>
          </span>
          <span style={{ fontFamily: "var(--f-body)", fontSize: ".8rem", lineHeight: 1.55, color: "#1f2937", fontWeight: 650 }}>
            {skill.description || "Habilidad registrada en el perfil profesional."}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "8px 9px",
              borderRadius: 12,
              background: "rgba(255,255,255,.98)",
              border: `1px solid ${palette.accent}2e`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.95)",
              fontFamily: "var(--f-ui)",
              fontSize: ".74rem",
              fontWeight: 850,
              color: "var(--muted)",
            }}
          >
            <span>{levelLabel}</span>
            <SkillLevelDots skill={skill} />
          </span>
        </span>
      ) : null}
    </span>
  );
}

export function ProjectCard({ project, onShare, sharing = false, shared = false }) {
  const cover = assetUrl(project.cover);
  const shareLabel = sharing ? (shared ? "Quitando..." : "Compartiendo...") : shared ? "Compartido" : "Compartir";
  const badge = project.status === "Completo"
    ? { color: "#16a34a", background: "rgba(74,222,128,.16)", border: "1px solid rgba(74,222,128,.24)" }
    : project.status === "Pausado"
      ? { color: "#d97706", background: "rgba(251,191,36,.16)", border: "1px solid rgba(251,191,36,.24)" }
      : { color: "#ef4444", background: "rgba(239,68,68,.14)", border: "1px solid rgba(239,68,68,.20)" };

  return (
    <article style={{ ...dashboardShell.surfaceCard, overflow: "hidden", borderRadius: 20 }}>
      <div style={{ height: 150, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, ...(cover ? { backgroundImage: `linear-gradient(180deg, rgba(14,30,60,.12) 0%, rgba(14,30,60,.34) 100%), url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "linear-gradient(135deg, #0d1f3c 0%, #1e3a5f 58%, #7fc6f3 100%)" }) }}>
        {onShare ? (
          <button
            type="button"
            onClick={() => onShare(project)}
            disabled={sharing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 11px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.34)",
              background: shared ? "rgba(30,58,138,.92)" : "rgba(255,255,255,.92)",
              color: shared ? "#fff" : "#2048a8",
              fontFamily: "var(--f-ui)",
              fontSize: ".76rem",
              fontWeight: 800,
              cursor: sharing ? "not-allowed" : "pointer",
              boxShadow: "0 10px 24px rgba(14,30,60,.14)",
              opacity: sharing ? 0.72 : 1,
            }}
          >
            <Send size={13} />
            {shareLabel}
          </button>
        ) : <span />}
        <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 999, fontFamily: "var(--f-ui)", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".06em", ...badge }}>
          {project.status === "Completo" ? "LIVE" : project.status === "Pausado" ? "PAUSADO" : "WIP"}
        </span>
      </div>
      <div style={{ display: "grid", gap: 10, padding: 16 }}>
        <div style={{ fontFamily: "var(--f-title)", fontSize: "1.05rem", fontWeight: 800, color: "var(--text)" }}>{project.title}</div>
        <div style={ui.body}>{project.description || "Proyecto sin descripcion."}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{project.tags?.slice(0, 5).map((tag) => <span key={`${project.id}-${tag}`} style={ui.chip}>{tag}</span>)}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {project.demoUrl ? <a href={project.demoUrl} target="_blank" rel="noreferrer" style={{ ...ui.primary, padding: "8px 11px", fontSize: ".76rem", textDecoration: "none" }}>Demo</a> : null}
            {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer" style={{ ...ui.secondary, padding: "8px 11px", fontSize: ".76rem" }}>Repo</a> : null}
          </div>
          <span style={ui.muted}>{project.status}</span>
        </div>
      </div>
    </article>
  );
}

export function ExperienceItem({ item, last, onShare, sharing = false, shared = false }) {
  const shareLabel = sharing ? (shared ? "Quitando..." : "Compartiendo...") : shared ? "Compartida" : "Compartir";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px minmax(0, 1fr)", gap: 12 }}>
      <div style={{ display: "grid", justifyItems: "center", gridTemplateRows: "auto 1fr", gap: 6 }}>
        <div style={{ ...dashboardShell.iconBadge, width: 28, height: 28, borderRadius: 10, color: "#2048a8", background: "rgba(36,86,191,.10)" }}>
          <BriefcaseBusiness size={14} />
        </div>
        {!last ? <div style={{ width: 1, background: "linear-gradient(180deg, rgba(162,214,249,.22) 0%, rgba(162,214,249,.50) 100%)" }} /> : null}
      </div>
      <div style={{ paddingBottom: 18, borderBottom: last ? "none" : "1px solid rgba(162,214,249,.16)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--f-title)", fontSize: "1rem", fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{item.title}</div>
            <div style={ui.muted}>{item.company}</div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={ui.muted}>{`${formatDate(item.startDate)} - ${item.isCurrent ? "Presente" : formatDate(item.endDate) || "Sin definir"}`}</div>
            {onShare ? (
              <button
                type="button"
                onClick={() => onShare(item)}
                disabled={sharing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 11px",
                  borderRadius: 999,
                  border: shared ? "1px solid rgba(36,86,191,.22)" : "1px solid rgba(205,225,245,.82)",
                  background: shared ? "rgba(36,86,191,.10)" : "rgba(255,255,255,.96)",
                  color: "#2048a8",
                  fontFamily: "var(--f-ui)",
                  fontSize: ".76rem",
                  fontWeight: 800,
                  cursor: sharing ? "not-allowed" : "pointer",
                  opacity: sharing ? 0.72 : 1,
                }}
              >
                <Send size={13} />
                {shareLabel}
              </button>
            ) : null}
          </div>
        </div>
        <div style={ui.body}>{item.description || "Experiencia sin descripcion detallada."}</div>
      </div>
    </div>
  );
}

export function EducationItem({ item }) {
  const period = [formatDate(item.startDate), item.isCurrent ? "Presente" : formatDate(item.endDate)]
    .filter(Boolean)
    .join(" - ");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: 10,
        padding: "12px 13px",
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(239,246,255,.96) 0%, rgba(255,255,255,.98) 100%)",
        border: "1px solid rgba(162,214,249,.34)",
        boxShadow: "0 10px 22px rgba(14,30,60,.05)",
      }}
    >
      <span style={{ ...dashboardShell.iconBadge, color: "#2048a8", background: "rgba(36,86,191,.10)" }}>
        <GraduationCap size={15} />
      </span>
      <span style={{ minWidth: 0, display: "grid", gap: 4 }}>
        <span style={{ fontFamily: "var(--f-ui)", fontSize: ".9rem", fontWeight: 900, color: "var(--text)", overflowWrap: "anywhere" }}>
          {item.program || item.level || "Formacion profesional"}
        </span>
        {item.institution ? (
          <span style={{ fontFamily: "var(--f-body)", fontSize: ".78rem", color: "var(--body)", overflowWrap: "anywhere" }}>
            {item.institution}
          </span>
        ) : null}
        <span style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {item.level ? (
            <span style={{ ...ui.chip, fontSize: ".72rem", padding: "5px 9px", background: "rgba(36,86,191,.08)", color: "#2048a8", border: "1px solid rgba(36,86,191,.16)" }}>
              {item.level}
            </span>
          ) : null}
          {period ? <span style={ui.muted}>{period}</span> : null}
        </span>
      </span>
    </div>
  );
}

export function SummaryCard({ title, text }) {
  return <div style={{ ...ui.subtleCard, display: "grid", gap: 10, padding: 18, borderRadius: 18 }}><div style={{ ...dashboardShell.iconBadge, width: 34, height: 34, borderRadius: 12, color: "#2048a8", background: "rgba(36,86,191,.10)" }}><Sparkles size={16} /></div><div style={{ fontFamily: "var(--f-title)", fontSize: ".96rem", fontWeight: 800, color: "var(--text)" }}>{title}</div><div style={ui.body}>{text}</div></div>;
}

export function EmptyCard({ icon, title, text }) {
  const Icon = icon;
  return <div style={{ minHeight: 230, display: "grid", placeItems: "center", alignContent: "center", gap: 10, padding: 24, borderRadius: 18, background: "rgba(248,250,252,.86)", border: "1px dashed rgba(162,214,249,.28)", textAlign: "center" }}><div style={{ ...dashboardShell.iconBadge, width: 34, height: 34, borderRadius: 12, color: "#2048a8", background: "rgba(36,86,191,.10)" }}><Icon size={18} /></div><div style={{ fontFamily: "var(--f-title)", fontSize: ".96rem", fontWeight: 800, color: "var(--text)" }}>{title}</div><div style={ui.muted}>{text}</div></div>;
}

export function StateBox({ title, text, action = null }) {
  return <div style={{ ...dashboardShell.surfaceCard, display: "grid", gap: 12, padding: "30px 28px", borderRadius: 24 }}><div style={{ fontFamily: "var(--f-title)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>{title}</div><div style={ui.body}>{text}</div>{action ? <div>{action}</div> : null}</div>;
}

export { FolderKanban, BriefcaseBusiness, GraduationCap };
