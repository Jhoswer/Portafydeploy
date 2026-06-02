import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

function formatDate(value, t) {
  if (!value) return t("backups.sinFecha");

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
  const { t } = useTranslation();
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
    if (!silent) setLoading(true);
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
      setListError(error?.message || t("backups.errorListar"));
      if (!silent) setBackups([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isSuperAdmin, t]);

  useEffect(() => {
    if (!isAllowed) return undefined;
    const timer = window.setTimeout(() => { loadBackups(); }, 0);
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
      setSuccessMessage(response?.message || t("backups.successGenerar"));
      await loadBackups({ silent: true });
    } catch (error) {
      console.error("[Backups] Error al generar backup", error);
      setGenerateError(error?.message || t("backups.errorGenerar"));
    } finally {
      setIsGenerating(false);
    }
  }, [loadBackups, t]);

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
      setActionError(error?.message || t("backups.errorDescargar"));
    } finally {
      setLoadingFile("");
    }
  }, [t]);

  const handleDelete = useCallback(async (backup) => {
    const filename = getFileName(backup);
    const confirmed = window.confirm(t("backups.confirmarEliminar", { filename }));
    if (!confirmed) return;

    setDeletingFile(filename);
    setActionError("");

    try {
      const response = await eliminarBackup(filename);
      setSuccessMessage(response?.message || t("backups.successEliminar"));
      await loadBackups({ silent: true });
    } catch (error) {
      setActionError(error?.message || t("backups.errorEliminar"));
    } finally {
      setDeletingFile("");
    }
  }, [loadBackups, t]);

  const handleRestore = useCallback(async (backup) => {
    const filename = getFileName(backup);
    const confirmed = window.confirm(t("backups.confirmarRestaurar", { filename }));
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
      const baseMsg = response?.message || t("backups.successRestaurar");

      setSuccessMessage(
        safetyFilename
          ? t("backups.successRestaurarConRespaldo", { mensaje: baseMsg, safety: safetyFilename })
          : t("backups.successRestaurarConAplicado", { mensaje: baseMsg, restored: restoredName })
      );

      await loadBackups({ silent: true });
      window.setTimeout(() => {
        console.info("[Backups] Recargando interfaz para forzar lectura fresca de la BD");
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error("[Backups] Error al restaurar backup", error);
      setActionError(error?.message || t("backups.errorRestaurar"));
    } finally {
      setRestoringFile("");
    }
  }, [loadBackups, t]);

  if (!isAllowed) {
    return (
      <AdminModuleLayout
        title={t("backups.titulo")}
        subtitle={t("backups.subtituloRestringido")}
      >
        <div className="backups-restricted">
          <AlertCircle size={28} color="#b45309" />
          <h2 className="backups-restricted__title">{t("backups.accesoRestringido")}</h2>
          <p className="backups-restricted__text">{t("backups.soloSuperAdmin")}</p>
        </div>
      </AdminModuleLayout>
    );
  }

  return (
    <AdminModuleLayout
      title={t("backups.titulo")}
      subtitle={t("backups.subtitulo")}
    >
      <div className="backups-page">
        <section className="backups-hero">
          <div className="backups-hero__info">
            <div className="backups-hero__badge">
              <Database size={14} />
              <span>{t("backups.badge")}</span>
            </div>
            <h2 className="backups-hero__title">{t("backups.heroTitulo")}</h2>
            <p className="backups-hero__text">{t("backups.heroTexto")}</p>
            <div className="backups-hero__notice">{t("backups.heroAviso")}</div>
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
                  {t("backups.generando")}
                </>
              ) : (
                <>
                  <Database size={16} />
                  {t("backups.generarBtn")}
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
              {t("backups.actualizar")}
            </button>
          </div>
        </section>

        <section className="metrics-grid">
          <article className="metric-card">
            <span className="metric-card__label">{t("backups.metricBackups")}</span>
            <strong className="metric-card__value">{backups.length}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">{t("backups.metricTamano")}</span>
            <strong className="metric-card__value">{formatBytes(totalSize)}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">{t("backups.metricEliminar")}</span>
            <strong className="metric-card__value">{canDelete ? t("backups.si") : t("backups.no")}</strong>
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
              {t("backups.reintentar")}
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
              {t("backups.reintentar")}
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
              {t("backups.reintentar")}
            </button>
          </div>
        ) : null}

        <section className="table-card">
          <div className="table-card__header">
            <div>
              <h3 className="table-card__title">{t("backups.listado")}</h3>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table__header-cell">{t("backups.colArchivo")}</th>
                  <th className="table__header-cell">{t("backups.colFecha")}</th>
                  <th className="table__header-cell">{t("backups.colTamano")}</th>
                  <th className="table__header-cell">{t("backups.colAcciones")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="table__empty-cell" colSpan={4}>
                      <div className="table__empty-state">
                        <Loader2 size={18} className="animate-spin" />
                        {t("backups.cargando")}
                      </div>
                    </td>
                  </tr>
                ) : backups.length === 0 ? (
                  <tr>
                    <td className="table__empty-cell" colSpan={4}>
                      <div className="table__empty-state">
                        <Database size={18} />
                        {t("backups.sinBackups")}
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
                            <div className="table__file-meta">{t("backups.backupSistema")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table__cell">
                        {formatDate(backup?.created_at || backup?.created_at_human, t)}
                      </td>
                      <td className="table__cell">
                        {backup?.size_label || formatBytes(backup?.size_bytes)}
                      </td>
                      <td className="table__cell">
                        <div className="table__actions">
                          <button
                            type="button"
                            onClick={() => handleDownload(backup)}
                            disabled={isDownloading}
                            className="btn btn--icon"
                            title={t("backups.descargar")}
                          >
                            {isDownloading
                              ? <Loader2 size={15} className="animate-spin" />
                              : <Download size={15} />}
                            {t("backups.descargar")}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRestore(backup)}
                            disabled={isRestoring}
                            className="btn btn--restore"
                            title={t("backups.restaurar")}
                          >
                            {isRestoring
                              ? <Loader2 size={15} className="animate-spin" />
                              : <RotateCcw size={15} />}
                            {isRestoring ? t("backups.preparandoRespaldo") : t("backups.restaurar")}
                          </button>

                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(backup)}
                              disabled={isDeleting}
                              className="btn btn--danger"
                              title={t("backups.eliminar")}
                            >
                              {isDeleting
                                ? <Loader2 size={15} className="animate-spin" />
                                : <Trash2 size={15} />}
                              {t("backups.eliminar")}
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