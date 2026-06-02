// TablaCV.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalCV from "./ModalCV";

export default function TablaCV({ idProfile }) {
  const { t } = useTranslation();
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [reloadKey,    setReloadKey]    = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile} resource="cvs"
        title={t("adminEdicion.tablas.cvs.title")}
        emptyText={t("adminEdicion.tablas.cvs.emptyText")}
        Icon={FileText} primaryKey="id_cv" reloadKey={reloadKey}
        onRowClick={(cv) => setSelectedCvId(cv.id_cv)}
      />
      {selectedCvId && (
        <ModalCV idProfile={idProfile} idCv={selectedCvId}
          onClose={() => setSelectedCvId(null)}
          onSaved={() => setReloadKey((v) => v + 1)} />
      )}
    </>
  );
}