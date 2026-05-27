import { useState } from "react";
import { Eye, Trash2, XCircle } from "lucide-react";
import ReportOpen from "./ReportOpen";
import "../../../../styles/components/admin/Reportcard.css";

export default function ReportCard({
  report,
  onDelete,
  onIgnore,
  onAccept,
  onRedirect,
  actionBusy,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [ignoreBusy, setIgnoreBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const { meta, reported_user, reporter_user, refType, description, formattedDate } = report;
  const profilePhoto = typeof reported_user?.photo === "string" ? reported_user.photo.trim() : "";
  const showProfilePhoto = Boolean(profilePhoto) && !imageFailed && report.motivo !== "hate_incitement";
  const avatarContent = report.motivo === "hate_incitement" ? "!" : reported_user.initials;

  function handleDelete(reportToDelete) {
    onDelete?.(reportToDelete);
    // No cerrar el detalle cuando se abre el modal de eliminacion,
    // el reporte debe seguir visible hasta que se confirme o se cancele.
  }

  async function handleIgnore(item) {
    setIgnoreBusy(true);
    try {
      const handled = await onIgnore?.(item);
      if (handled) {
        setIsOpen(false);
      }
    } finally {
      setIgnoreBusy(false);
    }
  }

  async function handleAccept(item, payload) {
    const handled = await onAccept?.(item, payload);
    if (handled) {
      setIsOpen(false);
    }
  }

  function handleInProgress(item) {
    console.log(`Reporte #${item.id} marcado en ejecucion.`);
  }

  async function handleRedirect(item) {
    const handled = await onRedirect?.(item);
    if (handled) {
      setIsOpen(false);
    }
  }

  const isAccepting = actionBusy?.reportId === report.id && actionBusy?.type === "accept";
  const isRedirecting = actionBusy?.reportId === report.id && actionBusy?.type === "redirect";
  const isIgnoring = ignoreBusy || (actionBusy?.reportId === report.id && actionBusy?.type === "ignore");

  return (
    <>
      <div className="rp-card">
        <div className={`rp-card__avatar ${meta.avatarClass}`}>
          {showProfilePhoto ? (
            <img
              src={profilePhoto}
              alt={reported_user.name || "Usuario reportado"}
              className="rp-card__avatar-img"
              onError={() => setImageFailed(true)}
            />
          ) : (
            avatarContent
          )}
        </div>

        <div className="rp-card__body">
          <div className="rp-card__header">
            <span className="rp-card__title">
              {reported_user.name} &mdash; {meta.label}
            </span>
            <span className={`rp-badge ${meta.badgeClass}`}>{meta.badge}</span>
          </div>

          <p className="rp-card__meta">
            Reportado por {reporter_user.name}&nbsp;·&nbsp;
            {refType}&nbsp;·&nbsp;
            {formattedDate}
          </p>

          <p className="rp-card__desc">{description}</p>

          <div className="rp-card__actions">
            <button className="rp-btn rp-btn--open" onClick={() => setIsOpen(true)}>
              <Eye size={14} /> Abrir
            </button>
            <button className="rp-btn rp-btn--ignore" onClick={() => handleIgnore(report)} disabled={isIgnoring}>
              <XCircle size={14} /> {isIgnoring ? "Procesando..." : "Ignorar"}
            </button>
            <button className="rp-btn rp-btn--delete" onClick={() => handleDelete(report)}>
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <ReportOpen
          report={report}
          onClose={() => setIsOpen(false)}
          onDelete={handleDelete}
          onIgnore={handleIgnore}
          onAccept={handleAccept}
          onInProgress={handleInProgress}
          onRedirect={handleRedirect}
          actionBusy={{ isAccepting, isRedirecting, isIgnoring }}
        />
      )}
    </>
  );
}
