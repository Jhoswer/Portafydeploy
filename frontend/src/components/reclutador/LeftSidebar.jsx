import {
  Building2, Users, Search, FilePlus,
  PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import EmpresaPerfil    from "./dashboardCompany/CompanyProfile";
import DashboardCompany from "./dashboardCompany/companyDashboard";
import Convocatorias    from "./dashboardCompany/Convocatory";
import NewConvocatory   from "./dashboardCompany/NewConvocatory";

import { convocatorias as convocatoriasData, candidatos as candidatosData, visibilidadInicial } from "../../data/mockData";
import { useSidebarNav } from "../landing/SidebarNavContext";

export default function RecruiterLeftSidebar() {
  const { t, i18n } = useTranslation(); 
  const { setNavItems } = useSidebarNav();

  const [collapsed, setCollapsed]            = useState(false);
  const [collapsedSections, setCollapsedSec] = useState({});
  const [activePage, setActivePage]          = useState("empresa");
  const [editingId, setEditingId]            = useState(null);
  const [convocatorias, setConvocatorias]    = useState(convocatoriasData);
  const [candidatos, setCandidatos]          = useState(candidatosData);
  const [visibility, setVisibility]          = useState(visibilidadInicial);

  function handleVisibilityChange(key) {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleNavigateNueva() {
    setEditingId(null);
    setActivePage("nueva");
  }

  function handleEdit(id) {
    setEditingId(id);
    setActivePage("nueva");
  }

  function handleBackFromForm() {
    setEditingId(null);
    setActivePage("convocatorias");
  }


  const NAV_SECTIONS = [
    {
      id: "empresa",
      label: t("empresa.nav.empresa"),
      groupKey: "empresa.nav.empresa",
      items: [
        { page: "empresa", icon: Building2, label: t("empresa.nav.perfil_empresa"), labelKey: "empresa.nav.perfil_empresa", color: "res-violet" },
        { page: "panel",   icon: Users,     label: t("empresa.nav.panel"),          labelKey: "empresa.nav.panel",          color: "res-teal"   },
      ],
    },
    {
      id: "convocatorias",
      label: t("empresa.nav.convocatorias"),
      groupKey: "empresa.nav.convocatorias",
      items: [
        { page: "convocatorias", icon: Search,   label: t("empresa.nav.convocatory"),        labelKey: "empresa.nav.convocatory",        color: "res-blue", badge: null },
        { page: "nueva",         icon: FilePlus, label: t("empresa.nav.nueva_convocatoria"), labelKey: "empresa.nav.nueva_convocatoria", color: "res-teal", badge: null },
      ],
    },
  ];

  useEffect(() => {
  const allItems = NAV_SECTIONS.flatMap(section =>
    section.items.map(item => ({
      key:      item.page,
      label:    item.label,     
      labelKey: item.labelKey,   
      group:    section.label,   
      groupKey: section.groupKey,
      icon:     item.icon,
      onClick:  () => {
        if (item.page === "nueva") handleNavigateNueva();
        else setActivePage(item.page);
      },
    }))
  );

  setNavItems(allItems);
  return () => setNavItems(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [i18n.language]); 

  const PAGE_MAP = {
    empresa: <EmpresaPerfil />,
    panel: (
      <DashboardCompany
        convocatorias={convocatorias}
        candidatos={candidatos}
        visibility={visibility}
        onVisibilityChange={handleVisibilityChange}
        onNavigate={setActivePage}
      />
    ),
    convocatorias: (
      <Convocatorias
        onEdit={handleEdit}
        onNueva={handleNavigateNueva}
      />
    ),
    nueva: (
      <NewConvocatory
        editId={editingId}
        onBack={handleBackFromForm}
      />
    ),
  };

  function toggleSection(id) {
    setCollapsedSec((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function renderItem({ page, icon: Icon, label, color, badge }) {
    const isActive = activePage === page;
    return (
      <div
        key={page}
        className={`resource-item${isActive ? " active" : ""}${collapsed ? " collapsed" : ""}`}
        onClick={() => {
          if (page === "nueva") handleNavigateNueva();
          else setActivePage(page);
        }}
        title={collapsed ? label : ""}
      >
        <div className={`resource-icon ${color}`}>
          <Icon size={16} />
        </div>
        {!collapsed && (
          <div className="resource-text">
            <div className="resource-label">{label}</div>
            {badge != null && <span className="recruiter-badge">{badge}</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="recruiter-layout">

      <div className={`sidebar-left recruiter${collapsed ? " collapsed" : ""}`}>

        {/* Primera card: título + botón toggle SIEMPRE dentro */}
        <div className="card">
          <div className="card-body">
            <div className="panel-card-title card-title">
              {!collapsed && <span>{t("empresa.nav.empresa")}</span>}
              <button
                className="sidebar-toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? t("empresa.nav.expandir") : t("empresa.nav.colapsar")}
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>
            {NAV_SECTIONS[0].items.map(renderItem)}
          </div>
        </div>

        {/* Resto de secciones colapsables */}
        {NAV_SECTIONS.slice(1).map((section) => {
          const isClosed = !!collapsedSections[section.id];
          return (
            <div className="card" key={section.id}>
              <div className="card-body">
                <div
                  className="recruiter-section-header"
                  onClick={() => !collapsed && toggleSection(section.id)}
                >
                  <span className="recruiter-section-title">{section.label}</span>
                  {!collapsed && (
                    <span className="recruiter-chevron">
                      {isClosed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </span>
                  )}
                </div>
                {(!isClosed || collapsed) && section.items.map(renderItem)}
              </div>
            </div>
          );
        })}

      </div>

      <div className="recruiter-content">
        {PAGE_MAP[activePage]}
      </div>

    </div>
  );
}