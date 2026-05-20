// src/components/admin/components/Edicion/EdicionFilterBar.jsx

import { Briefcase, Users } from "lucide-react";

/**
 * Barra de filtros de rol del módulo Edición.
 * Solo muestra usuarios con ROLE.name = "profesional" | "reclutador".
 *
 * Props:
 *  - activeRole   : "todos" | "profesional" | "reclutador"
 *  - onChange     : fn(role) → actualiza el rol activo en el padre
 */

const ROLES = [
  { key: "todos",        label: "Todos",        Icon: Users },
  { key: "profesional",  label: "Profesional",  Icon: Users },
  { key: "reclutador",   label: "Reclutador",   Icon: Briefcase },
];

export default function EdicionFilterBar({ activeRole = "todos", onChange }) {
  return (
    <div className="edicion-filterbar">
      <span className="edicion-filterbar__label">Rol:</span>

      <div className="edicion-filterbar__chips">
        {ROLES.map(({ key, label, Icon }) => {
          const isActive = activeRole === key;
          return (
            <button
              key={key}
              className={[
                "edicion-chip",
                `edicion-chip--${key}`,
                isActive ? "edicion-chip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange?.(key)}
            >
              <Icon size={12} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}