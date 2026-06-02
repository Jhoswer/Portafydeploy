// TablaOfertas.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaOfertas({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="offers"
      title={t("adminEliminacion.tablas.ofertas.title")}
      emptyText={t("adminEliminacion.tablas.ofertas.empty")}
      Icon={FileText} primaryKey="id_offer"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}