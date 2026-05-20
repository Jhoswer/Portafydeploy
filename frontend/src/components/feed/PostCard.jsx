import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Bookmark } from "lucide-react";

const TYPE_CONFIG = (t) => ({
  talent: {
    label: t("postCard.type.talent"),
    badgeBg: "hsl(224 80% 96%)",
    badgeColor: "hsl(224 76% 40%)",
  },
  job: {
    label: t("postCard.type.job"),
    badgeBg: "hsl(152 60% 94%)",
    badgeColor: "hsl(152 60% 28%)",
  },
  portfolio: {
    label: t("postCard.type.portfolio"),
    badgeBg: "hsl(28 90% 95%)",
    badgeColor: "hsl(28 80% 35%)",
  },
});

const PASTEL_RED = "hsl(350 75% 70%)";
const PASTEL_RED_STRONG = "hsl(350 70% 60%)";

function actionBtnStyle(active = false) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 12px",
    borderRadius: 100,
    border: "none",
    background: active ? "hsl(350 100% 97%)" : "transparent",
    color: active ? PASTEL_RED_STRONG : "hsl(220 12% 52%)",
    cursor: "pointer",
  };
}

function LikeButton({ initial }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);

  const toggle = () => {
    setLiked((v) => {
      setCount((c) => (v ? c - 1 : c + 1));
      return !v;
    });
  };

  return (
    <button onClick={toggle} style={actionBtnStyle(liked)}>
      <Heart
        size={17}
        fill={liked ? PASTEL_RED : "none"}
        stroke={liked ? PASTEL_RED_STRONG : "currentColor"}
      />
      <span>{count}</span>
    </button>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);

  return (
    <button onClick={() => setSaved(!saved)} style={actionBtnStyle(saved)}>
      <Bookmark
        size={17}
        fill={saved ? "hsl(224 76% 65%)" : "none"}
        stroke={saved ? "hsl(224 76% 65%)" : "currentColor"}
      />
    </button>
  );
}

function CommentToggle({ comments }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)}>
        {open
          ? t("postCard.hideComments")
          : t("postCard.viewComments", { count: comments.length })}
      </button>

      {open &&
        comments.map((c) => (
          <div key={c.id}>
            <b>{c.name}</b>
            <div>{c.text}</div>
          </div>
        ))}
    </>
  );
}

export default function PostCard({ post }) {
  const { t } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const config = TYPE_CONFIG(t)[post.type];

  return (
    <article style={{
      background: "white",
      borderRadius: 20,
      border: "1px solid hsl(220 20% 91%)",
    }}>

      {/* HEADER */}
      <div style={{ padding: 16, display: "flex", gap: 12 }}>
        <img src={post.author.avatar} style={{ width: 46, borderRadius: "50%" }} />

        <div style={{ flex: 1 }}>
          <b>{post.author.name}</b>
          <div style={{ fontSize: 12, color: "#777" }}>
            {post.author.title}
          </div>
        </div>

        <span style={{
          fontSize: 11,
          fontWeight: 700,
          background: config.badgeBg,
          color: config.badgeColor,
          padding: "4px 10px",
          borderRadius: 100,
        }}>
          {config.label}
        </span>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "0 16px 12px" }}>
        <p>{post.content}</p>
      </div>

      {/* ACTIONS */}
      <div style={{ display: "flex", padding: 10 }}>
        <LikeButton initial={post.likes} />

        <button onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={17} />
          {post.comments.length}
        </button>

        <div style={{ marginLeft: "auto" }}>
          <SaveButton />
        </div>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div style={{ padding: 16 }}>
          {post.comments.slice(0, 1).map((c) => (
            <div key={c.id}>
              <b>{c.name}</b>
              <div>{c.text}</div>
            </div>
          ))}

          {post.comments.length > 1 && (
            <CommentToggle comments={post.comments.slice(1)} />
          )}

          <input
            placeholder={t("postCard.writeComment")}
          />
        </div>
      )}
    </article>
  );
}