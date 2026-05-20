import {
  Building2, Users, Search, FilePlus, FileText,
  UserCheck, Clock, CheckCircle,
  PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";


// ── Páginas ──────────────────────────────────────────────────
import EmpresaPerfil     from "./dashboardCompany/CompanyProfile";
import ExplorarTalento   from "./dashboard/ExplorarTalento";
import TodosPostulantes  from "./dashboard/TodosPostulantes";
import EnRevision        from "./dashboard/EnRevision";
import Contratados       from "./dashboard/Contratados";
import DashboardCompany  from "./dashboardCompany/companyDashboard";
import Convocatorias     from "./dashboardCompany/Convocatory";
import NewConvocatory    from "./dashboardCompany/NewConvocatory";

import { convocatorias as convocatoriasData, candidatos as candidatosData, visibilidadInicial } from "../../data/mockData";

const NAV_SECTIONS = [
  {
    id: "empresa",
    label: "Mi empresa",
    items: [
      { page: "empresa", icon: Building2, label: "Perfil empresa", color: "res-violet" },
      { page: "panel",   icon: Users,     label: "Panel",          color: "res-teal"   },
    ],
  },
  {
    id: "convocatorias",
    label: "Convocatorias",
    items: [
      { page: "convocatorias", icon: Search,   label: "Convocatory",        color: "res-blue", badge: null },
      { page: "nueva",         icon: FilePlus, label: "Nueva convocatoria", color: "res-teal", badge: null },
    ],
  },
];

export default function RecruiterLeftSidebar() {
  const [collapsed, setCollapsed]            = useState(false);
  const [collapsedSections, setCollapsedSec] = useState({});
  const [activePage, setActivePage]          = useState("empresa");

  // ── ID de convocatoria a editar (null = crear nueva) ────────
  const [editingId, setEditingId] = useState(null);

  // ── Estado de datos ──────────────────────────────────────────
  const [convocatorias, setConvocatorias] = useState(convocatoriasData);
  const [candidatos, setCandidatos]       = useState(candidatosData);
  const [visibility, setVisibility]       = useState(visibilidadInicial);

  function handleVisibilityChange(key) {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ── Navegar a "nueva" limpio ─────────────────────────────────
  function handleNavigateNueva() {
    setEditingId(null);
    setActivePage("nueva");
  }

  // ── Navegar a editar una convocatoria ────────────────────────
  function handleEdit(id) {
    setEditingId(id);
    setActivePage("nueva");
  }

  // ── Volver desde el formulario ───────────────────────────────
  function handleBackFromForm() {
    setEditingId(null);
    setActivePage("convocatorias");
  }

  // ── PAGE_MAP ─────────────────────────────────────────────────
  const PAGE_MAP = {
    empresa:       <EmpresaPerfil />,
    talento:       <ExplorarTalento />,
    todos:         <TodosPostulantes />,
    revision:      <EnRevision />,
    contratados:   <Contratados />,
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
          // Si clickea "nueva" desde el sidebar, siempre limpia el editingId
          if (page === "nueva") {
            handleNavigateNueva();
          } else {
            setActivePage(page);
          }
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
    <>
      <div className="recruiter-layout">

        {/* ── Sidebar ── */}
        <div className={`sidebar-left recruiter${collapsed ? " collapsed" : ""}`}>

          <div className="card">
            <div className="card-body">
              <div className="panel-card-title card-title">
                {!collapsed && <span>Empresa</span>}
                <button
                  className="sidebar-toggle-btn"
                  onClick={() => setCollapsed(!collapsed)}
                  title={collapsed ? "Expandir menú" : "Colapsar menú"}
                >
                  {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </button>
              </div>
              {NAV_SECTIONS[0].items.map(renderItem)}
            </div>
          </div>

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

        {/* ── Contenido principal ── */}
        <div className="recruiter-content">
          {PAGE_MAP[activePage]}
        </div>

      </div>
    </>
  );
}