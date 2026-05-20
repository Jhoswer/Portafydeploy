// src/components/admin/components/Eliminacion/TableProyectos.jsx
import { useState } from "react";
import { FolderKanban } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TableProyectos({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="projects"
      title="Proyectos del usuario"
      emptyText="Este usuario no tiene proyectos registrados."
      Icon={FolderKanban}
      primaryKey="id_project"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}