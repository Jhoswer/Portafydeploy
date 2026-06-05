import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useTranslation } from "react-i18next";
import { EXPLORE_FILTER_ITEMS, NAV_ITEMS, SEARCH_FILTERS } from "./feedSidebarConfig";

export default function LeftSidebar({ onFilter, activeFilter, onSearchFilter, activeSearchFilters = {} }) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSearchPage = location.pathname === "/nueva-busqueda";

  const activePage = Object.values(NAV_ITEMS)
    .flat()
    .find((item) => item.route === location.pathname)?.page ?? "home";

  function renderNavItem({ page, route, icon: Icon, label, labelKey, sub, color }) {
    const isActive = activePage === page;
    const itemLabel = labelKey ? t(`appI18n.feed.left.${labelKey}`) : label;
    return (
      <div
        key={page}
        className={`resource-item${isActive ? " active" : ""}${collapsed ? " collapsed" : ""}`}
        onClick={() => {
          if (page === "tendencias") onFilter?.("tendencias");
          navigate(route);
        }}
        title={collapsed ? itemLabel : ""}
      >
        <div className={`resource-icon ${color}`}>
          <Icon size={18} />
        </div>
        {!collapsed && (
          <div className="resource-text">
            <div className="resource-label">{itemLabel}</div>
            {sub && <div className="resource-sub">{sub}</div>}
          </div>
        )}
      </div>
    );
  }

  function renderExploreFilterItem({ filter, icon: Icon, label, labelKey, color }) {
    const isActive = activeFilter === filter;
    const itemLabel = labelKey ? t(`appI18n.feed.left.${labelKey}`) : label;
    return (
      <div
        key={filter}
        className={`resource-item${isActive ? " active" : ""}${collapsed ? " collapsed" : ""}`}
        onClick={() => {
          if (location.pathname === "/tendencias") navigate("/feed");
          onFilter?.(filter);
        }}
        title={collapsed ? itemLabel : ""}
      >
        <div className={`resource-icon ${color}`}>
          <Icon size={15} />
        </div>
        {!collapsed && (
          <div className="resource-text">
            <div className="resource-label">{itemLabel}</div>
          </div>
        )}
      </div>
    );
  }

  function renderSearchFilters() {
    if (collapsed) {
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

          {isOpen && (
            <div className="search-filter-options">
              {options.map((opt) => (
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
        <div className="card">
          <div className="card-body">
            <div className="panel-card-title card-title">
              {!collapsed && <span>{t("appI18n.feed.left.panel")}</span>}
              <button
                className="sidebar-toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? "Expandir menu" : "Colapsar menu"}
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
          <div className="card">
            <div className="card-body">
              <div className="card-title search-filters-title">{t("appI18n.feed.left.filters")}</div>
              {renderSearchFilters()}
            </div>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="card-body">
                <div className="card-title">{t("appI18n.feed.left.explore")}</div>
                {EXPLORE_FILTER_ITEMS.map(renderExploreFilterItem)}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="card-title">{t("appI18n.feed.left.activity")}</div>
                {NAV_ITEMS.actividad.map(renderNavItem)}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
