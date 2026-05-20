import { useEffect, useState } from "react";
import {
  X,
  User,
  Calendar,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  MessageCircle,
  Clock,
  ShieldCheck,
  Loader,
  AlertCircle,
} from "lucide-react";
import "../../../../styles/components/admin/components/Sugerencias/SugerenciaOpen.css";

import SugerenciaAceptModal    from "./SugerenciaAceptModal";
import SugerenciaDeleteModal   from "./SugerenciaDeleteModal";
import SugerenciaRedirectedModal from "./SugerenciaRedirectedModal";

import { fetchSuggestionContext } from "../../../../services/sugerenciaService";
/* ══════════════════════════════════════════════════════
   Sub-componente: Avatar con foto o iniciales coloreadas
══════════════════════════════════════════════════════ */
function PostulantAvatar({ photo, initials, avatarClass, size = 40 }) {
  const [imgError, setImgError] = useState(false);
  const style = { width: size, height: size, borderRadius: "50%", flexShrink: 0 };

  if (photo && !imgError) {
    return (
      <div style={{ ...style, overflow: "hidden" }}>
        <img
          src={photo}
          alt={initials}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`so-header__avatar ${avatarClass}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Badge de estado ATTENDED
══════════════════════════════════════════════════════ */
const STATE_BADGE = {
  pending:       { label: "Pendiente",     cls: "badge--abierto"  },
  accepted:      { label: "Aceptada",      cls: "badge--success"  },
  rejected:      { label: "Rechazada",     cls: "badge--critico"  },
  in_discussion: { label: "En discusión",  cls: "badge--blue"     },
  higher:        { label: "Escalada",      cls: "badge--purple"   },
  ignored:       { label: "Ignorada",      cls: "badge--pendiente"},
};

function AttendedBadge({ state }) {
  const cfg = STATE_BADGE[state] ?? STATE_BADGE.pending;
  return <span className={`rp-badge ${cfg.cls}`}>{cfg.label}</span>;
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export default function SugerenciaOpen({
  sugerencia,
  onClose,
  onAccept,
  onReject,
  onEscalate,
  onIgnore,
  actionBusy,
}) {
  if (!sugerencia) return null;

  const { meta, postulant, description, formattedDate, id } = sugerencia;

  /* ── Estado local ── */
  const [note,           setNote]           = useState("");
  const [context,        setContext]        = useState(null);
  const [ctxLoading,     setCtxLoading]     = useState(true);
  const [ctxError,       setCtxError]       = useState("");

  const [showAcceptModal,   setShowAcceptModal]   = useState(false);
  const [showRejectModal,   setShowRejectModal]   = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const [actionError, setActionError] = useState("");
  const [busy,        setBusy]        = useState(false);

  /* ── Cargar contexto al montar ── */
  useEffect(() => {
    let cancelled = false;
    setCtxLoading(true);
    setCtxError("");

    fetchSuggestionContext(id)
      .then((data) => { if (!cancelled) setContext(data); })
      .catch((err) => { if (!cancelled) setCtxError(err?.message || "Error al cargar contexto."); })
      .finally(() => { if (!cancelled) setCtxLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  /* ── Escape ── */
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  /* ── Scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

// ── Acción: Ignorar ──
async function handleIgnore() {
  setBusy(true);
  setActionError("");
  try {
    await onIgnore?.(sugerencia, note); // ← delega con note, sin llamar al API aquí
  } catch (e) {
    setActionError(e?.message || "Error al ignorar.");
    setBusy(false);
  }
}

// ── Acción: Aceptar ──
async function handleConfirmAccept() {
  setBusy(true);
  setActionError("");
  try {
    setShowAcceptModal(false);
    await onAccept?.(sugerencia, note); // ← delega con note
  } catch (e) {
    setActionError(e?.message || "Error al aceptar.");
  } finally {
    setBusy(false);
  }
}

// ── Acción: Rechazar ──
async function handleConfirmReject() {
  setBusy(true);
  setActionError("");
  try {
    setShowRejectModal(false);
    await onReject?.(sugerencia, note); // ← delega con note
  } catch (e) {
    setActionError(e?.message || "Error al rechazar.");
  } finally {
    setBusy(false);
  }
}

// ── Acción: Escalar ──
async function handleConfirmEscalate() {
  setBusy(true);
  setActionError("");
  try {
    setShowEscalateModal(false);
    await onEscalate?.(sugerencia, note); // ← delega con note
  } catch (e) {
    setActionError(e?.message || "Error al escalar.");
  } finally {
    setBusy(false);
  }
}

  /* ── Datos del contexto ── */
  const attended         = context?.attended         ?? null;
  const postulantHistory = context?.postulant_history ?? null;

  return (
    <>
      <div
        className="so-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de sugerencia"
      >
        <div className="so-modal">

          {/* ══════════════════════════════════════
              CABECERA
          ══════════════════════════════════════ */}
          <div className="so-header">
            <div className="so-header__left">
              <PostulantAvatar
                photo={postulant.photo}
                initials={postulant.initials}
                avatarClass={meta.avatarClass}
                size={42}
              />
              <div>
                <h2 className="so-header__title">
                  Sugerencia de <span className="so-header__name">{postulant.name}</span>
                </h2>
                <p className="so-header__subtitle">
                  {meta.label}
                  <span className="so-header__dot">·</span>
                  Sugerencia #{id}
                  <span className="so-header__dot">·</span>
                  {ctxLoading
                    ? <span className="so-loading-inline">cargando estado...</span>
                    : <AttendedBadge state={attended?.state ?? "pending"} />
                  }
                </p>
              </div>
            </div>

            <button className="so-close-btn" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>

          {/* ══════════════════════════════════════
              CUERPO — 2 columnas
          ══════════════════════════════════════ */}
          <div className="so-body">

            {/* ── Columna principal ── */}
            <div className="so-main">

              {/* 1. Usuario que sugiere */}
              <section className="so-section">
                <div className="so-section__label">
                  <User size={14} /> Usuario que sugiere
                </div>
                <div className="so-user-card">
                  <PostulantAvatar
                    photo={postulant.photo}
                    initials={postulant.initials}
                    avatarClass={meta.avatarClass}
                    size={34}
                  />
                  <div className="so-user-card__info">
                    <span className="so-user-card__name">{postulant.name}</span>
                    <span className="so-user-card__id">ID de perfil: {postulant.id ?? "—"}</span>
                  </div>
                </div>
              </section>

              {/* 2. Descripción */}
              <section className="so-section">
                <div className="so-section__label">
                  <FileText size={14} /> Descripción de la sugerencia
                </div>
                <p className="so-section__text">{description}</p>
              </section>

              {/* 3. Nota del administrador */}
              <section className="so-section">
                <div className="so-section__label">
                  <MessageCircle size={14} /> Nota del administrador
                </div>
                <textarea
                  className="so-section__textarea"
                  placeholder="Escribe el motivo de la decisión tomada (se adjuntará a la acción)..."
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </section>

              {/* Error de acción */}
              {actionError && (
                <div className="so-action-error">
                  <AlertCircle size={14} /> {actionError}
                </div>
              )}

            </div>

            {/* ── Columna lateral ── */}
            <aside className="so-aside">

              {/* Detalles */}
              <div className="so-detail-card">
                <div className="so-detail-card__title">Detalles</div>

                <div className="so-detail-row">
                  <Tag size={13} className="so-detail-row__icon" />
                  <span className="so-detail-row__label">Tipo</span>
                  <span className={`rp-badge ${meta.badgeClass}`}>{meta.badge}</span>
                </div>

                <div className="so-detail-row">
                  <Clock size={13} className="so-detail-row__icon" />
                  <span className="so-detail-row__label">Estado</span>
                  {ctxLoading
                    ? <span className="so-skeleton so-skeleton--sm" />
                    : <AttendedBadge state={attended?.state ?? "pending"} />
                  }
                </div>

                <div className="so-detail-row">
                  <Calendar size={13} className="so-detail-row__icon" />
                  <span className="so-detail-row__label">Fecha</span>
                  <span className="so-detail-row__value">{formattedDate}</span>
                </div>
              </div>

              {/* Historial del usuario */}
              <div className="so-detail-card">
                <div className="so-detail-card__title">
                  Historial de {postulant.name}
                </div>

                {ctxLoading ? (
                  <div className="so-skeleton-wrap">
                    <span className="so-skeleton" />
                    <span className="so-skeleton" />
                    <span className="so-skeleton" />
                  </div>
                ) : ctxError ? (
                  <p className="so-detail-card__hint so-detail-card__hint--error">
                    No se pudo cargar el historial.
                  </p>
                ) : (
                  <>
                    <div className="so-history-stat">
                      <span className="so-history-stat__dot so-history-stat__dot--blue" />
                      <span className="so-history-stat__label">Sugerencias activas</span>
                      <span className="so-history-stat__value">
                        {postulantHistory?.total_activas ?? 0}
                      </span>
                    </div>
                    <div className="so-history-stat">
                      <span className="so-history-stat__dot so-history-stat__dot--amber" />
                      <span className="so-history-stat__label">En discusión</span>
                      <span className="so-history-stat__value">
                        {postulantHistory?.in_discussion ?? 0}
                      </span>
                    </div>
                    <div className="so-history-stat">
                      <span className="so-history-stat__dot so-history-stat__dot--purple" />
                      <span className="so-history-stat__label">Escaladas</span>
                      <span className="so-history-stat__value">
                        {postulantHistory?.escaladas ?? 0}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Registro de atención */}
              <div className="so-detail-card so-detail-card--info">
                <div className="so-detail-card__title">
                  <ShieldCheck size={13} /> Registro de atención
                </div>

                {ctxLoading ? (
                  <div className="so-skeleton-wrap">
                    <span className="so-skeleton" />
                    <span className="so-skeleton so-skeleton--short" />
                  </div>
                ) : ctxError ? (
                  <p className="so-detail-card__hint so-detail-card__hint--error">
                    No disponible.
                  </p>
                ) : !attended?.exists ? (
                  <p className="so-detail-card__hint">
                    Esta sugerencia nunca ha sido atendida.
                  </p>
                ) : (
                  <>
                    <p className="so-detail-card__hint">
                      Atendida por{" "}
                      <strong>{attended.admin?.name ?? "Administrador desconocido"}</strong>
                    </p>
                    <div className="so-detail-row so-detail-row--sm">
                      <Calendar size={12} className="so-detail-row__icon" />
                      <span className="so-detail-row__label">Creación</span>
                      <span className="so-detail-row__value">{attended.created_at ?? "—"}</span>
                    </div>
                    <div className="so-detail-row so-detail-row--sm">
                      <Calendar size={12} className="so-detail-row__icon" />
                      <span className="so-detail-row__label">Modificación</span>
                      <span className="so-detail-row__value">{attended.updated_at ?? "—"}</span>
                    </div>
                    {attended.note && (
                      <p className="so-detail-card__note">
                        "{attended.note}"
                      </p>
                    )}
                  </>
                )}
              </div>

            </aside>
          </div>

          {/* ══════════════════════════════════════
              FOOTER
          ══════════════════════════════════════ */}
          <div className="so-footer">

            <div className="so-footer__left">
              <button
                className="so-action-btn so-action-btn--reject"
                onClick={() => { setActionError(""); setShowRejectModal(true); }}
                disabled={busy}
              >
                <XCircle size={15} /> Rechazar
              </button>

              <button
                className="so-action-btn so-action-btn--ignore"
                onClick={handleIgnore}
                disabled={busy}
              >
                {busy ? <Loader size={14} className="so-spin" /> : null}
                Ignorar
              </button>
            </div>

            <div className="so-footer__right">
              <button
                className="so-action-btn so-action-btn--accept"
                onClick={() => { setActionError(""); setShowAcceptModal(true); }}
                disabled={busy}
              >
                <CheckCircle size={15} /> Aceptar
              </button>

              <button
                className="so-action-btn so-action-btn--escalate"
                onClick={() => { setActionError(""); setShowEscalateModal(true); }}
                disabled={busy}
              >
                <ArrowUpCircle size={15} /> Escalar
              </button>

              <button
                className="so-action-btn so-action-btn--close"
                onClick={onClose}
              >
                <X size={15} /> Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MODALES DE CONFIRMACIÓN
      ══════════════════════════════════════ */}

      <SugerenciaAceptModal
        sugerencia={sugerencia}
        isOpen={showAcceptModal}
        isBusy={busy}
        error={actionError}
        onClose={() => setShowAcceptModal(false)}
        onBack={() => setShowAcceptModal(false)}
        onConfirm={handleConfirmAccept}
      />

      <SugerenciaDeleteModal
        sugerencia={sugerencia}
        isOpen={showRejectModal}
        isBusy={busy}
        error={actionError}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
      />

      <SugerenciaRedirectedModal
        sugerencia={sugerencia}
        isOpen={showEscalateModal}
        isBusy={busy}
        error={actionError}
        onClose={() => setShowEscalateModal(false)}
        onConfirm={handleConfirmEscalate}
      />
    </>
  );
}