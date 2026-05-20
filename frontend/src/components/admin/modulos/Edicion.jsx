// src/components/admin/modulos/Edicion.jsx

import { useState, useCallback } from "react";
import AdminModuleLayout from "../components/AdminModuleLayout";
import EdicionSearchBar  from "../components/Edicion/EdicionSearchBar";
import EdicionFilterBar  from "../components/Edicion/EdicionFilterBar";
import EdicionUserGrid   from "../components/Edicion/EdicionUserGrid";
import EdicionPanel      from "../components/Edicion/EdicionPanel";
import { buscarUsuariosEdicion } from "../../../services/adminService";

/* ─────────────────────────────────────────────────────────────
   Edicion — módulo admin
   Vista 1 → búsqueda + grid de usuarios
   Vista 2 → EdicionPanel (burbujas de secciones) del usuario elegido
───────────────────────────────────────────────────────────── */
export default function Edicion() {
  /* ── Estado de búsqueda ── */
  const [query,        setQuery]        = useState("");
  const [activeRole,   setActiveRole]   = useState("todos");
  const [users,        setUsers]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [searched,     setSearched]     = useState(false);

  /* ── Usuario seleccionado para editar (null = vista búsqueda) ── */
  const [selectedUser, setSelectedUser] = useState(null);

  /* ── Fetch ── */
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
      console.error("[Edicion] Error al buscar usuarios:", err);
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
  };

  /* ── Cambio de rol ── */
  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (searched && query.trim()) {
      setIsLoading(true);
      fetchUsers(query.trim(), role)
        .catch(() => setUsers([]))
        .finally(() => setIsLoading(false));
    }
  };

  /* ── Abrir panel de edición ── */
  const handleEdit = (user) => {
    setSelectedUser(user);
  };

  /* ── Volver al listado ── */
  const handleBack = () => {
    setSelectedUser(null);
  };

  const totalFound = users.length;

  /* ════════════════════════════════════════════
     VISTA 2 — Panel de edición del usuario
  ════════════════════════════════════════════ */
  if (selectedUser) {
    return (
      <AdminModuleLayout
        title="Edición"
        subtitle={`Editando perfil de ${(selectedUser.name ?? "")} ${(selectedUser.last_name ?? "")}`.trim()}
      >
        <EdicionPanel user={selectedUser} onBack={handleBack} />
      </AdminModuleLayout>
    );
  }

  /* ════════════════════════════════════════════
     VISTA 1 — Búsqueda de usuarios
  ════════════════════════════════════════════ */
  return (
    <AdminModuleLayout
      title="Edición"
      subtitle="Busca y edita la información de profesionales y reclutadores registrados."
    >
      <div className="edicion-module">

        <EdicionSearchBar
          query={query}
          onChange={setQuery}
          onSearch={handleSearch}
          onClear={handleClear}
          isLoading={isLoading}
        />

        <EdicionFilterBar activeRole={activeRole} onChange={handleRoleChange} />

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

        <EdicionUserGrid
          users={users}
          isLoading={isLoading}
          searched={searched}
          onEdit={handleEdit}
          module="edicion"
        />

      </div>
    </AdminModuleLayout>
  );
}