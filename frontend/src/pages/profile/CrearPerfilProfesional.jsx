import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/landing/Navbar";
import DashboardProfile from "../../components/dashboard/DashboardProfile";
import { dashboardShell } from "../../styles/components/dashboardShell";

export default function CrearPerfilProfesional() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get("usuario");

  return (
    <>
      <Navbar />

      <div
        style={{
          ...dashboardShell.container,
          padding: "24px 20px 32px",
          boxSizing: "border-box",
          display: "grid",
          gap: 14,
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              ...dashboardShell.secondaryButton,
              borderRadius: 999,
              color: "var(--text)",
            }}
          >
            <ArrowLeft size={14} />
            Volver
          </button>
        </div>
        <DashboardProfile userId={selectedUserId} readOnly />
      </div>
    </>
  );
}
