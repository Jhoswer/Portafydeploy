// TablaProyectos.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderKanban } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaProyectos({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="projects"
      title={t("adminEliminacion.tablas.proyectos.title")}
      emptyText={t("adminEliminacion.tablas.proyectos.empty")}
      Icon={FolderKanban} primaryKey="id_project"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}