// TablaExperiencias.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaExperiencias({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="experiences"
      title={t("adminEliminacion.tablas.experiencias.title")}
      emptyText={t("adminEliminacion.tablas.experiencias.empty")}
      Icon={Briefcase} primaryKey="id_experience"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}