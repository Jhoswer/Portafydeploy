// src/components/admin/components/Eliminacion/TableComentarios.jsx
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TableComentarios({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="comments"
      title="Comentarios del usuario"
      emptyText="Este usuario no tiene comentarios registrados."
      Icon={MessageCircle}
      primaryKey="id_comment"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}