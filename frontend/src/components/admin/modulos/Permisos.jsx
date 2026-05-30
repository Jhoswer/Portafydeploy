import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  User,
  UserRound,
  X,
} from "lucide-react";
import AdminModuleLayout from "../components/AdminModuleLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  buscarUsuariosPermisos,
  obtenerPermisosUsuario,
  actualizarPermisosUsuario,
} from "../../../services/adminService";
import "../../../styles/components/admin/components/Permisos/Permisos.css";

const ROLE_THEME = {
  profesional: {
    label: "Profesional",
    color: "#059669",
    bg: "rgba(5,150,105,.10)",
    border: "rgba(5,150,105,.18)",
    icon: <UserRound size={11} />,
  },
  reclutador: {
    label: "Reclutador",
    color: "#0284c7",
    bg: "rgba(2,132,199,.10)",
    border: "rgba(2,132,199,.18)",
    icon: <ShieldCheck size={11} />,
  },
  administrador: {
    label: "Administrador",
    color: "#ef5759",
    bg: "rgba(239,87,89,.10)",
    border: "rgba(239,87,89,.18)",
    icon: <ShieldAlert size={11} />,
  },
  "super administrador": {
    label: "Super Admin",
    color: "#ef5759",
    bg: "rgba(239,87,89,.10)",
    border: "rgba(239,87,89,.18)",
    icon: <Shield size={11} />,
  },
  default: {
    label: "Usuario",
    color: "#64748b",
    bg: "rgba(100,116,139,.10)",
    border: "rgba(100,116,139,.18)",
    icon: <User size={11} />,
  },
};

function getUserId(user) {
  return user?.id ?? user?.id_user ?? null;
}

function getFullName(user) {
  return `${user?.nombre ?? user?.name ?? "Usuario"} ${user?.apellido ?? user?.last_name ?? ""}`.trim();
}

function getRoleKey(role) {
  return String(role ?? "").toLowerCase();
}

