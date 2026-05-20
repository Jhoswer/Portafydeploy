// src/components/admin/components/Edicion/TablaPreferencias.jsx

import { useState } from "react";
import { Settings2 } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalPreferencias from "./ModalPreferencias";

export default function TablaPreferencias({ idProfile }) {
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRowClick  = (row) => setSelectedPreference(row);
  const handleClose     = ()    => setSelectedPreference(null);
  const handleSave      = ()    => { setSelectedPreference(null); setReloadKey((k) => k + 1); };

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile}
        resource="preferences"
        title="Preferencias del usuario"
        emptyText="Este usuario no tiene preferencias registradas."
        Icon={Settings2}
        primaryKey="id_preference"
        reloadKey={reloadKey}
        onRowClick={handleRowClick}
      />

      {selectedPreference && (
        <ModalPreferencias
          idProfile={idProfile}
          preference={selectedPreference}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
}