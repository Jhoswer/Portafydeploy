import { useAuth } from "../../context/useAuth"
import RecruiterDashboard from "../../components/reclutador/RecruiterDashboard" 
import Admin from "../admin/Admin" 
import DashboardLayout from "../../components/dashboard/DashboardLayout"

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) return <div>Cargando...</div>

  if (user.rol === "reclutador")        return <RecruiterDashboard />
  if (user.rol === "administrador")     return <Admin />
  if (user.rol === "super administrador") return <Admin /> 

  return <DashboardLayout />
}