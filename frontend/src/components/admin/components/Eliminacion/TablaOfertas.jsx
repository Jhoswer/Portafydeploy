// src/components/admin/components/Eliminacion/TableOfertas.jsx
import { useState } from "react";
import { FileText } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TableOfertas({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="offers"
      title="Ofertas del usuario"
      emptyText="Este usuario no tiene ofertas registradas."
      Icon={FileText}
      primaryKey="id_offer"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}