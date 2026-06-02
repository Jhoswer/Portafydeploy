// TablaPublicaciones.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Newspaper } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaPublicaciones({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="publications"
      title={t("adminEliminacion.tablas.publicaciones.title")}
      emptyText={t("adminEliminacion.tablas.publicaciones.empty")}
      Icon={Newspaper} primaryKey="id_publication"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}