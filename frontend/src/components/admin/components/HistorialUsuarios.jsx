import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, User, MapPin, Briefcase, Clock,
  ChevronRight, X, Loader2, SlidersHorizontal,
  Shield, Star, UserCheck, ChevronDown, RotateCcw,
  Mail, Hash, Filter, Users, AlertCircle,
} from "lucide-react";
import { buscarUsuariosHistorial } from "../../../services/adminService";

function getRoles(t) {
  return [
    { value: "",                    label: t("historial.usuarios.roles.todos") },
    { value: "reclutador",          label: t("historial.usuarios.roles.reclutador") },
    { value: "profesional",         label: t("historial.usuarios.roles.profesional") },
    { value: "administrador",       label: t("historial.usuarios.roles.administrador") },
    { value: "super administrador", label: t("historial.usuarios.roles.super_administrador") },
  ];
}

function getVisibleRoles(roles, currentRoleId) {
  const normalizedRoleId = Number(currentRoleId);
  if (normalizedRoleId === 5) return roles;
  return roles.filter((r) => r.value !== "administrador" && r.value !== "super administrador");
}

function getRolConfig(t) {
  return {
    "super administrador": { color: "#7c3aed", bg: "rgba(124,58,237,.10)", icon: <Star size={10} />,      label: t("historial.usuarios.rol_labels.super_admin") },
    "administrador":       { color: "#ef5759", bg: "rgba(239,87,89,.10)",  icon: <Shield size={10} />,    label: t("historial.usuarios.rol_labels.admin") },
    "reclutador":          { color: "#0284c7", bg: "rgba(2,132,199,.10)",  icon: <Users size={10} />,     label: t("historial.usuarios.rol_labels.reclutador") },
    "profesional":         { color: "#059669", bg: "rgba(5,150,105,.10)",  icon: <Briefcase size={10} />, label: t("historial.usuarios.rol_labels.profesional") },
  };
}

function getRolDefault(t) {
  return { color: "#64748b", bg: "rgba(100,116,139,.10)", icon: <UserCheck size={10} />, label: t("historial.usuarios.rol_labels.usuario") };
}

function highlight(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = String(text).split(regex);
  return parts.map((p, i) =>
    regex.test(p)
      ? <mark key={i} style={{ background: "rgba(239,87,89,.16)", color: "#ef5759", borderRadius: 3, padding: "0 1px", fontWeight: 700 }}>{p}</mark>
      : p
  );
}

async function buscarUsuarios({ query, rol }) {
  return buscarUsuariosHistorial({ query, rol });
}

