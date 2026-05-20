import AdminModuleLayout from "../components/AdminModuleLayout";

export default function Exploracion() {
  return (
    <AdminModuleLayout title="Exploracion" subtitle="Modulo para inspeccion rapida de entidades y trazabilidad.">
      <div className="adm-placeholder">
        <span className="adm-placeholder__icon">Panel</span>
        <p className="adm-placeholder__label">Modulo Exploracion disponible para integracion.</p>
      </div>
    </AdminModuleLayout>
  );
}
