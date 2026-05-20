// src/components/admin/components/Eliminacion/TableHabilidades.jsx
import { useState } from "react";
import { Zap } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TableHabilidades({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="skills"
      title="Habilidades del usuario"
      emptyText="Este usuario no tiene habilidades registradas."
      Icon={Zap}
      primaryKey="id_skill_profile"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}