import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Search,
  Shield,
  ShieldAlert,
  ShieldOff,
  User,
  X,
} from "lucide-react";
import AdminModuleLayout from "../components/AdminModuleLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  buscarUsuariosSuspension,
  suspenderUsuario,
} from "../../../services/adminService";

const ROLE_STYLES = {
  "super administrador": {
    label: "Super Admin",
    color: "#7c3aed",
    background: "rgba(124,58,237,.10)",
    icon: <Shield size={11} />,
  },
  administrador: {
    label: "Admin",
    color: "#ef5759",
    background: "rgba(239,87,89,.10)",
    icon: <ShieldAlert size={11} />,
  },
  reclutador: {
    label: "Reclutador",
    color: "#0284c7",
    background: "rgba(2,132,199,.10)",
    icon: <User size={11} />,
  },
  profesional: {
    label: "Profesional",
    color: "#059669",
    background: "rgba(5,150,105,.10)",
    icon: <User size={11} />,
  },
};

const DEFAULT_ROLE_STYLE = {
  label: "Usuario",
  color: "#64748b",
  background: "rgba(100,116,139,.10)",
  icon: <User size={11} />,
};

const TEMPORARY = "temporal";
const PERMANENT = "permanente";

function getUserId(user) {
  return user?.id ?? user?.id_user ?? null;
}

function getFullName(user) {
  return `${user?.nombre ?? user?.name ?? "Usuario"} ${user?.apellido ?? user?.last_name ?? ""}`.trim();
}

function getRoleStyle(role) {
  return ROLE_STYLES[String(role ?? "").toLowerCase()] ?? DEFAULT_ROLE_STYLE;
}

function getRoleKey(role) {
  return String(role ?? "").toLowerCase();
}

