// src/components/admin/components/Edicion/EdicionSearchBar.jsx

import { Search, X } from "lucide-react";

/**
 * Barra de búsqueda del módulo Edición.
 * Permite buscar usuarios por nombre o apellido.
 *
 * Props:
 *  - query        : string   → valor actual del input
 *  - onChange     : fn(val)  → actualiza query en el padre
 *  - onSearch     : fn()     → dispara la búsqueda
 *  - onClear      : fn()     → limpia query y resultados
 *  - isLoading    : bool     → deshabilita el botón mientras carga
 */
export default function EdicionSearchBar({
  query = "",
  onChange,
  onSearch,
  onClear,
  isLoading = false,
}) {
  /* Enter también dispara la búsqueda */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch?.();
  };

  return (
    <div className="edicion-searchbar">
      {/* ── Input ── */}
      <div className="edicion-searchbar__input-wrap">
        <Search size={16} className="edicion-searchbar__icon" />
        <input
          type="text"
          className="edicion-searchbar__input"
          placeholder="Buscar usuario por nombre o apellido…"
          value={query}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* ── Botón buscar ── */}
      <button
        className="edicion-searchbar__btn"
        onClick={onSearch}
        disabled={isLoading || !query.trim()}
      >
        <Search size={14} />
        {isLoading ? "Buscando…" : "Buscar"}
      </button>

      {/* ── Limpiar (solo si hay query) ── */}
      {query.trim() && (
        <button className="edicion-searchbar__clear" onClick={onClear}>
          <X size={13} />
          Limpiar
        </button>
      )}
    </div>
  );
}