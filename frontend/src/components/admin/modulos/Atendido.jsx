import AdminModuleLayout from "../components/AdminModuleLayout";

export default function Atendido() {
  return (
    <AdminModuleLayout title="Atendido" subtitle="Resumen de casos trabajados y cerrados por el administrador.">
      <div className="adm-placeholder">
        <span className="adm-placeholder__icon">Panel</span>
        <p className="adm-placeholder__label">Modulo Atendido disponible para integracion.</p>
      </div>
    </AdminModuleLayout>
  );
}
