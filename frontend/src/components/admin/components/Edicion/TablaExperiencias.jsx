import { useState } from "react";
import { Briefcase } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalExperiencias from "./ModalExperiencias";

export default function TablaExperiencias({ idProfile }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [reloadKey,   setReloadKey]   = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile}
        resource="experiences"
        title="Experiencias del usuario"
        emptyText="Este usuario no tiene experiencias registradas."
        Icon={Briefcase}
        primaryKey="id_experience"
        reloadKey={reloadKey}
        onRowClick={(row) => setSelectedRow(row)}
      />

      {selectedRow && (
        <ModalExperiencias
          idProfile={idProfile}
          idExperience={selectedRow.id_experience}
          initialData={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSaved={() => { setSelectedRow(null); setReloadKey((v) => v + 1); }}
        />
      )}
    </>
  );
}