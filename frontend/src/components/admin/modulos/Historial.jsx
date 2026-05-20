import { useState } from "react";
import AdminModuleLayout from "../components/AdminModuleLayout";
import HistorialUsuarios from "../components/HistorialUsuarios";
import HistorialDetalle from "../components/Historial/Historial";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/components/admin/adminHistorial.css";

function getUsuarioId(usuario) {
  return usuario?.id ?? usuario?.id_user ?? null;
}

export default function Historial() {
  const { user } = useAuth();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const currentRoleId =
    user?.id_role ??
    user?.idRole ??
    (user?.rol === "super administrador" ? 5 : user?.rol === "administrador" ? 6 : null);

  function handleSelectUsuario(usuario) {
    if (!usuario) return;
    setUsuarioSeleccionado({
      ...usuario,
      id: getUsuarioId(usuario),
      nombre: usuario.nombre ?? usuario.name ?? "Usuario",
      apellido: usuario.apellido ?? usuario.last_name ?? "",
      foto_perfil: usuario.foto_perfil ?? usuario.fotoPerfil ?? "",
      email: usuario.email ?? usuario.correo ?? "",
      rol: usuario.rol ?? "usuario",
      profesion: usuario.profesion ?? usuario.cargo ?? "",
      ubicacion: usuario.ubicacion ?? usuario.ciudad ?? "",
      biografia: usuario.biografia ?? usuario.bio ?? "",
      perfil_completado: usuario.perfil_completado ?? usuario.perfilCompletado ?? false,
    });
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
