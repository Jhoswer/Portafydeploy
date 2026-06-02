// TablaExperiencias.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalExperiencias from "./ModalExperiencias";

export default function TablaExperiencias({ idProfile }) {
  const { t } = useTranslation();
  const [selectedRow, setSelectedRow] = useState(null);
  const [reloadKey,   setReloadKey]   = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile} resource="experiences"
        title={t("adminEdicion.tablas.experiencias.title")}
        emptyText={t("adminEdicion.tablas.experiencias.emptyText")}
        Icon={Briefcase} primaryKey="id_experience" reloadKey={reloadKey}
        onRowClick={(row) => setSelectedRow(row)}
      />
      {selectedRow && (
        <ModalExperiencias idProfile={idProfile} idExperience={selectedRow.id_experience}
          initialData={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSaved={() => { setSelectedRow(null); setReloadKey((v) => v + 1); }} />
      )}
    </>
  );
}