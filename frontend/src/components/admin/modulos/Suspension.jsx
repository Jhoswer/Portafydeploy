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
import "../../../styles/components/admin/components/Suspencion/Suspencion.css";

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
      const userResult =
        response?.data?.usuario ?? response?.data ?? response?.usuario ?? selectedUser;

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

      setSuccessMessage(buildSummaryMessage(response?.data ?? response, pendingPayload));
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
        <div className="susp-restricted-wrapper">
          <div className="susp-restricted-card">
            <div className="susp-restricted-icon">
              <ShieldAlert size={28} color="#ef5759" />
            </div>
            <h2>Acceso restringido</h2>
            <p>
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
      <div className="susp-layout">
        {/* ── Banner de controles ── */}
        <div className="susp-header-banner">
          <div className="susp-header-banner__title-group">
            <p>Controles criticos</p>
            <h2>Módulo de suspensión</h2>
          </div>
          <div className="susp-header-banner__scope">
            <span className="susp-header-banner__scope-label">{currentScopeLabel}</span>
            <span className="susp-header-banner__scope-hint">{scopeHint}</span>
          </div>
        </div>

        {/* ── Éxito ── */}
        {successMessage ? (
          <div className="susp-success-banner">
            <CheckCircle2 size={18} color="#059669" />
            <div>
              <p className="susp-success-banner__title">Suspensión aplicada correctamente</p>
              <p className="susp-success-banner__text">{successMessage}</p>
            </div>
          </div>
        ) : null}

        {/* ── Búsqueda ── */}
        <div className="susp-search-row">
          <div className={`susp-search-input-wrapper${query ? " susp-search-input-wrapper--active" : ""}`}>
            <Search
              className="susp-search-input-wrapper__icon"
              size={15}
              color={query ? "#ef5759" : "#94a3b8"}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre, apellido o correo..."
            />
            {loading ? (
              <Loader2 size={15} color="#ef5759" className="susp-search-input-wrapper__spinner" />
            ) : null}
            {query && !loading ? (
              <button
                type="button"
                className="susp-search-clear-btn"
                onClick={() => {
                  setQuery("");
                  setUsuarios([]);
                  setSearched(false);
                  setError("");
                }}
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className="susp-search-submit-btn"
            onClick={() => fetchUsuarios(query)}
            disabled={loading}
          >
            <Search size={14} />
            Buscar
          </button>
        </div>

        {/* ── Error de búsqueda ── */}
        {error ? (
          <div className="susp-error-banner">
            <AlertTriangle size={14} color="#ef5759" />
            <p>{error}</p>
          </div>
        ) : null}

        {/* ── Estados y resultados ── */}
        <AnimatePresence mode="wait">
          {!searched && !loading ? (
            <div key="empty" className="susp-empty-state">
              <div className="susp-empty-state__icon susp-empty-state__icon--red">
                <Ban size={28} color="#ef5759" />
              </div>
              <p className="susp-empty-state__title">Busca un usuario a suspender</p>
              <p className="susp-empty-state__subtitle">
                Ingresa un nombre, apellido o correo para revisar si puede ser sancionado.
              </p>
            </div>
          ) : null}

          {searched && !loading && usuarios.length === 0 ? (
            <div key="no-results" className="susp-empty-state">
              <div className="susp-empty-state__icon susp-empty-state__icon--gray">
                <ShieldOff size={28} color="#64748b" />
              </div>
              <p className="susp-empty-state__title">Sin resultados</p>
              <p className="susp-empty-state__subtitle">
                No se encontraron usuarios para <strong>{query}</strong>.
              </p>
            </div>
          ) : null}

          {usuarios.length > 0 ? (
            <div key="results" className="susp-results-list">
              <p className="susp-results-count">
                <strong>{usuarios.length}</strong> resultado{usuarios.length !== 1 ? "s" : ""}
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

      {/* ── Modales ── */}
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
    </AdminModuleLayout>
  );
}

/* ── Tarjeta de usuario ──────────────────────────────────── */
function SuspensionCard({ usuario, onSuspender }) {
  const role = getRoleKey(usuario?.rol);
  const roleStyle = getRoleStyle(role);
  const initials = `${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase();
  const suspendido = !!usuario?.suspendido;
  const canSuspend = !!usuario?.can_suspend;

  const cardClass = [
    "susp-card",
    suspendido ? "susp-card--suspended" : canSuspend ? "susp-card--suspendable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      {/* avatar */}
      <div className="susp-card__avatar-wrapper">
        {usuario?.foto_perfil ? (
          <img
            className="susp-card__avatar-img"
            src={usuario.foto_perfil}
            alt={getFullName(usuario)}
          />
        ) : (
          <div className="susp-card__avatar-initials">
            {initials || <User size={18} />}
          </div>
        )}
        <span
          className="susp-card__role-badge"
          style={{ background: roleStyle.background, color: roleStyle.color }}
        >
          {roleStyle.icon}
        </span>
      </div>

      {/* info */}
      <div className="susp-card__info">
        <div className="susp-card__name-row">
          <span className="susp-card__name">{getFullName(usuario)}</span>
          <span
            className="susp-card__role-pill"
            style={{ background: roleStyle.background, color: roleStyle.color }}
          >
            {roleStyle.label}
          </span>
          {suspendido ? (
            <span className="susp-card__suspended-pill">Suspendido</span>
          ) : null}
        </div>

        <div className="susp-card__meta-row">
          <Mail size={11} color="#94a3b8" />
          <span className="susp-card__meta-text">{usuario?.email ?? "Sin correo"}</span>
          {usuario?.ubicacion ? (
            <>
              <span className="susp-card__meta-sep">•</span>
              <MapPin size={11} color="#94a3b8" />
              <span className="susp-card__meta-text">{usuario.ubicacion}</span>
            </>
          ) : null}
          {usuario?.suspension_status && usuario.suspension_status !== "activo" ? (
            <>
              <span className="susp-card__meta-sep">•</span>
              <CalendarDays size={11} color="#94a3b8" />
              <span className="susp-card__meta-text">
                {usuario.suspension_status === "temporal"
                  ? `Temporal hasta ${formatDate(usuario.suspension_ends_at)}`
                  : "Permanente"}
              </span>
            </>
          ) : null}
        </div>

        <div className="susp-card__footer-row">
          <small className="susp-card__id">ID #{getUserId(usuario)}</small>
          {usuario?.disable_reason ? (
            <small className="susp-card__disable-reason">{usuario.disable_reason}</small>
          ) : null}
        </div>
      </div>

      {/* acción */}
      <div className="susp-card__actions">
        <button
          type="button"
          className={`susp-card__suspend-btn${canSuspend ? " susp-card__suspend-btn--active" : ""}`}
          onClick={() => onSuspender(usuario)}
          disabled={!canSuspend}
        >
          <Ban size={14} />
          {suspendido ? "Ya suspendido" : canSuspend ? "Suspender" : "No disponible"}
        </button>
        <ChevronRight size={16} color={canSuspend ? "#ef5759" : "#cbd5e1"} />
      </div>
    </article>
  );
}

/* ── Modal de formulario ─────────────────────────────────── */
function SuspensionFormModal({ usuario, isBusy, error, onClose, onContinue }) {
  const [tipo, setTipo] = useState(TEMPORARY);
  const [fechaFin, setFechaFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [localError, setLocalError] = useState(() => error || "");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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

  const roleStyle = getRoleStyle(usuario?.rol);

  return (
    <div
      className="susp-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && !isBusy) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspension-form-title"
        className="susp-modal susp-modal--form"
      >
        {/* cabecera */}
        <div className="susp-modal__header">
          <div className="susp-modal__header-icon">
            <ShieldAlert size={20} />
          </div>
          <div className="susp-modal__header-text">
            <h3 id="suspension-form-title" className="susp-modal__header-title">
              Suspender a {getFullName(usuario)}
            </h3>
            <p className="susp-modal__header-subtitle">
              Define el tipo de sancion, la fecha de fin si corresponde y un motivo claro para registrar la accion.
            </p>
          </div>
          <button
            type="button"
            className="susp-modal__close-btn"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* cuerpo */}
        <div className="susp-modal__form-body">
          {/* aside */}
          <aside className="susp-modal__aside">
            <div className="susp-modal__user-info-card">
              <p className="susp-modal__user-info-card__label">Usuario seleccionado</p>
              <div className="susp-modal__user-info-card__content">
                <div className="susp-modal__user-avatar">
                  {`${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase() || (
                    <User size={18} />
                  )}
                </div>
                <div>
                  <div className="susp-modal__user-name">
                    <strong>{getFullName(usuario)}</strong>
                    <span
                      className="susp-card__role-pill"
                      style={{ background: roleStyle.background, color: roleStyle.color }}
                    >
                      {roleStyle.label}
                    </span>
                  </div>
                  <div className="susp-modal__user-meta">
                    <span><Mail size={11} /> {usuario?.email}</span>
                    <span><MapPin size={11} /> {usuario?.ubicacion || "Sin ubicacion"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="susp-modal__rules-card">
              <p className="susp-modal__rules-card__label">Reglas</p>
              <ul>
                <li>El motivo es obligatorio.</li>
                <li>Las suspensiones temporales requieren fecha de fin.</li>
                <li>Los administradores y super administradores no se pueden suspender.</li>
              </ul>
            </div>
          </aside>

          {/* campos */}
          <section className="susp-modal__form-section">
            <Field label="Tipo de sancion" icon={<ShieldAlert size={13} />}>
              <select
                className="susp-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value={TEMPORARY}>Temporal</option>
                <option value={PERMANENT}>Permanente</option>
              </select>
            </Field>

            {tipo === TEMPORARY ? (
              <Field label="Fecha de fin" icon={<CalendarDays size={13} />}>
                <input
                  type="date"
                  className="susp-input"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </Field>
            ) : null}

            <Field label="Motivo" required icon={<Lock size={13} />}>
              <textarea
                className="susp-input susp-textarea"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Explica claramente por qué se aplica la suspensión..."
                rows={6}
              />
            </Field>

            {localError || error ? (
              <div className="susp-modal-error">
                <AlertTriangle size={14} color="#ef5759" />
                <p>{error || localError}</p>
              </div>
            ) : null}

            <div className="susp-modal__btn-row">
              <button type="button" className="susp-btn-ghost" onClick={onClose} disabled={isBusy}>
                Cancelar
              </button>
              <button type="button" className="susp-btn-primary" onClick={submit} disabled={isBusy}>
                {isBusy ? (
                  <Loader2 size={15} className="susp-btn-primary__spinner" />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                Revisar
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Modal de confirmación ───────────────────────────────── */
function SuspensionConfirmModal({ usuario, payload, isBusy, error, onClose, onBack, onConfirm }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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
      className="susp-overlay susp-overlay--confirm"
      onClick={(e) => { if (e.target === e.currentTarget && !isBusy) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspension-confirm-title"
        className="susp-modal susp-modal--confirm"
      >
        {/* cabecera */}
        <div className="susp-modal__header">
          <div className="susp-modal__header-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="susp-modal__header-text">
            <h3 id="suspension-confirm-title" className="susp-modal__header-title">
              Confirmar suspensión
            </h3>
            <p className="susp-modal__header-subtitle">
              Revisa el resumen antes de aplicar la sanción. Esta acción quedará registrada.
            </p>
          </div>
        </div>

        {/* cuerpo */}
        <div className="susp-confirm-body">
          <div className="susp-confirm-summary">
            <p className="susp-confirm-summary__label">Resumen</p>
            <div className="susp-confirm-summary__rows">
              <Row label="Usuario" value={getFullName(usuario)} />
              <Row label="Tipo" value={isTemporal ? "Temporal" : "Permanente"} />
              {isTemporal ? (
                <Row label="Fecha de fin" value={formatDate(payload?.fecha_fin)} />
              ) : null}
              <Row label="Motivo" value={payload?.motivo} />
            </div>
          </div>

          <div className="susp-modal__btn-row susp-modal__btn-row--between">
            <button type="button" className="susp-btn-ghost" onClick={onBack} disabled={isBusy}>
              Volver
            </button>
            <button type="button" className="susp-btn-primary" onClick={onConfirm} disabled={isBusy}>
              {isBusy ? (
                <Loader2 size={15} className="susp-btn-primary__spinner" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              Aplicar suspensión
            </button>
          </div>

          {error ? (
            <div className="susp-modal-error">
              <AlertTriangle size={14} color="#ef5759" />
              <p>{error}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Componentes auxiliares ──────────────────────────────── */
function Field({ label, icon, required = false, children }) {
  return (
    <label className="susp-field">
      <span className="susp-field__label">
        {icon}
        {label}
        {required ? <span className="susp-field__required">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="susp-row">
      <span className="susp-row__label">{label}</span>
      <span className="susp-row__value">{value || "Sin definir"}</span>
    </div>
  );
}