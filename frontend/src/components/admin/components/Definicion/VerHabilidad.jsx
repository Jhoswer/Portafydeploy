import { useState } from "react";
import { Search } from "lucide-react";
import useDefinitionRecords from "./useDefinitionRecords";
import { getSkillTypeLabel, getStateLabel } from "./definitionLabels";

export default function VerHabilidad() {
  const [search, setSearch] = useState("");
  const { records, isLoading, error } = useDefinitionRecords("skills");

  const filtered = records.filter((r) =>
    (r.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.type ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.area_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="def-ver">
      <div className="def-ver__toolbar">
        <div className="def-ver__search-wrap">
          <Search size={14} className="def-ver__search-icon" />
          <input className="def-ver__search" placeholder="Buscar por nombre, tipo, area o descripcion..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="def-ver__count">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="def-ver__table-wrap">
        <table className="def-ver__table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Nivel Cuantitativo</th><th>Nivel Cualitativo</th><th>Descripcion</th><th>Estado</th><th>Area</th><th>Creado</th><th>Actualizado</th></tr></thead>
          <tbody>
            {isLoading || error || filtered.length === 0 ? (
              <tr><td colSpan={10} className="def-ver__empty">{isLoading ? "Cargando registros..." : error || `Sin resultados para "${search}"`}</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id_skill}>
                <td className="def-ver__id">#{r.id_skill}</td>
                <td className="def-ver__name">{r.name}</td>
                <td><span className={`def-badge def-badge--${r.type}`}>{getSkillTypeLabel(r.type)}</span></td>
                <td>{r.quantitative_level ?? <span className="def-ver__null">-</span>}</td>
                <td className="def-ver__center">{r.qualitative_level ?? <span className="def-ver__null">-</span>}</td>
                <td className="def-ver__desc">{r.description ?? <span className="def-ver__null">-</span>}</td>
                <td><span className={`def-badge def-badge--${r.state}`}>{getStateLabel(r.state)}</span></td>
                <td className="def-ver__name">{r.area_name ?? <span className="def-ver__null">Sin area</span>}</td>
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
