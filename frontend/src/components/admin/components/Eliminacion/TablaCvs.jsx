// TablaCvs.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaCvs({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="cvs"
      title={t("adminEliminacion.tablas.cvs.title")}
      emptyText={t("adminEliminacion.tablas.cvs.empty")}
      Icon={FileText} primaryKey="id_cv"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}