import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { ADMIN_MODULE_GROUPS } from "./adminModules";
import "../../../styles/components/admin/RightSidebarAdmin.css";

export default function RightSidebarAdmin({ role, activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);
  const isSuperAdmin = role === "superadmin";

  function renderNavItem({ page, icon: Icon, label, color }) {
    const isActive = activePage === page;

    return (
      <div
        key={page}
        className={`resource-item${isActive ? " active" : ""}${collapsed ? " collapsed-right" : ""}`}
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
    <div className={`admin-sidebar-right${collapsed ? " admin-sidebar-right--collapsed" : ""}`}>
      {ADMIN_MODULE_GROUPS.right
        .filter((group) => !group.superadminOnly || isSuperAdmin)
        .map((group, index) => (
          <div className="card" key={group.key}>
            <div className="card-body">
              {index === 0 ? (
                <div className="admin-right-panel-title card-title">
                  <button
                    type="button"
                    className="sidebar-toggle-btn"
                    onClick={() => setCollapsed((value) => !value)}
                    title={collapsed ? "Expandir menu" : "Colapsar menu"}
                  >
                    {collapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                  </button>
                  {!collapsed ? <span>{group.title}</span> : null}
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
