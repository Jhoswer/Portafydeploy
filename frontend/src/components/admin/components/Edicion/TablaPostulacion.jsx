// TablaPostulacion.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SendHorizonal } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalPostulacion from "./ModalPostulacion";

export default function TablaPostulacion({ idProfile }) {
  const { t } = useTranslation();
  const [selectedPostulation, setSelectedPostulation] = useState(null);
  const [reloadKey,           setReloadKey]           = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile} resource="postulations"
        title={t("adminEdicion.tablas.postulaciones.title")}
        emptyText={t("adminEdicion.tablas.postulaciones.emptyText")}
        Icon={SendHorizonal} primaryKey="id_postulation" reloadKey={reloadKey}
        onRowClick={(row) => setSelectedPostulation(row)}
      />
      {selectedPostulation && (
        <ModalPostulacion idProfile={idProfile} postulation={selectedPostulation}
          onClose={() => setSelectedPostulation(null)}
          onSave={() => { setSelectedPostulation(null); setReloadKey((k) => k + 1); }} />
      )}
    </>
  );
}