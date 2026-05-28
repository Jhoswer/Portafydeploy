import { useState } from "react";
import AdminModuleLayout from "../components/AdminModuleLayout";
import HistorialUsuarios from "../components/HistorialUsuarios";
import HistorialDetalle from "../components/Historial/Historial";
import { useAuth } from "../../../context/AuthContext";
import { normalizeHistorialUsuario, getUsuarioId } from "../components/Historial/historialUtils";
import "../../../styles/components/admin/adminHistorial.css";

export default function Historial() {
  const { user } = useAuth();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const currentRoleId =
    user?.id_role ??
    user?.idRole ??
    (user?.rol === "super administrador" ? 5 : user?.rol === "administrador" ? 6 : null);

  function handleSelectUsuario(usuario) {
    if (!usuario) return;
    setUsuarioSeleccionado(normalizeHistorialUsuario(usuario));
  }

  function volverABuscar() {
    setUsuarioSeleccionado(null);
  }

  if (usuarioSeleccionado) {
    return <HistorialDetalle usuario={usuarioSeleccionado} onVolver={volverABuscar} />;
  }

  return (
    <AdminModuleLayout
      title="Historial"
      subtitle="Busca un usuario y revisa sus registros de actividad."
    >
      <div className="adm-historial adm-historial--search">
        <div className="adm-historial__list">
          <HistorialUsuarios
            onSelectUsuario={handleSelectUsuario}
            selectedUserId={getUsuarioId(usuarioSeleccionado)}
            currentRoleId={currentRoleId}
          />
        </div>
      </div>
    </AdminModuleLayout>
  );
}
