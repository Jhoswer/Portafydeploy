// src/components/admin/components/Eliminacion/TableCVs.jsx
import { useState } from "react";
import { FileText } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TableCVs({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="cvs"
      title="CVs del usuario"
      emptyText="Este usuario no tiene CVs registrados."
      Icon={FileText}
      primaryKey="id_cv"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}