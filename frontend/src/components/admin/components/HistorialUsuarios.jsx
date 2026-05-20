import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, User, MapPin, Briefcase, Clock,
  ChevronRight, X, Loader2, SlidersHorizontal,
  Shield, Star, UserCheck, ChevronDown, RotateCcw,
  Mail, Hash, Filter, Users, AlertCircle,
} from "lucide-react";
import { buscarUsuariosHistorial } from "../../../services/adminService";

const ROLES = [
  { value: "",                    label: "Todos los roles" },
  { value: "reclutador",          label: "Reclutador" },
  { value: "profesional",         label: "Profesional" },
  { value: "administrador",       label: "Administrador" },
  { value: "super administrador", label: "Super Administrador" },
];

function getVisibleRoles(currentRoleId) {
  const normalizedRoleId = Number(currentRoleId);

  if (normalizedRoleId === 5) {
    return ROLES;
  }

  if (normalizedRoleId === 6) {
    return ROLES.filter((role) => role.value !== "administrador" && role.value !== "super administrador");
  }

  return ROLES.filter((role) => role.value !== "administrador" && role.value !== "super administrador");
}

const ROL_CONFIG = {
  "super administrador": { color: "#7c3aed", bg: "rgba(124,58,237,.10)", icon: <Star size={10} />, label: "Super Admin" },
  "administrador":       { color: "#ef5759", bg: "rgba(239,87,89,.10)",  icon: <Shield size={10} />, label: "Admin" },
  "reclutador":          { color: "#0284c7", bg: "rgba(2,132,199,.10)",  icon: <Users size={10} />, label: "Reclutador" },
  "profesional":         { color: "#059669", bg: "rgba(5,150,105,.10)",  icon: <Briefcase size={10} />, label: "Profesional" },
};
const ROL_DEFAULT = { color: "#64748b", bg: "rgba(100,116,139,.10)", icon: <UserCheck size={10} />, label: "Usuario" };

function highlight(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = String(text).split(regex);
  return parts.map((p, i) =>
    regex.test(p)
      ? <mark key={i} style={{ background: "rgba(239,87,89,.18)", color: "#ef5759", borderRadius: 3, padding: "0 1px", fontWeight: 700 }}>{p}</mark>
      : p
  );
}

async function buscarUsuarios({ query, rol, ciudad, profesion }) {
  return buscarUsuariosHistorial({ query, rol });
}

