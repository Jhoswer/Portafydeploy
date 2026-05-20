import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Eye,
  Loader2,
  Mail,
  MousePointerClick,
  RefreshCw,
  UserRound,
} from "lucide-react";

import { fetchProfileAnalytics } from "../../services/profileTrustService";
import { profileUi as ui } from "../../styles/components/dashboard/profileStyles";

const SUMMARY_CARDS = [
  { key: "profile_views", label: "Visitas al perfil", icon: Eye, color: "#2563eb" },
  { key: "profile_views_week", label: "Ultimos 7 dias", icon: Activity, color: "#0d9488" },
  { key: "project_views", label: "Vistas a proyectos", icon: BriefcaseBusiness, color: "#7c3aed" },
  { key: "experience_views", label: "Vistas a experiencia", icon: UserRound, color: "#ea580c" },
  { key: "contact_clicks", label: "Clicks de contacto", icon: Mail, color: "#dc2626" },
  { key: "cv_clicks", label: "Clicks al CV", icon: MousePointerClick, color: "#0891b2" },
];

export default function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchProfileAnalytics()
      .then((response) => {
        if (cancelled) return;
        setAnalytics(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "No se pudieron cargar las analiticas.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const series = useMemo(() => analytics?.series || [], [analytics?.series]);
  const maxSeriesValue = useMemo(
    () => Math.max(1, ...series.map((item) => Number(item.views || 0))),
    [series],
  );

  if (loading) {
    return (
      <div style={ui.section}>
        <State
          title="Cargando analiticas..."
          text="Estamos calculando el alcance visible de tu perfil."
          icon={<Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={ui.section}>
        <State
          title="No se pudo cargar"
          text={error}
          action={
            <button type="button" onClick={() => { setLoading(true); setError(""); setAttempt((value) => value + 1); }} style={retryButtonStyle}>
              <RefreshCw size={15} />
              Volver a intentar
            </button>
          }
        />
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const topEvents = analytics?.top_events || [];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={{ ...ui.section, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={titleStyle}>Analytics</h1>
            <p style={{ ...ui.muted, margin: "6px 0 0" }}>Alcance y actividad reciente de tu presencia profesional.</p>
          </div>
          <div style={badgeStyle}>
            <BarChart3 size={16} />
            Perfil profesional
          </div>
        </div>
      </section>

      <section style={gridStyle}>
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.key} style={metricCardStyle}>
              <div style={{ ...iconBoxStyle, color: card.color, background: `${card.color}12` }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={metricValueStyle}>{Number(summary[card.key] || 0)}</div>
                <div style={metricLabelStyle}>{card.label}</div>
              </div>
            </article>
          );
        })}
      </section>

      <section style={{ ...ui.section, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 style={sectionTitleStyle}>Visitas de los ultimos 14 dias</h2>
            <p style={{ ...ui.muted, margin: "4px 0 0" }}>Cada barra representa visitas registradas a tu perfil.</p>
          </div>
        </div>

        <div style={chartStyle}>
          {series.length ? (
            series.map((item) => (
              <div key={item.day} style={barColumnStyle} title={`${item.label}: ${item.views}`}>
                <div style={{ ...barStyle, height: `${Math.max(8, (Number(item.views || 0) / maxSeriesValue) * 150)}px` }} />
                <span style={barLabelStyle}>{item.label || String(item.day || "").slice(5)}</span>
              </div>
            ))
          ) : (
            <State title="Sin visitas todavia" text="Cuando otros perfiles visiten el tuyo, veras la tendencia aqui." compact />
          )}
        </div>
      </section>

      <section style={{ ...ui.section, padding: 22 }}>
        <h2 style={sectionTitleStyle}>Actividad reciente</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {topEvents.length ? (
            topEvents.map((event, index) => (
              <div key={`${event.type}-${index}`} style={eventRowStyle}>
                <span style={eventDotStyle} />
                <span style={{ fontWeight: 800 }}>{eventLabel(event.type)}</span>
                <span style={{ marginLeft: "auto", color: "var(--muted)", fontWeight: 800 }}>{event.total}</span>
              </div>
            ))
          ) : (
            <State title="Sin eventos recientes" text="Los clicks de contacto, CV y secciones visitadas se iran registrando aqui." compact />
          )}
        </div>
      </section>
    </div>
  );
}

function State({ title, text, compact = false, action = null, icon = null }) {
  return (
    <div style={{ padding: compact ? 16 : 28, textAlign: "center" }}>
      {icon ? <div style={stateIconStyle}>{icon}</div> : null}
      <h3 style={{ ...sectionTitleStyle, marginBottom: 6 }}>{title}</h3>
      <p style={{ ...ui.muted, margin: 0 }}>{text}</p>
      {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
    </div>
  );
}

function eventLabel(type) {
  const labels = {
    profile_view: "Visitas al perfil",
    project_view: "Vistas a proyectos",
    experience_view: "Vistas a experiencia",
    contact_click: "Clicks de contacto",
    cv_click: "Clicks al CV",
  };
  return labels[type] || type;
}

const titleStyle = {
  margin: 0,
  fontFamily: "var(--f-title)",
  fontSize: "clamp(1.6rem, 2vw, 2.1rem)",
  color: "var(--text)",
};

const sectionTitleStyle = {
  margin: 0,
  fontFamily: "var(--f-title)",
  fontSize: "1.12rem",
  color: "var(--text)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
};

const metricCardStyle = {
  ...ui.section,
  padding: 18,
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const iconBoxStyle = {
  width: 42,
  height: 42,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
};

const metricValueStyle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.65rem",
  fontWeight: 900,
  color: "var(--text)",
  lineHeight: 1,
};

const metricLabelStyle = {
  marginTop: 4,
  color: "var(--muted)",
  fontFamily: "var(--f-ui)",
  fontSize: ".84rem",
  fontWeight: 800,
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 12px",
  borderRadius: 14,
  background: "rgba(37,99,235,.08)",
  color: "#2563eb",
  fontWeight: 900,
};

const retryButtonStyle = {
  ...ui.primary,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 42,
  padding: "0 16px",
  borderRadius: 14,
};

const stateIconStyle = {
  width: 42,
  height: 42,
  margin: "0 auto 12px",
  display: "grid",
  placeItems: "center",
  borderRadius: 14,
  color: "#2563eb",
  background: "rgba(37,99,235,.10)",
};

const chartStyle = {
  minHeight: 210,
  display: "flex",
  alignItems: "end",
  gap: 10,
  padding: "18px 6px 4px",
  overflowX: "auto",
};

const barColumnStyle = {
  minWidth: 34,
  display: "grid",
  alignItems: "end",
  justifyItems: "center",
  gap: 8,
};

const barStyle = {
  width: 22,
  borderRadius: "10px 10px 4px 4px",
  background: "linear-gradient(180deg, #2563eb 0%, #7fc6f3 100%)",
  boxShadow: "0 10px 20px rgba(37,99,235,.18)",
};

const barLabelStyle = {
  color: "var(--muted)",
  fontSize: ".72rem",
  fontWeight: 800,
};

const eventRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(248,251,255,.9)",
  border: "1px solid rgba(205,225,245,.72)",
};

const eventDotStyle = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  background: "#2563eb",
};
