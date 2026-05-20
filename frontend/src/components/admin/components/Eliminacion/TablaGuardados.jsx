// src/components/admin/components/Eliminacion/TableGuardados.jsx
import { useState } from "react";
import { Bookmark } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TableGuardados({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="saved"
      title="Guardados del usuario"
      emptyText="Este usuario no tiene elementos guardados."
      Icon={Bookmark}
      primaryKey="id_saved"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}