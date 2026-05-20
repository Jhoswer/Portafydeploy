import { useNavigate } from "react-router-dom";

export function CommentItem({ comment }) {
  const navigate = useNavigate();

  const handleAuthorClick = () => {
    if (!comment.authorId) return;
    navigate(`/perfil-profesional?usuario=${comment.authorId}`);
  };

  const canNavigate = Boolean(comment.authorId);

  return (
    <div className="post-comment" style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0" }}>
      
      {/* Avatar */}
      <button
        type="button"
        onClick={handleAuthorClick}
        disabled={!canNavigate}
        style={{ background: "none", border: "none", padding: 0, cursor: canNavigate ? "pointer" : "default", flexShrink: 0 }}
      >
        {comment.authorAvatar
          ? (
            <img
              src={comment.authorAvatar}
              alt={comment.author}
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", transition: "opacity 0.15s" }}
              onMouseEnter={e => { if (canNavigate) e.target.style.opacity = "0.8"; }}
              onMouseLeave={e => e.target.style.opacity = "1"}
            />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#185FA5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {comment.author?.[0] || "U"}
            </div>
          )
        }
      </button>

      {/* Burbuja */}
      <div style={{ flex: 1 }}>
        <div style={{ background: "var(--color-background-secondary, #f3f4f6)", borderRadius: "0 12px 12px 12px", padding: "8px 12px" }}>
          <button
            type="button"
            onClick={handleAuthorClick}
            disabled={!canNavigate}
            style={{ background: "none", border: "none", padding: 0, cursor: canNavigate ? "pointer" : "default", display: "block", marginBottom: 2 }}
          >
            <span
              style={{ fontSize: 13, fontWeight: 600, color: canNavigate ? "#2563eb" : "var(--text, #111)", transition: "color 0.15s" }}
              onMouseEnter={e => { if (canNavigate) e.target.style.textDecoration = "underline"; }}
              onMouseLeave={e => e.target.style.textDecoration = "none"}
            >
              {comment.author}
            </span>
          </button>
          <span style={{ fontSize: 13, color: "var(--text, #374151)", lineHeight: 1.45 }}>{comment.text}</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", marginLeft: 4, marginTop: 3, display: "block" }}>
          {comment.posted}
        </span>
      </div>

    </div>
  );
}