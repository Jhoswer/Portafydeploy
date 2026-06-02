// src/components/admin/components/Edicion/AdminProfileTable.jsx

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ExternalLink, FileX, Loader2 } from "lucide-react";
import { getAdminProfileTable } from "../../../../services/adminProfileTableService";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

export default function AdminProfileTable({
  idProfile, resource, title, emptyText,
  Icon, primaryKey, reloadKey = 0, onRowClick,
}) {
  const { t } = useTranslation();
  const e = "adminEdicion.table";

  function labelFor(column) {
    const key = `${e}.columns.${column}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return column
      .replace(/^id_/, "ID ")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function formatValue(value, column) {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? t(`${e}.boolTrue`) : t(`${e}.boolFalse`);
    if (column.endsWith("_at") || column.endsWith("_date")) return formatDate(value);
    return String(value);
  }

  const [rows,      setRows]      = useState([]);
  const [meta,      setMeta]      = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!idProfile) { setRows([]); setIsLoading(false); return; }
    const load = async () => {
      setIsLoading(true); setError(null); setCurrentPage(1);
      try {
        const data = await getAdminProfileTable(idProfile, resource);
        setRows(data.rows); setMeta(data.meta);
      } catch (err) {
        setError(err?.message || t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, resource, reloadKey]);

  const hiddenPrimaryKey = primaryKey || meta.primary_key;
  const columns = useMemo(() => {
    const sourceColumns =
      Array.isArray(meta.columns) && meta.columns.length > 0
        ? meta.columns
        : Object.keys(rows[0] ?? {});
    return sourceColumns.filter((col) => col !== hiddenPrimaryKey);
  }, [hiddenPrimaryKey, meta.columns, rows]);

  const totalPages    = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const needsPagination = rows.length > PAGE_SIZE;

  if (isLoading) {
    return (
      <div className="edicion-tabla-wrap">
        <div className="edicion-tabla__loading">
          <Loader2 size={20} className="edicion-modal__spinner" />
          <span>{t(`${e}.loadingPrefix`)} {title.toLowerCase()}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edicion-tabla-wrap">
        <div className="edicion-tabla__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="edicion-tabla-wrap">
      <div className="edicion-tabla__section-header">
        <Icon size={15} />
        <h3 className="edicion-tabla__section-title">{title}</h3>
        <span className="edicion-tabla__count">{rows.length} {t(`${e}.records`)}</span>

        {needsPagination && (
          <div className="edicion-tabla__pagination">
            <button className="edicion-tabla__pagination-btn" onClick={goToPrev}
              disabled={currentPage === 1} title={t(`${e}.prevPage`)}>
              <ChevronLeft size={14} />
            </button>
            <span className="edicion-tabla__pagination-info">
              {currentPage} / {totalPages}
            </span>
            <button className="edicion-tabla__pagination-btn" onClick={goToNext}
              disabled={currentPage === totalPages} title={t(`${e}.nextPage`)}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="edicion-tabla__empty">
          <FileX size={28} />
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="edicion-tabla__scroll">
          <table className="edicion-tabla">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} className="edicion-tabla__th">{labelFor(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, index) => (
                <tr key={row[hiddenPrimaryKey] ?? `${resource}-${index}`}
                  className="edicion-tabla__row"
                  onClick={() => onRowClick?.(row)}
                  style={onRowClick ? { cursor: "pointer" } : undefined}>
                  {columns.map((col) => (
                    <td key={col} className="edicion-tabla__td">
                      {isUrl(row[col]) ? (
                        <a href={row[col]} target="_blank" rel="noreferrer"
                          className="edicion-tabla__link"
                          onClick={(ev) => ev.stopPropagation()}>
                          <ExternalLink size={12} /> {t(`${e}.openLink`)}
                        </a>
                      ) : (
                        formatValue(row[col], col)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}