import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Code2,
  ExternalLink,
  Flag,
  GraduationCap,
  MoreHorizontal,
  PauseCircle,
  Send,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { FeedPublicationMedia } from "./FeedPublicationMedia";
import { isAdministrativeRole } from "../../services/searchService";
import { useTranslation } from "react-i18next";

function ThumbsUp() {
  return <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>;
}

function Chat() {
  return <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
}

function Bookmark() {
  return <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
}

function PortfolioKindIcon({ type }) {
  if (type === "experience") {
    return <svg viewBox="0 0 24 24"><path d="M10 6V5a2 2 0 012-2h0a2 2 0 012 2v1"/><path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v8a3 3 0 01-3 3H6a3 3 0 01-3-3z"/><path d="M3 13h18"/><path d="M9 13v1a1 1 0 001 1h4a1 1 0 001-1v-1"/></svg>;
  }

  return <svg viewBox="0 0 24 24"><path d="M4 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M8 13h8"/><path d="M8 16h5"/></svg>;
}

function formatCompactCount(value) {
  const number = Number(value || 0);
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`;
  return String(number);
}

function VerifiedMark({ size = 15 }) {
  const { t } = useTranslation();
  return (
    <span className="post-verified-mark" title={t("appI18n.common.verifiedAccount")} aria-label={t("appI18n.common.verifiedAccount")}>
      <ShieldCheck size={size} />
    </span>
  );
}

function useCloseOnOutside(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);

  return ref;
}

function ProfileHoverCard({ post }) {
  const { t } = useTranslation();
  const title = post.authorTitle && post.authorTitle !== "Profesional"
    ? post.authorTitle
    : t("appI18n.feed.right.professionalFallback");

  return (
    <div className="post-author-hover" role="status">
      <div className="post-author-hover__head">
        {post.avatar ? (
          <img src={post.avatar} alt="" />
        ) : (
          <span>{post.author?.[0] || "P"}</span>
        )}
        <div>
          <strong>
            {post.author || "Usuario Portafy"}
            {post.authorIsVerified ? <VerifiedMark size={14} /> : null}
          </strong>
          <small>{title}</small>
        </div>
      </div>
      <div className="post-author-hover__stats">
        <span><UsersRound size={14} /> {formatCompactCount(post.authorFollowers)} {t("appI18n.feed.post.followers")}</span>
        <span>{formatCompactCount(post.authorFollowing)} {t("appI18n.feed.post.followingUsers")}</span>
      </div>
    </div>
  );
}

function AuthorIdentity({ post, onOpenProfile }) {
  const canOpen = Boolean(post.authorId && onOpenProfile);

  const handleOpen = () => {
    if (canOpen) onOpenProfile(post.authorId);
  };

  return (
    <div className="post-author-shell">
      <button
        type="button"
        className="post-author-trigger"
        onClick={handleOpen}
        disabled={!canOpen}
        aria-label={canOpen ? `Ver perfil de ${post.author}` : undefined}
      >
        {post.avatar ? <img className="post-avatar" src={post.avatar} alt={post.author} /> : <span className="post-avatar">{post.author?.[0] || "A"}</span>}
        <div className="post-meta">
          <div className="post-author">
            {post.author}
            {post.authorIsVerified ? <VerifiedMark /> : null}
          </div>
          <PostMeta post={post} />
        </div>
      </button>
      {canOpen ? <ProfileHoverCard post={post} /> : null}
    </div>
  );
}

function normalizeProjectStatus(status, t) {
  const value = String(status || "").trim().toLowerCase();
  if (["completo", "completado", "complete", "done", "finalizado"].includes(value)) return t("appI18n.feed.post.complete");
  if (["pausado", "paused", "pause"].includes(value)) return t("appI18n.feed.post.paused");
  return t("appI18n.feed.post.inProgress");
}

function ProjectStatusBadge({ status }) {
  const { t } = useTranslation();
  const complete = t("appI18n.feed.post.complete");
  const paused = t("appI18n.feed.post.paused");
  const normalized = normalizeProjectStatus(status, t);
  const config = normalized === complete
    ? { Icon: CheckCircle2, cls: "complete", label: complete }
    : normalized === paused
      ? { Icon: PauseCircle, cls: "paused", label: paused }
      : { Icon: CircleDashed, cls: "progress", label: t("appI18n.feed.post.inProgress") };
  const Icon = config.Icon;

  return (
    <span className={`post-status-badge ${config.cls}`}>
      <Icon size={15} />
      {config.label}
    </span>
  );
}

function externalHost(url) {
  if (!url) return "";

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return String(url).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es", { month: "short", year: "numeric" }).format(date);
}

function experienceTypeLabel(experience = {}, t) {
  const value = String(experience.typeLabel || experience.type || "").toLowerCase();
  if (value.includes("academ")) return t("appI18n.feed.post.academic");
  if (value.includes("freelance")) return "Freelance";
  return t("appI18n.feed.post.professional");
}

function experienceIcon(experience = {}, t) {
  return experienceTypeLabel(experience, t) === t("appI18n.feed.post.academic")
    ? <GraduationCap size={16} />
    : <BriefcaseBusiness size={16} />;
}

function textIncludes(left = "", right = "") {
  const a = String(left || "").trim().toLowerCase();
  const b = String(right || "").trim().toLowerCase();
  return Boolean(a && b && (a === b || a.includes(b) || b.includes(a)));
}

function shouldShowIntro(post) {
  const content = String(post.description || "").trim();
  if (!content) return false;
  if (/^(proyecto publicado|experiencia publicada|comparti mi proyecto|comparti el proyecto|comparti mi experiencia|comparti una experiencia)/i.test(content)) return false;

  if (post.sourceType === "project") {
    return !textIncludes(content.replace(/^proyecto publicado:\s*/i, ""), post.project?.description);
  }

  return !textIncludes(content.replace(/^experiencia publicada:\s*/i, ""), post.experience?.description);
}

function PostMeta({ post }) {
  const { t } = useTranslation();
  return (
    <div className="post-meta-row">
      <span className="post-meta-chip post-meta-chip--role">{post.authorTitle || t("appI18n.feed.right.professionalFallback")}</span>
      {post.posted ? <span className="post-meta-chip">{post.posted}</span> : null}
    </div>
  );
}

const postMenuItemStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 9,
  border: "none",
  borderRadius: 11,
  padding: "9px 10px",
  background: "transparent",
  color: "var(--body)",
  fontFamily: "var(--f-ui)",
  fontSize: ".82rem",
  fontWeight: 800,
  textAlign: "left",
  cursor: "pointer",
};

function DefaultPostOptionsMenu({ owner = false, onUnshare = null, onReport = null, isUnsharing = false }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useCloseOnOutside(open, () => setOpen(false));

  if (owner && !onUnshare) {
    return null;
  }

  if (!owner && !onReport) {
    return null;
  }

  return (
    <div className="post-options" ref={menuRef}>
      <button
        className="post-more"
        type="button"
        aria-label={t("appI18n.feed.post.moreOptions")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={17} />
      </button>
      {open ? (
        <div className="post-options__menu">
          {owner ? (
            <button
              type="button"
              disabled={isUnsharing}
              onClick={() => {
                setOpen(false);
                onUnshare?.();
              }}
              style={{ ...postMenuItemStyle, color: "#b42318", opacity: isUnsharing ? 0.68 : 1 }}
            >
              <PauseCircle size={15} />
              {isUnsharing ? t("appI18n.feed.post.removing") : t("appI18n.feed.post.removeSharing")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onReport?.();
              }}
              style={{ ...postMenuItemStyle, color: "#b42318" }}
            >
              <Flag size={15} />
              {t("appI18n.feed.post.reportPublication")}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ProjectPublicationDetails({ post }) {
  const { t } = useTranslation();
  const project = post.project || {};
  const tags = post.tags?.length ? post.tags : [];

  return (
    <section className="post-showcase post-showcase--project">
      <div className="post-showcase__main">
        <div className="post-showcase__head">
          <span className="post-showcase__icon"><Code2 size={18} /></span>
          <div>
            <div className="post-showcase__eyebrow">{t("appI18n.feed.post.project")}</div>
            <h3 className="post-showcase__title">{project.title || t("appI18n.feed.post.portfolioProject")}</h3>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <p className="post-showcase__text">{project.description || t("appI18n.feed.post.portfolioProjectText")}</p>

        <div className="post-tech-panel">
          <div className="post-tech-panel__label">{t("appI18n.feed.post.technologies")}</div>
          {tags.length ? (
            <div className="post-tags post-tags--inside">
              {tags.map((tag) => (
                <span key={tag.label} className={`tag ${tag.cls}`}>{tag.label}</span>
              ))}
            </div>
          ) : (
            <span className="post-empty-note">{t("appI18n.feed.post.noTechnologies")}</span>
          )}
        </div>

        {(project.demoUrl || project.repoUrl) ? (
          <div className="post-link-row">
            {project.demoUrl ? (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="post-resource-link">
                <ExternalLink size={14} />
                {t("appI18n.feed.post.demo")}
                <span>{externalHost(project.demoUrl)}</span>
              </a>
            ) : null}
            {project.repoUrl ? (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="post-resource-link">
                <ExternalLink size={14} />
                {t("appI18n.feed.post.repository")}
                <span>{externalHost(project.repoUrl)}</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="post-showcase__media">
        <FeedPublicationMedia post={post} />
      </div>
    </section>
  );
}

function ExperiencePublicationDetails({ post }) {
  const { t } = useTranslation();
  const experience = post.experience || {};
  const dateRange = [formatDate(experience.startDate), experience.isCurrent ? "Presente" : formatDate(experience.endDate)]
    .filter(Boolean)
    .join(" - ");

  return (
    <section className="post-showcase post-showcase--experience">
      <div className="post-showcase__main">
        <div className="post-showcase__head">
          <span className="post-showcase__icon">{experienceIcon(experience, t)}</span>
          <div>
            <div className="post-showcase__eyebrow">{t("appI18n.feed.post.experience")}</div>
            <h3 className="post-showcase__title">{experience.title || t("appI18n.feed.post.professionalTrajectory")}</h3>
          </div>
          <span className="post-experience-type">{experienceTypeLabel(experience, t)}</span>
        </div>

        <div className="post-experience-grid">
          <div className="post-info-tile">
            <Building2 size={16} />
            <span>{t("appI18n.feed.post.organization")}</span>
            <strong>{experience.company || t("appI18n.feed.post.noOrganization")}</strong>
          </div>
          <div className="post-info-tile">
            <CalendarDays size={16} />
            <span>{t("appI18n.feed.post.period")}</span>
            <strong>{dateRange || t("appI18n.feed.post.noDates")}</strong>
          </div>
        </div>

        <p className="post-showcase__text">{experience.description || t("appI18n.feed.post.experienceText")}</p>
      </div>
    </section>
  );
}

function CommentAvatar({ comment }) {
  if (comment.authorAvatar) {
    return <img className="post-comment__avatar" src={comment.authorAvatar} alt={comment.author || "Usuario Portafy"} />;
  }

  const initial = (comment.author || "U").trim().charAt(0).toUpperCase() || "U";
  return <span className="post-comment__avatar">{initial}</span>;
}

function CommentOptionsMenu({ comment, canReport = false, onReportComment }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useCloseOnOutside(open, () => setOpen(false));

  if (!canReport || !onReportComment) return null;

  return (
    <div className="post-comment-menu" ref={menuRef}>
      <button
        type="button"
        className="post-comment-menu__trigger"
        aria-label={t("appI18n.feed.post.commentOptions")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={15} />
      </button>
      {open ? (
        <div className="post-comment-menu__panel">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onReportComment(comment);
            }}
          >
            <Flag size={14} />
            {t("appI18n.feed.post.reportComment")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CommentItem({ comment, showDate = true, onOpenProfile, currentUserId = null, onReportComment }) {
  const canOpen = Boolean(comment.authorId && onOpenProfile);
  const canReport = Boolean(comment.id && comment.authorId && currentUserId && String(comment.authorId) !== String(currentUserId));
  const openProfile = () => {
    if (canOpen) onOpenProfile(comment.authorId);
  };

  return (
    <div className="post-comment">
      <button
        type="button"
        className="post-comment-profile-btn"
        onClick={openProfile}
        disabled={!canOpen}
        aria-label={canOpen ? `Ver perfil de ${comment.author}` : undefined}
      >
        <CommentAvatar comment={comment} />
      </button>
      <div className="post-comment__body">
        <div className="post-comment__meta">
          <button
            type="button"
            className="post-comment-author"
            onClick={openProfile}
            disabled={!canOpen}
          >
            {comment.author}
            {comment.authorIsVerified ? <VerifiedMark size={13} /> : null}
          </button>
          {showDate && comment.posted ? <small>{comment.posted}</small> : null}
        </div>
        <span>{comment.text}</span>
      </div>
      <CommentOptionsMenu comment={comment} canReport={canReport} onReportComment={onReportComment} />
    </div>
  );
}

export function PostCommentsModal({ post, isLoading = false, onClose, onOpenProfile, currentUserId = null, onReportComment }) {
  const { t } = useTranslation();
  if (!post) return null;

  const comments = Array.isArray(post.commentsList) ? post.commentsList : [];

  return (
    <div className="post-comments-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="post-comments-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-comments-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="post-comments-modal__header">
          <div>
            <span>{t("appI18n.feed.post.comments")}</span>
            <h3 id="post-comments-modal-title">{post.project?.title || post.experience?.title || t("appI18n.feed.post.publication")}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label={t("appI18n.common.close")}>
            <X size={18} />
          </button>
        </header>
        <div className="post-comments-modal__summary">
          <AuthorIdentity post={post} onOpenProfile={onOpenProfile} />
          {post.description ? <p>{post.description}</p> : null}
        </div>
        <div className="post-comments-modal__list">
          {isLoading ? <div className="post-comment post-comment--muted">{t("appI18n.feed.post.loadingComments")}</div> : null}
          {!isLoading && comments.length ? comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onOpenProfile={onOpenProfile}
              currentUserId={currentUserId}
              onReportComment={onReportComment}
            />
          )) : null}
          {!isLoading && !comments.length ? (
            <div className="post-comment post-comment--muted">{t("appI18n.feed.post.noComments")}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function FeedPostCard({
  post,
  commentDraft,
  commentError = "",
  commentMaxLength = 280,
  isCommentingOpen,
  isLiking,
  isSaving,
  isCommenting,
  isLoadingComments,
  canReact = true,
  canComment = true,
  onLike,
  onSave,
  onToggleComment,
  onCommentDraftChange,
  onSubmitComment,
  moreMenu = null,
  onUnshare = null,
  onReport = null,
  isUnsharing = false,
  onOpenProfile = null,
  onViewAllComments = null,
  isLoadingAllComments = false,
  currentUserId = null,
  onFollowAuthor = null,
  isFollowingAuthor = null,
  isFollowAuthorBusy = false,
  onReportComment = null,
}) {
  const { t } = useTranslation();
  const isExperiencePost = post.sourceType === "experience";
  const kindLabel = isExperiencePost ? t("appI18n.feed.post.experienceKind") : t("appI18n.feed.post.projectKind");
  const showIntro = shouldShowIntro(post);
  const shownComments = Array.isArray(post.commentsList) ? post.commentsList.slice(0, 3) : [];
  const hiddenComments = Math.max(0, Number(post.comments || 0) - shownComments.length);
  const canViewMoreComments = Boolean(onViewAllComments && (hiddenComments > 0 || (post.commentsList?.length || 0) > shownComments.length));
  const canFollowAuthor = Boolean(onFollowAuthor && post.authorId && currentUserId && String(post.authorId) !== String(currentUserId));
  const authorIsAdmin = isAdministrativeRole(post.authorRole);
  const authorIsFollowing = Boolean(isFollowingAuthor ?? post.authorIsFollowing);

  return (
    <article className="card">
      <div className="post-header">
        <AuthorIdentity post={post} onOpenProfile={onOpenProfile} />
        {canFollowAuthor && !authorIsAdmin ? (
          <button
            type="button"
            className={`post-follow-author${authorIsFollowing ? " following" : ""}${isFollowAuthorBusy ? " pending" : ""}`}
            onClick={onFollowAuthor}
            aria-pressed={authorIsFollowing}
            aria-busy={isFollowAuthorBusy}
            title={authorIsFollowing ? t("appI18n.feed.post.following") : t("appI18n.feed.post.follow")}
          >
            {authorIsFollowing ? (
              <UserCheck size={15} />
            ) : (
              <UserPlus size={15} />
            )}
            <span>{authorIsFollowing ? t("appI18n.feed.post.following") : t("appI18n.feed.post.follow")}</span>
          </button>
        ) : null}
        {moreMenu ? moreMenu : <DefaultPostOptionsMenu owner={post.ownedByMe} onUnshare={onUnshare} onReport={onReport} isUnsharing={isUnsharing} />}
      </div>

      <div className="post-body">
        <div className={`post-kind-pill ${isExperiencePost ? "experience" : "project"}`}>
          <PortfolioKindIcon type={post.sourceType} />
          <span>{kindLabel}</span>
        </div>

        {showIntro ? <p className="post-description">{post.description}</p> : null}

        {isExperiencePost ? <ExperiencePublicationDetails post={post} /> : <ProjectPublicationDetails post={post} />}
      </div>

      <div className="post-stats">
        {post.likes} {t("appI18n.feed.post.likes")} - {post.comments} {t("appI18n.feed.post.commentsCount")} - {post.saves || 0} {t("appI18n.feed.post.savedCount")}
      </div>

      {isCommentingOpen ? (
        <div className="post-comments">
          {isLoadingComments ? <div className="post-comment post-comment--muted">{t("appI18n.feed.post.loadingComments")}</div> : null}
          {!isLoadingComments && shownComments.length ? shownComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onOpenProfile={onOpenProfile}
              currentUserId={currentUserId}
              onReportComment={onReportComment}
            />
          )) : null}
          {!isLoadingComments && canViewMoreComments ? (
            <button className="post-comments-more" type="button" onClick={onViewAllComments} disabled={isLoadingAllComments}>
              {isLoadingAllComments ? t("appI18n.common.loading") : `${t("appI18n.feed.post.viewMoreComments")}${hiddenComments > 0 ? ` (${hiddenComments})` : ""}`}
            </button>
          ) : null}
          {!isLoadingComments && !post.commentsList?.length && post.comments > 0 ? <div className="post-comment post-comment--muted">{t("appI18n.feed.post.commentsUnavailable")}</div> : null}
          {!isLoadingComments && post.comments === 0 ? <div className="post-comment post-comment--muted">{t("appI18n.feed.post.firstComment")}</div> : null}
        </div>
      ) : post.commentsList?.length ? (
        <div className="post-comments post-comments--preview">
          {post.commentsList.slice(0, 1).map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              showDate={false}
              onOpenProfile={onOpenProfile}
              currentUserId={currentUserId}
              onReportComment={onReportComment}
            />
          ))}
          {canViewMoreComments ? (
            <button className="post-comments-more" type="button" onClick={onViewAllComments} disabled={isLoadingAllComments}>
              {isLoadingAllComments ? t("appI18n.common.loading") : t("appI18n.feed.post.viewMoreComments")}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="post-actions">
        <button className={`action-btn${post.likedByMe ? " liked" : ""}`} type="button" onClick={onLike} aria-pressed={post.likedByMe} aria-busy={isLiking} disabled={!canReact}>
          <ThumbsUp />
          {t("appI18n.feed.post.like")}
        </button>
        <button className={`action-btn${isCommentingOpen ? " commenting" : ""}`} type="button" onClick={onToggleComment} aria-expanded={isCommentingOpen} disabled={!canComment}>
          <Chat /> {t("appI18n.feed.post.comment")}
        </button>
        <button className={`action-btn${post.savedByMe ? " saved" : ""}`} type="button" onClick={onSave} aria-pressed={post.savedByMe} aria-busy={isSaving}>
          <Bookmark /> {post.savedByMe ? t("appI18n.common.saved") : t("appI18n.common.save")}
        </button>
      </div>

      {isCommentingOpen ? (
        <form onSubmit={onSubmitComment} className="post-comment-composer">
          <input
            value={commentDraft}
            onChange={(event) => onCommentDraftChange(event.target.value)}
            placeholder={t("appI18n.feed.post.writeComment")}
            maxLength={commentMaxLength}
            className="post-comment-composer__input"
            aria-invalid={Boolean(commentError)}
            disabled={!canComment}
          />
          <span className="post-comment-composer__count">
            {String(commentDraft || "").length}/{commentMaxLength}
          </span>
          <button
            className="post-comment-composer__send"
            type="submit"
            disabled={!canComment || isCommenting || !String(commentDraft || "").trim()}
            aria-label={t("appI18n.feed.post.sendComment")}
            title={t("appI18n.feed.post.sendComment")}
          >
            <Send size={17} />
          </button>
          {commentError ? (
            <div className="post-comment-composer__error" role="alert">
              {commentError}
            </div>
          ) : null}
        </form>
      ) : null}
    </article>
  );
}
