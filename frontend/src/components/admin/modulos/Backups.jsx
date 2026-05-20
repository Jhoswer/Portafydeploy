import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import AdminModuleLayout from "../components/AdminModuleLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  descargarBackup,
  eliminarBackup,
  generarBackup,
  listarBackups,
} from "../../../services/adminService";

function getRoleKey(role) {
  return String(role ?? "").toLowerCase();
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  const date = value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatBytes(bytes) {
  const size = Number(bytes ?? 0);
  if (!Number.isFinite(size) || size <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let current = size;
  let unit = 0;

  while (current >= 1024 && unit < units.length - 1) {
    current /= 1024;
    unit += 1;
  }

  return unit === 0 ? `${current} ${units[unit]}` : `${current.toFixed(2)} ${units[unit]}`;
}

function getFileName(backup) {
  return backup?.filename || backup?.name || "backup.sql";
}

export default function Backups() {
  const { user } = useAuth();
  const currentRole = getRoleKey(user?.rol);
  const isSuperAdmin = currentRole === "super administrador";
  const isAllowed = isSuperAdmin;

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingFile, setLoadingFile] = useState("");
  const [deletingFile, setDeletingFile] = useState("");
  const [canDelete, setCanDelete] = useState(isSuperAdmin);

  const totalSize = useMemo(
    () => backups.reduce((sum, item) => sum + Number(item?.size_bytes ?? 0), 0),
    [backups],
  );

  const loadBackups = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    setListError("");

    try {
      const response = await listarBackups();
      setBackups(Array.isArray(response.items) ? response.items : []);
      setCanDelete(Boolean(response.meta?.can_delete) || isSuperAdmin);
    } catch (error) {
      setListError(error?.message || "No se pudo cargar la lista de backups.");

      if (!silent) {
        setBackups([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return undefined;
    }

    loadBackups();
  }, [isAllowed, loadBackups]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!generateError) return undefined;
    const timer = setTimeout(() => setGenerateError(""), 8000);
    return () => clearTimeout(timer);
  }, [generateError]);

  useEffect(() => {
    if (!actionError) return undefined;
    const timer = setTimeout(() => setActionError(""), 8000);
    return () => clearTimeout(timer);
  }, [actionError]);

  const handleGenerateBackup = useCallback(async () => {
    setIsGenerating(true);
    setGenerateError("");
    setActionError("");

    try {
      const response = await generarBackup();
      setSuccessMessage(response?.message || "Backup generado correctamente.");
      await loadBackups({ silent: true });
    } catch (error) {
      setGenerateError(error?.message || "No se pudo generar el backup.");
    } finally {
      setIsGenerating(false);
    }
  }, [loadBackups]);

  const handleDownload = useCallback(async (backup) => {
    const filename = getFileName(backup);
    setLoadingFile(filename);
    setActionError("");

    try {
      const result = await descargarBackup(filename);
      const objectUrl = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = result.filename || filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setActionError(error?.message || "No se pudo descargar el backup.");
    } finally {
      setLoadingFile("");
    }
  }, []);

  const handleDelete = useCallback(async (backup) => {
    const filename = getFileName(backup);
    const confirmed = window.confirm(`Eliminar ${filename}? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    setDeletingFile(filename);
    setActionError("");

    try {
      const response = await eliminarBackup(filename);
      setSuccessMessage(response?.message || "Backup eliminado correctamente.");
      await loadBackups({ silent: true });
    } catch (error) {
      setActionError(error?.message || "No se pudo eliminar el backup.");
    } finally {
      setDeletingFile("");
    }
  }, [loadBackups]);

  if (!isAllowed) {
    return (
      <AdminModuleLayout
        title="Backups"
        subtitle="Gestion de respaldos de base de datos."
      >
        <div style={styles.restricted}>
          <AlertCircle size={28} color="#b45309" />
          <h2 style={styles.restrictedTitle}>Acceso restringido</h2>
          <p style={styles.restrictedText}>
            Este modulo solo esta disponible para el super administrador.
          </p>
        </div>
      </AdminModuleLayout>
    );
  }

  return (
    <AdminModuleLayout
      title="Backups"
      subtitle="Gestion de respaldos de base de datos y descargas."
    >
      <div style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroInfo}>
            <div style={styles.heroBadge}>
              <Database size={14} />
              <span>Respaldo del sistema</span>
            </div>
            <h2 style={styles.heroTitle}>Backups del sistema</h2>
            <p style={styles.heroText}>
              Genera y descarga respaldos de los datos.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button
              type="button"
              onClick={handleGenerateBackup}
              disabled={isGenerating}
              style={{
                ...styles.primaryButton,
                ...(isGenerating ? styles.buttonDisabled : null),
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin .8s linear infinite" }} />
                  Generando backup...
                </>
              ) : (
                <>
                  <Database size={16} />
                  Generar backup
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => loadBackups()}
              disabled={loading}
              style={{
                ...styles.secondaryButton,
                ...(loading ? styles.buttonDisabled : null),
              }}
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <article style={styles.metricCard}>
            <span style={styles.metricLabel}>Backups</span>
            <strong style={styles.metricValue}>{backups.length}</strong>
          </article>
          <article style={styles.metricCard}>
            <span style={styles.metricLabel}>Tamaño total</span>
            <strong style={styles.metricValue}>{formatBytes(totalSize)}</strong>
          </article>
          <article style={styles.metricCard}>
            <span style={styles.metricLabel}>Eliminar habilitado</span>
            <strong style={styles.metricValue}>{canDelete ? "Si" : "No"}</strong>
          </article>
        </section>

        {successMessage ? (
          <div style={styles.successBanner}>
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {generateError ? (
          <div style={styles.errorBanner}>
            <div style={styles.bannerContent}>
              <AlertCircle size={16} />
              <span>{generateError}</span>
            </div>
            <button type="button" onClick={handleGenerateBackup} style={styles.bannerButton}>
              Reintentar
            </button>
          </div>
        ) : null}

        {actionError ? (
          <div style={styles.errorBanner}>
            <div style={styles.bannerContent}>
              <AlertCircle size={16} />
              <span>{actionError}</span>
            </div>
            <button type="button" onClick={() => loadBackups()} style={styles.bannerButton}>
              Reintentar
            </button>
          </div>
        ) : null}

        {listError ? (
          <div style={styles.errorBanner}>
            <div style={styles.bannerContent}>
              <AlertCircle size={16} />
              <span>{listError}</span>
            </div>
            <button type="button" onClick={() => loadBackups()} style={styles.bannerButton}>
              Reintentar
            </button>
          </div>
        ) : null}

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h3 style={styles.tableTitle}>Listado de backups</h3>
              
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre de archivo</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Tamaño</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td style={styles.emptyCell} colSpan={4}>
                      <div style={styles.emptyState}>
                        <Loader2 size={18} style={{ animation: "spin .8s linear infinite" }} />
                        Cargando backups...
                      </div>
                    </td>
                  </tr>
                ) : backups.length === 0 ? (
                  <tr>
                    <td style={styles.emptyCell} colSpan={4}>
                      <div style={styles.emptyState}>
                        <Database size={18} />
                        Aun no hay backups generados.
                      </div>
                    </td>
                  </tr>
                ) : backups.map((backup) => {
                  const filename = getFileName(backup);
                  const isDownloading = loadingFile === filename;
                  const isDeleting = deletingFile === filename;

                  return (
                    <tr key={filename}>
                      <td style={styles.td}>
                        <div style={styles.fileCell}>
                          <div style={styles.fileIcon}>
                            <Database size={14} />
                          </div>
                          <div>
                            <div style={styles.fileName}>{filename}</div>
                            <div style={styles.fileMeta}>Backup del sistema</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{formatDate(backup?.created_at || backup?.created_at_human)}</td>
                      <td style={styles.td}>{backup?.size_label || formatBytes(backup?.size_bytes)}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            type="button"
                            onClick={() => handleDownload(backup)}
                            disabled={isDownloading}
                            style={{
                              ...styles.iconButton,
                              ...(isDownloading ? styles.buttonDisabled : null),
                            }}
                            title="Descargar backup"
                          >
                            {isDownloading ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <Download size={15} />}
                            Descargar
                          </button>

                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(backup)}
                              disabled={isDeleting}
                              style={{
                                ...styles.dangerButton,
                                ...(isDeleting ? styles.buttonDisabled : null),
                              }}
                              title="Eliminar backup"
                            >
                              {isDeleting ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <Trash2 size={15} />}
                              Eliminar
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminModuleLayout>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  hero: {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  borderRadius: 20,

  // fondo rojo más intenso
  background:
    "linear-gradient(135deg, rgba(239,87,89,.28) 0%, rgba(255,220,221,.95) 100%)",

  border: "1px solid rgba(239,87,89,.22)",

  boxShadow: "0 12px 32px rgba(239,87,89,.12)",
},
  heroInfo: {
    minWidth: 260,
    flex: 1,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,.75)",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".02em",
    marginBottom: 12,
  },
  heroTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 28,
    lineHeight: 1.1,
  },
  heroText: {
    margin: "10px 0 0",
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 740,
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
primaryButton: {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 16px",
  border: "none",
  borderRadius: 14,

  // botón rojo
  background: "linear-gradient(135deg, #ef5759, #dc2626)",

  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",

  boxShadow: "0 12px 24px rgba(239,87,89,.28)",

  transition: "all .2s ease",
},
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,.10)",
    background: "rgba(255,255,255,.75)",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },
  dangerButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(220,38,38,.18)",
    background: "rgba(254,242,242,.95)",
    color: "#dc2626",
    fontWeight: 700,
    cursor: "pointer",
  },
  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,.10)",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: .6,
    cursor: "not-allowed",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  metricCard: {
    padding: 16,
    borderRadius: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.08)",
    boxShadow: "0 8px 20px rgba(15,23,42,.04)",
  },
  metricLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    marginBottom: 8,
  },
  metricValue: {
    display: "block",
    color: "#0f172a",
    fontSize: 22,
    lineHeight: 1.1,
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(236,253,245,.95)",
    color: "#047857",
    border: "1px solid rgba(5,150,105,.18)",
    fontWeight: 600,
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(254,242,242,.98)",
    color: "#b91c1c",
    border: "1px solid rgba(239,68,68,.18)",
    fontWeight: 600,
  },
  bannerContent: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  bannerButton: {
    border: "none",
    background: "#fff",
    color: "#b91c1c",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  tableCard: {
    borderRadius: 20,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.08)",
    overflow: "hidden",
    boxShadow: "0 14px 30px rgba(15,23,42,.04)",
  },
  tableHeader: {
    padding: 18,
    borderBottom: "1px solid rgba(15,23,42,.06)",
  },
  tableTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 18,
  },
  tableSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.5,
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    color: "#475569",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    background: "#f8fafc",
  },
  td: {
    padding: "14px 18px",
    borderTop: "1px solid rgba(15,23,42,.06)",
    color: "#0f172a",
    fontSize: 14,
    verticalAlign: "middle",
  },
  emptyCell: {
    padding: 0,
    borderTop: "1px solid rgba(15,23,42,.06)",
  },
  emptyState: {
    minHeight: 180,
    display: "grid",
    placeItems: "center",
    gap: 10,
    color: "#64748b",
    fontSize: 14,
    padding: 24,
    textAlign: "center",
  },
  fileCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(14,165,233,.14), rgba(16,185,129,.14))",
    color: "#0f172a",
    flex: "0 0 auto",
  },
  fileName: {
    fontWeight: 700,
    color: "#0f172a",
    wordBreak: "break-word",
  },
  fileMeta: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  restricted: {
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    gap: 10,
    minHeight: 280,
    padding: 24,
    borderRadius: 20,
    background: "linear-gradient(135deg, rgba(251,191,36,.08), rgba(239,68,68,.08))",
    border: "1px solid rgba(251,191,36,.16)",
  },
  restrictedTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 22,
  },
  restrictedText: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
    maxWidth: 520,
    lineHeight: 1.6,
  },
};