export default function HistorialUsuarios({ onSelectUsuario, selectedUserId, currentRoleId }) {
  const { t } = useTranslation();

  const ROLES = getRoles(t);
  const ROL_CONFIG = getRolConfig(t);
  const ROL_DEFAULT = getRolDefault(t);

  const [query,       setQuery]       = useState("");
  const [usuarios,    setUsuarios]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [searched,    setSearched]    = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);
  const [rolFiltro,   setRolFiltro]   = useState("");
  const debounceRef   = useRef(null);
  const visibleRoles  = getVisibleRoles(ROLES, currentRoleId);

  const filtrosActivos = [
    rolFiltro && {
      label: t("historial.usuarios.chip_rol", { rol: visibleRoles.find(r => r.value === rolFiltro)?.label ?? rolFiltro }),
      clear: () => setRolFiltro(""),
    },
  ].filter(Boolean);

  const limpiarTodo = () => setRolFiltro("");

  const fetchUsuarios = useCallback(async (overrideQuery) => {
    const q = (overrideQuery ?? query).trim().replace(/\s+/g, " ");
    const hayFiltros = !!rolFiltro;
    if (!q && !hayFiltros) { setUsuarios([]); setSearched(false); setError(""); return; }
    setLoading(true); setError("");
    try {
      const data = await buscarUsuarios({ query: q, rol: rolFiltro });
      setUsuarios(data);
      setSearched(true);
    } catch {
      setError(t("historial.usuarios.error_busqueda"));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, rolFiltro]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsuarios(query), 400);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleFiltrar = () => { clearTimeout(debounceRef.current); fetchUsuarios(query); };

  const resultCount = usuarios.length;

  return (
    <div className="hu-root">

      {/* ── Header ── */}
      <div className="hu-header">
        <div className="hu-header__icon">
          <Clock size={20} color="white" />
        </div>
        <div>
          <h2 className="hu-header__title">{t("historial.usuarios.header_title")}</h2>
          <p className="hu-header__subtitle">{t("historial.usuarios.header_subtitle")}</p>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="hu-searchbar">
        <div className={`hu-searchbar__input-wrap${query ? " hu-searchbar__input-wrap--active" : ""}`}>
          <Search size={15} className={`hu-searchbar__icon${query ? " hu-searchbar__icon--active" : ""}`} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleFiltrar()}
            placeholder={t("historial.usuarios.search_placeholder")}
            className="hu-searchbar__input"
          />
          {loading && <Loader2 size={15} className="hu-searchbar__loader" />}
          {query && !loading && (
            <button
              onClick={() => { setQuery(""); setUsuarios([]); setSearched(false); limpiarTodo(); }}
              className="hu-searchbar__clear"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFiltros(v => !v)}
          className={`hu-btn hu-btn--filter${showFiltros ? " hu-btn--filter-active" : ""}`}
        >
          <SlidersHorizontal size={14} />
          {t("historial.usuarios.btn_filtros")}
          {filtrosActivos.length > 0 && (
            <span className="hu-btn__badge">{filtrosActivos.length}</span>
          )}
        </button>

        <button
          onClick={handleFiltrar}
          disabled={loading}
          className="hu-btn hu-btn--search"
        >
          <Filter size={14} />
          {t("historial.usuarios.btn_buscar")}
        </button>
      </div>

      {/* ── Filtros panel ── */}
      <AnimatePresence>
        {showFiltros && (
          <motion.div
            key="filtros"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div className="hu-filters-card">
              <div className="hu-filters-card__head">
                <span className="hu-filters-card__label">{t("historial.usuarios.filtros_title")}</span>
                {filtrosActivos.length > 0 && (
                  <button onClick={limpiarTodo} className="hu-filters-card__clear">
                    <RotateCcw size={11} /> {t("historial.usuarios.filtros_limpiar")}
                  </button>
                )}
              </div>
              <div className="hu-filters-card__grid">
                <div className="hu-filter-field">
                  <label className="hu-filter-field__label">{t("historial.usuarios.filtro_rol_label")}</label>
                  <div className="hu-filter-field__select-wrap">
                    <select
                      value={rolFiltro}
                      onChange={e => setRolFiltro(e.target.value)}
                      className={`hu-filter-field__select${rolFiltro ? " hu-filter-field__select--active" : ""}`}
                    >
                      {visibleRoles.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="hu-filter-field__chevron" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chips filtros activos ── */}
      <AnimatePresence>
        {filtrosActivos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="hu-chips"
          >
            {filtrosActivos.map((f, i) => (
              <span key={i} className="hu-chip">
                {f.label}
                <button onClick={f.clear} className="hu-chip__remove"><X size={11} /></button>
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="hu-error"
          >
            <AlertCircle size={14} color="#ef5759" />
            <p className="hu-error__text">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel de resultados con scroll ── */}
      <div className="hu-results-panel">
        <AnimatePresence mode="wait">
          {!searched && !loading && (
            <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hu-state">
              <div className="hu-state__icon hu-state__icon--neutral">
                <Search size={26} color="var(--muted, #94a3b8)" />
              </div>
              <p className="hu-state__title">{t("historial.usuarios.estado_buscar_title")}</p>
              <p className="hu-state__text">{t("historial.usuarios.estado_buscar_text")}</p>
            </motion.div>
          )}

          {searched && !loading && usuarios.length === 0 && (
            <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hu-state">
              <div className="hu-state__icon hu-state__icon--red">
                <User size={26} color="#ef5759" />
              </div>
              <p className="hu-state__title">{t("historial.usuarios.estado_sin_resultados_title")}</p>
              <p className="hu-state__text">
                {t("historial.usuarios.estado_sin_resultados_text")}
                {query && t("historial.usuarios.estado_sin_resultados_query", { query })}
                {filtrosActivos.length > 0 && t("historial.usuarios.estado_sin_resultados_filtros")}
              </p>
            </motion.div>
          )}

          {usuarios.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="hu-results-count">
                <strong>{resultCount}</strong>{" "}
                {t(resultCount === 1 ? "historial.usuarios.resultados_count_one" : "historial.usuarios.resultados_count_other", { count: resultCount })}
              </p>
              <div className="hu-results-list">
                {usuarios.map((u, i) => (
                  <UsuarioCard
                    key={u.id ?? u.id_user ?? i}
                    usuario={u}
                    index={i}
                    onSelect={onSelectUsuario}
                    query={query}
                    isSelected={String(u.id ?? u.id_user) === String(selectedUserId)}
                    rolConfig={ROL_CONFIG}
                    rolDefault={ROL_DEFAULT}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes hu-spin { to { transform: rotate(360deg); } }

        .hu-root {
          max-width: 100%;
          width: 100%;
          margin: 0 auto;
          padding: 22px 22px 0;
          font-family: var(--f-body, 'DM Sans', sans-serif);
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(15, 23, 42, 0.07);
        }

        .hu-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          flex-shrink: 0;
        }
        .hu-header__icon {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          background: #ef5759;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(239,87,89,.32);
          flex-shrink: 0;
        }
        .hu-header__title {
          font-size: 19px;
          font-weight: 800;
          margin: 0;
          color: var(--text, #0f172a);
          letter-spacing: -0.4px;
        }
        .hu-header__subtitle {
          font-size: 13px;
          color: var(--muted, #64748b);
          margin: 3px 0 0;
        }

        .hu-searchbar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        .hu-searchbar__input-wrap {
          flex: 1;
          min-width: 180px;
          display: flex;
          align-items: center;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 13px;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          transition: border-color .2s, box-shadow .2s;
        }
        .hu-searchbar__input-wrap--active {
          border-color: rgba(239,87,89,.45);
          box-shadow: 0 0 0 3px rgba(239,87,89,.08);
        }
        .hu-searchbar__icon {
          flex-shrink: 0;
          margin-left: 14px;
          color: var(--muted, #94a3b8);
          transition: color .2s;
        }
        .hu-searchbar__icon--active { color: #ef5759; }
        .hu-searchbar__input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: var(--text, #0f172a);
          padding: 13px 10px;
          font-family: inherit;
        }
        .hu-searchbar__input::placeholder { color: #94a3b8; }
        .hu-searchbar__loader {
          margin-right: 12px;
          flex-shrink: 0;
          color: #ef5759;
          animation: hu-spin .8s linear infinite;
        }
        .hu-searchbar__clear {
          background: none;
          border: none;
          cursor: pointer;
          margin-right: 10px;
          color: var(--muted, #94a3b8);
          display: flex;
          padding: 4px;
          border-radius: 6px;
          transition: color .15s;
        }
        .hu-searchbar__clear:hover { color: #ef5759; }

        .hu-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 16px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          height: 48px;
          transition: all .18s;
        }
        .hu-btn--filter {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          color: var(--muted, #64748b);
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
        }
        .hu-btn--filter:hover {
          border-color: rgba(239,87,89,.35);
          color: #ef5759;
        }
        .hu-btn--filter-active {
          background: rgba(239,87,89,.07);
          border-color: rgba(239,87,89,.35);
          color: #ef5759;
        }
        .hu-btn__badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #ef5759;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg, #f1f5f9);
        }
        .hu-btn--search {
          background: #ef5759;
          border: none;
          color: #fff;
          box-shadow: 0 4px 16px rgba(239,87,89,.30);
          padding: 0 20px;
        }
        .hu-btn--search:hover:not(:disabled) {
          opacity: .92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239,87,89,.38);
        }
        .hu-btn--search:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .hu-filters-card {
          padding: 18px 20px;
          flex-shrink: 0;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,.04);
        }
        .hu-filters-card__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .hu-filters-card__label {
          font-size: 11px;
          font-weight: 800;
          color: var(--muted, #94a3b8);
          text-transform: uppercase;
          letter-spacing: .06em;
        }
        .hu-filters-card__clear {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: #ef5759;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          font-family: inherit;
          transition: opacity .15s;
        }
        .hu-filters-card__clear:hover { opacity: .75; }
        .hu-filters-card__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .hu-filter-field__label {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted, #94a3b8);
          display: block;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .hu-filter-field__select-wrap {
          position: relative;
        }
        .hu-filter-field__select {
          width: 100%;
          appearance: none;
          padding: 9px 32px 9px 12px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 13px;
          font-family: inherit;
          color: var(--text, #0f172a);
          cursor: pointer;
          outline: none;
          transition: border-color .15s;
          box-sizing: border-box;
        }
        .hu-filter-field__select:focus { border-color: #ef5759; }
        .hu-filter-field__select--active {
          border-color: rgba(239,87,89,.4);
          background: rgba(239,87,89,.04);
        }
        .hu-filter-field__chevron {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted, #94a3b8);
          pointer-events: none;
        }

        .hu-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .hu-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(239,87,89,.08);
          border: 1px solid rgba(239,87,89,.22);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          color: #ef5759;
        }
        .hu-chip__remove {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: #ef5759;
          display: flex;
          transition: opacity .15s;
        }
        .hu-chip__remove:hover { opacity: .65; }

        .hu-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 11px;
          background: rgba(239,87,89,.06);
          border: 1px solid rgba(239,87,89,.18);
          margin-bottom: 16px;
        }
        .hu-error__text {
          font-size: 13px;
          color: #ef5759;
          margin: 0;
          font-family: inherit;
        }

        .hu-state {
          text-align: center;
          padding: 56px 0;
        }
        .hu-state__icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .hu-state__icon--neutral { background: #f1f5f9; }
        .hu-state__icon--red    { background: rgba(239,87,89,.07); }
        .hu-state__title {
          font-size: 14px;
          font-weight: 800;
          color: var(--text, #334155);
          margin: 0 0 6px;
          font-family: inherit;
        }
        .hu-state__text {
          font-size: 13px;
          color: var(--muted, #94a3b8);
          margin: 0;
          font-family: inherit;
        }

        .hu-results-count {
          font-size: 12px;
          color: var(--muted, #64748b);
          margin: 0 0 12px;
          font-family: inherit;
        }
        .hu-results-count strong { color: var(--text, #334155); }
        .hu-results-panel {
          max-height: 275px;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 2px 22px;
          margin: 0 -2px;
          scroll-behavior: smooth;
        }
        .hu-results-panel::-webkit-scrollbar { width: 5px; }
        .hu-results-panel::-webkit-scrollbar-track { background: transparent; }
        .hu-results-panel::-webkit-scrollbar-thumb {
          background: rgba(239,87,89,.25);
          border-radius: 99px;
        }
        .hu-results-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(239,87,89,.45);
        }
        .hu-results-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hu-user-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          transition: border-color .18s, box-shadow .18s, transform .18s, background .18s;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }
        .hu-user-card:hover {
          border-color: rgba(239,87,89,.30);
          box-shadow: 0 4px 20px rgba(239,87,89,.10);
          transform: translateY(-1px);
          background: rgba(239,87,89,.02);
        }
        .hu-user-card--selected {
          border-color: rgba(239,87,89,.45) !important;
          background: rgba(239,87,89,.05) !important;
          box-shadow: 0 0 0 3px rgba(239,87,89,.10) !important;
        }

        .hu-user-avatar { position: relative; flex-shrink: 0; }
        .hu-user-avatar__img {
          width: 44px; height: 44px; border-radius: 12px;
          object-fit: cover; border: 2px solid #e2e8f0; display: block;
        }
        .hu-user-avatar__initials {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(239,87,89,.10);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800; color: #ef5759;
          border: 2px solid rgba(239,87,89,.15); font-family: inherit;
        }
        .hu-user-avatar__role-dot {
          position: absolute; bottom: -4px; right: -4px;
          width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--bg, #f1f5f9); font-size: 9px;
        }

        .hu-user-info { flex: 1; min-width: 0; }
        .hu-user-info__top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .hu-user-info__name { font-size: 14px; font-weight: 700; color: var(--text, #0f172a); font-family: inherit; }
        .hu-user-info__role-badge {
          font-size: 10px; font-weight: 800; padding: 2px 8px;
          border-radius: 100px; text-transform: uppercase;
          letter-spacing: .05em; font-family: inherit; white-space: nowrap;
        }
        .hu-user-info__email { display: flex; align-items: center; gap: 5px; margin-top: 4px; }
        .hu-user-info__email-text {
          font-size: 12px; color: var(--muted, #64748b); font-family: inherit;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .hu-user-info__meta { display: flex; gap: 14px; margin-top: 5px; flex-wrap: wrap; }
        .hu-user-info__meta-item {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: var(--muted, #64748b); font-family: inherit;
        }

        .hu-user-side { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
        .hu-user-side__id {
          display: flex; align-items: center; gap: 3px;
          font-size: 11px; color: var(--muted, #94a3b8); font-family: monospace;
        }
        .hu-user-side__chevron { transition: color .15s, transform .15s; }

        @media (max-width: 600px) {
          .hu-btn { height: 44px; }
          .hu-searchbar { flex-direction: column; }
          .hu-searchbar__input-wrap { min-width: 0; }
          .hu-btn--filter, .hu-btn--search { width: 100%; justify-content: center; }
        }

        select option { background: #fff; color: #0f172a; }
      `}</style>
    </div>
  );
}

function UsuarioCard({ usuario, index, onSelect, query, isSelected, rolConfig, rolDefault }) {
  const nombre    = usuario.nombre   ?? usuario.name     ?? "—";
  const apellido  = usuario.apellido ?? usuario.last_name ?? "";
  const email     = usuario.email    ?? "—";
  const foto      = usuario.foto_perfil ?? null;
  const profesion = usuario.profesion  ?? null;
  const ubicacion = usuario.ubicacion  ?? null;
  const rol       = (usuario.rol ?? "usuario").toLowerCase();
  const config    = rolConfig[rol] ?? rolDefault;
  const initials  = `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.22, ease: "easeOut" }}
      onClick={() => onSelect?.(usuario)}
      className={`hu-user-card${isSelected ? " hu-user-card--selected" : ""}`}
    >
      <div className="hu-user-avatar">
        {foto
          ? <img src={foto} alt={nombre} className="hu-user-avatar__img" />
          : <div className="hu-user-avatar__initials">{initials || <User size={18} />}</div>
        }
        <span
          className="hu-user-avatar__role-dot"
          style={{ background: config.bg, color: config.color }}
        >
          {config.icon}
        </span>
      </div>

      <div className="hu-user-info">
        <div className="hu-user-info__top">
          <span className="hu-user-info__name">
            {highlight(nombre, query)} {highlight(apellido, query)}
          </span>
          <span
            className="hu-user-info__role-badge"
            style={{ background: config.bg, color: config.color }}
          >
            {config.label}
          </span>
        </div>

        <div className="hu-user-info__email">
          <Mail size={11} color="var(--muted, #94a3b8)" />
          <span className="hu-user-info__email-text">{highlight(email, query)}</span>
        </div>

        {(profesion || ubicacion) && (
          <div className="hu-user-info__meta">
            {profesion && (
              <div className="hu-user-info__meta-item">
                <Briefcase size={11} color="var(--muted, #94a3b8)" />
                <span>{profesion}</span>
              </div>
            )}
            {ubicacion && (
              <div className="hu-user-info__meta-item">
                <MapPin size={11} color="var(--muted, #94a3b8)" />
                <span>{ubicacion}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hu-user-side">
        <div className="hu-user-side__id">
          <Hash size={10} color="var(--muted, #94a3b8)" />
          <span>{usuario.id ?? usuario.id_user}</span>
        </div>
        <ChevronRight
          size={16}
          className="hu-user-side__chevron"
          color={isSelected ? "#ef5759" : "var(--muted, #cbd5e1)"}
          style={{ transform: isSelected ? "translateX(2px)" : "none" }}
        />
      </div>
    </motion.button>
  );
}