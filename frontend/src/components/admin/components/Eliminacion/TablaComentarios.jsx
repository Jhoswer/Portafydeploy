// TablaComentarios.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import EliminacionProfileTable from "./EliminacionProfileTable";

export default function TablaComentarios({ idProfile }) {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <EliminacionProfileTable idProfile={idProfile} resource="comments"
      title={t("adminEliminacion.tablas.comentarios.title")}
      emptyText={t("adminEliminacion.tablas.comentarios.empty")}
      Icon={MessageCircle} primaryKey="id_comment"
      reloadKey={reloadKey} onDeleted={() => setReloadKey((v) => v + 1)} />
  );
}