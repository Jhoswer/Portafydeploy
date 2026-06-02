// src/components/admin/components/Creacion/CreacionNuevaInfo.jsx
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import EdicionSearchBar from "../Edicion/EdicionSearchBar";
import EdicionFilterBar from "../Edicion/EdicionFilterBar";
import EdicionUserGrid  from "../Edicion/EdicionUserGrid";
import { buscarUsuariosEdicion } from "../../../../services/adminService";

export default function CreacionNuevaInfo({ onSelectUser }) {
  const { t } = useTranslation();
  const ni = "adminCreacion.nuevaInfo";

  const [query,      setQuery]      = useState("");
  const [activeRole, setActiveRole] = useState("todos");
  const [users,      setUsers]      = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [searched,   setSearched]   = useState(false);

  const fetchUsers = useCallback(async (searchQuery, role) => {
    const data = await buscarUsuariosEdicion({ query: searchQuery, role });
    setUsers(Array.isArray(data) ? data : []);
  }, []);

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

  const handleClear = () => {
    setQuery(""); setUsers([]); setSearched(false); setActiveRole("todos");
  };

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
        <EdicionSearchBar query={query} onChange={setQuery}
          onSearch={handleSearch} onClear={handleClear} isLoading={isLoading} />

        <EdicionFilterBar activeRole={activeRole} onChange={handleRoleChange} />

        {searched && !isLoading && (
          <div className="edicion-results__meta">
            <p className="edicion-results__count">
              {totalFound === 0 ? (
                t(`${ni}.noResults`)
              ) : (
                <>
                  <strong>{totalFound}</strong>{" "}
                  {totalFound === 1 ? t(`${ni}.found`) : t(`${ni}.foundMany`)}
                  {activeRole !== "todos" && (
                    <> · {t(`${ni}.role`)} <strong>{activeRole}</strong></>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        <EdicionUserGrid users={users} isLoading={isLoading}
          searched={searched} module="creacion" onEdit={onSelectUser} />
      </div>
    </div>
  );
}