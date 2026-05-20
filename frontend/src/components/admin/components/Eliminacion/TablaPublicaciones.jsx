// src/components/admin/components/Eliminacion/TablePublicaciones.jsx
import { useState } from "react";
import { Newspaper } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablePublicaciones({ idProfile }) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <EliminacionProfileTable
      idProfile={idProfile}
      resource="publications"
      title="Publicaciones del usuario"
      emptyText="Este usuario no tiene publicaciones registradas."
      Icon={Newspaper}
      primaryKey="id_publication"
      reloadKey={reloadKey}
      onDeleted={() => setReloadKey((v) => v + 1)}
    />
  );
}