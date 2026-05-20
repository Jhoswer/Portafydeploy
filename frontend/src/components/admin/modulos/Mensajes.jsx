import AdminModuleLayout from "../components/AdminModuleLayout";

export default function Mensajes() {
  return (
    <AdminModuleLayout title="Mensajes" subtitle="Bandeja interna para la comunicacion del equipo administrador.">
      <div className="adm-placeholder">
        <span className="adm-placeholder__icon">Panel</span>
        <p className="adm-placeholder__label">Modulo Mensajes disponible para integracion.</p>
      </div>
    </AdminModuleLayout>
  );
}
