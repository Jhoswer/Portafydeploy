import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X, AlertTriangle, User, Calendar, Tag, FileText, Link,
  Trash2, XCircle, CornerUpRight, ExternalLink, Clock, Zap,
} from "lucide-react";
import "../../../../styles/components/admin/components/Report/ReportOpen.css";
import ReportActionModal from "./ReportActionModal";
import ReportRedirected from "./ReportRedirected";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
function getToken() { return localStorage.getItem("token") ?? ""; }

async function fetchReportContext(reportId) {
  const res = await fetch(`${API_BASE}/reports/${reportId}/context`, {
    headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("contextError");
  return res.json();
}

function ProfileStats({ label, stats, loading, error }) {
  const { t } = useTranslation();
  const o = "adminReports.open";
  return (
    <div className="ro-detail-card">
      <div className="ro-detail-card__title">{label}</div>
      {loading && <p className="ro-section__empty">{t(`${o}.historyLoading`)}</p>}
      {!loading && error && <p className="ro-section__empty ro-section__empty--error">{error}</p>}
      {!loading && !error && stats && (
        <ul className="ro-history-list">
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--gray" />
            <span className="ro-history-item__bd">
              {t(`${o}.historyTotal`)} <strong>{stats.total}</strong>
            </span>
          </li>
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--green" />
            <span className="ro-history-item__bd">
              {t(`${o}.historyAcceptedAgainst`)} <strong>{stats.accepted_against}</strong>
            </span>
          </li>
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--red" />
            <span className="ro-history-item__bd">
              {t(`${o}.historyRejected`)} <strong>{stats.rejected}</strong>
            </span>
          </li>
          <li className="ro-history-item">
            <span className="ro-history-item__dot ro-history-item__dot--orange" />
            <span className="ro-history-item__bd">
              {t(`${o}.historyAccepted`)} <strong>{stats.accepted}</strong>
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}

export default function ReportOpen({
  report, onClose, onDelete, onIgnore, onAccept, onInProgress, onRedirect,
}) {
  const { t } = useTranslation();
  const o = "adminReports.open";

  const [showActionModal,   setShowActionModal]   = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [ignoreBusy,        setIgnoreBusy]        = useState(false);
  const [redirectBusy,      setRedirectBusy]      = useState(false);
  const [redirectError,     setRedirectError]     = useState("");
  const [context,           setContext]           = useState(null);
  const [contextLoading,    setContextLoading]    = useState(true);
  const [contextError,      setContextError]      = useState("");
  const [reporterImageFailed, setReporterImageFailed] = useState(false);
  const [reportedImageFailed, setReportedImageFailed] = useState(false);

  useEffect(() => {
    if (!report) return;
    setContextLoading(true); setContextError("");
    fetchReportContext(report.id)
      .then(setContext)
      .catch((e) => setContextError(e.message === "contextError"
        ? t(`${o}.contextError`) : e.message))
      .finally(() => setContextLoading(false));
  }, [report?.id]);

  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!report) return null;

  const { meta, reported_user, reporter_user, refType, description, formattedDate, id, tests_url } = report;

  const reporterPhoto = typeof reporter_user?.photo === "string" ? reporter_user.photo.trim() : "";
  const reportedPhoto = typeof reported_user?.photo === "string" ? reported_user.photo.trim() : "";
  const reporterName = reporter_user.name || t(`${o}.reporterUserFallback`, { defaultValue: "Usuario" });
  const reportedName = reported_user.name || t(`${o}.reportedUserFallback`, { defaultValue: "Usuario reportado" });
  const motivoLabel = t(meta.labelKey);
  const badgeLabel = t(meta.badgeKey);
  const showReporterPhoto = Boolean(reporterPhoto) && !reporterImageFailed;
  const showReportedPhoto = Boolean(reportedPhoto) && !reportedImageFailed;

  const handleIgnore = async () => {
    setIgnoreBusy(true);
    try { const handled = await onIgnore?.(report); if (handled) onClose?.(); }
    finally { setIgnoreBusy(false); }
  };

  const handleAcceptSuccess = async (payload) => {
    const handled = await onAccept?.(report, payload);
    if (handled) { setShowActionModal(false); onClose?.(); return true; }
    return false;
  };

  const handleRedirectConfirm = async () => {
    setRedirectBusy(true); setRedirectError("");
    try {
      const handled = await onRedirect?.(report);
      if (handled) { setShowRedirectModal(false); onClose?.(); }
    } catch (requestError) {
      setRedirectError(requestError?.message || t(`${o}.contextError`));
    } finally { setRedirectBusy(false); }
  };

  const statusBadge = contextLoading
    ? { label: t(`${o}.statusLoading`), cls: "rp-badge--gray" }
    : contextError
    ? { label: t(`${o}.statusError`),   cls: "rp-badge--gray" }
    : context?.is_open
    ? { label: t(`${o}.statusOpen`),    cls: "rp-badge--open" }
    : { label: badgeLabel,              cls: meta.badgeClass   };

  return (
    <div className="ro-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-label={t(`${o}.ariaLabel`)}>
      <div className="ro-modal">

        {/* Header */}
        <div className="ro-header">
          <div className="ro-header__left">
            <div className={`ro-header__avatar ${meta.avatarClass}`}>
              {showReporterPhoto ? (
                <img src={reporterPhoto} alt={reporterName}
                  className="ro-card__avatar-img" onError={() => setReporterImageFailed(true)} />
              ) : reporter_user.initials}
            </div>
            <div>
              <h2 className="ro-header__title">
                {t(`${o}.reportMadeBy`)} {reporterName}
              </h2>
              <p className="ro-header__subtitle">
                {motivoLabel} · #{id}
              </p>
            </div>
          </div>
          <button className="ro-close-btn" onClick={onClose} aria-label={t(`${o}.btnClose`)}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ro-body">
          <div className="ro-main">

            <section className="ro-section">
              <div className="ro-section__label">
                <User size={14} /> {t(`${o}.reportedUser`)}
              </div>
              <div className="ro-user-card">
                <div className={`ro-user-card__avatar ${meta.avatarClass}`}>
                  {showReportedPhoto ? (
                    <img src={reportedPhoto} alt={reportedName}
                      className="ro-card__avatar-img" onError={() => setReportedImageFailed(true)} />
                  ) : reported_user.initials}
                </div>
                <div className="ro-user-card__info">
                  <span className="ro-user-card__name">{reportedName}</span>
                  <span className="ro-user-card__id">{t(`${o}.profileId`)} {report.id_reported_user}</span>
                </div>
                <a href={`/profile/${report.id_reported_user}`} target="_blank"
                  rel="noopener noreferrer" className="ro-profile-link">
                  <ExternalLink size={13} /> {t(`${o}.viewProfile`)}
                </a>
              </div>
            </section>

            <section className="ro-section">
              <div className="ro-section__label">
                <AlertTriangle size={14} /> {t(`${o}.reportedBy`)}
              </div>
              <div className="ro-user-card ro-user-card--reporter">
                <div className="ro-user-card__avatar ro-user-card__avatar--reporter">
                  {showReporterPhoto ? (
                    <img src={reporterPhoto} alt={reporterName}
                      className="ro-card__avatar-img" onError={() => setReporterImageFailed(true)} />
                  ) : reporter_user.initials}
                </div>
                <div className="ro-user-card__info">
                  <span className="ro-user-card__name">{reporterName}</span>
                  <span className="ro-user-card__id">{t(`${o}.profileId`)} {report.id_profile}</span>
                </div>
              </div>
            </section>

            <section className="ro-section">
              <div className="ro-section__label">
                <FileText size={14} /> {t(`${o}.descriptionLabel`)}
              </div>
              <p className="ro-section__text">{description}</p>
            </section>

            <section className="ro-section">
              <div className="ro-section__label">
                <Link size={14} /> {t(`${o}.evidenceLabel`)}
              </div>
              {tests_url ? (
                <a href={tests_url} target="_blank" rel="noopener noreferrer" className="ro-evidence-link">
                  <ExternalLink size={13} /> {tests_url}
                </a>
              ) : (
                <p className="ro-section__empty">{t(`${o}.noEvidence`)}</p>
              )}
            </section>
          </div>

          {/* Aside */}
          <aside className="ro-aside">
            <div className="ro-detail-card">
              <div className="ro-detail-card__title">{t(`${o}.details`)}</div>
              <div className="ro-detail-row">
                <Tag size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">{t(`${o}.detailType`)}</span>
                <span className="ro-detail-row__value">{refType}</span>
              </div>
              <div className="ro-detail-row">
                <AlertTriangle size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">{t(`${o}.detailReason`)}</span>
                <span className="ro-detail-row__value">{motivoLabel}</span>
              </div>
              <div className="ro-detail-row">
                <Clock size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">{t(`${o}.detailStatus`)}</span>
                <span className={`rp-badge ${statusBadge.cls}`}>{statusBadge.label}</span>
              </div>
              <div className="ro-detail-row">
                <Calendar size={13} className="ro-detail-row__icon" />
                <span className="ro-detail-row__label">{t(`${o}.detailDate`)}</span>
                <span className="ro-detail-row__value">{formattedDate}</span>
              </div>
            </div>

            <ProfileStats
              label={`${t(`${o}.historyOf`)} ${reportedName}`}
              stats={context?.reporter_stats}
              loading={contextLoading} error={contextError}
            />
            <ProfileStats
              label={`${t(`${o}.historyOf`)} ${reporterName}`}
              stats={context?.reported_stats}
              loading={contextLoading} error={contextError}
            />
          </aside>
        </div>

        {/* Footer */}
        <div className="ro-footer">
          <div className="ro-footer__left">
            <button className="ro-action-btn ro-action-btn--delete" onClick={() => onDelete?.(report)}>
              <Trash2 size={15} /> {t(`${o}.btnDelete`)}
            </button>
            <button className="ro-action-btn ro-action-btn--ignore"
              onClick={handleIgnore} disabled={ignoreBusy}>
              <XCircle size={15} /> {ignoreBusy ? t(`${o}.processing`) : t(`${o}.btnIgnore`)}
            </button>
          </div>
          <div className="ro-footer__right">
            <button className="ro-action-btn ro-action-btn--inprogress"
              onClick={() => setShowActionModal(true)}>
              <Zap size={15} /> {t(`${o}.btnAction`)}
            </button>
            <button className="ro-action-btn ro-action-btn--redirect"
              onClick={() => { setRedirectError(""); setShowRedirectModal(true); }}
              disabled={redirectBusy}>
              <CornerUpRight size={15} />
              {redirectBusy ? t(`${o}.processing`) : t(`${o}.btnRedirect`)}
            </button>
            <button className="ro-action-btn ro-action-btn--close" onClick={onClose}>
              <X size={15} /> {t(`${o}.btnClose`)}
            </button>
          </div>
        </div>

        <ReportActionModal
          report={report} isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          onAccept={handleAcceptSuccess}
        />
        <ReportRedirected
          report={report} isOpen={showRedirectModal}
          isBusy={redirectBusy} error={redirectError}
          onClose={() => setShowRedirectModal(false)}
          onConfirm={handleRedirectConfirm}
        />
      </div>
    </div>
  );
}
