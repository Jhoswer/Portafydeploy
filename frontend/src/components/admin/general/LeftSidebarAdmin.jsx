import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ADMIN_MODULE_GROUPS } from "./adminModules";
import "../../../styles/components/admin/LeftSidebarAdmin.css";

export default function LeftSidebarAdmin({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);

  function renderNavItem({ page, icon: Icon, label, color }) {
    const isActive = activePage === page;

    return (
      <div
        key={page}
        className={`resource-item${isActive ? " active" : ""}${collapsed ? " collapsed" : ""}`}
        onClick={() => setActivePage(page)}
        title={collapsed ? label : ""}
      >
        <div className={`resource-icon ${color}`}>
          <Icon size={18} />
        </div>
        {!collapsed ? (
          <div className="resource-text">
            <div className="resource-label">{label}</div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`admin-sidebar-left${collapsed ? " admin-sidebar-collapsed" : ""}`}>
      {ADMIN_MODULE_GROUPS.left.map((group, index) => (
        <div className="card" key={group.key}>
          <div className="card-body">
            {index === 0 ? (
              <div className="admin-panel-title card-title">
                {!collapsed ? <span>{group.title}</span> : null}
                <button
                  type="button"
                  className="sidebar-toggle-btn"
                  onClick={() => setCollapsed((value) => !value)}
                  title={collapsed ? "Expandir menu" : "Colapsar menu"}
                >
                  {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </button>
              </div>
            ) : (
              !collapsed ? <div className="card-title">{group.title}</div> : null
            )}

            {group.items.map(renderNavItem)}
          </div>
        </div>
      ))}
    </div>
  );
}
