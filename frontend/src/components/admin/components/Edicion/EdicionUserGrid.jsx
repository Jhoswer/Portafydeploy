// src/components/admin/components/Edicion/EdicionUserGrid.jsx

import { UserX } from "lucide-react";
import EdicionUserCard from "./EdicionUserCard";

/**
 * Grid de resultados del módulo Edición.
 *
 * Props:
 *  - users     : array de usuarios (ya filtrados/buscados)
 *  - isLoading : bool → muestra skeletons
 *  - searched  : bool → indica si ya se realizó alguna búsqueda
 *  - onEdit    : fn(user) → sube al padre para abrir formulario
 *  - module    : "edicion" | "eliminacion" → determina el comportamiento
 */
export default function EdicionUserGrid({
  users = [],
  isLoading = false,
  searched = false,
  onEdit,
  module = "edicion",
}) {
  /* ── Skeletons mientras carga ── */
  if (isLoading) {
    return (
      <div className="edicion-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  /* ── Estado inicial: no se ha buscado aún ── */
  if (!searched) {
    return (
      <div className="edicion-empty">
        <div className="edicion-empty__icon">
          <UserX size={28} />
        </div>
        <p className="edicion-empty__title">Busca un usuario para editar</p>
        <p className="edicion-empty__desc">
          Ingresa el nombre o apellido en la barra de búsqueda y selecciona el
          rol que deseas filtrar.
        </p>
      </div>
    );
  }

  /* ── Sin resultados ── */
  if (users.length === 0) {
    return (
      <div className="edicion-empty">
        <div className="edicion-empty__icon">
          <UserX size={28} />
        </div>
        <p className="edicion-empty__title">Sin resultados</p>
        <p className="edicion-empty__desc">
          No se encontraron usuarios con ese nombre. Prueba con otro término o
          cambia el filtro de rol.
        </p>
      </div>
    );
  }

  /* ── Grid con resultados ── */
  return (
    <div className="edicion-grid">
      {users.map((user) => (
        <EdicionUserCard
          key={user.id_profile}
          user={user}
          onEdit={onEdit}
          module={module}
        />
      ))}
    </div>
  );
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="edicion-card edicion-card--loading">
      <div className="edicion-card__body" style={{ gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            className="edicion-skeleton"
            style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0 }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="edicion-skeleton" style={{ height: 14, width: "70%" }} />
            <div className="edicion-skeleton" style={{ height: 12, width: "50%" }} />
          </div>
        </div>
        <div className="edicion-skeleton" style={{ height: 22, width: 90, borderRadius: 9999 }} />
        <div className="edicion-skeleton" style={{ height: 12, width: "80%" }} />
        <div className="edicion-skeleton" style={{ height: 12, width: "60%" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[60, 70, 55].map((w, i) => (
            <div
              key={i}
              className="edicion-skeleton"
              style={{ height: 22, width: w, borderRadius: 9999 }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <div className="edicion-skeleton" style={{ height: 34, flex: 1, borderRadius: 8 }} />
          <div className="edicion-skeleton" style={{ height: 34, width: 60, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}