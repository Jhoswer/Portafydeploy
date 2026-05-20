import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Mail, MapPin, Briefcase, Clock,
  Shield, Star, UserCheck, Users, Activity,
  ChevronLeft, ChevronRight, Calendar,
  RotateCcw, FileText, AlertCircle, CheckCircle,
  Trash2, Edit3, Plus, Eye, Filter,
} from "lucide-react";
import { apiClient } from "../../../../services/http/httpClient";
import "./Historial.css";

const TABLAS = [
  "Todos","PROFILE","USER","SKILL","CERTIFICATE",
  "EXPERIENCE","PROJECT","OFFER","PORTFOLIO",
  "PUBLICATION","UNIVERSITY_CAREER","SOCIAL_NETWORK","CV",
];

const TIPOS = [
  { value: "",       label: "Todos",     icon: <Eye size={12} /> },
  { value: "create", label: "Creado",    icon: <Plus size={12} /> },
  { value: "update", label: "Editado",   icon: <Edit3 size={12} /> },
  { value: "delete", label: "Eliminado", icon: <Trash2 size={12} /> },
];

const ROL_CONFIG = {
  "super administrador": { color: "#7c3aed", bg: "rgba(124,58,237,.12)", icon: <Star size={11} />,     label: "Super Admin" },
  "administrador":       { color: "#ef5759", bg: "rgba(239,87,89,.12)",  icon: <Shield size={11} />,   label: "Admin" },
  "reclutador":          { color: "#0284c7", bg: "rgba(2,132,199,.12)",  icon: <Users size={11} />,    label: "Reclutador" },
  "profesional":         { color: "#059669", bg: "rgba(5,150,105,.12)",  icon: <Briefcase size={11} />,label: "Profesional" },
};
const ROL_DEFAULT = { color: "#64748b", bg: "rgba(100,116,139,.12)", icon: <UserCheck size={11} />, label: "Usuario" };

const TIPO_STYLES = {
  create: { label: "Creado",    color: "#059669", bg: "rgba(5,150,105,.10)",  icon: <Plus size={10} /> },
  update: { label: "Editado",   color: "#0284c7", bg: "rgba(2,132,199,.10)",  icon: <Edit3 size={10} /> },
  delete: { label: "Eliminado", color: "#ef5759", bg: "rgba(239,87,89,.10)",  icon: <Trash2 size={10} /> },
};

const PER_PAGE = 8;

function getUsuarioId(u) { return u?.id ?? u?.id_user ?? null; }

function getLogsFromResponse(res) {
  if (Array.isArray(res?.logs))       return res.logs;
  if (Array.isArray(res?.data?.logs)) return res.data.logs;
  if (Array.isArray(res?.data))       return res.data;
  if (Array.isArray(res))             return res;
  return [];
}

async function fetchLogs(idUser, { modifiedTable, type, fechaInicio, fechaFin, page }) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("per_page", PER_PAGE);
  if (modifiedTable && modifiedTable !== "Todos") {
    params.set("modified_table", modifiedTable);
    params.set("tabla", modifiedTable);
  }
  if (type)        { params.set("type", type); params.set("tipo", type); }
  if (fechaInicio)   params.set("fecha_inicio", fechaInicio);
  if (fechaFin)      params.set("fecha_fin", fechaFin);
  return apiClient.get(`admin/historial/usuarios/${idUser}/logs?${params.toString()}`);
}

