import AdminModuleLayout from "../components/AdminModuleLayout";

export default function Solicitudes() {
  return (
    <AdminModuleLayout title="Solicitudes" subtitle="Gestion y evaluacion de solicitudes pendientes del sistema.">
      <div className="adm-placeholder">
        <span className="adm-placeholder__icon">Panel</span>
        <p className="adm-placeholder__label">Modulo Solicitudes disponible para integracion.</p>
      </div>
    </AdminModuleLayout>
  );
}
