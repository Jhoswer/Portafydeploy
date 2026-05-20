// src/components/admin/components/Edicion/AdminProfileTable.jsx

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileX, Loader2 } from "lucide-react";
import { getAdminProfileTable } from "../../../../services/adminProfileTableService";

const COLUMN_LABELS = {
  name_cv:          "Nombre CV",
  archive_pdf:      "PDF",
  cv_url:           "URL CV",
  id_profile:       "ID Perfil",
  id_skill:         "ID Skill",
  skill_name:       "Habilidad",
  id_offer:         "ID Oferta",
  id_postulant:     "ID Postulante",
  id_cv:            "ID CV",
  repository_url:   "Repositorio",
  url_demo:         "Demo",
  url_photo_main:   "Foto principal",
  quota_quantity:   "Cupos",
  closed_at:        "Cierre",
  salary_min:       "Salario min.",
  salary_max:       "Salario max.",
  show_salary:      "Mostrar salario",
  id_audience_type: "ID Audiencia",
  created_at:       "Creado",
  updated_at:       "Actualizado",
};

function labelFor(column) {
  if (COLUMN_LABELS[column]) return COLUMN_LABELS[column];
  return column
    .replace(/^id_/, "ID ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function formatValue(value, column) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Si" : "No";
  if (column.endsWith("_at") || column.endsWith("_date")) return formatDate(value);
  return String(value);
}

export default function AdminProfileTable({
  idProfile,
  resource,
  title,
  emptyText,
  Icon,
  primaryKey,
  reloadKey = 0,
  onRowClick,
}) {
  const [rows,      setRows]      = useState([]);
  const [meta,      setMeta]      = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  /* Paginación */
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Carga ── */
  useEffect(() => {
    if (!idProfile) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1); // reiniciar página al recargar
      try {
        const data = await getAdminProfileTable(idProfile, resource);
        setRows(data.rows);
        setMeta(data.meta);
      } catch (err) {
        console.error(`[${resource}] Error al cargar tabla:`, err);
        setError(err?.message || "No se pudo cargar la tabla.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [idProfile, resource, reloadKey]);

  /* ── Columnas visibles (sin PK) ── */
  const hiddenPrimaryKey = primaryKey || meta.primary_key;
  const columns = useMemo(() => {
    const sourceColumns =
      Array.isArray(meta.columns) && meta.columns.length > 0
        ? meta.columns
        : Object.keys(rows[0] ?? {});
    return sourceColumns.filter((column) => column !== hiddenPrimaryKey);
  }, [hiddenPrimaryKey, meta.columns, rows]);

  /* ── Paginación ── */
  const totalPages    = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const needsPagination = rows.length > PAGE_SIZE;

  /* ── Render ── */
  if (isLoading) {
    return (
      <div className="edicion-tabla-wrap">
        <div className="edicion-tabla__loading">
          <Loader2 size={20} className="edicion-modal__spinner" />
          <span>Cargando {title.toLowerCase()}...</span>
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
        <span className="edicion-tabla__count">{rows.length} registros</span>

        {/* ── Paginación (solo si hay más de PAGE_SIZE filas) ── */}
        {needsPagination && (
          <div className="edicion-tabla__pagination">
            <button
              className="edicion-tabla__pagination-btn"
              onClick={goToPrev}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="edicion-tabla__pagination-info">
              {currentPage} / {totalPages}
            </span>
            <button
              className="edicion-tabla__pagination-btn"
              onClick={goToNext}
              disabled={currentPage === totalPages}
              title="Página siguiente"
            >
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
                {columns.map((column) => (
                  <th key={column} className="edicion-tabla__th">
                    {labelFor(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, index) => (
                <tr
                  key={row[hiddenPrimaryKey] ?? `${resource}-${index}`}
                  className="edicion-tabla__row"
                  onClick={() => onRowClick?.(row)}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((column) => (
                    <td key={column} className="edicion-tabla__td">
                      {isUrl(row[column]) ? (
                        <a
                          href={row[column]}
                          target="_blank"
                          rel="noreferrer"
                          className="edicion-tabla__link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={12} /> Abrir
                        </a>
                      ) : (
                        formatValue(row[column], column)
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