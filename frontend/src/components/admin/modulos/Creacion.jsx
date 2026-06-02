import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminModuleLayout       from "../components/AdminModuleLayout";
import CreacionTabs            from "../components/Creacion/CreacionTabs";
import CreacionProfesionalForm from "../components/Creacion/CreacionProfesionalForm";
import CreacionReclutadorForm  from "../components/Creacion/CreacionReclutadorForm";
import CreacionNuevaInfo       from "../components/Creacion/CreacionNuevaInfo";
import CreacionInfoPanel       from "../components/Creacion/CreacionInfoPanel";
import "../../../styles/components/admin/components/Creacion/Creacion.css";

export default function Creacion() {
  const { t } = useTranslation();
  const m = "adminCreacion.module";

  const [activeTab,    setActiveTab]    = useState("profesional");
  const [selectedUser, setSelectedUser] = useState(null);

  const TAB_SUBTITLES = {
    "profesional": t(`${m}.subtitleProfesional`),
    "reclutador":  t(`${m}.subtitleReclutador`),
    "nueva-info":  t(`${m}.subtitleNuevaInfo`),
  };

  if (selectedUser) {
    const fullName =
      `${selectedUser.name ?? ""} ${selectedUser.last_name ?? ""}`.trim();
    return (
      <AdminModuleLayout
        title={t(`${m}.title`)}
        subtitle={`${t(`${m}.subtitleManaging`)} ${fullName}`}
      >
        <CreacionInfoPanel user={selectedUser} onBack={() => setSelectedUser(null)} />
      </AdminModuleLayout>
    );
  }

  return (
    <AdminModuleLayout title={t(`${m}.title`)} subtitle={TAB_SUBTITLES[activeTab]}>
      <CreacionTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === "profesional" && <CreacionProfesionalForm />}
      {activeTab === "reclutador"  && <CreacionReclutadorForm  />}
      {activeTab === "nueva-info"  && <CreacionNuevaInfo onSelectUser={setSelectedUser} />}
    </AdminModuleLayout>
  );
}