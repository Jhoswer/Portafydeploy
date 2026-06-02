// TablaPreferencias.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings2 } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalPreferencias from "./ModalPreferencias";

export default function TablaPreferencias({ idProfile }) {
  const { t } = useTranslation();
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [reloadKey,          setReloadKey]          = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile} resource="preferences"
        title={t("adminEdicion.tablas.preferencias.title")}
        emptyText={t("adminEdicion.tablas.preferencias.emptyText")}
        Icon={Settings2} primaryKey="id_preference" reloadKey={reloadKey}
        onRowClick={(row) => setSelectedPreference(row)}
      />
      {selectedPreference && (
        <ModalPreferencias idProfile={idProfile} preference={selectedPreference}
          onClose={() => setSelectedPreference(null)}
          onSave={() => { setSelectedPreference(null); setReloadKey((k) => k + 1); }} />
      )}
    </>
  );
}