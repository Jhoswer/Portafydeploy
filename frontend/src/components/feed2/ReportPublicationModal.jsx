import { useMemo, useState } from "react";
import { AlertTriangle, Flag, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getPublicationReportReasons } from "../../services/reportService";

export function ReportPublicationModal({
  post,
  comment = null,
  reportKind = "publication",
  isOpen,
  isBusy = false,
  error = "",
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation();
  const reasons = useMemo(() => getPublicationReportReasons(), []);
  const [motivo, setMotivo] = useState(reasons[0]?.key || "");
  const [description, setDescription] = useState("");

  if (!isOpen || !post) return null;

  const isCommentReport = reportKind === "comment";
  const typeLabel = isCommentReport
    ? t("reporte.tipo_comentario")
    : post.sourceType === "experience"
      ? t("reporte.tipo_experiencia")
      : post.sourceType === "offer"
        ? t("reporte.tipo_convocatoria")
        : t("reporte.tipo_proyecto");

  const title = isCommentReport
    ? (comment?.text || t("reporte.comentario_fallback"))
    : (post.title || post.project?.title || post.experience?.title || t("reporte.publicacion_fallback"));
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.({
      motivo,
      description: description.trim(),
    });
  }

  return (
    <div className="feed-report-modal__backdrop" onMouseDown={isBusy ? undefined : onClose}>
      <form className="feed-report-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <button
          className="feed-report-modal__close"
          type="button"
          onClick={onClose}
          disabled={isBusy}
          aria-label={t("reporte.cerrar")}
        >
          <X size={18} />
        </button>

        <span className="feed-report-modal__icon">
          <Flag size={20} />
        </span>

        <h3>{isCommentReport ? t("reporte.reportar_comentario") : t("reporte.reportar_publicacion")}</h3>
        <p>
          {t("reporte.descripcion_modal")}
        </p>

        <div className="feed-report-modal__target">
          <AlertTriangle size={15} />
          <span className="feed-report-modal__target-type">{typeLabel}</span>
          <span className="feed-report-modal__target-title">{title}</span>
        </div>

        <label className="feed-report-modal__field">
          <span>{t("reporte.motivo")}</span>
          <select value={motivo} onChange={(event) => setMotivo(event.target.value)} disabled={isBusy}>
            {reasons.map((reason) => (
              <option key={reason.key} value={reason.key}>{reason.label}</option>
            ))}
          </select>
        </label>

        <label className="feed-report-modal__field">
          <span>{t("reporte.detalle_opcional")}</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 255))}
            placeholder={isCommentReport ? t("reporte.placeholder_comentario") : t("reporte.placeholder_publicacion")}
            rows={4}
            disabled={isBusy}
          />
          <small>{description.length}/255</small>
        </label>

        {error ? <div className="feed-report-modal__error">{error}</div> : null}

        <div className="feed-report-modal__actions">
          <button type="button" onClick={onClose} disabled={isBusy}>
            {t("reporte.cancelar")}
          </button>
          <button type="submit" disabled={isBusy || !motivo}>
            {isBusy ? t("reporte.enviando") : t("reporte.enviar")}
          </button>
        </div>
      </form>
    </div>
  );
}