function formatDate(value) {
  if (!value) return "Sin definir";

  const date = value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function buildSummaryMessage(result, payload) {
  const user = result?.usuario ?? {};
  const type = payload.tipo === TEMPORARY ? "temporal" : "permanente";
  const until = payload.tipo === TEMPORARY ? ` hasta ${formatDate(payload.fecha_fin)}` : "";

  return `${getFullName(user)} fue suspendido de forma ${type}${until}. Motivo: ${payload.motivo}`;
}

export default function Suspension() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const debounceRef = useRef(null);
  const currentRole = getRoleKey(user?.rol);
  const isSuperAdmin = currentRole === "super administrador";

  const currentScopeLabel = useMemo(() => {
    if (isSuperAdmin) return "Super administrador: acceso total";
    return "Acceso restringido";
  }, [isSuperAdmin]);

  const fetchUsuarios = async (term) => {
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
      const data = await buscarUsuariosSuspension({ query: q });
      setUsuarios(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) {
      setError(err?.message || "No se pudo completar la busqueda.");
      setUsuarios([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsuarios(query);
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const openSuspensionModal = (usuario) => {
    if (!usuario?.can_suspend) return;

    setSelectedUser(usuario);
    setPendingPayload(null);
    setFormError("");
    setConfirmError("");
    setShowConfirm(false);
    setShowForm(true);
  };

  const closeAllModals = () => {
    if (busy) return;
    setShowForm(false);
    setShowConfirm(false);
    setSelectedUser(null);
    setPendingPayload(null);
    setFormError("");
    setConfirmError("");
  };

  const handleContinue = (payload) => {
    setPendingPayload(payload);
    setShowForm(false);
    setShowConfirm(true);
    setConfirmError("");
  };

  const handleConfirm = async () => {
    if (!pendingPayload) return;

    setBusy(true);
    setError("");
    setConfirmError("");
    let succeeded = false;

    try {
      const result = await suspenderUsuario(pendingPayload);
      const response = result?.data ?? result ?? {};
      const userResult = response?.data?.usuario ?? response?.data ?? response?.usuario ?? selectedUser;

      setUsuarios((prev) =>
        prev.map((item) => {
          if (String(getUserId(item)) !== String(getUserId(userResult))) return item;

          return {
            ...item,
            suspendido: true,
            suspension_status: pendingPayload.tipo,
            suspension_type: pendingPayload.tipo,
            suspension_reason: pendingPayload.motivo,
            suspension_ends_at: pendingPayload.tipo === TEMPORARY ? pendingPayload.fecha_fin : null,
            can_suspend: false,
            disable_reason: "Este usuario ya tiene una suspension activa.",
          };
        })
      );

      setSuccessMessage(
        buildSummaryMessage(
          response?.data ?? response,
          pendingPayload
        )
      );
      succeeded = true;
    } catch (err) {
      setConfirmError(err?.message || "No se pudo aplicar la suspension.");
    } finally {
      setBusy(false);
    }

    if (succeeded) {
      setShowConfirm(false);
      setShowForm(false);
      setSelectedUser(null);
      setPendingPayload(null);
    }
  };

  const scopeHint = isSuperAdmin
    ? "Puedes suspender cualquier usuario del sistema."
    : "Este modulo solo esta disponible para super administradores.";

  if (!isSuperAdmin) {
    return (
      <AdminModuleLayout
        title="Suspension"
        subtitle="Administracion de suspensiones de usuarios."
      >
        <div style={{ display: "grid", placeItems: "center", minHeight: "56vh", padding: 24 }}>
          <div style={{ maxWidth: 560, width: "100%", padding: 24, borderRadius: 20, background: "linear-gradient(135deg, rgba(239,87,89,.08), rgba(162,214,249,.10))", border: "1px solid rgba(239,87,89,.16)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 14px", borderRadius: 20, background: "rgba(239,87,89,.12)", display: "grid", placeItems: "center" }}>
              <ShieldAlert size={28} color="#ef5759" />
            </div>
            <h2 style={{ margin: 0, color: "#0f172a", fontSize: 22 }}>Acceso restringido</h2>
            <p style={{ margin: "10px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              Este módulo está reservado únicamente para el super administrador.
              Los administradores normales no pueden suspender usuarios.
            </p>
          </div>
        </div>
      </AdminModuleLayout>
    );
  }

  return (
    <AdminModuleLayout
      title="Suspension"
      subtitle="Busca usuarios y aplica suspensiones temporales o permanentes con control de acceso por ubicacion."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(239,87,89,.09), rgba(162,214,249,.11))",
            border: "1px solid rgba(239,87,89,.14)",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#ef5759", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Controles criticos
            </p>
            <h2 style={{ margin: "4px 0 0", fontSize: 22, lineHeight: 1.1, color: "var(--text-primary, #0f172a)" }}>
              Módulo de suspensión
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "10px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,.75)",
              border: "1px solid rgba(15,23,42,.06)",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{currentScopeLabel}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{scopeHint}</span>
          </div>
        </div>

        {successMessage ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "14px 16px",
              borderRadius: 14,
              background: "rgba(5,150,105,.08)",
              border: "1px solid rgba(5,150,105,.18)",
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#047857" }}>
                Suspensión aplicada correctamente
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#065f46", lineHeight: 1.5 }}>
                {successMessage}
              </p>
            </div>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "var(--card, #fff)",
              border: "1.5px solid",
              borderColor: query ? "rgba(239,87,89,.45)" : "rgba(162,214,249,.45)",
              borderRadius: 14,
              boxShadow: query ? "0 0 0 3px rgba(239,87,89,.08)" : "0 2px 10px rgba(0,0,0,.04)",
              transition: "border-color .2s, box-shadow .2s",
            }}
          >
            <Search size={15} color={query ? "#ef5759" : "#94a3b8"} style={{ marginLeft: 14, flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre, apellido o correo..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 14,
                color: "var(--text, #0f172a)",
                padding: "13px 10px",
                fontFamily: "inherit",
              }}
            />
            {loading ? (
              <Loader2 size={15} color="#ef5759" style={{ marginRight: 12, animation: "spin .8s linear infinite" }} />
            ) : null}
            {query && !loading ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setUsuarios([]);
                  setSearched(false);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginRight: 10,
                  color: "#94a3b8",
                  display: "flex",
                  padding: 4,
                  borderRadius: 6,
                }}
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => fetchUsuarios(query)}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "0 18px",
              background: loading ? "rgba(239,87,89,.5)" : "linear-gradient(135deg, #ef5759 0%, #f87171 100%)",
              border: "none",
              borderRadius: 14,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(239,87,89,.28)",
            }}
          >
            <Search size={14} />
            Buscar
          </button>
        </div>

        {error ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(239,87,89,.07)",
              border: "1px solid rgba(239,87,89,.20)",
            }}
          >
            <AlertTriangle size={14} color="#ef5759" />
            <p style={{ fontSize: 13, color: "#ef5759", margin: 0 }}>{error}</p>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {!searched && !loading ? (
            <div
              key="empty"
              style={{
                textAlign: "center",
                padding: "52px 0",
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.94))",
                border: "1px dashed rgba(148,163,184,.32)",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 20,
                  background: "rgba(239,87,89,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Ban size={28} color="#ef5759" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                Busca un usuario a suspender
              </p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                Ingresa un nombre, apellido o correo para revisar si puede ser sancionado.
              </p>
            </div>
          ) : null}

          {searched && !loading && usuarios.length === 0 ? (
            <div
              key="no-results"
              style={{
                textAlign: "center",
                padding: "52px 0",
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.94))",
                border: "1px dashed rgba(148,163,184,.32)",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 20,
                  background: "rgba(148,163,184,.09)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <ShieldOff size={28} color="#64748b" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                Sin resultados
              </p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                No se encontraron usuarios para <strong>{query}</strong>.
              </p>
            </div>
          ) : null}

          {usuarios.length > 0 ? (
            <div
              key="results"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 2px" }}>
                <strong style={{ color: "#0f172a" }}>{usuarios.length}</strong> resultado{usuarios.length !== 1 ? "s" : ""}
              </p>

              {usuarios.map((usuario, index) => (
                <SuspensionCard
                  key={getUserId(usuario) ?? index}
                  usuario={usuario}
                  onSuspender={openSuspensionModal}
                />
              ))}
            </div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && selectedUser ? (
          <SuspensionFormModal
            usuario={selectedUser}
            isBusy={busy}
            error={formError}
            onClose={closeAllModals}
            onContinue={handleContinue}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && selectedUser && pendingPayload ? (
          <SuspensionConfirmModal
            usuario={selectedUser}
            payload={pendingPayload}
            isBusy={busy}
            error={confirmError}
            onClose={closeAllModals}
            onBack={() => {
              setShowConfirm(false);
              setShowForm(true);
            }}
            onConfirm={handleConfirm}
          />
        ) : null}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminModuleLayout>
  );
}

function SuspensionCard({ usuario, onSuspender }) {
  const role = getRoleKey(usuario?.rol);
  const roleStyle = getRoleStyle(role);
  const initials = `${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase();
  const suspendido = !!usuario?.suspendido;
  const canSuspend = !!usuario?.can_suspend;

  return (
    <article
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "14px 16px",
        borderRadius: 16,
        background: "var(--card, #fff)",
        border: "1.5px solid",
        borderColor: suspendido ? "rgba(148,163,184,.32)" : canSuspend ? "rgba(239,87,89,.24)" : "rgba(148,163,184,.26)",
        boxShadow: "0 2px 10px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        {usuario?.foto_perfil ? (
          <img
            src={usuario.foto_perfil}
            alt={getFullName(usuario)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              objectFit: "cover",
              border: "2px solid rgba(239,87,89,.14)",
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(239,87,89,.14), rgba(162,214,249,.24))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 800,
              color: "#ef5759",
            }}
          >
            {initials || <User size={18} />}
          </div>
        )}

        <span
          style={{
            position: "absolute",
            right: -4,
            bottom: -4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: roleStyle.background,
            color: roleStyle.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg, #f1f5f9)",
          }}
        >
          {roleStyle.icon}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
            {getFullName(usuario)}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 999,
              background: roleStyle.background,
              color: roleStyle.color,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            {roleStyle.label}
          </span>
          {suspendido ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(148,163,184,.12)",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Suspendido
            </span>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
          <Mail size={11} color="#94a3b8" />
          <span style={{ fontSize: 12, color: "#64748b" }}>{usuario?.email ?? "Sin correo"}</span>
          {usuario?.ubicacion ? (
            <>
              <span style={{ color: "#cbd5e1" }}>•</span>
              <MapPin size={11} color="#94a3b8" />
              <span style={{ fontSize: 12, color: "#64748b" }}>{usuario.ubicacion}</span>
            </>
          ) : null}
          {usuario?.suspension_status && usuario.suspension_status !== "activo" ? (
            <>
              <span style={{ color: "#cbd5e1" }}>•</span>
              <CalendarDays size={11} color="#94a3b8" />
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {usuario.suspension_status === "temporal" ? `Temporal hasta ${formatDate(usuario.suspension_ends_at)}` : "Permanente"}
              </span>
            </>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
          <small style={{ color: "#94a3b8" }}>ID #{getUserId(usuario)}</small>
          {usuario?.disable_reason ? (
            <small style={{ color: "#ef5759" }}>{usuario.disable_reason}</small>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => onSuspender(usuario)}
          disabled={!canSuspend}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            cursor: canSuspend ? "pointer" : "not-allowed",
            fontSize: 13,
            fontWeight: 800,
            color: "#fff",
            background: canSuspend ? "linear-gradient(135deg, #ef5759 0%, #f87171 100%)" : "rgba(148,163,184,.55)",
            boxShadow: canSuspend ? "0 6px 18px rgba(239,87,89,.22)" : "none",
          }}
        >
          <Ban size={14} />
          {suspendido ? "Ya suspendido" : canSuspend ? "Suspender" : "No disponible"}
        </button>

        <ChevronRight size={16} color={canSuspend ? "#ef5759" : "#cbd5e1"} />
      </div>
    </article>
  );
}

function SuspensionFormModal({ usuario, isBusy, error, onClose, onContinue }) {
  const [tipo, setTipo] = useState(TEMPORARY);
  const [fechaFin, setFechaFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [localError, setLocalError] = useState(() => error || "");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && !isBusy) onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isBusy, onClose]);

  const submit = () => {
    const motivoNormalizado = normalizeText(motivo);

    if (!motivoNormalizado) {
      setLocalError("El motivo es obligatorio.");
      return;
    }

    if (tipo === TEMPORARY && !fechaFin) {
      setLocalError("La fecha de fin es obligatoria para suspensiones temporales.");
      return;
    }

    setLocalError("");
    onContinue({
      user_id: getUserId(usuario),
      tipo,
      motivo: motivoNormalizado,
      fecha_fin: tipo === TEMPORARY ? fechaFin : null,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.52)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        zIndex: 80,
        padding: 18,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspension-form-title"
        style={{
          width: "min(760px, 100%)",
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,252,255,.98))",
          boxShadow: "0 30px 80px rgba(15,23,42,.28)",
          border: "1px solid rgba(255,255,255,.6)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 20, borderBottom: "1px solid rgba(148,163,184,.16)" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #ef5759, #fb7185)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <ShieldAlert size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <h3 id="suspension-form-title" style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>
              Suspender a {getFullName(usuario)}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              Define el tipo de sancion, la fecha de fin si corresponde y un motivo claro para registrar la accion.
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18, padding: 20 }}>
          <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 16, background: "rgba(239,87,89,.05)", border: "1px solid rgba(239,87,89,.16)" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#ef5759", textTransform: "uppercase", letterSpacing: ".06em" }}>
                Usuario seleccionado
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center" }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg, rgba(239,87,89,.18), rgba(162,214,249,.22))", display: "grid", placeItems: "center", fontWeight: 800, color: "#ef5759" }}>
                  {`${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase() || <User size={18} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <strong style={{ color: "#0f172a" }}>{getFullName(usuario)}</strong>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: getRoleStyle(usuario?.rol).background, color: getRoleStyle(usuario?.rol).color, fontWeight: 800 }}>
                      {getRoleStyle(usuario?.rol).label}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4, color: "#64748b", fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={11} /> {usuario?.email}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={11} /> {usuario?.ubicacion || "Sin ubicacion"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: 16, borderRadius: 16, background: "rgba(2,132,199,.05)", border: "1px solid rgba(2,132,199,.16)" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#0284c7", textTransform: "uppercase", letterSpacing: ".06em" }}>
                Reglas
              </p>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                <li>El motivo es obligatorio.</li>
                <li>Las suspensiones temporales requieren fecha de fin.</li>
                <li>Los administradores y super administradores no se pueden suspender.</li>
              </ul>
            </div>
          </aside>

          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Tipo de sancion" icon={<ShieldAlert size={13} />}>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                style={inputStyle}
              >
                <option value={TEMPORARY}>Temporal</option>
                <option value={PERMANENT}>Permanente</option>
              </select>
            </Field>

            {tipo === TEMPORARY ? (
              <Field label="Fecha de fin" icon={<CalendarDays size={13} />}>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  style={inputStyle}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </Field>
            ) : null}

            <Field label="Motivo" required icon={<Lock size={13} />}>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Explica claramente por qué se aplica la suspensión..."
                rows={6}
                style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
              />
            </Field>

            {localError || error ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(239,87,89,.07)", border: "1px solid rgba(239,87,89,.18)" }}>
                <AlertTriangle size={14} color="#ef5759" />
                <p style={{ margin: 0, color: "#ef5759", fontSize: 13 }}>{error || localError}</p>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 6 }}>
              <button type="button" onClick={onClose} disabled={isBusy} style={ghostButtonStyle}>
                Cancelar
              </button>
              <button type="button" onClick={submit} disabled={isBusy} style={primaryButtonStyle}>
                {isBusy ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <CheckCircle2 size={15} />}
                Revisar
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SuspensionConfirmModal({ usuario, payload, isBusy, error, onClose, onBack, onConfirm }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && !isBusy) onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isBusy, onClose]);

  const isTemporal = payload?.tipo === TEMPORARY;

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
        aria-labelledby="suspension-confirm-title"
        style={{
          width: "min(640px, 100%)",
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,252,255,.98))",
          boxShadow: "0 30px 80px rgba(15,23,42,.28)",
          border: "1px solid rgba(255,255,255,.6)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 20, borderBottom: "1px solid rgba(148,163,184,.16)" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #ef5759, #fb7185)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 id="suspension-confirm-title" style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>
              Confirmar suspensión
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              Revisa el resumen antes de aplicar la sanción. Esta acción quedará registrada.
            </p>
          </div>
        </div>

        <div style={{ padding: 20, display: "grid", gap: 14 }}>
          <div style={{ padding: 16, borderRadius: 16, background: "rgba(239,87,89,.05)", border: "1px solid rgba(239,87,89,.16)" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#ef5759", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Resumen
            </p>
            <div style={{ marginTop: 12, display: "grid", gap: 8, color: "#0f172a", fontSize: 14 }}>
              <Row label="Usuario" value={getFullName(usuario)} />
              <Row label="Tipo" value={isTemporal ? "Temporal" : "Permanente"} />
              {isTemporal ? <Row label="Fecha de fin" value={formatDate(payload?.fecha_fin)} /> : null}
              <Row label="Motivo" value={payload?.motivo} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={onBack} disabled={isBusy} style={ghostButtonStyle}>
              Volver
            </button>
            <button type="button" onClick={onConfirm} disabled={isBusy} style={primaryButtonStyle}>
              {isBusy ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <CheckCircle2 size={15} />}
              Aplicar suspensión
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

function Field({ label, icon, required = false, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        {label}
        {required ? <span style={{ color: "#ef5759" }}>*</span> : null}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12 }}>
      <span style={{ color: "#64748b", fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#0f172a", wordBreak: "break-word" }}>{value || "Sin definir"}</span>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,.28)",
  background: "#fff",
  padding: "11px 13px",
  fontSize: 14,
  color: "#0f172a",
  fontFamily: "inherit",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
};

const ghostButtonStyle = {
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

const primaryButtonStyle = {
  padding: "11px 16px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #ef5759 0%, #f87171 100%)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 6px 18px rgba(239,87,89,.22)",
};
