import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthTopbar from "../../components/landing/AuthTopbar";
import LeftSidebarAdmin from "../../components/admin/general/LeftSidebarAdmin";
import AdminFeed from "../../components/admin/general/Adminfeed";
import RightSidebarAdmin from "../../components/admin/general/RightSidebarAdmin";
import "../../styles/components/admin/AdminLayout.css";
import { SidebarNavProvider, useSidebarNav } from "../../components/landing/SidebarNavContext";
import { ADMIN_MODULE_GROUPS } from "../../components/admin/general/adminModules";

export default function Admin() {
  return (
    <SidebarNavProvider>
      <AdminInner />
    </SidebarNavProvider>
  );
}

function AdminInner() {
  const { state } = useLocation();
  const { user }  = useAuth();
  const { setNavItems } = useSidebarNav();

  const roleRaw = state?.role || user?.rol || "";
  const role    = roleRaw.toLowerCase();

  const normalizedRole =
    role === "super administrador" ? "superadmin" :
    role === "administrador"       ? "admin"       : "admin";

  const isSuperAdmin = normalizedRole === "superadmin";

  const [activePage, setActivePage] = useState("reportes");

  useEffect(() => {
    if (role === "administrador")       console.log("Ingreso como administrador");
    if (role === "super administrador") console.log("Ingreso como super administrador");
  }, [role]);

  useEffect(() => {
    const leftItems = ADMIN_MODULE_GROUPS.left
      .flatMap(group => group.items.map(item => ({
        ...item,
        key:     item.page,
        group:   group.title,
        side:    "left",
        onClick: () => setActivePage(item.page),
      })));

    const rightItems = ADMIN_MODULE_GROUPS.right
      .filter(group => !group.superadminOnly || isSuperAdmin)
      .flatMap(group => group.items.map(item => ({
        ...item,
        key:     item.page,
        group:   group.title,
        side:    "right",
        onClick: () => setActivePage(item.page),
      })));

    setNavItems([...leftItems, ...rightItems]);

    return () => setNavItems(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  return (
    <div className="page-wrapper page-admin">
      <AuthTopbar />

      <div className="layout">
        <LeftSidebarAdmin
          role={normalizedRole}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <AdminFeed activePage={activePage} />

        <RightSidebarAdmin
          role={normalizedRole}
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </div>
    </div>
  );
}