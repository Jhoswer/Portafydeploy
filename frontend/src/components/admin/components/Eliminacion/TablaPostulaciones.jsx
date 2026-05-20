// src/components/admin/components/Eliminacion/TablePostulaciones.jsx
import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablePostulaciones({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="postulations"
      title="Postulaciones del usuario"
      emptyText="Este usuario no tiene postulaciones registradas."
      Icon={SendHorizonal}
      primaryKey="id_postulation"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}