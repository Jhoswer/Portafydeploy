import { useEffect, useState } from "react";
import {
  X,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  FileText,
  Link,
  Trash2,
  XCircle,
  CornerUpRight,
  ExternalLink,
  Clock,
  Zap,
} from "lucide-react";
import "../../../../styles/components/admin/components/Report/ReportOpen.css";

import ReportActionModal from "./ReportActionModal";
import ReportRedirected from "./ReportRedirected";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

function getToken() {
  return localStorage.getItem("token") ?? "";
}

async function fetchReportContext(reportId) {
  const res = await fetch(`${API_BASE}/reports/${reportId}/context`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("No se pudo cargar el contexto del reporte.");
  return res.json();
}

function ProfileStats({ label, stats, loading, error }) {
  return (
    <div className="ro-detail-card">
      <div className="ro-detail-card__title">{label}</div>

      {loading && (
        <p className="ro-section__empty">Cargando historial…</p>
      )}

      {!loading && error && (
        <p className="ro-section__empty ro-section__empty--error">{error}</p>
      )}

      {!loading && !error && stats && (
        <ul className="ro-history-list">
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--gray" />
            <span className="ro-history-item__bd">
              Reportes realizados: <strong>{stats.total}</strong>
            </span>
          </li>
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--green" />
            <span className="ro-history-item__bd">
              Reportes aceptados: <strong>{stats.accepted_against}</strong>
            </span>
          </li>
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--red" />
            <span className="ro-history-item__bd">
              Reportes rechazados: <strong>{stats.rejected}</strong>
            </span>
          </li>
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--orange" />
            <span className="ro-history-item__bd">
              Reportes aceptados en contra: <strong>{stats.accepted}</strong>
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}

export default function ReportOpen({
  report,
  onClose,
  onDelete,
  onIgnore,
  onAccept,
  onInProgress,
  onRedirect,
}) {
  // ── TODOS los hooks van primero, sin excepción ──────────────────────────────
  const [showActionModal,   setShowActionModal]   = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [ignoreBusy,        setIgnoreBusy]        = useState(false);
  const [redirectBusy,      setRedirectBusy]      = useState(false);
  const [redirectError,     setRedirectError]     = useState("");
  const [context,           setContext]           = useState(null);
  const [contextLoading,    setContextLoading]    = useState(true);
  const [contextError,      setContextError]      = useState("");

  useEffect(() => {
    if (!report) return;
    setContextLoading(true);
    setContextError("");
    fetchReportContext(report.id)
      .then(setContext)
      .catch((e) => setContextError(e.message))
      .finally(() => setContextLoading(false));
  }, [report?.id]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Early return DESPUÉS de los hooks ──────────────────────────────────────
  if (!report) return null;

  const {
    meta,
    reported_user,
    reporter_user,
    refType,
    description,
    formattedDate,
    id,
    tests_url,
  } = report;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleIgnore = async () => {
    setIgnoreBusy(true);
    try {
      const handled = await onIgnore?.(report);
      if (handled) onClose?.();
    } finally {
      setIgnoreBusy(false);
    }
  };

  const handleAcceptSuccess = async (payload) => {
    const handled = await onAccept?.(report, payload);
    if (handled) {
      setShowActionModal(false);
      onClose?.();
      return true;
    }
    return false;
  };

  const handleRedirectConfirm = async () => {
    setRedirectBusy(true);
    setRedirectError("");
    try {
      const handled = await onRedirect?.(report);
      if (handled) {
        setShowRedirectModal(false);
        onClose?.();
      }
    } catch (requestError) {
      setRedirectError(requestError?.message || "No se pudo redirigir el reporte.");
    } finally {
      setRedirectBusy(false);
    }
  };

  // ── Badge de Estado dinámico ───────────────────────────────────────────────
  const statusBadge = contextLoading
    ? { label: "Cargando…", cls: "rp-badge--gray"  }
    : contextError
    ? { label: "Error",     cls: "rp-badge--gray"  }
    : context?.is_open
    ? { label: "Abierto",   cls: "rp-badge--open"  }
    : { label: meta.badge,  cls: meta.badgeClass   };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="ro-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del reporte"
    >
      <div className="ro-modal">

        {/* Header */}
        <div className="ro-header">
          <div className="ro-header__left">
            <div className={`ro-header__avatar ${meta.avatarClass}`}>
              {reported_user.initials}
            </div>
            <div>
              <h2 className="ro-header__title">
                Reporte hecho por {reported_user.name}
              </h2>
              <p className="ro-header__subtitle">
                {meta.label} · Reporte #{id}
              </p>
            </div>
          </div>
          <button className="ro-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ro-body">
          <div className="ro-main">

            <section className="ro-section">
              <div className="ro-section__label">
                <User size={14} /> Usuario reportado
              </div>
              <div className="ro-user-card">
                <div className={`ro-user-card__avatar ${meta.avatarClass}`}>
                  {reporter_user.initials}
                </div>
                <div className="ro-user-card__info">
                  <span className="ro-user-card__name">{reporter_user.name}</span>
                  <span className="ro-user-card__id">ID de usuario: {report.id_profile}</span>
                </div>
                <a
                  href={`/profile/${report.id_profile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ro-profile-link"
                >
                  <ExternalLink size={13} /> Ver perfil
                </a>
              </div>
            </section>

            <section className="ro-section">
              <div className="ro-section__label">
                <AlertTriangle size={14} /> Reportado por
              </div>
              <div className="ro-user-card ro-user-card--reporter">
                <div className="ro-user-card__avatar ro-user-card__avatar--reporter">
                  {reported_user.initials}
                </div>
                <div className="ro-user-card__info">
                  <span className="ro-user-card__name">{reported_user.name}</span>
                  <span className="ro-user-card__id">ID de perfil: {report.id_reported_user}</span>
                </div>
              </div>
            </section>

            <section className="ro-section">
              <div className="ro-section__label">
                <FileText size={14} /> Descripcion del reporte
              </div>
              <p className="ro-section__text">{description}</p>
            </section>

            <section className="ro-section">
              <div className="ro-section__label">
                <Link size={14} /> Pruebas
              </div>
              {tests_url ? (
                <a
                  href={tests_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ro-evidence-link"
                >
                  <ExternalLink size={13} /> {tests_url}
                </a>
              ) : (
                <p className="ro-section__empty">Sin pruebas adjuntas.</p>
              )}
            </section>

          </div>

          {/* Aside */}
          <aside className="ro-aside">

            <div className="ro-detail-card">
              <div className="ro-detail-card__title">Detalles</div>

              <div className="ro-detail-row">
                <Tag size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">Tipo</span>
                <span className="ro-detail-row__value">{refType}</span>
              </div>
              <div className="ro-detail-row">
                <AlertTriangle size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">Motivo</span>
                <span className="ro-detail-row__value">{meta.label}</span>
              </div>
              <div className="ro-detail-row">
                <Clock size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">Estado</span>
                <span className={`rp-badge ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
              </div>
              <div className="ro-detail-row">
                <Calendar size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">Fecha</span>
                <span className="ro-detail-row__value">{formattedDate}</span>
              </div>
            </div>

            <ProfileStats
              label={`Historial de ${reporter_user.name}`}
              stats={context?.reporter_stats}
              loading={contextLoading}
              error={contextError}
            />

            <ProfileStats
              label={`Historial de ${reported_user.name}`}
              stats={context?.reported_stats}
              loading={contextLoading}
              error={contextError}
            />

          </aside>
        </div>

        {/* Footer */}
        <div className="ro-footer">
          <div className="ro-footer__left">
            <button
              className="ro-action-btn ro-action-btn--delete"
              onClick={() => onDelete?.(report)}
            >
              <Trash2 size={15} /> Eliminar
            </button>
            <button
              className="ro-action-btn ro-action-btn--ignore"
              onClick={handleIgnore}
              disabled={ignoreBusy}
            >
              <XCircle size={15} /> {ignoreBusy ? "Procesando..." : "Ignorar"}
            </button>
          </div>

          <div className="ro-footer__right">
            <button
              className="ro-action-btn ro-action-btn--inprogress"
              onClick={() => setShowActionModal(true)}
            >
              <Zap size={15} /> Accion
            </button>
            <button
              className="ro-action-btn ro-action-btn--redirect"
              onClick={() => { setRedirectError(""); setShowRedirectModal(true); }}
              disabled={redirectBusy}
            >
              <CornerUpRight size={15} /> {redirectBusy ? "Procesando..." : "Redirigir"}
            </button>
            <button
              className="ro-action-btn ro-action-btn--close"
              onClick={onClose}
            >
              <X size={15} /> Cerrar
            </button>
          </div>
        </div>

        <ReportActionModal
          report={report}
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          onAccept={handleAcceptSuccess}
        />

        <ReportRedirected
          report={report}
          isOpen={showRedirectModal}
          isBusy={redirectBusy}
          error={redirectError}
          onClose={() => setShowRedirectModal(false)}
          onConfirm={handleRedirectConfirm}
        />

      </div>
    </div>
  );
}