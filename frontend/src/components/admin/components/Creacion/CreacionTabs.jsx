// src/components/admin/components/Creacion/CreacionTabs.jsx
import { useTranslation } from "react-i18next";
import { UserPlus, UserCheck, FolderPlus } from "lucide-react";

export default function CreacionTabs({ active, onChange }) {
  const { t } = useTranslation();
  const tb = "adminCreacion.tabs";

  const TABS = [
    { id: "profesional", label: t(`${tb}.profesional`), icon: UserPlus   },
    { id: "reclutador",  label: t(`${tb}.reclutador`),  icon: UserCheck  },
    { id: "nueva-info",  label: t(`${tb}.nuevaInfo`),   icon: FolderPlus },
  ];

  return (
    <nav className="cre-tabs" role="tablist">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button key={id} role="tab" aria-selected={active === id}
          className={`cre-tabs__btn${active === id ? " cre-tabs__btn--active" : ""}`}
          onClick={() => onChange(id)}>
          <Icon size={14} />
          {label}
        </button>
      ))}
    </nav>
  );
}