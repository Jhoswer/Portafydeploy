import { useState } from "react";
import { House, LayoutDashboard, LayoutGrid, Users, Briefcase, Layers, TrendingUp } from "lucide-react";

const FILTERS = [
  { value: "all", label: "Todos", icon: <LayoutGrid size={15} />, color: "#7fc6f3" },
  { value: "talent", label: "Talento", icon: <Users size={15} />, color: "#a78bfa" },
  { value: "job", label: "Empleo", icon: <Briefcase size={15} />, color: "#34d399" },
  { value: "portfolio", label: "Portafolio", icon: <Layers size={15} />, color: "#fb923c" },
];

const TRENDING_TAGS = [
  { tag: "React", count: 142 },
  { tag: "UX Design", count: 98 },
  { tag: "Remoto", count: 87 },
  { tag: "TypeScript", count: 74 },
  { tag: "FullStack", count: 61 },
  { tag: "Freelance", count: 55 },
];

export default function LeftSidebar({ activeFilter, onFilterChange, onOpenDashboard }) {
  const [hoveredTag, setHoveredTag] = useState(null);

  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      <aside
        style={{
          position: "sticky",
          top: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={card}>
          <p style={sectionLabel}>Panel</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button
              onClick={() => onFilterChange?.("all")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--f-ui)",
                fontSize: "0.84rem",
                fontWeight: 700,
                transition: "all 0.18s ease",
                background:
                  activeFilter === "all"
                    ? "linear-gradient(135deg, rgba(127,198,243,.22) 0%, rgba(127,198,243,.10) 100%)"
                    : "rgba(127,198,243,.06)",
                color: "var(--text)",
                borderLeft:
                  activeFilter === "all"
                    ? "3px solid #7fc6f3"
                    : "3px solid transparent",
                boxShadow:
                  activeFilter === "all"
                    ? "0 8px 24px rgba(127,198,243,.14)"
                    : "none",
              }}
            >
              <span style={{ color: "#7fc6f3", display: "flex", alignItems: "center" }}>
                <House size={16} />
              </span>
              Inicio
            </button>

            <button
              onClick={() => onOpenDashboard?.()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--f-ui)",
                fontSize: "0.84rem",
                fontWeight: 700,
                transition: "all 0.18s ease",
                background:
                  activeFilter === "dashboard"
                    ? "linear-gradient(135deg, rgba(91,124,250,.22) 0%, rgba(91,124,250,.10) 100%)"
                    : "rgba(91,124,250,.06)",
                color: "var(--text)",
                borderLeft:
                  activeFilter === "dashboard"
                    ? "3px solid #5b7cfa"
                    : "3px solid transparent",
                boxShadow:
                  activeFilter === "dashboard"
                    ? "0 8px 24px rgba(91,124,250,.14)"
                    : "none",
              }}
            >
              <span style={{ color: "#5b7cfa", display: "flex", alignItems: "center" }}>
                <LayoutDashboard size={16} />
              </span>
              Dashboard
            </button>
          </div>
        </div>

        <div style={card}>
          <p style={sectionLabel}>Explorar</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {FILTERS.map((f) => {
              const active = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => onFilterChange?.(f.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--f-ui)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    transition: "all 0.18s ease",
                    background: active
                      ? `linear-gradient(135deg, ${f.color}33 0%, ${f.color}18 100%)`
                      : "transparent",
                    color: active ? "var(--text)" : "var(--body)",
                    borderLeft: active ? `3px solid ${f.color}` : "3px solid transparent",
                  }}
                >
                  <span style={{ color: active ? f.color : "var(--muted)" }}>{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <TrendingUp size={13} color="var(--muted)" />
            <p style={{ ...sectionLabel, margin: 0 }}>Tendencias</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {TRENDING_TAGS.map((t, i) => (
              <button
                key={t.tag}
                onMouseEnter={() => setHoveredTag(t.tag)}
                onMouseLeave={() => setHoveredTag(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 8px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: hoveredTag === t.tag ? "rgba(162,214,249,.18)" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 700, width: 14 }}
                  >
                    {i + 1}
                  </span>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      fontFamily: "var(--f-ui)",
                    }}
                  >
                    #{t.tag}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    background: "rgba(162,214,249,.20)",
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,.88)",
  border: "1.5px solid rgba(162,214,249,.35)",
  borderRadius: 18,
  padding: "16px 14px",
  boxShadow: "0 4px 24px rgba(127,198,243,.10)",
  backdropFilter: "blur(10px)",
};

const sectionLabel = {
  fontSize: "0.7rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted)",
  fontFamily: "var(--f-ui)",
  marginBottom: 10,
};
