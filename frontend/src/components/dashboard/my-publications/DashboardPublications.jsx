import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Eye, FileText, MessageCircle, Newspaper, RefreshCw, Sparkles, ThumbsUp } from "lucide-react";
import { fetchFeedPost, fetchMyFeedPosts } from "../../../services/feedService";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import {
  countComments,
  getPublicationKind,
  getPublicationSubtitle,
  getPublicationTitle,
  initials,
  statValue,
} from "../../../features/dashboard-publications/publicationUtils";
import * as styles from "../../../styles/components/dashboard/publicationStyles";

const INITIAL_COMMENTS = 3;
const NEXT_COMMENTS = 5;

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div style={styles.metricCard}>
      <span style={{ ...dashboardShell.iconBadge, width: 30, height: 30, color: "#2048a8" }}>
        <Icon size={14} />
      </span>
      <span>
        <strong style={{ display: "block", fontFamily: "var(--f-title)", fontSize: "1.12rem", color: "var(--text)" }}>{value}</strong>
        <span style={{ fontFamily: "var(--f-ui)", fontSize: ".72rem", fontWeight: 800, color: "var(--muted)" }}>{label}</span>
      </span>
    </div>
  );
}

function KindPill({ post, active = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        width: "fit-content",
        padding: "5px 8px",
        borderRadius: 999,
        background: active ? "rgba(36,86,191,.12)" : "rgba(36,86,191,.08)",
        border: "1px solid rgba(36,86,191,.14)",
        color: "#2048a8",
        fontFamily: "var(--f-ui)",
        fontSize: ".68rem",
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      <Sparkles size={11} />
      {getPublicationKind(post)}
    </span>
  );
}

