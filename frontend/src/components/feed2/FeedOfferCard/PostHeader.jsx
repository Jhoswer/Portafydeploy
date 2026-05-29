import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Flag, PauseCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useCloseOnOutside(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);
  return ref;
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

function PostOptionsMenu({ owner = false, onUnshare, onReport, isUnsharing = false }) {
  const [open, setOpen] = useState(false);
  const menuRef = useCloseOnOutside(open, () => setOpen(false));

  if (owner && !onUnshare) return null;
  if (!owner && !onReport) return null;

  return (
    <div className="post-options" ref={menuRef}>
      <button
        className="post-more"
        type="button"
        aria-label="Mas opciones"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal size={17} />
      </button>
      {open && (
        <div className="post-options__menu">
          {owner ? (
            <button
              type="button"
              disabled={isUnsharing}
              onClick={() => { setOpen(false); onUnshare?.(); }}
              style={{ ...postMenuItemStyle, color: "#b42318", opacity: isUnsharing ? 0.68 : 1 }}
            >
              <PauseCircle size={15} />
              {isUnsharing ? "Quitando..." : "Dejar de compartir"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setOpen(false); onReport?.(); }}
              style={{ ...postMenuItemStyle, color: "#b42318" }}
            >
              <Flag size={15} />
              Reportar publicacion
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PostHeader({ post, owner = false, onUnshare, onReport, isUnsharing = false }) {
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
          display: "flex", alignItems: "center", borderRadius: "50%",
        }}
      >
        {post.avatar ? (
          <img className="post-avatar" src={post.avatar} alt={post.author} />
        ) : (
          <div className="post-avatar" style={{ background: "#185FA5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
            {post.author?.[0] || "E"}
          </div>
        )}
      </button>

      <div className="post-meta">
        <button
          type="button"
          onClick={handleAuthorClick}
          style={{ background: "none", border: "none", padding: 0, cursor: post.authorSlug ? "pointer" : "default", textAlign: "left" }}
        >
          <div className="post-author">{post.author}</div>
        </button>
        <div className="post-subtitle">{post.subtitle}</div>
      </div>

      <PostOptionsMenu
        owner={owner}
        onUnshare={onUnshare}
        onReport={onReport}
        isUnsharing={isUnsharing}
      />
    </div>
  );
}