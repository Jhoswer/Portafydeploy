import { useMemo, useState } from "react";
import { AlertTriangle, Flag, X } from "lucide-react";
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
  const reasons = useMemo(() => getPublicationReportReasons(), []);
  const [motivo, setMotivo] = useState(reasons[0]?.key || "");
  const [description, setDescription] = useState("");

  if (!isOpen || !post) return null;

  const isCommentReport = reportKind === "comment";
  const typeLabel = isCommentReport
    ? "Comentario"
    : post.sourceType === "experience"
      ? "Experiencia"
      : "Proyecto";
  const title = isCommentReport
    ? (comment?.text || "Comentario reportado")
    : (post.project?.title || post.experience?.title || "Publicacion");

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
          aria-label="Cerrar reporte"
        >
          <X size={18} />
        </button>

        <span className="feed-report-modal__icon">
          <Flag size={20} />
        </span>

        <h3>{isCommentReport ? "Reportar comentario" : "Reportar publicacion"}</h3>
        <p>
          El reporte sera enviado al panel de administracion con el motivo seleccionado.
        </p>

        <div className="feed-report-modal__target">
          <AlertTriangle size={15} />
          <span className="feed-report-modal__target-type">{typeLabel}</span>
          <span className="feed-report-modal__target-title">{title}</span>
        </div>

        <label className="feed-report-modal__field">
          <span>Motivo</span>
          <select value={motivo} onChange={(event) => setMotivo(event.target.value)} disabled={isBusy}>
            {reasons.map((reason) => (
              <option key={reason.key} value={reason.key}>{reason.label}</option>
            ))}
          </select>
        </label>

        <label className="feed-report-modal__field">
          <span>Detalle opcional</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 255))}
            placeholder={`Describe brevemente que ocurre con ${isCommentReport ? "este comentario" : "esta publicacion"}...`}
            rows={4}
            disabled={isBusy}
          />
          <small>{description.length}/255</small>
        </label>

        {error ? <div className="feed-report-modal__error">{error}</div> : null}

        <div className="feed-report-modal__actions">
          <button type="button" onClick={onClose} disabled={isBusy}>
            Cancelar
          </button>
          <button type="submit" disabled={isBusy || !motivo}>
            {isBusy ? "Enviando..." : "Enviar reporte"}
          </button>
        </div>
      </form>
    </div>
  );
}
