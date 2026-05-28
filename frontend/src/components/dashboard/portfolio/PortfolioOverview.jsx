import { ArrowUpRight, Orbit, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  cardText,
  cardTitle,
  missionBadge,
  missionDescription,
  missionHero,
  missionStat,
  missionStats,
  missionTitle,
  overviewStage,
  portfolioCard,
  portfolioCardChrome,
  portfolioCardGrid,
  portfolioCardShine,
  portfolioCountPill,
  portfolioFooter,
  portfolioFooterRow,
  portfolioIconFrame,
  portfolioSignalTrack,
  portfolioUniverse,
  portfolioUniverseGrid,
} from "../../../features/dashboard-portfolio/portfolioStyles";
import { useViewport } from "../../../features/dashboard-portfolio/portfolioWorkspaceControls";

export default function PortfolioOverview({ overviewCards, progress, recentHighlights = [], onOpenSection }) {
  const viewport = useViewport();
  const isTablet = viewport < 1080;
  const isMobile = viewport < 720;
  const totalItems = overviewCards.reduce((total, cardData) => total + cardData.count, 0);
  const nextSection = overviewCards.find((cardData) => cardData.count === 0)?.title ?? "Publicacion";
  const stageStyle = {
    ...overviewStage,
    gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : overviewStage.gridTemplateColumns,
  };
  const heroStyle = {
    ...missionHero,
    gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : missionHero.gridTemplateColumns,
    padding: isMobile ? "20px" : "24px",
  };
  const statsStyle = {
    ...missionStats,
    gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : missionStats.gridTemplateColumns,
  };

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={portfolioUniverse}>
        <span aria-hidden="true" style={portfolioUniverseGrid} />

        <section
          style={{
            position: "relative",
            display: "grid",
            gap: 9,
            padding: isMobile ? "12px 14px" : "12px 16px",
            borderRadius: 22,
            background: "var(--dashboard-card-bg)",
            border: "1px solid var(--dashboard-card-border)",
            boxShadow: "0 10px 24px rgba(7,17,31,.045), inset 0 1px 0 rgba(255,255,255,.88)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--f-ui)",
                fontSize: "0.76rem",
                fontWeight: 950,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Portafolio activo
            </span>
            <span style={{ fontFamily: "var(--f-title)", fontSize: "0.95rem", fontWeight: 950, color: "var(--text)" }}>
              {progress.percent}% completado
              <span style={{ color: "var(--muted)", fontWeight: 800 }}> / {totalItems} registros</span>
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(15,23,42,.07)", overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                width: `${progress.percent}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #5b7cfa 0%, #4f8cff 54%, #c8874c 100%)",
                boxShadow: "0 0 18px rgba(79,140,255,.18)",
                transition: "width .28s ease",
              }}
            />
          </div>
        </section>

        <section style={stageStyle}>
          {overviewCards.map((cardData, index) => (
            <OverviewCard
              key={cardData.key}
              cardData={cardData}
              index={index}
              isMobile={isMobile}
              onOpenSection={onOpenSection}
            />
          ))}
        </section>
      </div>

      <section style={heroStyle}>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            right: -110,
            top: -120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,146,60,.14) 0%, rgba(251,146,60,.05) 38%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            left: "42%",
            bottom: -120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,124,250,.14) 0%, transparent 68%)",
          }}
        />

        <div style={{ position: "relative", display: "grid", gap: 18, alignContent: "center" }}>
          <span style={missionBadge}>
            <Sparkles size={14} />
            Actividad inteligente
          </span>

          <div style={{ display: "grid", gap: 14 }}>
            <h1 style={{ ...missionTitle, fontSize: isMobile ? "1.85rem" : "clamp(2rem, 3vw, 3.3rem)" }}>
              Lo ultimo que agregaste, convertido en senales utiles.
            </h1>
            <p style={missionDescription}>
              Este bloque resume el pulso de tu portafolio: que modulo esta vivo, que pieza se agrego al frente
              y donde conviene entrar para seguir afinando tu historia profesional.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <div style={{ ...statsStyle, alignContent: "center", marginTop: 0 }}>
            {[
              ["Progreso", `${progress.percent}%`],
              ["Registros", totalItems],
              ["Siguiente", nextSection],
            ].map(([label, value]) => (
              <div key={label} style={missionStat}>
                <div
                  style={{
                    fontFamily: "var(--f-ui)",
                    fontSize: "0.66rem",
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 5,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-title)",
                    fontSize: label === "Siguiente" ? "0.94rem" : "1.22rem",
                    lineHeight: 1,
                    fontWeight: 950,
                    color: "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {recentHighlights.map((highlight, index) => (
              <RecentHighlight
                key={highlight.key}
                highlight={highlight}
                index={index}
                onOpenSection={onOpenSection}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function RecentHighlight({ highlight, index, onOpenSection }) {
  const [hovered, setHovered] = useState(false);
  const Icon = highlight.icon;
  const hasLatest = Boolean(highlight.latestTitle);

  return (
    <button
      type="button"
      onClick={() => onOpenSection(highlight.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        gap: 12,
        alignItems: "center",
        width: "100%",
        padding: "12px 13px",
        borderRadius: 20,
        border: hovered ? `1px solid ${highlight.color}3d` : "1px solid var(--dashboard-card-border)",
        background: hovered ? `linear-gradient(135deg, ${highlight.color}12 0%, var(--dashboard-card-bg) 100%)` : "var(--dashboard-soft-bg)",
        boxShadow: hovered ? `0 14px 28px ${highlight.color}18` : "0 8px 18px rgba(14,30,60,.035)",
        cursor: "pointer",
        textAlign: "left",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          color: highlight.color,
          background: `${highlight.color}13`,
          border: `1px solid ${highlight.color}1f`,
        }}
      >
        <Icon size={17} />
      </span>

      <span style={{ minWidth: 0, display: "grid", gap: 3 }}>
        <span
          style={{
            fontFamily: "var(--f-ui)",
            fontSize: "0.66rem",
            fontWeight: 950,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          {hasLatest ? `Ultimo ${highlight.singular}` : `Estacion 0${index + 1}`}
        </span>
        <span
          style={{
            fontFamily: "var(--f-title)",
            fontSize: "0.96rem",
            fontWeight: 950,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {hasLatest ? highlight.latestTitle : `Agrega tu primer ${highlight.singular}`}
        </span>
        <span
          style={{
            fontFamily: "var(--f-body)",
            fontSize: "0.78rem",
            color: "var(--body)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {hasLatest ? highlight.latestSubtitle || `${highlight.count} registros en ${highlight.title}` : "Aun no hay contenido en este modulo."}
        </span>
      </span>

      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 11,
          display: "grid",
          placeItems: "center",
          color: hovered ? "#fff" : highlight.color,
          background: hovered ? highlight.color : "var(--dashboard-icon-bg)",
          border: `1px solid ${highlight.color}20`,
          transition: "background .18s ease, color .18s ease",
        }}
      >
        <ArrowUpRight size={14} />
      </span>
    </button>
  );
}

function OverviewCard({ cardData, index, isMobile, onOpenSection }) {
  const [hovered, setHovered] = useState(false);
  const { key, title: heading, icon: Icon, color, description: text, count } = cardData;
  const completionSignal = Math.min(100, Math.max(18, count ? 42 + count * 12 : 18));
  const microStatus = count ? "En orbita" : "Sin despegar";

  return (
    <button
      type="button"
      onClick={() => onOpenSection(key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...portfolioCard,
        gridColumn: isMobile ? "span 1" : "span 6",
        minHeight: 266,
        padding: isMobile ? 18 : 20,
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 22px 48px rgba(7,17,31,.105), 0 0 0 1px ${color}24, inset 0 1px 0 rgba(255,255,255,.92)`
          : portfolioCard.boxShadow,
        borderColor: hovered ? `${color}34` : "var(--dashboard-card-border)",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
      }}
    >
      <div style={portfolioCardChrome}>
        <span
          style={{
            position: "absolute",
            width: 190,
            height: 190,
            right: -72,
            top: -82,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}30 0%, ${color}12 38%, transparent 72%)`,
            filter: "blur(1px)",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform .2s ease",
          }}
        />
        <span
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            left: -68,
            bottom: -72,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}26 0%, transparent 68%)`,
          }}
        />
        <span style={portfolioCardGrid} />
        <span style={portfolioCardShine} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              ...portfolioIconFrame,
              color,
              border: `1px solid ${color}28`,
              background: `linear-gradient(145deg, var(--dashboard-icon-bg), ${color}12)`,
              transform: hovered ? "translateY(-1px) scale(1.015)" : "translateY(0) scale(1)",
              transition: "transform .2s ease",
            }}
          >
            <Icon size={22} strokeWidth={2.45} />
          </div>

          <span
            style={{
              fontFamily: "var(--f-ui)",
              fontSize: "0.68rem",
              fontWeight: 950,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            estacion 0{index + 1}
          </span>
        </div>

        <span style={portfolioCountPill}>
          <Orbit size={13} />
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <span
          style={{
            width: "fit-content",
            padding: "6px 10px",
            borderRadius: 999,
            background: count ? `${color}18` : "var(--dashboard-icon-bg)",
            border: `1px solid ${count ? `${color}22` : "var(--dashboard-card-border)"}`,
            fontFamily: "var(--f-ui)",
            fontSize: "0.68rem",
            fontWeight: 950,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: count ? color : "var(--muted)",
          }}
        >
          {microStatus}
        </span>

        <h2 style={{ ...cardTitle, margin: 0, fontSize: "1.32rem", letterSpacing: "-0.05em", lineHeight: 1 }}>
          {heading}
        </h2>
        <p style={{ ...cardText, margin: 0, maxWidth: 520, color: "var(--body)" }}>{text}</p>
      </div>

      <div style={portfolioFooter}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--f-title)", fontSize: "0.94rem", fontWeight: 950, color }}>
            {completionSignal}%
          </span>
          <div style={portfolioSignalTrack}>
            <span
              style={{
                display: "block",
                width: `${completionSignal}%`,
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${color} 0%, rgba(7,17,31,.88) 100%)`,
                transition: "width .24s ease",
              }}
            />
          </div>
        </div>

        <div style={{ ...portfolioFooterRow, justifyContent: "flex-end" }}>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: hovered ? `linear-gradient(135deg, ${color} 0%, #07111f 100%)` : "var(--dashboard-icon-bg)",
              color: hovered ? "#fff" : color,
              border: hovered ? `1px solid ${color}` : `1px solid ${color}20`,
              boxShadow: hovered ? `0 12px 24px ${color}22` : "0 10px 22px rgba(14,30,60,.06)",
              transform: hovered ? "translateX(1px)" : "translateX(0)",
              transition: "all .2s ease",
            }}
          >
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}
