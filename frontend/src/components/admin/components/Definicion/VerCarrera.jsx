import { useState } from "react";
import { Search } from "lucide-react";
import useDefinitionRecords from "./useDefinitionRecords";
import { getStateLabel } from "./definitionLabels";

export default function VerCarrera() {
  const [search, setSearch] = useState("");
  const { records, isLoading, error } = useDefinitionRecords("careers");

  const filtered = records.filter((r) =>
    (r.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.state ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="def-ver">
      <div className="def-ver__toolbar">
        <div className="def-ver__search-wrap">
          <Search size={14} className="def-ver__search-icon" />
          <input className="def-ver__search" placeholder="Buscar por nombre, descripcion o estado..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="def-ver__count">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="def-ver__table-wrap">
        <table className="def-ver__table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Descripcion</th><th>Estado</th><th>Creado</th><th>Actualizado</th></tr></thead>
          <tbody>
            {isLoading || error || filtered.length === 0 ? (
              <tr><td colSpan={6} className="def-ver__empty">{isLoading ? "Cargando registros..." : error || `Sin resultados para "${search}"`}</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id_career}>
                <td className="def-ver__id">#{r.id_career}</td>
                <td className="def-ver__name">{r.name}</td>
                <td className="def-ver__desc">{r.description ?? <span className="def-ver__null">-</span>}</td>
                <td><span className={`def-badge def-badge--${r.state}`}>{getStateLabel(r.state)}</span></td>
                <td className="def-ver__date">{r.created_at}</td>
                <td className="def-ver__date">{r.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
