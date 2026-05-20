import AdminModuleLayout from "../components/AdminModuleLayout";

export default function Anadir() {
  return (
    <AdminModuleLayout title="Anadir" subtitle="Modulo disponible para futuras herramientas administrativas.">
      <div className="adm-placeholder">
        <span className="adm-placeholder__icon">Panel</span>
        <p className="adm-placeholder__label">La logica de alta fue movida al modulo Nuevos.</p>
      </div>
    </AdminModuleLayout>
  );
}
