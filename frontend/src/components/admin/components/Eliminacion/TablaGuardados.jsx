// TablaGuardados.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bookmark } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaGuardados({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="saved"
      title={t("adminEliminacion.tablas.guardados.title")}
      emptyText={t("adminEliminacion.tablas.guardados.empty")}
      Icon={Bookmark} primaryKey="id_saved"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}