import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import AdminModuleLayout from "../components/AdminModuleLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  descargarBackup,
  eliminarBackup,
  generarBackup,
  listarBackups,
  restaurarBackup,
} from "../../../services/adminService";
import "../../../styles/components/admin/components/Backups/Backups.css";

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
  const [restoringFile, setRestoringFile] = useState("");
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
      console.info("[Backups] Lista cargada", {
        total: Array.isArray(response.items) ? response.items.length : 0,
        files: Array.isArray(response.items) ? response.items.map((item) => item?.filename).filter(Boolean) : [],
      });
    } catch (error) {
      console.error("[Backups] Error al cargar lista", error);
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
      return undefined;
    }

    const timer = window.setTimeout(() => {
      loadBackups();
    }, 0);

    return () => window.clearTimeout(timer);
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
      console.info("[Backups] Iniciando generacion de backup manual");
      const response = await generarBackup();
      console.info("[Backups] Respuesta generate", response);
      setSuccessMessage(response?.message || "Backup generado correctamente.");
      await loadBackups({ silent: true });
    } catch (error) {
      console.error("[Backups] Error al generar backup", error);
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

  const handleRestore = useCallback(async (backup) => {
    const filename = getFileName(backup);
    const confirmed = window.confirm(
      `Restaurar ${filename}? Antes de hacerlo se generara automaticamente un backup de seguridad del estado actual.`
    );

    if (!confirmed) return;

    setRestoringFile(filename);
    setActionError("");
    setSuccessMessage("");

    try {
      console.info("[Backups] Iniciando restauracion", { filename });
      const response = await restaurarBackup(filename);
      console.info("[Backups] Respuesta restore", response);
      if (response?.data?.debug) {
        console.info("[Backups] Snapshot backend before/after", response.data.debug);
        if (response.data.debug.after?.counts) {
          console.table(response.data.debug.after.counts);
        }
      }

      const safetyFilename = response?.data?.safety_backup?.filename;
      const restoredName = response?.data?.restored_backup?.filename || filename;

      setSuccessMessage(
        safetyFilename
          ? `${response?.message || "Backup restaurado correctamente."} Respaldo previo: ${safetyFilename}.`
          : `${response?.message || "Backup restaurado correctamente."} Backup aplicado: ${restoredName}.`
      );
      await loadBackups({ silent: true });
      window.setTimeout(() => {
        console.info("[Backups] Recargando interfaz para forzar lectura fresca de la BD");
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error("[Backups] Error al restaurar backup", error);
      setActionError(error?.message || "No se pudo restaurar el backup.");
    } finally {
      setRestoringFile("");
    }
  }, [loadBackups]);

  if (!isAllowed) {
    return (
      <AdminModuleLayout
        title="Backups"
        subtitle="Gestion de respaldos de base de datos."
      >
        <div className="backups-restricted">
          <AlertCircle size={28} color="#b45309" />
          <h2 className="backups-restricted__title">Acceso restringido</h2>
          <p className="backups-restricted__text">
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
      <div className="backups-page">
        <section className="backups-hero">
          <div className="backups-hero__info">
            <div className="backups-hero__badge">
              <Database size={14} />
              <span>Respaldo del sistema</span>
            </div>
            <h2 className="backups-hero__title">Backups del sistema</h2>
            <p className="backups-hero__text">
              Genera y descarga respaldos de los datos.
            </p>
            <div className="backups-hero__notice">
              Antes de restaurar, el sistema crea automaticamente un backup de seguridad del estado actual.
            </div>
          </div>

          <div className="backups-hero__actions">
            <button
              type="button"
              onClick={handleGenerateBackup}
              disabled={isGenerating}
              className="btn btn--primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
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
              className="btn btn--secondary"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </section>

        <section className="metrics-grid">
          <article className="metric-card">
            <span className="metric-card__label">Backups</span>
            <strong className="metric-card__value">{backups.length}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Tamaño total</span>
            <strong className="metric-card__value">{formatBytes(totalSize)}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Eliminar habilitado</span>
            <strong className="metric-card__value">{canDelete ? "Si" : "No"}</strong>
          </article>
        </section>

        {successMessage ? (
          <div className="banner banner--success">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {generateError ? (
          <div className="banner banner--error">
            <div className="banner__content">
              <AlertCircle size={16} />
              <span>{generateError}</span>
            </div>
            <button type="button" onClick={handleGenerateBackup} className="btn__small">
              Reintentar
            </button>
          </div>
        ) : null}

        {actionError ? (
          <div className="banner banner--error">
            <div className="banner__content">
              <AlertCircle size={16} />
              <span>{actionError}</span>
            </div>
            <button type="button" onClick={() => loadBackups()} className="btn__small">
              Reintentar
            </button>
          </div>
        ) : null}

        {listError ? (
          <div className="banner banner--error">
            <div className="banner__content">
              <AlertCircle size={16} />
              <span>{listError}</span>
            </div>
            <button type="button" onClick={() => loadBackups()} className="btn__small">
              Reintentar
            </button>
          </div>
        ) : null}

        <section className="table-card">
          <div className="table-card__header">
            <div>
              <h3 className="table-card__title">Listado de backups</h3>
              
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table__header-cell">Nombre de archivo</th>
                  <th className="table__header-cell">Fecha</th>
                  <th className="table__header-cell">Tamaño</th>
                  <th className="table__header-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="table__empty-cell" colSpan={4}>
                      <div className="table__empty-state">
                        <Loader2 size={18} className="animate-spin" />
                        Cargando backups...
                      </div>
                    </td>
                  </tr>
                ) : backups.length === 0 ? (
                  <tr>
                    <td className="table__empty-cell" colSpan={4}>
                      <div className="table__empty-state">
                        <Database size={18} />
                        Aun no hay backups generados.
                      </div>
                    </td>
                  </tr>
                ) : backups.map((backup) => {
                  const filename = getFileName(backup);
                  const isDownloading = loadingFile === filename;
                  const isRestoring = restoringFile === filename;
                  const isDeleting = deletingFile === filename;

                  return (
                    <tr key={filename}>
                      <td className="table__cell">
                        <div className="table__file-cell">
                          <div className="table__file-icon">
                            <Database size={14} />
                          </div>
                          <div>
                            <div className="table__file-name">{filename}</div>
                            <div className="table__file-meta">Backup del sistema</div>
                          </div>
                        </div>
                      </td>
                      <td className="table__cell">{formatDate(backup?.created_at || backup?.created_at_human)}</td>
                      <td className="table__cell">{backup?.size_label || formatBytes(backup?.size_bytes)}</td>
                      <td className="table__cell">
                        <div className="table__actions">
                          <button
                            type="button"
                            onClick={() => handleDownload(backup)}
                            disabled={isDownloading}
                            className="btn btn--icon"
                            title="Descargar backup"
                          >
                            {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                            Descargar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRestore(backup)}
                            disabled={isRestoring}
                            className="btn btn--restore"
                            title="Restaurar backup"
                          >
                            {isRestoring ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                            {isRestoring ? "Preparando respaldo..." : "Restaurar"}
                          </button>

                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(backup)}
                              disabled={isDeleting}
                              className="btn btn--danger"
                              title="Eliminar backup"
                            >
                              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
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

/* Styles have been moved to Backups.css for better maintainability */
