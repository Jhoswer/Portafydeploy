// TablaOfertas.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import AdminProfileTable from "./AdminProfileTable";
import ModalOferta from "./ModalOferta";

export default function TablaOfertas({ idProfile }) {
  const { t } = useTranslation();
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [reloadKey,     setReloadKey]     = useState(0);

  return (
    <>
      <AdminProfileTable
        idProfile={idProfile} resource="offers"
        title={t("adminEdicion.tablas.ofertas.title")}
        emptyText={t("adminEdicion.tablas.ofertas.emptyText")}
        Icon={ClipboardList} primaryKey="id_offer" reloadKey={reloadKey}
        onRowClick={(row) => setSelectedOffer(row.id_offer)}
      />
      {selectedOffer !== null && (
        <ModalOferta idProfile={idProfile} idOffer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSaved={() => setReloadKey((k) => k + 1)} />
      )}
    </>
  );
}