import AdminModuleLayout from "../components/AdminModuleLayout";

export default function Mensaje() {
  return (
    <AdminModuleLayout title="Mensaje" subtitle="Panel de avisos criticos y comunicaciones operativas.">
      <div className="adm-placeholder">
        <span className="adm-placeholder__icon">Panel</span>
        <p className="adm-placeholder__label">Modulo Mensaje disponible para integracion.</p>
      </div>
    </AdminModuleLayout>
  );
}