function getRoleTheme(role) {
  return ROLE_THEME[getRoleKey(role)] ?? ROLE_THEME.default;
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeDateValue(value) {
  if (!value) return "";
  const text = String(value).trim();
  return text ? text.slice(0, 10) : "";
}

function diffPermissions(original, next) {
  const originalMap = new Map((original ?? []).map((p) => [
    String(p.id_permission),
    { active: !!p.active, deadline: normalizeDateValue(p.deadline) },
  ]));

  const applied = [];
  const removed = [];
  const temporary = [];

  for (const perm of next ?? []) {
    const before = originalMap.get(String(perm.id_permission)) ?? { active: false, deadline: "" };
    const afterActive = !!perm.active;
    const afterDeadline = normalizeDateValue(perm.deadline);

    if (before.active === afterActive && before.deadline === afterDeadline) continue;

    if (afterActive) { applied.push(perm.name); continue; }
    if (afterDeadline) { temporary.push({ name: perm.name, deadline: afterDeadline }); continue; }
    removed.push(perm.name);
  }

  return { applied, removed, temporary, total: applied.length + removed.length + temporary.length };
}

export default function Permisos() {
  const { user: authUser } = useAuth();
  const currentRole  = getRoleKey(authUser?.rol);
  const isAllowed    = currentRole === "administrador" || currentRole === "super administrador";
  const isSuperAdmin = currentRole === "super administrador";
  const currentLocation = normalizeText(authUser?.ubicacion || authUser?.location);

  const [query,               setQuery]               = useState("");
  const [usuarios,            setUsuarios]            = useState([]);
  const [searched,            setSearched]            = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState("");
  const [selectedUser,        setSelectedUser]        = useState(null);
  const [permissions,         setPermissions]         = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [detailLoading,       setDetailLoading]       = useState(false);
  const [detailError,         setDetailError]         = useState("");
  const [saving,              setSaving]              = useState(false);
  const [showConfirm,         setShowConfirm]         = useState(false);
  const [pendingPayload,      setPendingPayload]      = useState(null);
  const [successMessage,      setSuccessMessage]      = useState("");
  const [confirmError,        setConfirmError]        = useState("");

  const debounceRef = useRef(null);

  const scopeLabel = useMemo(() => {
    if (!isAllowed) return "Sin acceso";
    if (isSuperAdmin) return "Super administrador: acceso total";
    if (currentLocation) return `Alcance: ${currentLocation}`;
    return "Alcance: usuarios sin ubicacion";
  }, [currentLocation, isAllowed, isSuperAdmin]);

  const scopeHint = isAllowed
    ? isSuperAdmin
      ? "Puedes activar o desactivar permisos en cualquier usuario."
      : currentLocation === "Por defecto"
        ? "Solo puedes gestionar usuarios sin ubicacion."
        : "Solo puedes gestionar usuarios de tu pais-ciudad."
    : "Este modulo esta disponible solo para administradores.";

  const hasChanges = useMemo(() => {
    if (!originalPermissions.length || !permissions.length) return false;
    const originalMap = new Map(originalPermissions.map((p) => [
      String(p.id_permission),
      { active: !!p.active, deadline: normalizeDateValue(p.deadline) },
    ]));
    return permissions.some((perm) => {
      const original = originalMap.get(String(perm.id_permission)) ?? { active: false, deadline: "" };
      return original.active !== !!perm.active || original.deadline !== normalizeDateValue(perm.deadline);
    });
  }, [originalPermissions, permissions]);

  useEffect(() => {
    if (!isAllowed) return undefined;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(query), 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  async function fetchUsers(term) {
    const q = normalizeText(term);
    if (!q) { setUsuarios([]); setSearched(false); setError(""); return; }
    setLoading(true);
    setError("");
    try {
      const data = await buscarUsuariosPermisos({ query: q });
      setUsuarios(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) {
      setError(err?.message || "No se pudo completar la busqueda.");
      setUsuarios([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  async function openUser(userData) {
    const userId = getUserId(userData);
    if (!userId) return;
    setSelectedUser({
      ...userData,
      id: userId,
      nombre:         userData.nombre         ?? userData.name      ?? "",
      apellido:       userData.apellido        ?? userData.last_name ?? "",
      email:          userData.email           ?? "",
      rol:            userData.rol             ?? "usuario",
      ubicacion:      userData.ubicacion       ?? "",
      foto_perfil:    userData.foto_perfil     ?? userData.fotoPerfil ?? "",
      can_edit:       userData.can_edit        ?? false,
      disable_reason: userData.disable_reason  ?? "",
    });
    setDetailLoading(true);
    setDetailError("");
    setPermissions([]);
    setOriginalPermissions([]);
    setConfirmError("");
    setShowConfirm(false);
    try {
      const response = await obtenerPermisosUsuario(userId);
      const payload  = response?.data ?? response ?? {};
      setSelectedUser((current) => ({
        ...current,
        ...(payload.usuario ?? {}),
        can_edit:       payload.usuario?.can_edit       ?? current?.can_edit       ?? false,
        disable_reason: payload.usuario?.disable_reason ?? current?.disable_reason ?? "",
      }));
      const nextPermissions = Array.isArray(payload.permissions) ? payload.permissions : [];
      setPermissions(nextPermissions);
      setOriginalPermissions(nextPermissions.map((perm) => ({ ...perm })));
    } catch (err) {
      setDetailError(err?.message || "No se pudieron cargar los permisos.");
    } finally {
      setDetailLoading(false);
    }
  }

  function togglePermission(idPermission) {
    if (!selectedUser?.can_edit || detailLoading || saving) return;
    setPermissions((current) =>
      current.map((perm) =>
        String(perm.id_permission) === String(idPermission)
          ? { ...perm, active: !perm.active, deadline: !perm.active ? perm.deadline : "" }
          : perm
      )
    );
  }

  function updatePermissionDeadline(idPermission, deadline) {
    if (!selectedUser?.can_edit || detailLoading || saving) return;
    const normalizedDeadline = normalizeDateValue(deadline);
    setPermissions((current) =>
      current.map((perm) =>
        String(perm.id_permission) === String(idPermission)
          ? { ...perm, deadline: normalizedDeadline, active: normalizedDeadline ? false : perm.active }
          : perm
      )
    );
  }

  function handlePrepareSave() {
    if (!selectedUser?.can_edit || !hasChanges) return;
    const summary = diffPermissions(originalPermissions, permissions);
    setPendingPayload({ permissions, summary });
    setConfirmError("");
    setShowConfirm(true);
  }

  async function handleConfirmSave() {
    if (!selectedUser || !pendingPayload) return;
    setSaving(true);
    setConfirmError("");
    try {
      const response = await actualizarPermisosUsuario(selectedUser.id, pendingPayload.permissions);
      const payload  = response?.data ?? response ?? {};
      const summary  = payload?.data?.summary ?? payload?.summary ?? pendingPayload.summary;
      const temporaryText = summary.temporary?.length
        ? summary.temporary.map((item) => `${item.name} hasta ${item.deadline}`).join(", ")
        : "ninguno";
      setSuccessMessage(
        `Cambios aplicados correctamente. ` +
          `Se actualizaron los permisos de ${getFullName(selectedUser)}. ` +
          `Aplicados: ${summary.applied?.length ? summary.applied.join(", ") : "ninguno"}. ` +
          `Quitados: ${summary.removed?.length ? summary.removed.join(", ") : "ninguno"}. ` +
          `Temporales: ${temporaryText}.`
      );
      const nextPermissions = Array.isArray(payload?.data?.permissions)
        ? payload.data.permissions
        : permissions;
      setPermissions(nextPermissions);
      setOriginalPermissions(nextPermissions.map((perm) => ({ ...perm })));
      setShowConfirm(false);
      setPendingPayload(null);
      setConfirmError("");
    } catch (err) {
      setConfirmError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Acceso restringido ── */
  if (!isAllowed) {
    return (
      <AdminModuleLayout title="Permisos" subtitle="Administracion de accesos, roles y autorizaciones.">
        <div className="permisos-restricted">
          <div className="permisos-restricted__card">
            <div className="permisos-restricted__icon">
              <Lock size={28} color="#ef5759" />
            </div>
            <h2 className="permisos-restricted__title">Acceso restringido</h2>
            <p className="permisos-restricted__text">
              Este módulo está disponible solo para administradores.
            </p>
          </div>
        </div>
      </AdminModuleLayout>
    );
  }

  /* ── Render principal ── */
  return (
    <AdminModuleLayout
      title="Permisos"
      subtitle="Busca usuarios, ajusta sus permisos activos y confirma cada cambio antes de guardarlo."
    >
      <div className="permisos-root">

        {/* Banner superior */}
        <div className="permisos-banner">
          <div className="permisos-banner__left">
            <p className="permisos-banner__eyebrow">Control de accesos</p>
            <h2 className="permisos-banner__title">Modulo de permisos</h2>
          </div>
          <div className="permisos-banner__scope">
            <span className="permisos-banner__scope-label">{scopeLabel}</span>
            <span className="permisos-banner__scope-hint">{scopeHint}</span>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="permisos-success">
            <CheckCircle2 size={18} color="#059669" />
            <div>
              <p className="permisos-success__title">Permisos actualizados correctamente</p>
              <p className="permisos-success__text">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="permisos-search-row">
          <div className={`permisos-search-input-wrap${query ? " permisos-search-input-wrap--active" : ""}`}>
            <Search
              size={15}
              className="permisos-search-icon"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre, apellido o correo..."
              className="permisos-search-input"
            />
            {loading && (
              <Loader2 size={15} color="#ef5759" className="permisos-spin" style={{ marginRight: 12 }} />
            )}
            {query && !loading && (
              <button
                type="button"
                className="permisos-search-clear"
                onClick={() => { setQuery(""); setUsuarios([]); setSearched(false); setError(""); }}
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => fetchUsers(query)}
            disabled={loading}
            className="permisos-search-btn"
          >
            <Search size={14} />
            Buscar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="permisos-error">
            <AlertTriangle size={14} color="#ef5759" />
            <p className="permisos-error__text">{error}</p>
          </div>
        )}

        {/* Grid principal */}
        <div className="permisos-grid">

          {/* ── Columna izquierda: lista ── */}
          <div style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {!searched && !loading && (
                <div key="empty" className="permisos-state">
                  <div className="permisos-state__icon">
                    <Search size={28} color="#ef5759" />
                  </div>
                  <p className="permisos-state__title">Busca un usuario</p>
                  <p className="permisos-state__text">Ingresa un nombre, apellido o correo para comenzar.</p>
                </div>
              )}

              {searched && !loading && usuarios.length === 0 && (
                <div key="no-results" className="permisos-state">
                  <div className="permisos-state__icon permisos-state__icon--neutral">
                    <UserRound size={28} color="#64748b" />
                  </div>
                  <p className="permisos-state__title">Sin resultados</p>
                  <p className="permisos-state__text">
                    No se encontraron usuarios para <strong>{query}</strong>.
                  </p>
                </div>
              )}

              {usuarios.length > 0 && (
                <div key="results">
                  <p className="permisos-results-count">
                    <strong>{usuarios.length}</strong> resultado{usuarios.length !== 1 ? "s" : ""}
                  </p>
                  <div className="permisos-results-list">
                    {usuarios.map((item) => {
                      const roleTheme = getRoleTheme(item.rol);
                      const selected  = String(getUserId(selectedUser)) === String(getUserId(item));

                      return (
                        <button
                          key={getUserId(item)}
                          type="button"
                          onClick={() => openUser(item)}
                          className={`permisos-user-card${selected ? " permisos-user-card--selected" : ""}`}
                        >
                          {/* Avatar */}
                          <div className="permisos-user-card__avatar-wrap">
                            {item.foto_perfil ? (
                              <img
                                src={item.foto_perfil}
                                alt={getFullName(item)}
                                className="permisos-user-card__avatar-img"
                              />
                            ) : (
                              <div className="permisos-user-card__avatar-initials">
                                {`${item.nombre?.[0] ?? ""}${item.apellido?.[0] ?? ""}`.toUpperCase() || <User size={18} />}
                              </div>
                            )}
                            <span
                              className="permisos-user-card__role-dot"
                              style={{ background: roleTheme.bg, color: roleTheme.color }}
                            >
                              {roleTheme.icon}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="permisos-user-card__info">
                            <div className="permisos-user-card__name-row">
                              <span className="permisos-user-card__name">{getFullName(item)}</span>
                              <span
                                className="permisos-user-card__role-badge"
                                style={{ background: roleTheme.bg, color: roleTheme.color }}
                              >
                                {roleTheme.label}
                              </span>
                            </div>
                            <div className="permisos-user-card__meta">
                              <Mail size={11} color="#94a3b8" />
                              <span className="permisos-user-card__email">{item.email}</span>
                              {item.ubicacion && (
                                <>
                                  <span className="permisos-user-card__sep">•</span>
                                  <MapPin size={11} color="#94a3b8" />
                                  <span className="permisos-user-card__location">{item.ubicacion}</span>
                                </>
                              )}
                            </div>
                            {item.disable_reason && (
                              <div className="permisos-user-card__disable-reason">
                                {item.disable_reason}
                              </div>
                            )}
                          </div>

                          <ChevronRight size={16} color={selected ? "#ef5759" : "#cbd5e1"} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Columna derecha: panel de permisos ── */}
          <div style={{ minWidth: 0 }}>
            <div className="permisos-panel">

              {/* Sin usuario seleccionado */}
              {!selectedUser && (
                <div className="permisos-panel__empty">
                  <div>
                    <div className="permisos-panel__empty-icon">
                      <ShieldCheck size={30} color="#ef5759" />
                    </div>
                    <p className="permisos-panel__empty-title">Selecciona un usuario</p>
                    <p className="permisos-panel__empty-text">
                      Aquí verás sus permisos activos y podrás activarlos o quitarlos.
                    </p>
                  </div>
                </div>
              )}

              {/* Con usuario seleccionado */}
              {selectedUser && (
                <>
                  {/* Header usuario */}
                  <div className="permisos-panel__header">
                    <div className="permisos-panel__user-row">
                      <div className="permisos-panel__avatar">
                        {`${selectedUser?.nombre?.[0] ?? ""}${selectedUser?.apellido?.[0] ?? ""}`.toUpperCase() || <User size={18} />}
                      </div>
                      <div>
                        <div className="permisos-panel__user-name-row">
                          <h3 className="permisos-panel__user-name">{getFullName(selectedUser)}</h3>
                          <span
                            className="permisos-user-card__role-badge"
                            style={{
                              background: getRoleTheme(selectedUser.rol).bg,
                              color:      getRoleTheme(selectedUser.rol).color,
                            }}
                          >
                            {getRoleTheme(selectedUser.rol).label}
                          </span>
                        </div>
                        <div className="permisos-panel__user-meta">
                          <Mail size={11} />
                          <span>{selectedUser.email}</span>
                          {selectedUser.ubicacion && (
                            <>
                              <span style={{ color: "#334155" }}>•</span>
                              <MapPin size={11} />
                              <span>{selectedUser.ubicacion}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="permisos-panel__close-btn"
                      onClick={() => {
                        setSelectedUser(null);
                        setPermissions([]);
                        setOriginalPermissions([]);
                        setDetailError("");
                        setShowConfirm(false);
                      }}
                      aria-label="Limpiar selección"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Loading */}
                  {detailLoading && (
                    <div className="permisos-panel__loading">
                      <div className="permisos-panel__loading-inner">
                        <Loader2 size={18} className="permisos-spin" />
                        Cargando permisos...
                      </div>
                    </div>
                  )}

                  {/* Error detalle */}
                  {!detailLoading && detailError && (
                    <div className="permisos-panel__error permisos-error">
                      <AlertTriangle size={14} color="#ef5759" />
                      <p className="permisos-error__text">{detailError}</p>
                    </div>
                  )}

                  {/* Contenido de permisos */}
                  {!detailLoading && !detailError && (
                    <>
                      {/* Stats */}
                      <div className="permisos-panel__stats-row">
                        <div className="permisos-panel__stats-left">
                          <span className="permisos-badge permisos-badge--active">
                            {permissions.filter((p) => p.active).length} activos
                          </span>
                          <span className="permisos-badge permisos-badge--total">
                            {permissions.length} permisos
                          </span>
                        </div>
                        {!selectedUser.can_edit ? (
                          <span className="permisos-badge permisos-badge--readonly">Solo lectura</span>
                        ) : (
                          <span className="permisos-badge permisos-badge--editable">Editable</span>
                        )}
                      </div>

                      {/* Aviso disable */}
                      {selectedUser.disable_reason && (
                        <div className="permisos-panel__disable-warning">
                          <AlertTriangle size={14} color="#ef5759" />
                          <p>{selectedUser.disable_reason}</p>
                        </div>
                      )}

                      {/* Lista de permisos */}
                      <div className="permisos-list">
                        {permissions.map((perm) => {
                          const checked       = !!perm.active;
                          const disabled      = !selectedUser.can_edit || !perm.permission_active || detailLoading || saving;
                          const deadlineValue = normalizeDateValue(perm.deadline);

                          return (
                            <div key={perm.id_permission} className="permisos-list__item">
                              {/* Toggle */}
                              <button
                                type="button"
                                onClick={() => togglePermission(perm.id_permission)}
                                disabled={disabled}
                                className={`permisos-perm-btn${checked ? " permisos-perm-btn--active" : ""}`}
                              >
                                <div>
                                  <div className="permisos-panel__user-name-row">
                                    <span className="permisos-perm-btn__name">{perm.name}</span>
                                    <span
                                      className="permisos-user-card__role-badge"
                                      style={{
                                        background: getRoleTheme(selectedUser.rol).bg,
                                        color:      getRoleTheme(selectedUser.rol).color,
                                      }}
                                    >
                                      {getRoleTheme(selectedUser.rol).label}
                                    </span>
                                  </div>
                                  <p className="permisos-perm-btn__status">
                                    {checked
                                      ? "Permiso activo para este usuario."
                                      : "Permiso desactivado para este usuario."}
                                  </p>
                                </div>
                                <div className={`permisos-perm-btn__toggle${checked ? " permisos-perm-btn__toggle--active" : ""}`}>
                                  {checked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                </div>
                              </button>

                              {/* Deadline */}
                              {(!checked || deadlineValue) && (
                                <div className="permisos-deadline">
                                  <CalendarDays size={14} color="#ef5759" />
                                  <div className="permisos-deadline__info">
                                    <div className="permisos-deadline__title">Hasta una fecha opcional</div>
                                    <div className="permisos-deadline__hint">
                                      Si eliges una fecha y el permiso queda apagado, se reactivará cuando esa fecha venza.
                                    </div>
                                  </div>
                                  <input
                                    type="date"
                                    value={deadlineValue}
                                    onChange={(e) => updatePermissionDeadline(perm.id_permission, e.target.value)}
                                    disabled={disabled}
                                    className="permisos-deadline__input"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="permisos-panel__footer">
                        <button
                          type="button"
                          onClick={() => setPermissions(originalPermissions.map((p) => ({ ...p })))}
                          disabled={!selectedUser.can_edit || !hasChanges || saving}
                          className="permisos-btn-secondary"
                        >
                          <ArrowLeft size={15} />
                          Revertir
                        </button>
                        <button
                          type="button"
                          onClick={handlePrepareSave}
                          disabled={!selectedUser.can_edit || !hasChanges || saving}
                          className="permisos-btn-primary"
                        >
                          {saving
                            ? <Loader2 size={15} className="permisos-spin" />
                            : <ArrowRight size={15} />
                          }
                          Guardar cambios
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {showConfirm && selectedUser && pendingPayload && (
          <ConfirmModal
            usuario={selectedUser}
            summary={pendingPayload.summary}
            isBusy={saving}
            error={confirmError}
            onClose={() => { if (saving) return; setShowConfirm(false); setPendingPayload(null); setConfirmError(""); }}
            onBack={() => { if (saving) return; setShowConfirm(false); setPendingPayload(null); }}
            onConfirm={handleConfirmSave}
          />
        )}
      </AnimatePresence>
    </AdminModuleLayout>
  );
}

/* ──────────────────────────────────────────────────────────
   MODAL DE CONFIRMACIÓN
────────────────────────────────────────────────────────── */
function ConfirmModal({ usuario, summary, isBusy, error, onClose, onBack, onConfirm }) {
  return (
    <div
      className="permisos-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !isBusy) onClose(); }}
    >
      <div
        className="permisos-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permissions-confirm-title"
      >
        {/* Header */}
        <div className="permisos-modal__header">
          <div className="permisos-modal__icon">
            <Lock size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 id="permissions-confirm-title" className="permisos-modal__title">
              Confirmar cambios de permisos
            </h3>
            <p className="permisos-modal__subtitle">
              Revisa el resumen antes de guardar. Esta acción quedará registrada.
            </p>
          </div>
          <button
            type="button"
            className="permisos-modal__close"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="permisos-modal__body">
          <div className="permisos-modal__summary">
            <p className="permisos-modal__summary-eyebrow">Resumen</p>
            <div className="permisos-modal__summary-grid">
              <ModalInfoRow label="Usuario"            value={getFullName(usuario)} />
              <ModalInfoRow label="Permisos aplicados" value={summary.applied?.length  ? summary.applied.join(", ")  : "Ninguno"} />
              <ModalInfoRow label="Permisos quitados"  value={summary.removed?.length  ? summary.removed.join(", ")  : "Ninguno"} />
              <ModalInfoRow
                label="Permisos temporales"
                value={summary.temporary?.length
                  ? summary.temporary.map((item) => `${item.name} hasta ${item.deadline}`).join(", ")
                  : "Ninguno"}
              />
            </div>
          </div>

          <div className="permisos-modal__actions">
            <button type="button" onClick={onBack} disabled={isBusy} className="permisos-btn-secondary">
              Volver
            </button>
            <button type="button" onClick={onConfirm} disabled={isBusy} className="permisos-btn-primary">
              {isBusy ? <Loader2 size={15} className="permisos-spin" /> : <CheckCircle2 size={15} />}
              Guardar permisos
            </button>
          </div>

          {error && (
            <div className="permisos-modal__error">
              <AlertTriangle size={14} color="#ef5759" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalInfoRow({ label, value }) {
  return (
    <div className="permisos-info-row">
      <span className="permisos-info-row__label">{label}</span>
      <span className="permisos-info-row__value">{value || "Sin definir"}</span>
    </div>
  );
}