import { useState } from "react";
import { ClipboardList } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalOferta from "./ModalOferta";

export default function TablaOfertas({ idProfile }) {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [reloadKey, setReloadKey]         = useState(0);

  const handleRowClick = (row) => {
    setSelectedOffer(row.id_offer);
  };

  const handleClose = () => setSelectedOffer(null);

  const handleSaved = () => {
    setReloadKey((k) => k + 1);
  };

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile}
        resource="offers"
        title="Ofertas del usuario"
        emptyText="Este usuario no tiene ofertas registradas."
        Icon={ClipboardList}
        primaryKey="id_offer"
        reloadKey={reloadKey}
        onRowClick={handleRowClick}
      />

      {selectedOffer !== null && (
        <ModalOferta
          idProfile={idProfile}
          idOffer={selectedOffer}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}