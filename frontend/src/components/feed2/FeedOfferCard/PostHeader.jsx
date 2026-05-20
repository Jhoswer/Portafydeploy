import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

export function PostHeader({ post }) {
  const navigate = useNavigate();

  const handleAuthorClick = () => {
    if (!post.authorSlug) return;
    navigate(`/empresa/${post.authorSlug}`);
  };

  return (
    <div className="post-header">
      <button
        type="button"
        onClick={handleAuthorClick}
        style={{
          background: "none", border: "none", padding: 0,
          cursor: post.authorSlug ? "pointer" : "default",
          display: "flex", alignItems: "center",
          borderRadius: "50%",
        }}
        title={post.authorSlug ? `Ver perfil de ${post.author}` : undefined}
      >
        {post.avatar
          ? (
            <img
              className="post-avatar"
              src={post.avatar}
              alt={post.author}
              style={{ transition: "opacity 0.15s" }}
              onMouseEnter={e => { if (post.authorSlug) e.target.style.opacity = "0.8"; }}
              onMouseLeave={e => e.target.style.opacity = "1"}
            />
          ) : (
            <div className="post-avatar" style={{ background: "#185FA5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
              {post.author?.[0] || "E"}
            </div>
          )
        }
      </button>

      <div className="post-meta">
        <button
          type="button"
          onClick={handleAuthorClick}
          style={{
            background: "none", border: "none", padding: 0,
            cursor: post.authorSlug ? "pointer" : "default",
            textAlign: "left",
          }}
        >
          <div
            className="post-author"
            style={{ transition: "color 0.15s", ...(post.authorSlug ? { cursor: "pointer" } : {}) }}
            onMouseEnter={e => { if (post.authorSlug) e.target.style.color = "#2563eb"; }}
            onMouseLeave={e => e.target.style.color = ""}
          >
            {post.author}
          </div>
        </button>
        <div className="post-subtitle">{post.subtitle}</div>
      </div>

      <button className="post-more" type="button" aria-label="Más opciones">
        <MoreHorizontal size={17} />
      </button>
    </div>
  );
}