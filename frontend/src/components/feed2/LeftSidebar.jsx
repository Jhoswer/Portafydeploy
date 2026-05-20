import { useNavigate, useLocation } from "react-router-dom";
import {
  House,
  LayoutDashboard,
  Search,
  Compass,
  Bookmark,
  TrendingUp,
  User,
  Layers,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";

const NAV_ITEMS = {
  panel: [
    { page: "home",      route: "/feed",        icon: House,           label: "Inicio",    color: "res-blue"   },
    { page: "dashboard", route: "/dashboard",      icon: LayoutDashboard, label: "Dashboard", color: "res-violet" },
    { page: "search",    route: "/search", icon: Search,          label: "Buscar",    color: "res-blue"   },
  ],
  actividad: [
    { page: "guardados",  route: "/guardados",  icon: Bookmark,   label: "Guardados",  color: "res-teal" },
    { page: "tendencias", route: "/tendencias", icon: TrendingUp, label: "Tendencias",  color: "res-blue" },
  ],
};

const EXPLORE_FILTER_ITEMS = [
  { filter: "todos",         icon: User,      label: "Todos",         color: "res-violet" },
  { filter: "portafolios",   icon: Layers,    label: "Portafolios",   color: "res-teal"   },
  { filter: "convocatorias", icon: Briefcase, label: "Convocatorias", color: "res-blue"   },
];

// Filtros de búsqueda — cada uno tiene opciones desplegables
const SEARCH_FILTERS = [
  {
    id: "tipo",
    label: "Tipo",
    icon: User,
    options: ["Todos", "Usuario", "Proyecto", "Convocatoria"],
  },
  {
    id: "habilidad",
    label: "Habilidad",
    icon: Layers,
    options: ["Todas", "React", "Node.js", "Python", "TypeScript", "Vue", "Flutter"],
  },
  {
    id: "experiencia",
    label: "Experiencia",
    icon: Briefcase,
    options: ["Cualquiera", "Junior", "Semi-Senior", "Senior", "Lead"],
  },
  {
    id: "profesional",
    label: "Profesional",
    icon: SlidersHorizontal,
    options: ["Todos", "Freelance", "Tiempo completo", "Prácticas"],
  },
];

export default function LeftSidebar({ onFilter, activeFilter, onSearchFilter, activeSearchFilters = {} }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openFilter, setOpenFilter] = useState(null); 
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSearchPage = location.pathname === "/nueva-busqueda";

  const activePage = Object.values(NAV_ITEMS)
    .flat()
    .find(item => item.route === location.pathname)?.page ?? "home";

  function renderNavItem({ page, route, icon: Icon, label, sub, color }) {
    const isActive = activePage === page;
    return (
      <div
        key={page}
        className={`resource-item${isActive ? " active" : ""}${collapsed ? " collapsed" : ""}`}
        onClick={() => navigate(route)}
        title={collapsed ? label : ""}
      >
        <div className={`resource-icon ${color}`}>
          <Icon size={18} />
        </div>
        {!collapsed && (
          <div className="resource-text">
            <div className="resource-label">{label}</div>
            {sub && <div className="resource-sub">{sub}</div>}
          </div>
        )}
      </div>
    );
  }

  function renderExploreFilterItem({ filter, icon: Icon, label, color }) {
    const isActive = activeFilter === filter;
    return (
      <div
        key={filter}
        className={`resource-item${isActive ? " active" : ""}${collapsed ? " collapsed" : ""}`}
        onClick={() => onFilter?.(filter)}
        title={collapsed ? label : ""}
      >
        <div className={`resource-icon ${color}`}>
          <Icon size={15} />
        </div>
        {!collapsed && (
          <div className="resource-text">
            <div className="resource-label">{label}</div>
          </div>
        )}
      </div>
    );
  }

  function renderSearchFilters() {
    if (collapsed) {
      // Colapsado: solo los íconos de cada filtro
      return SEARCH_FILTERS.map(({ id, icon: Icon }) => (
        <div key={id} className="resource-item collapsed" title={id}>
          <div className="resource-icon res-blue">
            <Icon size={16} />
          </div>
        </div>
      ));
    }

    return SEARCH_FILTERS.map(({ id, label, icon: Icon, options }) => {
      const isOpen = openFilter === id;
      const selected = activeSearchFilters[id] || options[0];
      return (
        <div key={id} className="search-filter-group">
          {/* Cabecera del acordeón */}
          <div
            className="search-filter-header"
            onClick={() => setOpenFilter(isOpen ? null : id)}
          >
            <div className="search-filter-header-left">
              <Icon size={14} className="search-filter-icon" />
              <span className="search-filter-label">{label}</span>
            </div>
            <div className="search-filter-right">
              <span className="search-filter-selected">{selected}</span>
              {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>
          </div>

          {/* Opciones */}
          {isOpen && (
            <div className="search-filter-options">
              {options.map(opt => (
                <div
                  key={opt}
                  className={`search-filter-option${selected === opt ? " selected" : ""}`}
                  onClick={() => {
                    onSearchFilter?.(id, opt);
                    setOpenFilter(null);
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <>
      <style>{`
        .sidebar-left {
          width: ${collapsed ? "64px" : "240px"};
          min-width: ${collapsed ? "64px" : "240px"};
          transition: width 0.25s ease, min-width 0.25s ease;
          overflow: hidden;
        }

        .sidebar-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .sidebar-toggle-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .sidebar-left .panel-card-title {
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? "center" : "space-between"};
          overflow: hidden;
          white-space: nowrap;
        }

        .sidebar-left .card-title:not(.panel-card-title) {
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.2s, max-height 0.25s;
          opacity: ${collapsed ? 0 : 1};
          max-height: ${collapsed ? "0px" : "32px"};
          margin-bottom: ${collapsed ? "0" : undefined};
        }

        .resource-item.collapsed {
          justify-content: center;
          padding: 8px 0;
        }

        .resource-text {
          overflow: hidden;
          white-space: nowrap;
        }

        /* ── Filtros de búsqueda ── */
        .search-filter-group {
          margin-bottom: 4px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
        }

        .search-filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          cursor: pointer;
          background: #fafafa;
          transition: background 0.15s;
          user-select: none;
        }
        .search-filter-header:hover {
          background: #f3f4f6;
        }

        .search-filter-header-left {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .search-filter-icon {
          color: #6b7280;
          flex-shrink: 0;
        }

        .search-filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .search-filter-right {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #9ca3af;
          font-size: 11px;
        }

        .search-filter-selected {
          font-size: 11px;
          color: #6b7280;
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .search-filter-options {
          background: #fff;
          border-top: 1px solid #f0f0f0;
          padding: 4px 0;
        }

        .search-filter-option {
          padding: 7px 14px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: background 0.12s;
          border-radius: 4px;
          margin: 0 4px;
        }
        .search-filter-option:hover {
          background: #f3f4f6;
        }
        .search-filter-option.selected {
          color: #e53935;
          font-weight: 600;
          background: #fff5f5;
        }

        /* Título de filtros cuando está colapsado */
        .search-filters-title {
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.2s, max-height 0.25s;
          opacity: ${collapsed ? 0 : 1};
          max-height: ${collapsed ? "0px" : "32px"};
          margin-bottom: ${collapsed ? "0" : undefined};
        }
      `}</style>

      <div className="sidebar-left">

        {/* ── PANEL ── */}
        <div className="card">
          <div className="card-body">
            <div className="panel-card-title card-title">
              {!collapsed && <span>Panel</span>}
              <button
                className="sidebar-toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? "Expandir menú" : "Colapsar menú"}
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>
            {NAV_ITEMS.panel
              .filter((item) => item.page !== "dashboard" || user)
              .map(renderNavItem)}
          </div>
        </div>

        {isSearchPage ? (
          /* ── MODO BÚSQUEDA: filtros verticales ── */
          <div className="card">
            <div className="card-body">
              <div className="card-title search-filters-title">Filtros</div>
              {renderSearchFilters()}
            </div>
          </div>
        ) : (
          /* ── MODO NORMAL: Explorar + Actividad ── */
          <>
            <div className="card">
              <div className="card-body">
                <div className="card-title">Explorar</div>
                {EXPLORE_FILTER_ITEMS.map(renderExploreFilterItem)}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="card-title">Actividad</div>
                {NAV_ITEMS.actividad.map(renderNavItem)}
              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}
