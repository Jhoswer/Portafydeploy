import { useState } from "react";
import { FileText } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalCV from "./ModalCV";

export default function TablaCV({ idProfile }) {
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile}
        resource="cvs"
        title="CVs del usuario"
        emptyText="Este usuario no tiene CVs registrados."
        Icon={FileText}
        primaryKey="id_cv"
        reloadKey={reloadKey}
        onRowClick={(cv) => setSelectedCvId(cv.id_cv)}
      />

      {selectedCvId && (
        <ModalCV
          idProfile={idProfile}
          idCv={selectedCvId}
          onClose={() => setSelectedCvId(null)}
          onSaved={() => setReloadKey((value) => value + 1)}
        />
      )}
    </>
  );
}
