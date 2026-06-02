import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import useDefinitionRecords from "./useDefinitionRecords";
import { getStateLabel } from "./definitionLabels";

export default function VerUniversidad() {
  const { t } = useTranslation();
  const v = "admin.definicion.ver";
  const [search, setSearch] = useState("");
  const { records, isLoading, error } = useDefinitionRecords("universities");

  const filtered = records.filter((r) =>
    (r.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.state ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const count = filtered.length;

  return (
    <div className="def-ver">
      <div className="def-ver__toolbar">
        <div className="def-ver__search-wrap">
          <Search size={14} className="def-ver__search-icon" />
          <input
            className="def-ver__search"
            placeholder={t(`${v}.search.universidad`)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="def-ver__count">
          {count} {count !== 1 ? t(`${v}.records`) : t(`${v}.record`)}
        </span>
      </div>
      <div className="def-ver__table-wrap">
        <table className="def-ver__table">
          <thead>
            <tr>
              <th>{t(`${v}.cols.id`)}</th>
              <th>{t(`${v}.cols.name`)}</th>
              <th>{t(`${v}.cols.description`)}</th>
              <th>{t(`${v}.cols.state`)}</th>
              <th>{t(`${v}.cols.created`)}</th>
              <th>{t(`${v}.cols.updated`)}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || error || filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="def-ver__empty">
                  {isLoading
                    ? t(`${v}.loading`)
                    : error || t(`${v}.noResults`, { search })}
                </td>
              </tr>
            ) : filtered.map((r) => (
              <tr key={r.id_university}>
                <td className="def-ver__id">#{r.id_university}</td>
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