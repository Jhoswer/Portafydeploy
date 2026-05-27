// src/components/admin/modulos/Creacion.jsx

import { useState } from "react";
import AdminModuleLayout       from "../components/AdminModuleLayout";
import CreacionTabs            from "../components/Creacion/CreacionTabs";
import CreacionProfesionalForm from "../components/Creacion/CreacionProfesionalForm";
import CreacionReclutadorForm  from "../components/Creacion/CreacionReclutadorForm";
import CreacionNuevaInfo       from "../components/Creacion/CreacionNuevaInfo";
import CreacionInfoPanel       from "../components/Creacion/CreacionInfoPanel";

import "../../../styles/components/admin/components/Creacion/Creacion.css";

const TAB_SUBTITLES = {
  "profesional": "Completa el formulario para registrar un nuevo profesional.",
  "reclutador":  "Completa el formulario para registrar un nuevo reclutador.",
  "nueva-info":  "Selecciona un usuario para gestionar su información adicional.",
};

export default function Creacion() {
  const [activeTab,    setActiveTab]    = useState("profesional");
  const [selectedUser, setSelectedUser] = useState(null);

  /* ════════════════════════════════════════════
     VISTA 2 — Panel completo del usuario
     Todo lo de Vista 1 desaparece (mismo patrón que Edicion.jsx)
  ════════════════════════════════════════════ */
  if (selectedUser) {
    const fullName =
      `${selectedUser.name ?? ""} ${selectedUser.last_name ?? ""}`.trim();

    return (
      <AdminModuleLayout
        title="Creación"
        subtitle={`Gestionando información de ${fullName}`}
      >
        <CreacionInfoPanel
          user={selectedUser}
          onBack={() => setSelectedUser(null)}
        />
      </AdminModuleLayout>
    );
  }

  /* ════════════════════════════════════════════
     VISTA 1 — Pestañas + contenido
  ════════════════════════════════════════════ */
  return (
    <AdminModuleLayout
      title="Creación"
      subtitle={TAB_SUBTITLES[activeTab]}
    >
      <CreacionTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "profesional" && <CreacionProfesionalForm />}
      {activeTab === "reclutador"  && <CreacionReclutadorForm  />}
      {activeTab === "nueva-info"  && (
        <CreacionNuevaInfo onSelectUser={setSelectedUser} />
      )}
    </AdminModuleLayout>
  );
}