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
    {
      active: !!p.active,
      deadline: normalizeDateValue(p.deadline),
    },
  ]));

  const applied = [];
  const removed = [];
  const temporary = [];

  for (const perm of next ?? []) {
    const before = originalMap.get(String(perm.id_permission)) ?? { active: false, deadline: "" };
    const afterActive = !!perm.active;
    const afterDeadline = normalizeDateValue(perm.deadline);

    if (before.active === afterActive && before.deadline === afterDeadline) continue;

    if (afterActive) {
      applied.push(perm.name);
      continue;
    }

    if (afterDeadline) {
      temporary.push({ name: perm.name, deadline: afterDeadline });
      continue;
    }

    removed.push(perm.name);
  }

  return {
    applied,
    removed,
    temporary,
    total: applied.length + removed.length + temporary.length,
  };
}

export default function Permisos() {
  const { user: authUser } = useAuth();
  const currentRole = getRoleKey(authUser?.rol);
  const isAllowed = currentRole === "administrador" || currentRole === "super administrador";
  const isSuperAdmin = currentRole === "super administrador";
  const currentLocation = normalizeText(authUser?.ubicacion || authUser?.location);

  const [query, setQuery] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmError, setConfirmError] = useState("");

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
      {
        active: !!p.active,
        deadline: normalizeDateValue(p.deadline),
      },
    ]));

    return permissions.some((perm) => {
      const original = originalMap.get(String(perm.id_permission)) ?? { active: false, deadline: "" };
      return original.active !== !!perm.active || original.deadline !== normalizeDateValue(perm.deadline);
    });
  }, [originalPermissions, permissions]);

  useEffect(() => {
    if (!isAllowed) return undefined;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(query);
    }, 350);

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

    if (!q) {
      setUsuarios([]);
      setSearched(false);
      setError("");
      return;
    }

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
      nombre: userData.nombre ?? userData.name ?? "",
      apellido: userData.apellido ?? userData.last_name ?? "",
      email: userData.email ?? "",
      rol: userData.rol ?? "usuario",
      ubicacion: userData.ubicacion ?? "",
      foto_perfil: userData.foto_perfil ?? userData.fotoPerfil ?? "",
      can_edit: userData.can_edit ?? false,
      disable_reason: userData.disable_reason ?? "",
    });
    setDetailLoading(true);
    setDetailError("");
    setPermissions([]);
    setOriginalPermissions([]);
    setConfirmError("");
    setShowConfirm(false);

    try {
      const response = await obtenerPermisosUsuario(userId);
      const payload = response?.data ?? response ?? {};

      setSelectedUser((current) => ({
        ...current,
        ...(payload.usuario ?? {}),
        can_edit: payload.usuario?.can_edit ?? current?.can_edit ?? false,
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
          ? {
              ...perm,
              active: !perm.active,
              deadline: !perm.active ? perm.deadline : "",
            }
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
          ? {
              ...perm,
              deadline: normalizedDeadline,
              active: normalizedDeadline ? false : perm.active,
            }
          : perm
      )
    );
  }

  function handlePrepareSave() {
    if (!selectedUser?.can_edit || !hasChanges) return;

    const summary = diffPermissions(originalPermissions, permissions);
    setPendingPayload({
      permissions,
      summary,
    });
    setConfirmError("");
    setShowConfirm(true);
  }

  async function handleConfirmSave() {
    if (!selectedUser || !pendingPayload) return;

    setSaving(true);
    setConfirmError("");

    try {
      const response = await actualizarPermisosUsuario(selectedUser.id, pendingPayload.permissions);
      const payload = response?.data ?? response ?? {};
      const summary = payload?.data?.summary ?? payload?.summary ?? pendingPayload.summary;
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

  if (!isAllowed) {
    return (
      <AdminModuleLayout title="Permisos" subtitle="Administracion de accesos, roles y autorizaciones.">
        <div style={{ display: "grid", placeItems: "center", minHeight: "56vh", padding: 24 }}>
          <div style={{ maxWidth: 560, width: "100%", padding: 24, borderRadius: 20, background: "linear-gradient(135deg, rgba(239,87,89,.08), rgba(162,214,249,.10))", border: "1px solid rgba(239,87,89,.16)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 14px", borderRadius: 20, background: "rgba(239,87,89,.12)", display: "grid", placeItems: "center" }}>
              <Lock size={28} color="#ef5759" />
            </div>
            <h2 style={{ margin: 0, color: "#0f172a", fontSize: 22 }}>Acceso restringido</h2>
            <p style={{ margin: "10px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              Este módulo está disponible solo para administradores.
            </p>
          </div>
        </div>
      </AdminModuleLayout>
    );
  }

  return (
    <AdminModuleLayout
      title="Permisos"
      subtitle="Busca usuarios, ajusta sus permisos activos y confirma cada cambio antes de guardarlo."
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, background: "linear-gradient(135deg, rgba(239,87,89,.09), rgba(220,38,38,.11))", border: "1px solid rgba(239,87,89,.14)" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#ef5759", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Control de accesos
            </p>
            <h2 style={{ margin: "4px 0 0", fontSize: 22, lineHeight: 1.1, color: "#0f172a" }}>
              Modulo de permisos
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,.76)", border: "1px solid rgba(15,23,42,.06)" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{scopeLabel}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{scopeHint}</span>
          </div>
        </div>

        {successMessage ? (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px", borderRadius: 14, background: "rgba(5,150,105,.08)", border: "1px solid rgba(5,150,105,.18)" }}>
            <CheckCircle2 size={18} color="#059669" />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#047857" }}>
                Permisos actualizados correctamente
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#065f46", lineHeight: 1.5 }}>
                {successMessage}
              </p>
            </div>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--card, #fff)", border: "1.5px solid", borderColor: query ? "rgba(239,87,89,.45)" : "rgba(162,214,249,.45)", borderRadius: 14, boxShadow: query ? "0 0 0 3px rgba(239,87,89,.08)" : "0 2px 10px rgba(0,0,0,.04)", transition: "border-color .2s, box-shadow .2s" }}>
            <Search size={15} color={query ? "#ef5759" : "#94a3b8"} style={{ marginLeft: 14, flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre, apellido o correo..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#0f172a", padding: "13px 10px", fontFamily: "inherit" }}
            />
            {loading ? <Loader2 size={15} color="#ef5759" style={{ marginRight: 12, animation: "spin .8s linear infinite" }} /> : null}
            {query && !loading ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setUsuarios([]);
                  setSearched(false);
                  setError("");
                }}
                style={{ background: "none", border: "none", cursor: "pointer", marginRight: 10, color: "#94a3b8", display: "flex", padding: 4, borderRadius: 6 }}
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => fetchUsers(query)}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "0 18px", background: loading ? "rgba(124,58,237,.55)" : "linear-gradient(135deg, #ef5759 0%, #dc2626 100%)", border: "none", borderRadius: 14, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(124,58,237,.26)" }}
          >
            <Search size={14} />
            Buscar
          </button>
        </div>

        {error ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,87,89,.07)", border: "1px solid rgba(239,87,89,.20)" }}>
            <AlertTriangle size={14} color="#ef5759" />
            <p style={{ fontSize: 13, color: "#ef5759", margin: 0 }}>{error}</p>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1.3fr", gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {!searched && !loading ? (
                <div key="empty" style={{ textAlign: "center", padding: "52px 0", borderRadius: 18, background: "linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.94))", border: "1px dashed rgba(148,163,184,.32)" }}>
                  <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(239,87,89,.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Search size={28} color="#ef5759" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Busca un usuario</p>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Ingresa un nombre, apellido o correo para comenzar.</p>
                </div>
              ) : null}

              {searched && !loading && usuarios.length === 0 ? (
                <div key="no-results" style={{ textAlign: "center", padding: "52px 0", borderRadius: 18, background: "linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.94))", border: "1px dashed rgba(148,163,184,.32)" }}>
                  <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(148,163,184,.09)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <UserRound size={28} color="#64748b" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Sin resultados</p>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                    No se encontraron usuarios para <strong>{query}</strong>.
                  </p>
                </div>
              ) : null}

              {usuarios.length > 0 ? (
                <div key="results" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 2px" }}>
                    <strong style={{ color: "#0f172a" }}>{usuarios.length}</strong> resultado{usuarios.length !== 1 ? "s" : ""}
                  </p>

                  {usuarios.map((item) => {
                    const roleTheme = getRoleTheme(item.rol);
                    const selected = String(getUserId(selectedUser)) === String(getUserId(item));

                    return (
                      <button
                        key={getUserId(item)}
                        type="button"
                        onClick={() => openUser(item)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 16px",
                          background: selected ? "rgba(239,87,89,.06)" : "var(--card, #fff)",
                          border: "1.5px solid",
                          borderColor: selected ? "rgba(239,87,89,.45)" : "rgba(162,214,249,.30)",
                          borderRadius: 14,
                          cursor: "pointer",
                          boxShadow: selected ? "0 0 0 3px rgba(239,87,89,.10)" : "0 2px 8px rgba(0,0,0,.04)",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          {item.foto_perfil ? (
                            <img src={item.foto_perfil} alt={getFullName(item)} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(162,214,249,.40)" }} />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(239,87,89,.15), rgba(220,38,38,.20))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#ef5759" }}>
                              {`${item.nombre?.[0] ?? ""}${item.apellido?.[0] ?? ""}`.toUpperCase() || <User size={18} />}
                            </div>
                          )}
                          <span style={{ position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: roleTheme.bg, color: roleTheme.color, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg, #f1f5f9)", fontSize: 9 }}>
                            {roleTheme.icon}
                          </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{getFullName(item)}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: roleTheme.bg, color: roleTheme.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
                              {roleTheme.label}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                            <Mail size={11} color="#94a3b8" />
                            <span style={{ fontSize: 12, color: "#64748b" }}>{item.email}</span>
                            {item.ubicacion ? (
                              <>
                                <span style={{ color: "#cbd5e1" }}>•</span>
                                <MapPin size={11} color="#94a3b8" />
                                <span style={{ fontSize: 12, color: "#64748b" }}>{item.ubicacion}</span>
                              </>
                            ) : null}
                          </div>
                          {item.disable_reason ? <div style={{ marginTop: 5, fontSize: 12, color: "#ef5759" }}>{item.disable_reason}</div> : null}
                        </div>

                        <ChevronRight size={16} color={selected ? "#ef5759" : "#cbd5e1"} />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </AnimatePresence>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ borderRadius: 18, padding: 18, background: "linear-gradient(180deg, rgba(255,255,255,.97), rgba(250,252,255,.97))", border: "1px solid rgba(239,87,89,.12)", boxShadow: "0 8px 28px rgba(15,23,42,.05)", minHeight: 440 }}>
              {!selectedUser ? (
                <div style={{ height: "100%", minHeight: 400, display: "grid", placeItems: "center", textAlign: "center" }}>
                  <div>
                    <div style={{ width: 72, height: 72, margin: "0 auto 16px", borderRadius: 22, background: "rgba(239,87,89,.08)", display: "grid", placeItems: "center" }}>
                      <ShieldCheck size={30} color="#ef5759" />
                    </div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Selecciona un usuario</p>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>Aquí verás sus permisos activos y podrás activarlos o quitarlos.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, rgba(239,87,89,.14), rgba(220,38,38,.18))", display: "grid", placeItems: "center", fontWeight: 800, color: "#ef5759", flexShrink: 0 }}>
                        {`${selectedUser?.nombre?.[0] ?? ""}${selectedUser?.apellido?.[0] ?? ""}`.toUpperCase() || <User size={18} />}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <h3 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>{getFullName(selectedUser)}</h3>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: getRoleTheme(selectedUser.rol).bg, color: getRoleTheme(selectedUser.rol).color, textTransform: "uppercase", letterSpacing: ".05em" }}>
                            {getRoleTheme(selectedUser.rol).label}
                          </span>
                        </div>
                        <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", color: "#64748b", fontSize: 12 }}>
                          <Mail size={11} />
                          <span>{selectedUser.email}</span>
                          {selectedUser.ubicacion ? (
                            <>
                              <span style={{ color: "#cbd5e1" }}>•</span>
                              <MapPin size={11} />
                              <span>{selectedUser.ubicacion}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setPermissions([]);
                        setOriginalPermissions([]);
                        setDetailError("");
                        setShowConfirm(false);
                      }}
                      style={{ border: "none", background: "rgba(148,163,184,.12)", color: "#475569", width: 34, height: 34, borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer" }}
                      aria-label="Limpiar selección"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {detailLoading ? (
                    <div style={{ minHeight: 320, display: "grid", placeItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ef5759", fontWeight: 700 }}>
                        <Loader2 size={18} style={{ animation: "spin .8s linear infinite" }} />
                        Cargando permisos...
                      </div>
                    </div>
                  ) : detailError ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,87,89,.07)", border: "1px solid rgba(239,87,89,.20)" }}>
                      <AlertTriangle size={14} color="#ef5759" />
                      <p style={{ fontSize: 13, color: "#ef5759", margin: 0 }}>{detailError}</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(239,87,89,.10)", color: "#ef5759", fontSize: 12, fontWeight: 700 }}>
                            {permissions.filter((p) => p.active).length} activos
                          </span>
                          <span style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(100,116,139,.10)", color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                            {permissions.length} permisos
                          </span>
                        </div>

                        {!selectedUser.can_edit ? (
                          <span style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(239,87,89,.10)", color: "#ef5759", fontSize: 12, fontWeight: 700 }}>
                            Solo lectura
                          </span>
                        ) : (
                          <span style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(5,150,105,.10)", color: "#059669", fontSize: 12, fontWeight: 700 }}>
                            Editable
                          </span>
                        )}
                      </div>

                      {selectedUser.disable_reason ? (
                        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(239,87,89,.07)", border: "1px solid rgba(239,87,89,.18)" }}>
                          <AlertTriangle size={14} color="#ef5759" />
                          <p style={{ margin: 0, color: "#ef5759", fontSize: 13 }}>{selectedUser.disable_reason}</p>
                        </div>
                      ) : null}

                      <div style={{ display: "grid", gap: 10, maxHeight: 340, overflow: "auto", paddingRight: 4 }}>
                        {permissions.map((perm) => {
                          const checked = !!perm.active;
                          const disabled = !selectedUser.can_edit || !perm.permission_active || detailLoading || saving;
                          const deadlineValue = normalizeDateValue(perm.deadline);

                          return (
                            <div key={perm.id_permission} style={{ display: "grid", gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => togglePermission(perm.id_permission)}
                                disabled={disabled}
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 12,
                                  padding: "14px 14px",
                                  borderRadius: 16,
                                  border: "1.5px solid",
                                  borderColor: checked ? "rgba(5,150,105,.32)" : "rgba(148,163,184,.22)",
                                  background: checked ? "rgba(5,150,105,.06)" : "var(--card, #fff)",
                                  cursor: disabled ? "not-allowed" : "pointer",
                                  textAlign: "left",
                                  opacity: disabled && !selectedUser.can_edit ? 0.72 : 1,
                                }}
                              >
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{perm.name}</span>
                                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: getRoleTheme(selectedUser.rol).bg, color: getRoleTheme(selectedUser.rol).color, textTransform: "uppercase", letterSpacing: ".05em" }}>
                                      {getRoleTheme(selectedUser.rol).label}
                                    </span>
                                  </div>
                                  <p style={{ margin: "5px 0 0", fontSize: 12, color: "#64748b" }}>
                                    {checked ? "Permiso activo para este usuario." : "Permiso desactivado para este usuario."}
                                  </p>
                                </div>

                                <div style={{ color: checked ? "#059669" : "#94a3b8", display: "flex", alignItems: "center" }}>
                                  {checked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                </div>
                              </button>

                              {(!checked || deadlineValue) ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, background: "rgba(148,163,184,.06)", border: "1px solid rgba(148,163,184,.14)" }}>
                                  <CalendarDays size={14} color="#ef5759" />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Hasta una fecha opcional</div>
                                    <div style={{ fontSize: 11, color: "#64748b" }}>Si eliges una fecha y el permiso queda apagado, se reactivará cuando esa fecha venza.</div>
                                  </div>
                                  <input
                                    type="date"
                                    value={deadlineValue}
                                    onChange={(event) => updatePermissionDeadline(perm.id_permission, event.target.value)}
                                    disabled={disabled}
                                    style={{
                                      border: "1px solid rgba(148,163,184,.24)",
                                      borderRadius: 10,
                                      padding: "8px 10px",
                                      fontFamily: "inherit",
                                      fontSize: 12,
                                      color: "#0f172a",
                                      background: "#fff",
                                    }}
                                  />
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setPermissions(originalPermissions.map((perm) => ({ ...perm })));
                          }}
                          disabled={!selectedUser.can_edit || !hasChanges || saving}
                          style={secondaryButtonStyle}
                        >
                          <ArrowLeft size={15} />
                          Revertir
                        </button>
                        <button
                          type="button"
                          onClick={handlePrepareSave}
                          disabled={!selectedUser.can_edit || !hasChanges || saving}
                          style={primaryButtonStyle}
                        >
                          {saving ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <ArrowRight size={15} />}
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

      <AnimatePresence>
        {showConfirm && selectedUser && pendingPayload ? (
          <ConfirmModal
            usuario={selectedUser}
            summary={pendingPayload.summary}
            isBusy={saving}
            error={confirmError}
            onClose={() => {
              if (saving) return;
              setShowConfirm(false);
              setPendingPayload(null);
              setConfirmError("");
            }}
            onBack={() => {
              if (saving) return;
              setShowConfirm(false);
              setPendingPayload(null);
            }}
            onConfirm={handleConfirmSave}
          />
        ) : null}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminModuleLayout>
  );
}

function ConfirmModal({ usuario, summary, isBusy, error, onClose, onBack, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.60)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        zIndex: 90,
        padding: 18,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="permissions-confirm-title"
        style={{
          width: "min(680px, 100%)",
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,252,255,.98))",
          boxShadow: "0 30px 80px rgba(15,23,42,.28)",
          border: "1px solid rgba(255,255,255,.6)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 20, borderBottom: "1px solid rgba(148,163,184,.16)" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #ef5759, #dc2626)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Lock size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 id="permissions-confirm-title" style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>
              Confirmar cambios de permisos
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              Revisa el resumen antes de guardar. Esta acción quedará registrada.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Cerrar"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "none",
              background: "rgba(148,163,184,.12)",
              color: "#475569",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20, display: "grid", gap: 14 }}>
          <div style={{ padding: 16, borderRadius: 16, background: "rgba(239,87,89,.05)", border: "1px solid rgba(239,87,89,.16)" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#ef5759", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Resumen
            </p>
            <div style={{ marginTop: 12, display: "grid", gap: 8, color: "#0f172a", fontSize: 14 }}>
              <InfoRow label="Usuario" value={getFullName(usuario)} />
              <InfoRow label="Permisos aplicados" value={summary.applied?.length ? summary.applied.join(", ") : "Ninguno"} />
              <InfoRow label="Permisos quitados" value={summary.removed?.length ? summary.removed.join(", ") : "Ninguno"} />
              <InfoRow
                label="Permisos temporales"
                value={summary.temporary?.length ? summary.temporary.map((item) => `${item.name} hasta ${item.deadline}`).join(", ") : "Ninguno"}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={onBack} disabled={isBusy} style={secondaryButtonStyle}>
              Volver
            </button>
            <button type="button" onClick={onConfirm} disabled={isBusy} style={primaryButtonStyle}>
              {isBusy ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <CheckCircle2 size={15} />}
              Guardar permisos
            </button>
          </div>

          {error ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(239,87,89,.07)", border: "1px solid rgba(239,87,89,.18)" }}>
              <AlertTriangle size={14} color="#ef5759" />
              <p style={{ margin: 0, color: "#ef5759", fontSize: 13 }}>{error}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
      <span style={{ color: "#64748b", fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#0f172a", wordBreak: "break-word" }}>{value || "Sin definir"}</span>
    </div>
  );
}

const primaryButtonStyle = {
  padding: "11px 16px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #ef5759 0%, #dc2626 100%)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 6px 18px rgba(239,87,89,.22)",
};

const secondaryButtonStyle = {
  padding: "11px 16px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,.26)",
  background: "#fff",
  color: "#475569",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};
