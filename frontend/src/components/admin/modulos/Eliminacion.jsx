import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminModuleLayout from "../components/AdminModuleLayout";
import EdicionSearchBar  from "../components/Edicion/EdicionSearchBar";
import EdicionFilterBar  from "../components/Edicion/EdicionFilterBar";
import EdicionUserGrid   from "../components/Edicion/EdicionUserGrid";
import EliminacionPanel  from "../components/Eliminacion/EliminacionPanel";
import { buscarUsuariosEdicion } from "../../../services/adminService";

export default function Eliminacion() {
  const { t } = useTranslation();
  const m = "adminEliminacion.module";

  const [query,        setQuery]        = useState("");
  const [activeRole,   setActiveRole]   = useState("todos");
  const [users,        setUsers]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [searched,     setSearched]     = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
      console.error("[Eliminacion] Error al buscar usuarios:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, activeRole, fetchUsers]);

  const handleClear = () => {
    setQuery(""); setUsers([]); setSearched(false);
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

  /* Vista 2 — Panel de eliminación */
  if (selectedUser) {
    const fullName = `${selectedUser.name ?? ""} ${selectedUser.last_name ?? ""}`.trim();
    return (
      <AdminModuleLayout
        title={t(`${m}.title`)}
        subtitle={`${t(`${m}.subtitleManaging`)} ${fullName}`}
      >
        <EliminacionPanel user={selectedUser} onBack={() => setSelectedUser(null)} />
      </AdminModuleLayout>
    );
  }

  /* Vista 1 — Búsqueda */
  return (
    <AdminModuleLayout
      title={t(`${m}.title`)}
      subtitle={t(`${m}.subtitle`)}
    >
      <div className="creacion-nueva-info-panel">
        <div className="edicion-module">

          <EdicionSearchBar
            query={query} onChange={setQuery}
            onSearch={handleSearch} onClear={handleClear}
            isLoading={isLoading} />

          <EdicionFilterBar activeRole={activeRole} onChange={handleRoleChange} />

          {searched && !isLoading && (
            <div className="edicion-results__meta">
              <p className="edicion-results__count">
                {totalFound === 0 ? (
                  t(`${m}.noResults`)
                ) : (
                  <>
                    <strong>{totalFound}</strong>{" "}
                    {totalFound === 1 ? t(`${m}.found`) : t(`${m}.foundMany`)}
                    {activeRole !== "todos" && (
                      <> · {t(`${m}.role`)} <strong>{activeRole}</strong></>
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          <EdicionUserGrid
            users={users} isLoading={isLoading} searched={searched}
            onEdit={(user) => setSelectedUser(user)}
            module="eliminacion" />
        </div>
      </div>
    </AdminModuleLayout>
  );
}