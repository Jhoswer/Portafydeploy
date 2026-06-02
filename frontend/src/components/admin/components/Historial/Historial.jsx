import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Mail,
  MapPin,
  RotateCcw,
  User,
} from "lucide-react";
import { apiClient } from "../../../../services/http/httpClient";
import HistorialAvatar from "./HistorialAvatar";
import {
  TABLAS,
  useTipos,
  useRolConfig,
  useRolDefault,
  useTipoStyles,
  getUsuarioId,
  getHistorialFullName,
  normalizeHistorialUsuario,
} from "./historialUtils";
import "./Historial.css";

const PER_PAGE = 8;

async function fetchLogs(idUser, { modifiedTable, type, fechaInicio, fechaFin, page }) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("per_page", PER_PAGE);

  if (modifiedTable && modifiedTable !== "Todos") {
    params.set("modified_table", modifiedTable);
    params.set("tabla", modifiedTable);
  }

  if (type) {
    params.set("type", type);
    params.set("tipo", type);
  }

  if (fechaInicio) params.set("fecha_inicio", fechaInicio);
  if (fechaFin) params.set("fecha_fin", fechaFin);

  return apiClient.get(`admin/historial/usuarios/${idUser}/logs?${params.toString()}`);
}

function getLogsFromResponse(res) {
  if (Array.isArray(res?.logs)) return res.logs;
  if (Array.isArray(res?.data?.logs)) return res.data.logs;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

export default function HistorialDetalle({ usuario, onVolver, showIntroPanel = true }) {
  const { t } = useTranslation();
  const TIPOS = useTipos();
  const ROL_CONFIG = useRolConfig();
  const ROL_DEFAULT = useRolDefault();
  const TIPO_STYLES = useTipoStyles();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [showHistory, setShowHistory] = useState(!showIntroPanel);

  const [tablaActiva, setTablaActiva] = useState("Todos");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const usuarioNormalizado = normalizeHistorialUsuario(usuario);
  const idUser = getUsuarioId(usuarioNormalizado);
  const nombre = getHistorialFullName(usuarioNormalizado);
  const rol = String(usuarioNormalizado?.rol ?? "usuario").toLowerCase();
  const rolConfig = ROL_CONFIG[rol] ?? ROL_DEFAULT;

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hayFiltros = tablaActiva !== "Todos" || tipoFiltro || fechaInicio || fechaFin;

  const cargarLogs = async (p = 1, override = {}) => {
    if (!idUser) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchLogs(idUser, {
        modifiedTable: override.modifiedTable ?? tablaActiva,
        type: override.type ?? tipoFiltro,
        fechaInicio: override.fechaInicio ?? fechaInicio,
        fechaFin: override.fechaFin ?? fechaFin,
        page: p,
      });
      const nextLogs = getLogsFromResponse(res);
      setLogs(nextLogs);
      setTotal(Number(res?.total ?? res?.data?.total ?? nextLogs.length) || 0);
      setPage(Number(res?.current_page ?? p) || p);
    } catch {
      setError(t("historial.detalle.error_cargar"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowHistory(!showIntroPanel);
    setLogs([]);
    setTotal(0);
    setPage(1);
    setError("");
    setTablaActiva("Todos");
    setTipoFiltro("");
    setFechaInicio("");
    setFechaFin("");
  }, [usuario?.id, usuario?.id_user, showIntroPanel]);

  useEffect(() => {
    if (!showHistory) return;
    cargarLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHistory, usuario?.id, usuario?.id_user]);

  const handleTablaChange = (value) => {
    setTablaActiva(value);
    if (showHistory) cargarLogs(1, { modifiedTable: value });
  };

  const limpiar = () => {
    setTablaActiva("Todos");
    setTipoFiltro("");
    setFechaInicio("");
    setFechaFin("");
    if (showHistory) {
      cargarLogs(1, { modifiedTable: "Todos", type: "", fechaInicio: "", fechaFin: "" });
    }
  };

  const TABLE_HEADERS = [
    t("historial.detalle.tabla_headers.numero"),
    t("historial.detalle.tabla_headers.tabla"),
    t("historial.detalle.tabla_headers.campo"),
    t("historial.detalle.tabla_headers.valor_anterior"),
    t("historial.detalle.tabla_headers.nuevo_valor"),
    t("historial.detalle.tabla_headers.tipo"),
    t("historial.detalle.tabla_headers.fecha"),
  ];

  return (
    <div className="historial-detalle">
      <AnimatePresence mode="wait">
        {!showHistory && showIntroPanel ? (
          /* ─── PANEL DE USUARIO ─── */
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="historial-detalle__panel"
          >
            <div className="historial-detalle__panel-banner">
              <div className="historial-detalle__panel-banner-top">
                {onVolver ? (
                  <button type="button" className="historial-detalle__back-link" onClick={onVolver}>
                    <ArrowLeft size={14} />
                    {t("historial.detalle.volver_buscar")}
                  </button>
                ) : (
                  <span />
                )}
                <div className="historial-detalle__role-badge">
                  <span className="historial-detalle__role-icon">{rolConfig.label.slice(0, 1)}</span>
                  {rolConfig.label.toUpperCase()}
                </div>
              </div>

              <div className="historial-detalle__panel-banner-bottom">
                <span className="historial-detalle__eyebrow">
                  <Clock size={11} />
                  {t("historial.detalle.panel_eyebrow")}
                </span>
                <p className="historial-detalle__panel-subtitle">
                  {t("historial.detalle.panel_subtitle")}
                </p>
              </div>
            </div>

            <div className="historial-detalle__panel-body">
              <div className="historial-detalle__avatar-row">
                <HistorialAvatar
                  usuario={usuarioNormalizado}
                  size={56}
                  radius={14}
                  borderWidth={3}
                  shadow="0 4px 14px rgba(0,0,0,.12)"
                />
                <div style={{ minWidth: 0 }}>
                  <h2 className="historial-detalle__name">{nombre.toUpperCase()}</h2>
                  <p className="historial-detalle__email">
                    {usuarioNormalizado?.email || t("historial.detalle.sin_correo")}
                  </p>
                </div>
              </div>

              <div className="historial-detalle__info-grid">
                <div className="historial-detalle__info-box">
                  <p className="historial-detalle__box-title">
                    <FileText size={11} />
                    {t("historial.detalle.info_general_title")}
                  </p>
                  <InfoRow
                    icon={<Mail size={12} />}
                    label={t("historial.detalle.label_correo")}
                    value={usuarioNormalizado?.email || t("historial.detalle.sin_correo")}
                  />
                  <InfoRow
                    icon={<Briefcase size={12} />}
                    label={t("historial.detalle.label_profesion")}
                    value={usuarioNormalizado?.profesion || t("historial.detalle.sin_profesion")}
                  />
                  <InfoRow
                    icon={<MapPin size={12} />}
                    label={t("historial.detalle.label_ubicacion")}
                    value={usuarioNormalizado?.ubicacion || t("historial.detalle.sin_ubicacion")}
                  />
                  <InfoRow
                    icon={<Activity size={12} />}
                    label={t("historial.detalle.label_perfil")}
                    value={
                      usuarioNormalizado?.perfil_completado
                        ? t("historial.detalle.perfil_completo")
                        : t("historial.detalle.perfil_incompleto")
                    }
                    highlight={!!usuarioNormalizado?.perfil_completado}
                  />
                </div>

                <div className="historial-detalle__info-box">
                  <p className="historial-detalle__box-title">
                    <User size={11} />
                    {t("historial.detalle.biografia_title")}
                  </p>
                  <p className="historial-detalle__bio">
                    {usuarioNormalizado?.biografia || t("historial.detalle.sin_biografia")}
                  </p>
                </div>
              </div>

              <div className="historial-detalle__panel-footer">
                <button type="button" className="historial-detalle__history-btn" onClick={() => setShowHistory(true)}>
                  {t("historial.detalle.ver_historial")}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ─── VISTA DE HISTORIAL ─── */
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="historial-detalle__history"
          >
            {/* Botón volver */}
            <button
              type="button"
              onClick={showIntroPanel ? () => setShowHistory(false) : onVolver}
              className="historial-detalle__back"
            >
              <ArrowLeft size={15} />
              {t("historial.detalle.volver")}
            </button>

            {/* Card: cabecera con avatar */}
            <div className="historial-detalle__history-head">
              <div className="historial-detalle__history-user">
                <HistorialAvatar
                  usuario={usuarioNormalizado}
                  size={52}
                  radius={14}
                  borderWidth={2}
                  shadow="0 4px 12px rgba(0,0,0,.10)"
                />
                <div style={{ minWidth: 0 }}>
                  <h3 className="historial-detalle__history-title">{nombre}</h3>
                  <p className="historial-detalle__history-subtitle">
                    {usuarioNormalizado?.email || t("historial.detalle.sin_correo")} · {rolConfig.label}
                  </p>
                </div>
              </div>

              <div className="historial-detalle__history-actions">
                {hayFiltros && (
                  <button type="button" onClick={limpiar} className="historial-detalle__reset-btn">
                    <RotateCcw size={11} />
                    {t("historial.detalle.limpiar_filtros")}
                  </button>
                )}
              </div>
            </div>

            {/* Card: filtros */}
            <div className="historial-detalle__filters-card">
              <div className="historial-detalle__filters">
                {/* Select tabla */}
                <div className="historial-detalle__select-box">
                  <span className="historial-detalle__select-label">
                    {t("historial.detalle.filtro_tabla_label")}
                  </span>
                  <div className="historial-detalle__select-wrap">
                    <select
                      value={tablaActiva}
                      onChange={(e) => handleTablaChange(e.target.value)}
                      className="historial-detalle__select"
                    >
                      {TABLAS.map((tabla) => (
                        <option key={tabla} value={tabla}>
                          {tabla === "Todos" ? t("historial.detalle.tabla_todos") : tabla}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="historial-detalle__select-icon" />
                  </div>
                </div>

                {/* Fecha inicio */}
                <div className="historial-detalle__date">
                  <Calendar size={12} color="var(--muted,#94a3b8)" />
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="historial-detalle__date-input"
                  />
                </div>

                {/* Fecha fin */}
                <div className="historial-detalle__date">
                  <Calendar size={12} color="var(--muted,#94a3b8)" />
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="historial-detalle__date-input"
                  />
                </div>

                {/* Tipos */}
                <div className="historial-detalle__types">
                  {TIPOS.map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setTipoFiltro(tipo.value)}
                      className={`historial-detalle__type${tipoFiltro === tipo.value ? " historial-detalle__type--active" : ""}`}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>

                {/* Buscar */}
                <button type="button" onClick={() => cargarLogs(1)} className="historial-detalle__search-btn">
                  <Filter size={13} />
                  {t("historial.detalle.btn_buscar")}
                </button>
              </div>
            </div>

            {/* Card: tabla de logs */}
            <div className="historial-detalle__table">
              <div className="historial-detalle__table-head">
                {TABLE_HEADERS.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="historial-detalle__state"
                  >
                    <div className="historial-detalle__spinner" />
                    <p className="historial-detalle__state-text">{t("historial.detalle.cargando")}</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="historial-detalle__state"
                  >
                    <AlertCircle size={24} color="#ef5759" style={{ marginBottom: 10 }} />
                    <p className="historial-detalle__state-error">{error}</p>
                  </motion.div>
                ) : logs.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="historial-detalle__state"
                  >
                    <div className="historial-detalle__empty-icon">
                      <Activity size={22} color="var(--muted,#94a3b8)" />
                    </div>
                    <p className="historial-detalle__state-title">
                      {t("historial.detalle.sin_registros_title")}
                    </p>
                    <p className="historial-detalle__state-text">
                      {t("historial.detalle.sin_registros_text")}
                    </p>
                  </motion.div>
                ) : (
                  <div key="rows">
                    {logs.map((log, index) => {
                      const ts = TIPO_STYLES[log.type] ?? {
                        label: log.type ?? "-",
                        color: "#64748b",
                        bg: "rgba(100,116,139,.10)",
                      };

                      return (
                        <div
                          key={log.id_log ?? index}
                          className={`historial-detalle__row${index % 2 !== 0 ? " historial-detalle__row--alt" : ""}`}
                        >
                          <span className="historial-detalle__cell historial-detalle__cell--index">
                            {(page - 1) * PER_PAGE + index + 1}
                          </span>
                          <span className="historial-detalle__cell historial-detalle__cell--table">
                            {log.modified_table ?? "-"}
                          </span>
                          <span className="historial-detalle__cell historial-detalle__cell--field">
                            {log.modified_field ?? "-"}
                          </span>
                          <span className="historial-detalle__cell historial-detalle__cell--value">
                            {log.previous_value || <span className="historial-detalle__placeholder">-</span>}
                          </span>
                          <span className="historial-detalle__cell historial-detalle__cell--value">
                            {log.new_value || <span className="historial-detalle__placeholder">-</span>}
                          </span>
                          <span className="historial-detalle__cell">
                            <span
                              className="historial-detalle__type-pill"
                              style={{ background: ts.bg, color: ts.color }}
                            >
                              {ts.label}
                            </span>
                          </span>
                          <span className="historial-detalle__cell historial-detalle__cell--date">
                            {log.created_at
                              ? new Date(log.created_at).toLocaleDateString("es-BO", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>

              {!loading && logs.length > 0 && (
                <div className="historial-detalle__pagination">
                  <span className="historial-detalle__pagination-count">
                    <strong>{total}</strong> {t("historial.detalle.registros_encontrados")}
                  </span>
                  <div className="historial-detalle__pagination-actions">
                    <PageBtn disabled={page <= 1} onClick={() => cargarLogs(page - 1)}>
                      <ChevronLeft size={13} />
                    </PageBtn>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const p =
                        totalPages <= 5
                          ? i + 1
                          : page <= 3
                            ? i + 1
                            : page >= totalPages - 2
                              ? totalPages - 4 + i
                              : page - 2 + i;
                      return (
                        <PageBtn key={p} active={p === page} onClick={() => cargarLogs(p)}>
                          {p}
                        </PageBtn>
                      );
                    })}
                    <PageBtn disabled={page >= totalPages} onClick={() => cargarLogs(page + 1)}>
                      <ChevronRight size={13} />
                    </PageBtn>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }) {
  return (
    <div className="historial-detalle__info-row">
      <div className="historial-detalle__info-label">
        <span className="historial-detalle__info-icon">{icon}</span>
        <span>{label}</span>
      </div>
      <span className={`historial-detalle__info-value${highlight ? " historial-detalle__info-value--highlight" : ""}`}>
        {highlight ? (
          <span className="historial-detalle__info-success">
            <CheckCircle size={11} color="#059669" />
            {value}
          </span>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`historial-detalle__page-btn${active ? " historial-detalle__page-btn--active" : ""}`}
    >
      {children}
    </button>
  );
}