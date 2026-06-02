import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAdminModuleGroups } from "./adminModules";
import "../../../styles/components/admin/LeftSidebarAdmin.css";

export default function LeftSidebarAdmin({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const ADMIN_MODULE_GROUPS = getAdminModuleGroups(t);

  function renderNavItem({ page, icon: Icon, label, color }) {
    return (
      <div
        key={page}
        className="resource-item"
        onClick={() => setActivePage(page)}
        title={collapsed ? label : ""}
        style={{
          background: activePage === page ? "rgba(224, 112, 112, 0.12)" : undefined,
          transform: activePage === page ? "translateX(2px)" : undefined,
        }}
      >
        <div
          className={`resource-icon ${color}`}
          style={{
            background: activePage === page ? "rgba(224, 112, 112, 0.12)" : undefined,
            color: activePage === page ? "#ff6b6b" : undefined,
          }}
        >
          <Icon size={18} />
        </div>
        {!collapsed ? <div className="resource-label">{label}</div> : null}
      </div>
    );
  }

  return (
    <aside
      className="sidebar-left"
      style={{
        width: collapsed ? 70 : 252,
        minWidth: collapsed ? 70 : 252,
      }}
    >
      {ADMIN_MODULE_GROUPS.left.map((group, index) => (
        <div className="card" key={group.key}>
          <div className="card-body">
            {index === 0 ? (
              <div
                className="card-title"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: collapsed ? 0 : 14,
                }}
              >
                {!collapsed ? <span>{group.title}</span> : null}
                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  title={collapsed ? t("common.expandMenu") : t("common.collapseMenu")}
                  style={{
                    background: "none",
                    border: 0,
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    flexShrink: 0,
                  }}
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
    </aside>
  );
}