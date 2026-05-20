import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar           from "../../components/landing/Navbar";
import LeftSidebarAdmin from "../../components/admin/general/LeftSidebarAdmin";
import AdminFeed from "../../components/admin/general/Adminfeed";
import RightSidebarAdmin from "../../components/admin/general/RightSidebarAdmin";
import "../../styles/components/admin/AdminLayout.css";

export default function Admin() {
  const { state } = useLocation();
  const { user }  = useAuth();

  // ── Rol ─────────────────────────────────────────────────────────────
  const roleRaw = state?.role || user?.rol || "";
  const role    = roleRaw.toLowerCase();

  const normalizedRole =
    role === "super administrador" ? "superadmin" :
    role === "administrador"       ? "admin"       : "admin";

  // ── Página activa (levantada para que AdminFeed la lea) ────────────
  const [activePage, setActivePage] = useState("reportes");

  useEffect(() => {
    if (role === "administrador")       console.log("Ingreso como administrador");
    if (role === "super administrador") console.log("Ingreso como super administrador");
  }, [role]);

  return (
    <div className="page-wrapper page-admin">
      <Navbar />

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
