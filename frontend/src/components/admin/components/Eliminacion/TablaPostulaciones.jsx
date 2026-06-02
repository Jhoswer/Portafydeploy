// TablaPostulaciones.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SendHorizonal } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaPostulaciones({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="postulations"
      title={t("adminEliminacion.tablas.postulaciones.title")}
      emptyText={t("adminEliminacion.tablas.postulaciones.empty")}
      Icon={SendHorizonal} primaryKey="id_postulation"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}