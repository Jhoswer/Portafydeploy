import { useState } from "react";
import { Newspaper } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalPublicacion from "./ModalPublicacion";

export default function TablaPublicacion({ idProfile }) {
  const [selectedId, setSelectedId] = useState(null);
  const [reloadKey, setReloadKey]   = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile}
        resource="publications"
        title="Publicaciones del usuario"
        emptyText="Este usuario no tiene publicaciones registradas."
        Icon={Newspaper}
        primaryKey="id_publication"
        reloadKey={reloadKey}
        onRowClick={(row) => setSelectedId(row.id_publication)}
      />

      {selectedId && (
        <ModalPublicacion
          idProfile={idProfile}
          idPublication={selectedId}
          onClose={() => setSelectedId(null)}
          onSaved={() => setReloadKey((v) => v + 1)}
        />
      )}
    </>
  );
}