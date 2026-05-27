// src/components/admin/components/Creacion/CreacionTabs.jsx

import { UserPlus, UserCheck, FolderPlus } from "lucide-react";

const TABS = [
  { id: "profesional",   label: "Añadir Profesional",     icon: UserPlus   },
  { id: "reclutador",    label: "Añadir Reclutador",      icon: UserCheck  },
  { id: "nueva-info",    label: "Crear Nueva Información", icon: FolderPlus },
];

export default function CreacionTabs({ active, onChange }) {
  return (
    <nav className="cre-tabs" role="tablist">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={active === id}
          className={`cre-tabs__btn${active === id ? " cre-tabs__btn--active" : ""}`}
          onClick={() => onChange(id)}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </nav>
  );
}