// TablaProyectos.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderKanban } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalProyecto from "./ModalProyecto";

export default function TablaProyectos({ idProfile }) {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState(null);
  const [reloadKey,       setReloadKey]       = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile} resource="projects"
        title={t("adminEdicion.tablas.proyectos.title")}
        emptyText={t("adminEdicion.tablas.proyectos.emptyText")}
        Icon={FolderKanban} primaryKey="id_project" reloadKey={reloadKey}
        onRowClick={(row) => setSelectedProject(row)}
      />
      {selectedProject && (
        <ModalProyecto idProfile={idProfile} idProject={selectedProject.id_project}
          onClose={() => setSelectedProject(null)}
          onSaved={() => { setSelectedProject(null); setReloadKey((k) => k + 1); }} />
      )}
    </>
  );
}