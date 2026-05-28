import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Eye,
  Loader2,
  Mail,
  MousePointerClick,
  Newspaper,
  RefreshCw,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { fetchProfileAnalytics, fetchProfileViews } from "../../services/profileTrustService";
import { ProfileViewsModal } from "./profile/ProfileTrustModals";
import { profileUi as ui } from "../../styles/components/dashboard/profileStyles";

const SUMMARY_CARDS = [
  { key: "profile_views", label: "Visitas al perfil", icon: Eye, color: "#2563eb", help: "Total de personas que abrieron tu perfil." },
  { key: "profile_views_week", label: "Ultimos 7 dias", icon: Activity, color: "#0d9488", help: "Visitas recibidas durante la ultima semana." },
  { key: "project_views", label: "Vistas a proyectos", icon: BriefcaseBusiness, color: "#7c3aed", help: "Veces que otros revisaron tus proyectos." },
  { key: "experience_views", label: "Vistas a experiencia", icon: UserRound, color: "#ea580c", help: "Interes generado por tus experiencias visibles." },
  { key: "contact_clicks", label: "Clicks de contacto", icon: Mail, color: "#dc2626", help: "Veces que intentaron contactarte desde tu perfil." },
  { key: "cv_clicks", label: "Clicks al CV", icon: MousePointerClick, color: "#0891b2", help: "Veces que abrieron o intentaron revisar tu CV." },
  { key: "portfolio_posts", label: "Contenido compartido", icon: Newspaper, color: "#4f46e5", help: "Publicaciones tuyas visibles en el feed y vitrina." },
  { key: "portfolio_engagement", label: "Interacciones totales", icon: TrendingUp, color: "#16a34a", help: "Suma de likes, comentarios y guardados de tu contenido." },
  { key: "engagement_rate", label: "Promedio por publicacion", icon: BarChart3, color: "#9333ea", help: "Interacciones promedio que recibe cada publicacion." },
];

export default function DashboardAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [profileViews, setProfileViews] = useState([]);
  const [showProfileViews, setShowProfileViews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([fetchProfileAnalytics(), fetchProfileViews()])
      .then(([analyticsResult, viewsResult]) => {
        if (cancelled) return;

        if (analyticsResult.status === "rejected") {
          throw analyticsResult.reason;
        }

        setAnalytics(analyticsResult.value);
        setProfileViews(
          viewsResult.status === "fulfilled" && Array.isArray(viewsResult.value?.items)
            ? viewsResult.value.items
            : [],
        );
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
            <h1 style={titleStyle}>Estadisticas profesionales</h1>
            <p style={{ ...ui.muted, margin: "6px 0 0" }}>Alcance, rendimiento y actividad reciente de tu perfil y portafolio.</p>
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
          const isProfileViews = card.key === "profile_views";
          return (
            <article key={card.key} className="dashboard-metric-card" style={metricCardStyle}>
              <button
                type="button"
                style={{
                  ...iconBoxStyle,
                  ...(isProfileViews ? iconButtonStyle : null),
                  color: card.color,
                  background: `${card.color}12`,
                  cursor: isProfileViews ? "pointer" : "default",
                }}
                onClick={isProfileViews ? () => setShowProfileViews(true) : undefined}
                aria-label={isProfileViews ? "Ver usuarios que visitaron mi perfil" : undefined}
              >
                <Icon size={18} />
              </button>
              <div>
                <div style={metricValueStyle}>{Number(summary[card.key] || 0)}</div>
                <div style={metricLabelStyle}>{card.label}</div>
              </div>
              <div className="dashboard-metric-card__hint" role="tooltip">{card.help}</div>
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

      <section style={{ ...ui.section, padding: 22 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={sectionTitleStyle}>Proyectos mas vistos</h2>
          <p style={{ ...ui.muted, margin: "4px 0 0" }}>Top 3 segun visitas en perfil y actividad de tus proyectos compartidos.</p>
        </div>
        <div style={topProjectsGridStyle}>
          <TopProjectsList
            title="En mi perfil"
            text="Proyectos que otros abrieron desde tu perfil publico."
            items={analytics?.top_projects_profile || []}
            valueKey="views"
            valueLabel="visitas"
          />
          <TopProjectsList
            title="En el feed"
            text="Proyectos compartidos con mejor respuesta en publicaciones."
            items={analytics?.top_projects_feed || []}
            valueKey="score"
            valueLabel="puntos"
          />
        </div>
      </section>

      {showProfileViews ? (
        <ProfileViewsModal
          views={profileViews}
          loading={false}
          onClose={() => setShowProfileViews(false)}
          onOpenProfile={(person) => {
            const targetUserId = person?.user_id;
            if (!targetUserId) return;
            navigate(`/perfil-profesional?usuario=${targetUserId}`);
          }}
        />
      ) : null}
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

function TopProjectsList({ title, text, items, valueKey, valueLabel }) {
  return (
    <article style={topProjectPanelStyle}>
      <div>
        <h3 style={topProjectTitleStyle}>{title}</h3>
        <p style={{ ...ui.muted, margin: "4px 0 0" }}>{text}</p>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.length ? (
          items.slice(0, 3).map((item, index) => (
            <div key={`${title}-${item.id || index}`} style={topProjectRowStyle}>
              <span style={topProjectRankStyle}>{index + 1}</span>
              <span style={{ minWidth: 0 }}>
                <strong style={topProjectNameStyle}>{item.title || "Proyecto sin titulo"}</strong>
                <span style={topProjectMetaStyle}>
                  {Number(item[valueKey] || 0)} {valueLabel}
                </span>
              </span>
            </div>
          ))
        ) : (
          <State title="Sin datos suficientes" text="Aun no hay visitas registradas para armar este ranking." compact />
        )}
      </div>
    </article>
  );
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
  position: "relative",
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

const iconButtonStyle = {
  border: 0,
  padding: 0,
  transition: "transform .16s ease, box-shadow .16s ease",
  boxShadow: "0 10px 24px rgba(37,99,235,.10)",
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
  background: "var(--dashboard-soft-bg)",
  border: "1px solid var(--dashboard-card-border)",
};

const eventDotStyle = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  background: "#2563eb",
};

const topProjectsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const topProjectPanelStyle = {
  padding: 16,
  borderRadius: 18,
  background: "var(--dashboard-soft-bg)",
  border: "1px solid var(--dashboard-card-border)",
  display: "grid",
  gap: 14,
};

const topProjectTitleStyle = {
  margin: 0,
  fontFamily: "var(--f-title)",
  fontSize: "1rem",
  color: "var(--text)",
};

const topProjectRowStyle = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  alignItems: "center",
  gap: 10,
  padding: "11px 12px",
  borderRadius: 14,
  background: "var(--dashboard-card-bg)",
  border: "1px solid var(--dashboard-card-border)",
};

const topProjectRankStyle = {
  width: 28,
  height: 28,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  color: "#2563eb",
  background: "rgba(37,99,235,.10)",
  fontFamily: "var(--f-ui)",
  fontWeight: 900,
};

const topProjectNameStyle = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontFamily: "var(--f-ui)",
  fontSize: ".86rem",
  color: "var(--text)",
};

const topProjectMetaStyle = {
  display: "block",
  marginTop: 2,
  fontFamily: "var(--f-body)",
  fontSize: ".76rem",
  color: "var(--muted)",
};
