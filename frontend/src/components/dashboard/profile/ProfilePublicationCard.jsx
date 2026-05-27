import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";

import { FeedPostCard } from "../../feed2/FeedPostCard";
import { normalizeFeedPost } from "../../../features/feed/feedMappers";

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

function PostOptionsMenu({ owner = false, onUnshare = null, busy = false }) {
  const [open, setOpen] = useState(false);

  if (!owner || !onUnshare) {
    return null;
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        className="post-more"
        type="button"
        aria-label="Mas opciones"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={17} />
      </button>
      {open ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 30,
            width: 210,
            display: "grid",
            gap: 4,
            padding: 8,
            borderRadius: 16,
            background: "rgba(255,255,255,.98)",
            border: "1px solid rgba(205,225,245,.86)",
            boxShadow: "0 18px 42px rgba(14,30,60,.16)",
          }}
        >
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              onUnshare?.();
            }}
            style={{
              ...postMenuItemStyle,
              color: "#b42318",
              opacity: busy ? 0.68 : 1,
            }}
          >
            <X size={15} />
            {busy ? "Quitando..." : "Dejar de compartir"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ProfilePublicationCard({
  post,
  expanded = false,
  loadingComments = false,
  owner = false,
  commentDraft = "",
  commentError = "",
  commentMaxLength,
  isCommenting = false,
  onToggleComments,
  onCommentDraftChange,
  onSubmitComment,
  onUnshare,
  unsharing = false,
  onOpenProfile = null,
  onViewAllComments = null,
  isLoadingAllComments = false,
  currentUserId = null,
  onFollowAuthor = null,
  isFollowingAuthor = false,
  isFollowAuthorBusy = false,
  onReportComment = null,
}) {
  const normalizedPost = normalizeFeedPost(post);

  return (
    <FeedPostCard
      post={normalizedPost}
      commentDraft={commentDraft}
      commentError={commentError}
      commentMaxLength={commentMaxLength}
      isCommentingOpen={expanded}
      isLiking={false}
      isSaving={false}
      isCommenting={isCommenting}
      isLoadingComments={loadingComments}
      isLoadingAllComments={isLoadingAllComments}
      onOpenProfile={onOpenProfile}
      onViewAllComments={onViewAllComments}
      currentUserId={currentUserId}
      onFollowAuthor={onFollowAuthor}
      isFollowingAuthor={isFollowingAuthor}
      isFollowAuthorBusy={isFollowAuthorBusy}
      onReportComment={onReportComment}
      moreMenu={
        <PostOptionsMenu owner={owner} onUnshare={onUnshare} busy={unsharing} />
      }
      onLike={() => {}}
      onSave={() => {}}
      onToggleComment={onToggleComments}
      onCommentDraftChange={onCommentDraftChange}
      onSubmitComment={onSubmitComment}
    />
  );
}
