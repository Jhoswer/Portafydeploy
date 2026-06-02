// TablaHabilidades.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalHabilidades from "./ModalHabilidades";

export default function TablaHabilidades({ idProfile }) {
  const { t } = useTranslation();
  const [selectedRow, setSelectedRow] = useState(null);
  const [reloadKey,   setReloadKey]   = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile} resource="skills"
        title={t("adminEdicion.tablas.habilidades.title")}
        emptyText={t("adminEdicion.tablas.habilidades.emptyText")}
        Icon={Zap} primaryKey="id_skill_profile" reloadKey={reloadKey}
        onRowClick={(row) => setSelectedRow(row)}
      />
      {selectedRow && (
        <ModalHabilidades idProfile={idProfile} idSkillProfile={selectedRow.id_skill_profile}
          initialData={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSaved={() => { setSelectedRow(null); setReloadKey((v) => v + 1); }} />
      )}
    </>
  );
}