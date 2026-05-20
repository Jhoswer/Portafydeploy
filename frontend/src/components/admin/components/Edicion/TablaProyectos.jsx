// src/components/admin/components/Edicion/TablaProyectos.jsx

import { useState } from "react";
import { FolderKanban } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalProyecto     from "./ModalProyecto";

export default function TablaProyectos({ idProfile }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [reloadKey,       setReloadKey]       = useState(0);

  const handleRowClick = (row) => setSelectedProject(row);
  const handleClose    = ()    => setSelectedProject(null);
  const handleSaved    = ()    => { setSelectedProject(null); setReloadKey((k) => k + 1); };

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile}
        resource="projects"
        title="Proyectos del usuario"
        emptyText="Este usuario no tiene proyectos registrados."
        Icon={FolderKanban}
        primaryKey="id_project"
        reloadKey={reloadKey}
        onRowClick={handleRowClick}
      />

      {selectedProject && (
        <ModalProyecto
          idProfile={idProfile}
          idProject={selectedProject.id_project}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}