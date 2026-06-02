// TablaHabilidades.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaHabilidades({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="skills"
      title={t("adminEliminacion.tablas.habilidades.title")}
      emptyText={t("adminEliminacion.tablas.habilidades.empty")}
      Icon={Zap} primaryKey="id_skill_profile"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}