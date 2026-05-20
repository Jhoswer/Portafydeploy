import AdminModuleLayout from "../components/AdminModuleLayout";
import AgregarAdmin from "../components/AgregarAdmin";

export default function Nuevos() {
  return (
    <AdminModuleLayout title="Nuevos" subtitle="Registro de nuevos administradores dentro del panel.">
      <AgregarAdmin />
    </AdminModuleLayout>
  );
}