function PublicationCard({ post, active, loading, onSelect }) {
  const comments = countComments(post);

  return (
    <button type="button" onClick={onSelect} style={styles.card(active)}>
      <div style={styles.cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <KindPill post={post} active={active} />
            <div style={{ marginTop: 4, fontFamily: "var(--f-title)", fontSize: "1rem", fontWeight: 850, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getPublicationTitle(post)}
            </div>
            <div style={{ ...dashboardShell.body, fontSize: ".78rem", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getPublicationSubtitle(post)}
            </div>
          </div>
          <span style={{ ...dashboardShell.badge, padding: "6px 9px", fontSize: ".7rem" }}>
            {post.posted || "Publicado"}
          </span>
        </div>

        {post.content ? (
          <p style={{ ...dashboardShell.body, fontSize: ".82rem", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {post.content}
          </p>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ ...dashboardShell.badge, padding: "6px 9px", fontSize: ".72rem" }}><ThumbsUp size={12} />{post.likes || 0}</span>
          <span style={{ ...dashboardShell.badge, padding: "6px 9px", fontSize: ".72rem" }}><MessageCircle size={12} />{comments}</span>
          <span style={{ ...dashboardShell.badge, padding: "6px 9px", fontSize: ".72rem" }}><Bookmark size={12} />{post.saves || 0}</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--f-ui)", fontSize: ".74rem", fontWeight: 850, color: active ? "#2048a8" : "var(--muted)" }}>
            <Eye size={13} />
            {loading ? "Abriendo..." : "Detalle"}
          </span>
        </div>
      </div>
      {post.image ? (
        <img src={post.image} alt={getPublicationTitle(post)} style={styles.thumb} />
      ) : (
        <div style={styles.fallbackThumb}>
          <FileText size={18} />
        </div>
      )}
    </button>
  );
}

function CommentItem({ comment }) {
  return (
    <div style={styles.commentCard}>
      {comment.authorAvatar ? (
        <img src={comment.authorAvatar} alt={comment.author || "Usuario Portafy"} style={styles.avatar} />
      ) : (
        <div style={styles.avatar}>{initials(comment.author)}</div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <strong style={{ fontFamily: "var(--f-ui)", color: "var(--text)", fontSize: ".84rem" }}>{comment.author || "Usuario Portafy"}</strong>
          {comment.posted ? <span style={{ fontFamily: "var(--f-ui)", fontSize: ".72rem", color: "var(--muted)", fontWeight: 700 }}>{comment.posted}</span> : null}
        </div>
        <p style={{ ...dashboardShell.body, fontSize: ".84rem", marginTop: 4 }}>{comment.text}</p>
      </div>
    </div>
  );
}

function PublicationDetail({ post, visibleComments, loadingComments, onShowMore, isCompact }) {
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [contentNeedsToggle, setContentNeedsToggle] = useState(false);
  const contentRef = useRef(null);
  const publicationId = post?.publicationId ?? null;
  const content = typeof post?.content === "string" ? post.content.trim() : "";
  const contentExpanded = expandedPostId === publicationId;

  useEffect(() => {
    const element = contentRef.current;
    if (!element || !content) return undefined;

    const checkOverflow = () => {
      const computedStyles = window.getComputedStyle(element);
      const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 24;
      const visibleLines = Math.ceil(element.scrollHeight / lineHeight);
      setContentNeedsToggle(visibleLines > 4);
    };

    checkOverflow();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
    }

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [content, isCompact]);

  if (!post) {
    return (
      <aside style={styles.sidePanel(isCompact)}>
        <div style={{ ...dashboardShell.iconBadge, width: 38, height: 38, color: "#2048a8" }}>
          <Eye size={17} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontFamily: "var(--f-title)", color: "var(--text)", fontSize: "1rem" }}>Selecciona una publicacion</h3>
          <p style={{ ...dashboardShell.body, marginTop: 6 }}>El detalle y los comentarios apareceran aqui.</p>
        </div>
      </aside>
    );
  }

  const comments = Array.isArray(post.comments) ? post.comments : [];
  const totalComments = countComments(post);
  const shownComments = comments.slice(0, visibleComments);
  const hasMore = visibleComments < comments.length || comments.length < totalComments;

  return (
    <aside style={styles.sidePanel(isCompact)}>
      <div style={styles.detailShell}>
        {post.image ? <img src={post.image} alt={getPublicationTitle(post)} style={styles.heroImage} /> : null}

        <div>
          <KindPill post={post} active />
          <h3 style={{ margin: "5px 0 4px", fontFamily: "var(--f-title)", color: "var(--text)", fontSize: isCompact ? "1.05rem" : "1.18rem", fontWeight: 850 }}>
            {getPublicationTitle(post)}
          </h3>
          <p style={{ ...dashboardShell.body, fontSize: ".84rem" }}>{getPublicationSubtitle(post)}</p>
        </div>

        {content ? (
          <div style={styles.contentBox}>
            <div style={styles.contentHeader}>
              <span style={styles.contentLabel}>
                <FileText size={13} />
                Contenido
              </span>
              {contentNeedsToggle ? (
                <button type="button" onClick={() => setExpandedPostId((current) => (current === post.publicationId ? null : post.publicationId))} style={styles.contentToggle}>
                  {contentExpanded ? "Contraer" : "Ver todo"}
                </button>
              ) : null}
            </div>
            <p ref={contentRef} style={styles.contentText(contentNeedsToggle && !contentExpanded)}>
              {content}
            </p>
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isCompact ? "repeat(auto-fit, minmax(110px, 1fr))" : "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        <MetricCard icon={ThumbsUp} label="Likes" value={post.likes || 0} />
        <MetricCard icon={MessageCircle} label="Coment." value={totalComments} />
        <MetricCard icon={Bookmark} label="Guard." value={post.saves || 0} />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <h4 style={{ margin: 0, fontFamily: "var(--f-title)", fontSize: ".98rem", color: "var(--text)" }}>Comentarios</h4>
          <span style={{ ...dashboardShell.badge, padding: "6px 9px", fontSize: ".72rem" }}>{totalComments}</span>
        </div>

        {loadingComments ? <p style={dashboardShell.body}>Cargando comentarios...</p> : null}
        {!loadingComments && shownComments.length ? (
          <div style={styles.commentsScroll(isCompact)}>
            {shownComments.map((comment) => <CommentItem key={comment.id} comment={comment} />)}
          </div>
        ) : null}
        {!loadingComments && !totalComments ? <p style={dashboardShell.body}>Aun no hay comentarios visibles.</p> : null}
        {!loadingComments && hasMore ? (
          <button type="button" onClick={onShowMore} style={{ ...dashboardShell.secondaryButton, justifyContent: "center" }}>
            Ver mas comentarios
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function needsFullDetail(post) {
  const loadedComments = Array.isArray(post?.comments) ? post.comments.length : 0;
  return countComments(post) > loadedComments;
}

export default function DashboardPublications() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loadingPostId, setLoadingPostId] = useState(null);
  const [visibleComments, setVisibleComments] = useState(INITIAL_COMMENTS);
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const summary = useMemo(() => ({
    posts: posts.length,
    likes: statValue(posts, (post) => post.likes),
    comments: statValue(posts, countComments),
    saves: statValue(posts, (post) => post.saves),
  }), [posts]);

  const selectedPost = posts.find((post) => post.publicationId === selectedId) || posts[0] || null;
  const isCompact = width < 1120;
  const isMobile = width < 720;

  const loadPosts = useCallback(async ({ silent = false, force = false } = {}) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    setError("");

    try {
      const items = await fetchMyFeedPosts({ limit: 40, force });
      setPosts(items);
      setSelectedId((current) => current ?? items[0]?.publicationId ?? null);
    } catch (loadError) {
      setError(loadError.message || "No se pudo cargar tu vitrina.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const loadPostDetail = useCallback(async (post) => {
    if (!post?.publicationId || loadingPostId === post.publicationId || !needsFullDetail(post)) return;

    setLoadingPostId(post.publicationId);
    try {
      const nextPost = await fetchFeedPost(post.publicationId);
      setPosts((current) => current.map((item) => item.publicationId === nextPost.publicationId ? nextPost : item));
    } finally {
      setLoadingPostId(null);
    }
  }, [loadingPostId]);

  useEffect(() => {
    if (selectedPost) {
      loadPostDetail(selectedPost);
    }
  }, [loadPostDetail, selectedPost]);

  const selectPost = async (post) => {
    setSelectedId(post.publicationId);
    setVisibleComments(INITIAL_COMMENTS);
    await loadPostDetail(post);
  };

  return (
    <div style={styles.shell}>
      <div style={styles.toolbar}>
        <div>
          <div style={dashboardShell.eyebrow}>Gestion del feed</div>
          <p style={{ ...dashboardShell.body, marginTop: 4 }}>Administra y revisa el rendimiento del contenido que compartiste.</p>
        </div>
        <button type="button" onClick={() => loadPosts({ silent: true, force: true })} disabled={loading || refreshing} style={dashboardShell.secondaryButton}>
          <RefreshCw size={14} />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <MetricCard icon={Newspaper} label="Compartidos" value={summary.posts} />
        <MetricCard icon={ThumbsUp} label="Me gusta" value={summary.likes} />
        <MetricCard icon={MessageCircle} label="Comentarios" value={summary.comments} />
        <MetricCard icon={Bookmark} label="Guardados" value={summary.saves} />
      </div>

      {error ? <section style={{ ...dashboardShell.surfaceCard, padding: 18 }}><p style={dashboardShell.body}>{error}</p></section> : null}
      {loading ? <section style={{ ...dashboardShell.surfaceCard, padding: 18 }}><p style={dashboardShell.body}>Cargando vitrina...</p></section> : null}
      {!loading && !error && !posts.length ? (
        <section style={{ ...dashboardShell.surfaceCard, padding: 24, textAlign: "center" }}>
          <p style={{ ...dashboardShell.body, margin: 0 }}>Aun no tienes contenido compartido desde tu portafolio.</p>
        </section>
      ) : null}

      {!loading && !error && posts.length ? (
        <div style={styles.workspace(isCompact)}>
          <div style={styles.list}>
            {posts.map((post) => (
              <PublicationCard
                key={post.publicationId || post.id}
                post={post}
                active={selectedPost?.publicationId === post.publicationId}
                loading={loadingPostId === post.publicationId}
                onSelect={() => selectPost(post)}
              />
            ))}
          </div>

          <PublicationDetail
            post={selectedPost}
            visibleComments={visibleComments}
            loadingComments={loadingPostId === selectedPost?.publicationId}
            isCompact={isCompact}
            onShowMore={async () => {
              if (selectedPost) await loadPostDetail(selectedPost);
              setVisibleComments((current) => current + (isMobile ? 3 : NEXT_COMMENTS));
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
