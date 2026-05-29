// src/components/admin/components/Eliminacion/EliminacionProfileTable.jsx

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileX, Loader2, Trash2 } from "lucide-react";
import {
  getEliminacionTable,
  deleteEliminacionRows,
} from "../../../../services/EliminacionProfileTableService";
import EliminarConfirmModal from "./EliminarConfirmModal";

/* ─────────────────────────────────────────────────────────────
   Helpers de formato (igual que AdminProfileTable)
───────────────────────────────────────────────────────────── */
const COLUMN_LABELS = {
  name_cv: "Nombre CV",
  archive_pdf: "PDF",
  cv_url: "URL CV",
  id_profile: "ID Perfil",
  id_skill: "ID Skill",
  skill_name: "Habilidad",
  id_offer: "ID Oferta",
  id_postulant: "ID Postulante",
  id_cv: "ID CV",
  repository_url: "Repositorio",
  url_demo: "Demo",
  url_photo_main: "Foto principal",
  quota_quantity: "Cupos",
  closed_at: "Cierre",
  salary_min: "Salario mín.",
  salary_max: "Salario máx.",
  show_salary: "Ver salario",
  id_audience_type: "ID Audiencia",
  id_commentator: "ID Comentador",
  id_publication: "ID Publicación",
  id_project: "ID Proyecto",
  id_provider: "ID Proveedor",
  id_saved: "ID Guardado",
  removed_at: "Eliminado",
  provider_user_id: "Provider User ID",
  created_at: "Creado",
  updated_at: "Actualizado",
};

function labelFor(column) {
  if (COLUMN_LABELS[column]) return COLUMN_LABELS[column];
  return column
    .replace(/^id_/, "ID ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function formatValue(value, column) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (column.endsWith("_at") || column.endsWith("_date") || column.endsWith("_at"))
    return formatDate(value);
  return String(value);
}

/* ─────────────────────────────────────────────────────────────
   EliminacionProfileTable
───────────────────────────────────────────────────────────── */
export default function EliminacionProfileTable({
  idProfile,
  resource,
  title,
  emptyText,
  Icon,
  primaryKey,
  reloadKey = 0,
  onDeleted,
}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Paginación */
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  /* Selección */
  const [selectedIds, setSelectedIds] = useState(new Set());

  /* Modal de confirmación */
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ── Carga ── */
  useEffect(() => {
    if (!idProfile) { setRows([]); setIsLoading(false); return; }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedIds(new Set()); // limpiar selección al recargar
      setCurrentPage(1);         // volver a la primera página al recargar
      try {
        const data = await getEliminacionTable(idProfile, resource);
        setRows(data.rows);
        setMeta(data.meta);
      } catch (err) {
        console.error(`[Eliminacion/${resource}] Error al cargar:`, err);
        setError(err?.message || "No se pudo cargar la tabla.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, resource, reloadKey]);

  /* ── Columnas visibles (sin PK) ── */
  const pk = primaryKey || meta.primary_key;
  const columns = useMemo(() => {
    const src =
      Array.isArray(meta.columns) && meta.columns.length > 0
        ? meta.columns
        : Object.keys(rows[0] ?? {});
    return src.filter((col) => col !== pk);
  }, [pk, meta.columns, rows]);

  /* ── Paginación ── */
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  /* ── Handlers de selección ── */
  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r[pk])));
    }
  };

  /* ── Eliminar ── */
  const handleOpenConfirm = () => {
    setDeleteError("");
    setShowConfirm(true);
  };

  const handleConfirmedDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteEliminacionRows(idProfile, resource, Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowConfirm(false);
      onDeleted?.();
    } catch (err) {
      console.error(`[Eliminacion/${resource}] Error al eliminar:`, err);
      setDeleteError(err?.message || "No se pudieron eliminar los registros.");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Resumen para el modal ── */
  const buildResumen = () => {
    const selRows = rows.filter((r) => selectedIds.has(r[pk]));
    const items = [];

    selRows.slice(0, 5).forEach((row, i) => {
      const descField = ["title", "name_cv", "comment", "provider", "skill_name", "reason"]
        .find((f) => row[f]);
      items.push({
        label: `Registro ${i + 1}`,
        value: descField ? String(row[descField]).slice(0, 60) : `ID ${row[pk]}`,
      });
    });

    if (selRows.length > 5) {
      items.push({
        label: "…y más",
        value: `${selRows.length - 5} registro(s) adicional(es)`,
      });
    }

    return items;
  };

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected = selectedIds.size > 0;
  const needsPagination = rows.length > PAGE_SIZE;

  /* ── Render ── */
  if (isLoading) {
    return (
      <div className="edicion-tabla-wrap">
        <div className="edicion-tabla__loading">
          <Loader2 size={20} className="edicion-modal__spinner" />
          <span>Cargando {title.toLowerCase()}…</span>
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
    <>
      <div className="edicion-tabla-wrap">

        {/* ── Encabezado de sección ── */}
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

          {/* Barra de acciones cuando hay selección */}
          {someSelected && (
            <div
              style={{
                marginLeft: needsPagination ? 0 : "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                {selectedIds.size} seleccionado{selectedIds.size !== 1 ? "s" : ""}
              </span>
              <button
                className="edicion-modal__btn-cancel"
                style={{ fontSize: 12, padding: "5px 10px" }}
                onClick={() => setSelectedIds(new Set())}
              >
                Limpiar
              </button>
              <button
                onClick={handleOpenConfirm}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 7,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 1px 6px rgba(220,38,38,0.28)",
                }}
              >
                <Trash2 size={12} color="#fff" />
                Eliminar {selectedIds.size}
              </button>
            </div>
          )}

          {/* marginLeft auto cuando NO hay paginación NI selección (empuja todo a la derecha si fuera necesario) */}
          {!needsPagination && !someSelected && <div style={{ marginLeft: "auto" }} />}
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
                  {/* Checkbox "seleccionar todo" */}
                  <th
                    className="edicion-tabla__th"
                    style={{ width: 36, textAlign: "center", paddingLeft: 12 }}
                  >
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      title={allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                      style={{ width: 14, height: 14, cursor: "pointer", accentColor: "#dc2626" }}
                    />
                  </th>
                  {columns.map((col) => (
                    <th key={col} className="edicion-tabla__th">
                      {labelFor(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, index) => {
                  const id = row[pk];
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id ?? `${resource}-${index}`}
                      className={`edicion-tabla__row${isSelected ? " edicion-tabla__row--selected" : ""}`}
                      onClick={() => toggleRow(id)}
                    >
                      {/* Checkbox de fila */}
                      <td
                        className="edicion-tabla__td"
                        style={{ textAlign: "center", paddingLeft: 12 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          style={{ width: 14, height: 14, cursor: "pointer", accentColor: "#dc2626" }}
                        />
                      </td>

                      {columns.map((col) => (
                        <td key={col} className="edicion-tabla__td">
                          {isUrl(row[col]) ? (
                            <a
                              href={row[col]}
                              target="_blank"
                              rel="noreferrer"
                              className="edicion-tabla__link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={12} /> Abrir
                            </a>
                          ) : (
                            formatValue(row[col], col)
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal de confirmación de eliminación ── */}
      <EliminarConfirmModal
        isOpen={showConfirm}
        isBusy={isDeleting}
        entidad={title}
        resumen={buildResumen()}
        error={deleteError}
        onClose={() => !isDeleting && setShowConfirm(false)}
        onConfirm={handleConfirmedDelete}
      />
    </>
  );
}