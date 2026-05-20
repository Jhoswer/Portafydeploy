// src/components/admin/components/Edicion/TablaPostulacion.jsx

import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalPostulacion from "./ModalPostulacion";

export default function TablaPostulacion({ idProfile }) {
  const [selectedPostulation, setSelectedPostulation] = useState(null);
  /* reloadKey fuerza a AdminProfileTable a re-fetchar tras un guardado */
  const [reloadKey, setReloadKey] = useState(0);

  const handleRowClick = (row) => {
    setSelectedPostulation(row);
  };

  const handleClose = () => {
    setSelectedPostulation(null);
  };

  const handleSave = (_updated) => {
    /* Cerrar modal y refrescar tabla */
    setSelectedPostulation(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile}
        resource="postulations"
        title="Postulaciones del usuario"
        emptyText="Este usuario no tiene postulaciones registradas."
        Icon={SendHorizonal}
        primaryKey="id_postulation"
        reloadKey={reloadKey}
        onRowClick={handleRowClick}
      />

      {selectedPostulation && (
        <ModalPostulacion
          idProfile={idProfile}
          postulation={selectedPostulation}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
}