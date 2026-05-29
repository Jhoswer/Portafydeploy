// src/components/admin/components/Creacion/CreacionNuevaInfo.jsx

import { useState, useCallback } from "react";
import EdicionSearchBar from "../Edicion/EdicionSearchBar";
import EdicionFilterBar from "../Edicion/EdicionFilterBar";
import EdicionUserGrid  from "../Edicion/EdicionUserGrid";
import { buscarUsuariosEdicion } from "../../../../services/adminService";

/**
 * Vista "Crear Nueva Información" dentro del módulo Creación.
 *
 * Props:
 *   onSelectUser — fn(user) → sube a Creacion.jsx para activar Vista 2.
 *                  Cuando se llama, tabs + searchbar + grid desaparecen
 *                  y aparece CreacionInfoPanel a pantalla completa.
 */
export default function CreacionNuevaInfo({ onSelectUser }) {
  const [query,      setQuery]      = useState("");
  const [activeRole, setActiveRole] = useState("todos");
  const [users,      setUsers]      = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [searched,   setSearched]   = useState(false);

  /* ── Fetch compartido (idéntico a Edicion.jsx) ── */
  const fetchUsers = useCallback(async (searchQuery, role) => {
    const data = await buscarUsuariosEdicion({ query: searchQuery, role });
    setUsers(Array.isArray(data) ? data : []);
  }, []);

  /* ── Buscar ── */
  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setSearched(true);
    try {
      await fetchUsers(trimmed, activeRole);
    } catch (err) {
      console.error("[CreacionNuevaInfo] Error al buscar:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, activeRole, fetchUsers]);

  /* ── Limpiar ── */
  const handleClear = () => {
    setQuery("");
    setUsers([]);
    setSearched(false);
    setActiveRole("todos");
  };

  /* ── Cambio de rol → re-fetch si ya se buscó ── */
  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (searched && query.trim()) {
      setIsLoading(true);
      fetchUsers(query.trim(), role)
        .catch(() => setUsers([]))
        .finally(() => setIsLoading(false));
    }
  };

  const totalFound = users.length;

  return (
    <div className="creacion-nueva-info-panel">
      <div className="edicion-module">

      <EdicionSearchBar
        query={query}
        onChange={setQuery}
        onSearch={handleSearch}
        onClear={handleClear}
        isLoading={isLoading}
      />

      <EdicionFilterBar
        activeRole={activeRole}
        onChange={handleRoleChange}
      />

      {searched && !isLoading && (
        <div className="edicion-results__meta">
          <p className="edicion-results__count">
            {totalFound === 0 ? (
              "Sin resultados"
            ) : (
              <>
                <strong>{totalFound}</strong>{" "}
                {totalFound === 1 ? "usuario encontrado" : "usuarios encontrados"}
                {activeRole !== "todos" && (
                  <> · rol <strong>{activeRole}</strong></>
                )}
              </>
            )}
          </p>
        </div>
      )}

      {/* onEdit → onSelectUser: Creacion.jsx activa Vista 2 */}
      <EdicionUserGrid
        users={users}
        isLoading={isLoading}
        searched={searched}
        module="creacion"
        onEdit={onSelectUser}
      />
    </div>
    </div>
  );
}