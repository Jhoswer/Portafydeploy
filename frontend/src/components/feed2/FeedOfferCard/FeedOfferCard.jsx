import { useState } from "react";
import { Briefcase, Monitor, Award, MapPin, DollarSign, Calendar } from "lucide-react";
import { useOfferCard } from "../../../hooks/useOfferCard";
import { PostulationModal } from "./PostulationModal";
import { InfoBadge } from "./InfoBadge";
import { truncate } from "../../../utils/offerUtils";
import { PostReactions } from "./PostReaction";
import { PostHeader } from "./PostHeader";
import { CommentItem } from "./CommentItem";
import { ReportPublicationModal } from "../ReportPublicationModal"; 
import { unshareFeedPost } from "../../../services/feedService";
import { createPublicationReport } from "../../../services/reportService";

export function FeedOfferCard({ post, onRequireAuth, userCvs = [] }) {
  const {
    modalOpen, setModalOpen,
    alreadyApplied, saved, liked, likes, saves,
    showComments, commentText, setCommentText,
    commentError, comments, commentsCount,
    busy,
    handleLike, openPostulation, toggleComments, toggleSave,
    handleApplied, handleSubmitComment,
  } = useOfferCard(post, onRequireAuth);

  const [isUnsharing, setIsUnsharing] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState("");

  async function handleUnshare() {
    if (!post.publicationId) return;
    setIsUnsharing(true);
    try {
      await unshareFeedPost(post.publicationId);
    } catch (err) {
      console.error("Error al dejar de compartir:", err);
    } finally {
      setIsUnsharing(false);
    }
  }

  async function handleSubmitReport({ motivo, description }) {
    setReportBusy(true);
    setReportError("");
    try {
      await createPublicationReport(post.publicationId, { motivo, description });
      setReportOpen(false);
    } catch {
      setReportError("No se pudo enviar el reporte. Intentá de nuevo.");
    } finally {
      setReportBusy(false);
    }
  }

  return (
    <>
      <article className="card">

        <PostHeader
          post={post}
          owner={post.ownedByMe}
          onUnshare={post.ownedByMe ? handleUnshare : undefined}
          onReport={!post.ownedByMe ? () => setReportOpen(true) : undefined}
          isUnsharing={isUnsharing}
        />

        <div className="post-body">
          <div className="post-kind-pill project" style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", marginBottom: 12 }}>
            <Briefcase size={12} />
            <span>Convocatoria</span>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.35 }}>
            {post.title}
          </h3>

          {post.description && (
            <p className="post-description" style={{ marginBottom: 14 }}>{truncate(post.description)}</p>
          )}

          {post.bannerUrl && (
            <img src={post.bannerUrl} alt={post.title} style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, display: "block", marginBottom: 14 }} />
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            <InfoBadge icon={Briefcase} label={post.tipo_contrato} />
            <InfoBadge icon={Monitor}   label={post.modalidad} />
            <InfoBadge icon={Award}     label={post.nivel} />
            <InfoBadge icon={MapPin}    label={post.ubicacion} />
          </div>

          {post.showSalary && (post.salaryMin || post.salaryMax) && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: "#15803d", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, marginBottom: 12, border: "1px solid #bbf7d0" }}>
              <DollarSign size={13} />
              {post.currency} {post.salaryMin}
              {post.salaryMax ? ` - ${post.salaryMax}` : ""}
            </div>
          )}

          {post.closedAt && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fefce8", color: "#a16207", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, marginBottom: 12, border: "1px solid #fde68a", marginLeft: 6 }}>
              <Calendar size={12} />
              Cierra: {new Date(post.closedAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}

          {post.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {post.tags.map((tag, i) => (
                <span key={i} className={`tag ${tag.cls}`}>{tag.label}</span>
              ))}
            </div>
          )}
        </div>

        {(likes > 0 || commentsCount > 0) && (
          <div className="post-stats">
            {likes > 0 && <span>{likes} me gusta</span>}
            {likes > 0 && commentsCount > 0 && <span>&nbsp;·&nbsp;</span>}
            {commentsCount > 0 && <span>{commentsCount} comentarios</span>}
          </div>
        )}

        <div style={{ height: 1, background: "#f3f4f6", margin: "0 18px" }} />

        <PostReactions
          liked={liked}
          likes={likes}
          saved={saved}
          saves={saves}
          showComments={showComments}
          commentsCount={commentsCount}
          busy={busy}
          onLike={handleLike}
          onSave={toggleSave}
          onToggleComment={toggleComments}
          alreadyApplied={alreadyApplied}
          onApply={openPostulation}
        />

        {showComments && (
          <div style={{ padding: "0 18px 14px", borderTop: "1px solid #f3f4f6" }}>
            {comments.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {comments.slice(0, 3).map((c, i) => (
                  <CommentItem key={c.id ?? i} comment={c} />
                ))}
              </div>
            )}
            {comments.length === 0 && commentsCount === 0 && (
              <div className="post-comment post-comment--muted" style={{ marginBottom: 10 }}>
                Sé el primero en comentar.
              </div>
            )}
            <form onSubmit={handleSubmitComment} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario..."
                  style={{ flex: 1, border: "1px solid #dbeafe", borderRadius: 999, padding: "8px 14px", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                />
                <button className="action-btn" type="submit" disabled={busy === "comment"}>
                  {busy === "comment" ? "..." : "Publicar"}
                </button>
              </div>
              {commentError && (
                <span style={{ fontSize: 12, color: "#dc2626", paddingLeft: 14 }}>{commentError}</span>
              )}
            </form>
          </div>
        )}

      </article>

      {modalOpen && (
        <PostulationModal
          offer={{ id_offer: post.offerId, title: post.title, company: post.author }}
          onClose={() => setModalOpen(false)}
          onSuccess={handleApplied}
        />
      )}

      <ReportPublicationModal
        post={post}
        reportKind="publication"
        isOpen={reportOpen}
        isBusy={reportBusy}
        error={reportError}
        onClose={() => { setReportOpen(false); setReportError(""); }}
        onSubmit={handleSubmitReport}
      />
    </>
  );
}