// src/components/admin/components/Eliminacion/TableExperiencias.jsx
import { useState } from "react";
import { Briefcase } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TableExperiencias({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="experiences"
      title="Experiencias del usuario"
      emptyText="Este usuario no tiene experiencias registradas."
      Icon={Briefcase}
      primaryKey="id_experience"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}