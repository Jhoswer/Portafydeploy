import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../landing/Navbar";
import DashboardMain from "./DashboardMain";
import DashboardCalendar from "./DashboardCalendar";
import DashboardPortfolio from "./DashboardPortfolio";
import DashboardProfile from "./DashboardProfile";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardPublications from "./my-publications/DashboardPublications";
import DashboardCv from "./cv/DashboardCv";
import DashboardFooter from "./DashboardFooter";
import {
  House,
  LayoutDashboard,
  UserRound,
  BriefcaseBusiness,
  CalendarDays,
  Newspaper,
  Settings,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  dashboardNavButton,
  dashboardShell,
} from "../../styles/components/dashboardShell";
import { fetchFeedPosts } from "../../services/feedService";

const SECTIONS = [
  { key: "main", labelKey: "main", icon: LayoutDashboard, color: "#5b7cfa" },
  { key: "profile", labelKey: "profile", icon: UserRound, color: "#7fc6f3" },
  {
    key: "portfolio",
    labelKey: "portfolio",
    icon: BriefcaseBusiness,
    color: "#fb923c",
  },
  {
    key: "publications",
    labelKey: "publications",
    icon: Newspaper,
    color: "#2563eb",
  },
  { key: "cv", labelKey: "cv", icon: FileText, color: "#0d9488" },
  { key: "analytics", labelKey: "analytics", icon: BarChart3, color: "#7c3aed" },
  {
    key: "calendar",
    labelKey: "calendar",
    icon: CalendarDays,
    color: "#22c55e",
  },
];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("main");
  const [mountedSections, setMountedSections] = useState(
    () => new Set(["main"]),
  );
  const viewport = useViewport();
  const isTablet = viewport < 1080;

  const sectionViews = useMemo(
    () => ({
      main: DashboardMain,
      profile: DashboardProfile,
      portfolio: DashboardPortfolio,
      publications: DashboardPublications,
      cv: DashboardCv,
      analytics: DashboardAnalytics,
      calendar: DashboardCalendar,
    }),
    [],
  );

  useEffect(() => {
    fetchFeedPosts({ limit: 20 }).catch(() => {});
  }, []);

  const showSection = useCallback((sectionKey) => {
    setActiveSection(sectionKey);
    setMountedSections((prev) => {
      if (prev.has(sectionKey)) return prev;
      const next = new Set(prev);
      next.add(sectionKey);
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e) => showSection(e.detail);
    window.addEventListener("dashboard:navigate", handler);
    return () => window.removeEventListener("dashboard:navigate", handler);
  }, [showSection]);

  return (
    <div style={dashboardShell.page}>
      <Navbar />

      <div
        style={{
          flex: 1,
          ...dashboardShell.container,
          padding: isTablet ? "18px 16px 28px" : "24px 20px 32px",
          display: "grid",
          gridTemplateColumns: isTablet
            ? "minmax(0, 1fr)"
            : "260px minmax(0, 1fr)",
          gap: 24,
          minHeight: 0,
        }}
      >
        <aside
          style={{
            width: isTablet ? "100%" : 260,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: isTablet ? "static" : "sticky",
              top: isTablet ? "auto" : 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div className="dashboard-rail-card" style={dashboardShell.railCard}>
              <div style={dashboardShell.sidebarCardTitle}>{t("appI18n.dashboard.layout.panel")}</div>

              <button
                type="button"
                onClick={() => navigate("/feed")}
                className="dashboard-nav-item"
                style={dashboardNavButton(false, "#7fc6f3")}
              >
                <span className="dashboard-nav-icon" style={dashboardShell.iconBadge}>
                  <House size={16} />
                </span>
                {t("appI18n.dashboard.layout.home")}
              </button>
            </div>

            <div className="dashboard-rail-card" style={dashboardShell.railCard}>
              <div style={dashboardShell.sidebarCardTitle}>{t("appI18n.dashboard.layout.dashboard")}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SECTIONS.map((section) => {
                  const NavIcon = section.icon;
                  const isActive = activeSection === section.key;
                  const handleSectionChange = (key) => {
                    setActiveSection(key);
                    setMountedSections((prev) => {
                      if (prev.has(key)) return prev;
                      const next = new Set(prev);
                      next.add(key);
                      return next;
                    });
                  };
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => handleSectionChange(section.key)}
                      className={`dashboard-nav-item${isActive ? " is-active" : ""}`}
                      style={dashboardNavButton(isActive, section.color)}
                    >
                      <span
                        className="dashboard-nav-icon"
                        style={{
                          ...dashboardShell.iconBadge,
                          color: isActive ? "#ef5759" : "var(--text)",
                          background: isActive
                            ? "rgba(254,226,226,.86)"
                            : "var(--dashboard-icon-bg)",
                        }}
                      >
                        <NavIcon size={16} />
                      </span>
                      {t(`appI18n.dashboard.layout.${section.labelKey}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-rail-card" style={dashboardShell.railCard}>
              <div style={dashboardShell.sidebarCardTitle}>{t("appI18n.dashboard.layout.status")}</div>
              <div
                className="dashboard-status-pill"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: "rgba(36,86,191,.08)",
                  border: "none",
                  color: "#2048a8",
                  fontFamily: "var(--f-ui)",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                }}
              >
                <span
                  className="dashboard-status-dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#2048a8",
                  }}
                />
                {t("appI18n.dashboard.layout.active")}
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "var(--dashboard-soft-bg)",
                  border: "1px solid var(--dashboard-card-border)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--f-title)",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {t("appI18n.dashboard.layout.readyTitle")}
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-body)",
                    fontSize: "0.8rem",
                    color: "var(--body)",
                    lineHeight: 1.5,
                  }}
                >
                  {t("appI18n.dashboard.layout.readyText")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/configuracion")}
                style={{
                  ...dashboardNavButton(false, "#2048a8"),
                  marginTop: 12,
                  background: "var(--dashboard-card-bg)",
                  border: "1px solid var(--dashboard-card-border)",
                }}
                className="dashboard-nav-item"
              >
                <span className="dashboard-nav-icon" style={{ ...dashboardShell.iconBadge, color: "#2048a8" }}>
                  <Settings size={16} />
                </span>
                {t("appI18n.dashboard.layout.settings")}
              </button>
            </div>
          </div>
        </aside>

        <main
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {Object.keys(sectionViews).map((sectionKey) => {
            if (!mountedSections.has(sectionKey)) return null;

            const isActive = activeSection === sectionKey;
            const ViewComponent = sectionViews[sectionKey];

            return (
              <div
                key={sectionKey}
                aria-hidden={!isActive}
                style={{
                  display: isActive ? "block" : "none",
                  minWidth: 0,
                }}
              >
                <ViewComponent />
              </div>
            );
          })}
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
}

function useViewport() {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