// ── Componente principal ──────────────────────────────────────────
export default function HistorialDetalle({ usuario, onVolver }) {
  const [logs,       setLogs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [page,       setPage]       = useState(1);

  const [tablaActiva, setTabla]      = useState("Todos");
  const [tipoFiltro,  setTipo]       = useState("");
  const [fechaInicio, setFechaInicio]= useState("");
  const [fechaFin,    setFechaFin]   = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const rol        = (usuario?.rol ?? "usuario").toLowerCase();
  const rolConfig  = ROL_CONFIG[rol] ?? ROL_DEFAULT;
  const nombre     = usuario?.nombre   ?? "—";
  const apellido   = usuario?.apellido ?? "";
  const initials   = `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();

  const cargarLogs = async (p = 1, override = {}) => {
    const idUser = getUsuarioId(usuario);
    if (!idUser) return;
    setLoading(true); setError("");
    try {
      const res = await fetchLogs(idUser, {
        modifiedTable: override.modifiedTable ?? tablaActiva,
        type:          override.type          ?? tipoFiltro,
        fechaInicio:   override.fechaInicio   ?? fechaInicio,
        fechaFin:      override.fechaFin      ?? fechaFin,
        page: p,
      });
      const nextLogs = getLogsFromResponse(res);
      setLogs(nextLogs);
      setTotal(Number(res?.total ?? res?.data?.total ?? nextLogs.length) || 0);
      setPage(Number(res?.current_page ?? p) || p);
    } catch {
      setError("No se pudieron cargar los registros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarLogs(1); }, [usuario?.id, usuario?.id_user]); // eslint-disable-line

  const limpiar = () => {
    setTabla("Todos"); setTipo(""); setFechaInicio(""); setFechaFin("");
    cargarLogs(1, { modifiedTable: "Todos", type: "", fechaInicio: "", fechaFin: "" });
  };

  const hayFiltros = tablaActiva !== "Todos" || tipoFiltro || fechaInicio || fechaFin;

  return (
    <div className="historial-detalle">

      {/* Volver */}
      <button
        onClick={onVolver}
        className="historial-detalle__back"
        onMouseOver={e => e.currentTarget.style.color = "#ef5759"}
        onMouseOut={e => e.currentTarget.style.color = ""}
        style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--muted,#64748b)", padding: "0 0 20px 0", fontFamily: "inherit", transition: "color .2s" }}
      >
        <ArrowLeft size={15} /> Volver a buscar
      </button>

      {/* ── Panel usuario ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="historial-detalle__panel">

        {/* Banner */}
        <div style={{ height: 80, background: "linear-gradient(135deg,#ef5759 0%,#ef5759 60%,#ef5759 100%)", position: "relative" }}>
          <div style={{ position: "absolute", top: 12, left: 16, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "rgba(255,255,255,.75)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={11} /> PANEL DE USUARIO
          </div>
          <div style={{ position: "absolute", top: 12, right: 16, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.85)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,.15)", padding: "4px 10px", borderRadius: 99 }}>
            {rolConfig.icon} {rolConfig.label.toUpperCase()}
          </div>
        </div>

        {/* Body */}
        <div className="historial-detalle__panel-body">

          {/* Avatar + nombre */}
          <div className="historial-detalle__avatar-row">
            {usuario?.foto_perfil
              ? <img src={usuario.foto_perfil} alt={nombre} style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover", border: "3px solid var(--card,#fff)", boxShadow: "0 4px 14px rgba(0,0,0,.12)" }} />
              : <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#ef5759,#ef5759)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", border: "3px solid var(--card,#fff)", boxShadow: "0 4px 14px rgba(239,87,89,.30)", flexShrink: 0 }}>{initials || <User size={22} />}</div>
            }
            <div style={{ paddingBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text,#0f172a)", letterSpacing: "-0.3px" }}>{nombre.toUpperCase()} {apellido.toUpperCase()}</h2>
              <p style={{ fontSize: 13, color: "var(--muted,#64748b)", margin: "2px 0 0", fontFamily: "inherit" }}>{usuario?.email}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="historial-detalle__info-grid">

            <div className="historial-detalle__info-box">
              <p className="historial-detalle__box-title"><FileText size={11} /> Información general</p>
              <InfoRow icon={<Mail size={12} />}      label="Correo"    value={usuario?.email ?? "—"} />
              <InfoRow icon={<Briefcase size={12} />} label="Profesion" value={usuario?.profesion || "No registrada"} />
              <InfoRow icon={<MapPin size={12} />}    label="Ubicacion" value={usuario?.ubicacion || "No registrada"} />
              <InfoRow icon={<Activity size={12} />}  label="Perfil"    value={usuario?.perfil_completado ? "Completo" : "Incompleto"} highlight={!!usuario?.perfil_completado} />
            </div>

            <div className="historial-detalle__info-box">
              <p className="historial-detalle__box-title"><User size={11} /> Biografía</p>
              <p style={{ fontSize: 13, color: usuario?.biografia ? "var(--text,#334155)" : "var(--muted,#94a3b8)", margin: 0, lineHeight: 1.6, fontFamily: "inherit", fontStyle: usuario?.biografia ? "normal" : "italic" }}>
                {usuario?.biografia || "Sin biografía registrada."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Sección historial ───────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="historial-detalle__history">

        {/* Header */}
        <div className="historial-detalle__section-head">
          <div className="historial-detalle__section-title">
            <div className="historial-detalle__section-icon"><Activity size={16} color="white" /></div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text,#0f172a)" }}>Historial de actividad</h3>
              <p style={{ fontSize: 12, color: "var(--muted,#64748b)", margin: 0, fontFamily: "inherit" }}>Registros de cambios en el sistema</p>
            </div>
          </div>
          {hayFiltros && (
            <button onClick={limpiar} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#ef5759", fontFamily: "inherit" }}>
              <RotateCcw size={11} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Chips tablas */}
        <div className="historial-detalle__chips">
          {TABLAS.map(t => (
            <button key={t} onClick={() => { setTabla(t); cargarLogs(1, { modifiedTable: t }); }}
              className={`historial-detalle__chip${tablaActiva === t ? " historial-detalle__chip--active" : ""}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="historial-detalle__filters">

          {/* Fecha inicio */}
          <div className="historial-detalle__date">
            <Calendar size={12} color="var(--muted,#94a3b8)" />
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="historial-detalle__date-input" />
          </div>

          {/* Fecha fin */}
          <div className="historial-detalle__date">
            <Calendar size={12} color="var(--muted,#94a3b8)" />
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="historial-detalle__date-input" />
          </div>

          {/* Tipos */}
          <div className="historial-detalle__types">
            {TIPOS.map(t => (
              <button key={t.value} onClick={() => setTipo(t.value)}
                className={`historial-detalle__type${tipoFiltro === t.value ? " historial-detalle__type--active" : ""}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Botón buscar */}
          <button onClick={() => cargarLogs(1)} className="historial-detalle__search-btn">
            <Filter size={13} /> Buscar
          </button>
        </div>

        {/* Tabla */}
        <div className="historial-detalle__table">

          {/* Cabecera */}
          <div className="historial-detalle__table-head">
            {["#","Tabla","Campo","Valor anterior","Nuevo valor","Tipo","Fecha"].map(h => (
              <span key={h}>{h}</span>
            ))}
          </div>

          {/* Contenido */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="historial-detalle__state">
                <div className="historial-detalle__spinner" />
                <p style={{ fontSize: 13, color: "var(--muted,#94a3b8)", margin: 0, fontFamily: "inherit" }}>Cargando registros...</p>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="historial-detalle__state">
                <AlertCircle size={24} color="#ef5759" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 13, color: "#ef5759", margin: 0 }}>{error}</p>
              </motion.div>
            ) : logs.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="historial-detalle__state">
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(162,214,249,.10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Activity size={22} color="var(--muted,#94a3b8)" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text,#334155)", margin: "0 0 4px", fontFamily: "inherit" }}>Sin registros</p>
                <p style={{ fontSize: 12, color: "var(--muted,#94a3b8)", margin: 0, fontFamily: "inherit" }}>No hay actividad con los filtros aplicados</p>
              </motion.div>
            ) : (
              <div key="rows">
                {logs.map((log, i) => {
                  const ts = TIPO_STYLES[log.type] ?? { label: log.type ?? "—", color: "#64748b", bg: "rgba(100,116,139,.10)", icon: <Eye size={10} /> };
                  return (
                    <div key={log.id_log ?? i} className={`historial-detalle__row${i % 2 !== 0 ? " historial-detalle__row--alt" : ""}`}>
                      <span className="historial-detalle__cell historial-detalle__cell--index">{(page - 1) * PER_PAGE + i + 1}</span>
                      <span className="historial-detalle__cell historial-detalle__cell--table">{log.modified_table ?? "—"}</span>
                      <span className="historial-detalle__cell historial-detalle__cell--field">{log.modified_field ?? "—"}</span>
                      <span className="historial-detalle__cell historial-detalle__cell--value">
                        {log.previous_value || <span className="historial-detalle__placeholder">—</span>}
                      </span>
                      <span className="historial-detalle__cell historial-detalle__cell--value">
                        {log.new_value || <span className="historial-detalle__placeholder">—</span>}
                      </span>
                      <span className="historial-detalle__cell">
                        <span className="historial-detalle__type-pill" style={{ background: ts.bg, color: ts.color }}>
                          {ts.icon} {ts.label}
                        </span>
                      </span>
                      <span className="historial-detalle__cell historial-detalle__cell--date">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Paginación */}
          {!loading && logs.length > 0 && (
            <div className="historial-detalle__pagination">
              <span className="historial-detalle__pagination-count">
                <strong>{total}</strong> registros encontrados
              </span>
              <div className="historial-detalle__pagination-actions">
                <PageBtn disabled={page <= 1} onClick={() => cargarLogs(page - 1)}><ChevronLeft size={13} /></PageBtn>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return <PageBtn key={p} active={p === page} onClick={() => cargarLogs(p)}>{p}</PageBtn>;
                })}
                <PageBtn disabled={page >= totalPages} onClick={() => cargarLogs(page + 1)}><ChevronRight size={13} /></PageBtn>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────
function InfoRow({ icon, label, value, highlight }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(162,214,249,.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ color: "var(--muted,#94a3b8)" }}>{icon}</span>
        <span style={{ fontSize: 12, color: "var(--muted,#64748b)", fontFamily: "inherit" }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: highlight ? "#059669" : "var(--text,#334155)", fontFamily: "inherit" }}>
        {highlight
          ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={11} color="#059669" />{value}</span>
          : value
        }
      </span>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 30, height: 30, borderRadius: 8, border: "1.5px solid",
      borderColor: active ? "rgba(239,87,89,.40)" : "rgba(162,214,249,.35)",
      background: active ? "rgba(239,87,89,.09)" : "var(--card,#fff)",
      color: active ? "#ef5759" : disabled ? "rgba(148,163,184,.4)" : "var(--muted,#64748b)",
      fontSize: 12, fontWeight: active ? 700 : 500,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all .15s", fontFamily: "inherit",
    }}>
      {children}
    </button>
  );
}