export default function HistorialUsuarios({ onSelectUsuario, selectedUserId, currentRoleId }) {
  const [query,          setQuery]       = useState("");
  const [usuarios,       setUsuarios]    = useState([]);
  const [loading,        setLoading]     = useState(false);
  const [error,          setError]       = useState("");
  const [searched,       setSearched]    = useState(false);
  const [showFiltros,    setShowFiltros] = useState(false);
  const [rolFiltro,      setRolFiltro]   = useState("");
  const debounceRef = useRef(null);
  const visibleRoles = getVisibleRoles(currentRoleId);

  const filtrosActivos = [
    rolFiltro       && { label: `Rol: ${visibleRoles.find(r => r.value === rolFiltro)?.label ?? rolFiltro}`, clear: () => setRolFiltro("") },
   
  ].filter(Boolean);

  const limpiarTodo = () => { setRolFiltro("") };

  const fetchUsuarios = useCallback(async (overrideQuery) => {
    const q = (overrideQuery ?? query).trim().replace(/\s+/g, " ");
    const hayFiltros = !!(rolFiltro );
    if (!q && !hayFiltros) { setUsuarios([]); setSearched(false); setError(""); return; }
    setLoading(true); setError("");
    try {
      const data = await buscarUsuarios({ query: q, rol: rolFiltro });
      setUsuarios(data);
      setSearched(true);
    } catch {
      setError("No se pudo completar la búsqueda. Verifica tu conexión.");
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

  return (
    <div style={{ maxWidth: "100%", width: "100%", margin: "0 auto", padding: "20px 0", fontFamily: "var(--f-body, 'DM Sans', sans-serif)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg, #ef5759 0%, #f87171 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(239,87,89,.30)", flexShrink: 0 }}>
          <Clock size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "var(--text, #0f172a)", letterSpacing: "-0.3px" }}>Historial de usuarios</h2>
          <p style={{ fontSize: 13, color: "var(--muted, #64748b)", margin: "2px 0 0" }}>Busca usuarios para inspeccionar su información</p>
        </div>
      </div>

      {/* Barra búsqueda */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: "180px", display: "flex", alignItems: "center", background: "var(--card, #fff)", border: "1.5px solid", borderColor: query ? "rgba(239,87,89,.45)" : "rgba(162,214,249,.45)", borderRadius: 13, boxShadow: query ? "0 0 0 3px rgba(239,87,89,.08)" : "0 2px 10px rgba(0,0,0,.04)", transition: "border-color .2s, box-shadow .2s" }}>
          <Search size={15} color={query ? "#ef5759" : "var(--muted, #94a3b8)"} style={{ flexShrink: 0, marginLeft: 14, transition: "color .2s" }} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleFiltrar()} placeholder="Nombre, apellido o correo electrónico..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text, #0f172a)", padding: "13px 10px", fontFamily: "inherit" }} />
          {loading && <Loader2 size={15} color="#ef5759" style={{ marginRight: 12, flexShrink: 0, animation: "spin .8s linear infinite" }} />}
          {(query && !loading) && <button onClick={() => { setQuery(""); setUsuarios([]); setSearched(false); limpiarTodo(); }} style={{ background: "none", border: "none", cursor: "pointer", marginRight: 10, color: "var(--muted, #94a3b8)", display: "flex", padding: 4, borderRadius: 6 }}><X size={13} /></button>}
        </div>

        <button onClick={() => setShowFiltros(v => !v)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 16px", background: showFiltros ? "rgba(239,87,89,.08)" : "var(--card, #fff)", border: "1.5px solid", borderColor: showFiltros ? "rgba(239,87,89,.35)" : "rgba(162,214,249,.45)", borderRadius: 13, cursor: "pointer", fontSize: 13, fontWeight: 600, color: showFiltros ? "#ef5759" : "var(--muted, #64748b)", fontFamily: "inherit", transition: "all .2s", position: "relative", whiteSpace: "nowrap" }}>
          <SlidersHorizontal size={14} />
          Filtros
          {filtrosActivos.length > 0 && <span style={{ position: "absolute", top: -6, right: -6, width: 17, height: 17, borderRadius: "50%", background: "#ef5759", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg, #f1f5f9)" }}>{filtrosActivos.length}</span>}
        </button>

        <button onClick={handleFiltrar} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 18px", background: loading ? "rgba(239,87,89,.5)" : "linear-gradient(135deg, #ef5759 0%, #f87171 100%)", border: "none", borderRadius: 13, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(239,87,89,.28)", transition: "all .2s", whiteSpace: "nowrap" }}>
          <Filter size={14} />
          Buscar
        </button>
      </div>

      {/* Panel filtros */}
      <AnimatePresence>
        {showFiltros && (
          <motion.div key="filtros" initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 14 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", background: "var(--card, #fff)", border: "1.5px solid rgba(162,214,249,.35)", borderRadius: 13, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted, #64748b)", textTransform: "uppercase", letterSpacing: ".06em" }}>Filtros</span>
                {filtrosActivos.length > 0 && <button onClick={limpiarTodo} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef5759", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: 0, fontFamily: "inherit" }}><RotateCcw size={11} /> Limpiar todo</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <FilterField label="Rol">
                  <div style={{ position: "relative" }}>
                    <select value={rolFiltro} onChange={e => setRolFiltro(e.target.value)} style={{ width: "100%", appearance: "none", padding: "9px 30px 9px 10px", borderRadius: 9, border: "1.5px solid", borderColor: rolFiltro ? "rgba(239,87,89,.4)" : "rgba(162,214,249,.4)", background: rolFiltro ? "rgba(239,87,89,.05)" : "var(--card, #fff)", fontSize: 13, color: "var(--text, #0f172a)", cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                      {visibleRoles.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted, #94a3b8)", pointerEvents: "none" }} />
                  </div>
                </FilterField>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips filtros activos */}
      <AnimatePresence>
        {filtrosActivos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {filtrosActivos.map((f, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "rgba(239,87,89,.09)", border: "1px solid rgba(239,87,89,.25)", borderRadius: 100, fontSize: 12, fontWeight: 600, color: "#ef5759" }}>
                {f.label}
                <button onClick={f.clear} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef5759", display: "flex" }}><X size={11} /></button>
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 11, background: "rgba(239,87,89,.07)", border: "1px solid rgba(239,87,89,.20)", marginBottom: 16 }}>
            <AlertCircle size={14} color="#ef5759" />
            <p style={{ fontSize: 13, color: "#ef5759", margin: 0, fontFamily: "inherit" }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultados */}
      <AnimatePresence mode="wait">
        {!searched && !loading && (
          <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "52px 0" }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(162,214,249,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Search size={28} color="var(--muted, #94a3b8)" /></div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #334155)", margin: "0 0 6px", fontFamily: "inherit" }}>Busca un usuario</p>
            <p style={{ fontSize: 13, color: "var(--muted, #94a3b8)", margin: 0, fontFamily: "inherit" }}>Ingresa un nombre, apellido o correo para comenzar.</p>
          </motion.div>
        )}
        {searched && !loading && usuarios.length === 0 && (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "52px 0" }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(239,87,89,.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><User size={28} color="#ef5759" /></div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #334155)", margin: "0 0 6px", fontFamily: "inherit" }}>Sin resultados</p>
            <p style={{ fontSize: 13, color: "var(--muted, #94a3b8)", margin: 0, fontFamily: "inherit" }}>No se encontraron usuarios{query && <> para <strong>"{query}"</strong></>}{filtrosActivos.length > 0 && " con los filtros aplicados"}</p>
          </motion.div>
        )}
        {usuarios.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: 12, color: "var(--muted, #64748b)", margin: "0 0 12px", fontFamily: "inherit" }}><strong style={{ color: "var(--text, #334155)" }}>{usuarios.length}</strong> resultado{usuarios.length !== 1 ? "s" : ""}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {usuarios.map((u, i) => <UsuarioCard key={u.id ?? u.id_user ?? i} usuario={u} index={i} onSelect={onSelectUsuario} query={query} isSelected={String(u.id ?? u.id_user) === String(selectedUserId)} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #94a3b8; } select option { background: #fff; color: #0f172a; }`}</style>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted, #94a3b8)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</label>
      {children}
    </div>
  );
}

function UsuarioCard({ usuario, index, onSelect, query, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const nombre    = usuario.nombre   ?? usuario.name     ?? "—";
  const apellido  = usuario.apellido ?? usuario.last_name ?? "";
  const email     = usuario.email    ?? "—";
  const foto      = usuario.foto_perfil ?? null;
  const profesion = usuario.profesion  ?? null;
  const ubicacion = usuario.ubicacion  ?? null;
  const rol       = (usuario.rol ?? "usuario").toLowerCase();
  const rolConfig = ROL_CONFIG[rol] ?? ROL_DEFAULT;
  const initials  = `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.22, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(usuario)}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: isSelected ? "rgba(239,87,89,.06)" : hovered ? "rgba(239,87,89,.03)" : "var(--card, #fff)", border: "1.5px solid", borderColor: isSelected ? "rgba(239,87,89,.45)" : hovered ? "rgba(239,87,89,.30)" : "rgba(162,214,249,.30)", borderRadius: 13, cursor: "pointer", boxShadow: isSelected ? "0 0 0 3px rgba(239,87,89,.10)" : hovered ? "0 4px 20px rgba(239,87,89,.10)" : "0 2px 8px rgba(0,0,0,.04)", transition: "all .18s ease", transform: hovered ? "translateY(-1px)" : "none" }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        {foto
          ? <img src={foto} alt={nombre} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(162,214,249,.40)" }} />
          : <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(239,87,89,.15), rgba(162,214,249,.25))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#ef5759", border: "2px solid rgba(239,87,89,.15)", fontFamily: "inherit" }}>{initials || <User size={18} />}</div>
        }
        <span style={{ position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: rolConfig.bg, color: rolConfig.color, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg, #f1f5f9)", fontSize: 9 }}>{rolConfig.icon}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text, #0f172a)", fontFamily: "inherit" }}>{highlight(nombre, query)} {highlight(apellido, query)}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: rolConfig.bg, color: rolConfig.color, textTransform: "uppercase", letterSpacing: ".05em", fontFamily: "inherit" }}>{rolConfig.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
          <Mail size={11} color="var(--muted, #94a3b8)" />
          <span style={{ fontSize: 12, color: "var(--muted, #64748b)", fontFamily: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{highlight(email, query)}</span>
        </div>
        {(profesion || ubicacion) && (
          <div style={{ display: "flex", gap: 14, marginTop: 5, flexWrap: "wrap" }}>
            {profesion && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={11} color="var(--muted, #94a3b8)" /><span style={{ fontSize: 12, color: "var(--muted, #64748b)", fontFamily: "inherit" }}>{profesion}</span></div>}
            {ubicacion && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} color="var(--muted, #94a3b8)" /><span style={{ fontSize: 12, color: "var(--muted, #64748b)", fontFamily: "inherit" }}>{ubicacion}</span></div>}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Hash size={10} color="var(--muted, #94a3b8)" />
          <span style={{ fontSize: 11, color: "var(--muted, #94a3b8)", fontFamily: "monospace" }}>{usuario.id ?? usuario.id_user}</span>
        </div>
        <ChevronRight size={16} color={isSelected ? "#ef5759" : hovered ? "#ef5759" : "var(--muted, #cbd5e1)"} style={{ transition: "color .15s, transform .15s", transform: hovered || isSelected ? "translateX(2px)" : "none" }} />
      </div>
    </motion.div>
  );
}
