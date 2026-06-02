import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Trash2, XCircle } from "lucide-react";
import ReportOpen from "./ReportOpen";
import "../../../../styles/components/admin/Reportcard.css";

export default function ReportCard({
  report, onDelete, onIgnore, onAccept, onRedirect, actionBusy,
}) {
  const { t } = useTranslation();
  const r = "adminReports.card";

  const [isOpen, setIsOpen]           = useState(false);
  const [ignoreBusy, setIgnoreBusy]   = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const { meta, reported_user, reporter_user, refType, description, formattedDate } = report;
  const reportedName = reported_user.name || t(`${r}.reportedUserFallback`, { defaultValue: "Usuario reportado" });
  const reporterName = reporter_user.name || t(`${r}.reporterUserFallback`, { defaultValue: "Usuario" });
  const motivoLabel = t(meta.labelKey);
  const badgeLabel = t(meta.badgeKey);
  const profilePhoto = typeof reported_user?.photo === "string" ? reported_user.photo.trim() : "";
  const showProfilePhoto = Boolean(profilePhoto) && !imageFailed && report.motivo !== "hate_incitement";
  const avatarContent = report.motivo === "hate_incitement" ? "!" : reported_user.initials;

  async function handleIgnore(item) {
    setIgnoreBusy(true);
    try { const handled = await onIgnore?.(item); if (handled) setIsOpen(false); }
    finally { setIgnoreBusy(false); }
  }

  async function handleAccept(item, payload) {
    const handled = await onAccept?.(item, payload);
    if (handled) setIsOpen(false);
  }

  async function handleRedirect(item) {
    const handled = await onRedirect?.(item);
    if (handled) setIsOpen(false);
  }

  const isAccepting   = actionBusy?.reportId === report.id && actionBusy?.type === "accept";
  const isRedirecting = actionBusy?.reportId === report.id && actionBusy?.type === "redirect";
  const isIgnoring    = ignoreBusy || (actionBusy?.reportId === report.id && actionBusy?.type === "ignore");

  return (
    <>
      <div className="rp-card">
        <div className={`rp-card__avatar ${meta.avatarClass}`}>
          {showProfilePhoto ? (
            <img src={profilePhoto} alt={reportedName}
              className="rp-card__avatar-img" onError={() => setImageFailed(true)} />
          ) : avatarContent}
        </div>

        <div className="rp-card__body">
          <div className="rp-card__header">
            <span className="rp-card__title">
              {reportedName} &mdash; {motivoLabel}
            </span>
            <span className={`rp-badge ${meta.badgeClass}`}>{badgeLabel}</span>
          </div>

          <p className="rp-card__meta">
            {t(`${r}.reportedBy`)} {reporterName}&nbsp;·&nbsp;
            {refType}&nbsp;·&nbsp;{formattedDate}
          </p>

          <p className="rp-card__desc">{description}</p>

          <div className="rp-card__actions">
            <button className="rp-btn rp-btn--open" onClick={() => setIsOpen(true)}>
              <Eye size={14} /> {t(`${r}.open`)}
            </button>
            <button className="rp-btn rp-btn--ignore"
              onClick={() => handleIgnore(report)} disabled={isIgnoring}>
              <XCircle size={14} /> {isIgnoring ? t(`${r}.processing`) : t(`${r}.ignore`)}
            </button>
            <button className="rp-btn rp-btn--delete" onClick={() => onDelete?.(report)}>
              <Trash2 size={14} /> {t(`${r}.delete`)}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <ReportOpen
          report={report} onClose={() => setIsOpen(false)}
          onDelete={onDelete} onIgnore={handleIgnore}
          onAccept={handleAccept}
          onInProgress={(item) => console.log(`Reporte #${item.id} en ejecucion.`)}
          onRedirect={handleRedirect}
          actionBusy={{ isAccepting, isRedirecting, isIgnoring }}
        />
      )}
    </>
  );
}
