// src/components/admin/components/Edicion/EdicionFilterBar.jsx

import { useTranslation } from "react-i18next";
import { Briefcase, Users } from "lucide-react";

export default function EdicionFilterBar({ activeRole = "todos", onChange }) {
  const { t } = useTranslation();
  const e = "adminEdicion.filterBar";

  const ROLES = [
    { key: "todos",       label: t(`${e}.roles.todos`),       Icon: Users     },
    { key: "profesional", label: t(`${e}.roles.profesional`), Icon: Users     },
    { key: "reclutador",  label: t(`${e}.roles.reclutador`),  Icon: Briefcase },
  ];

  return (
    <div className="edicion-filterbar">
      <span className="edicion-filterbar__label">{t(`${e}.roleLabel`)}</span>
      <div className="edicion-filterbar__chips">
        {ROLES.map(({ key, label, Icon }) => (
          <button key={key}
            className={["edicion-chip", `edicion-chip--${key}`, activeRole === key ? "edicion-chip--active" : ""]
              .filter(Boolean).join(" ")}
            onClick={() => onChange?.(key)}>
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}