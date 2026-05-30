import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Eye, FileText, MessageCircle, Newspaper, RefreshCw, Sparkles, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
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
const PAGE_SIZE = 6;
const SORT_OPTIONS = ["popular", "likes", "newest", "oldest"];

function publicationScore(post = {}) {
  return Number(post.likes || 0) * 3 + countComments(post) * 2 + Number(post.saves || 0) * 2;
}

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
  const { t } = useTranslation();
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
      {getPublicationKind(post) === "Proyecto" ? t("appI18n.feed.post.project") : t("appI18n.feed.post.experience")}
    </span>
  );
}

function PublicationCard({ post, active, loading, onSelect }) {
  const { t } = useTranslation();
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
            {post.posted || t("appI18n.showcase.published")}
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
            {loading ? t("appI18n.showcase.opening") : t("appI18n.showcase.detail")}
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
  const { t } = useTranslation();
  return (
    <div style={styles.commentCard}>
      {comment.authorAvatar ? (
        <img src={comment.authorAvatar} alt={comment.author || t("appI18n.common.portfolioUser")} style={styles.avatar} />
      ) : (
        <div style={styles.avatar}>{initials(comment.author)}</div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <strong style={{ fontFamily: "var(--f-ui)", color: "var(--text)", fontSize: ".84rem" }}>{comment.author || t("appI18n.common.portfolioUser")}</strong>
          {comment.posted ? <span style={{ fontFamily: "var(--f-ui)", fontSize: ".72rem", color: "var(--muted)", fontWeight: 700 }}>{comment.posted}</span> : null}
        </div>
        <p style={{ ...dashboardShell.body, fontSize: ".84rem", marginTop: 4 }}>{comment.text}</p>
      </div>
    </div>
  );
}

function PublicationDetail({ post, visibleComments, loadingComments, onShowMore, isCompact }) {
  const { t } = useTranslation();
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
          <h3 style={{ margin: 0, fontFamily: "var(--f-title)", color: "var(--text)", fontSize: "1rem" }}>{t("appI18n.showcase.selectTitle")}</h3>
          <p style={{ ...dashboardShell.body, marginTop: 6 }}>{t("appI18n.showcase.selectText")}</p>
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
                {t("appI18n.showcase.content")}
              </span>
              {contentNeedsToggle ? (
                <button type="button" onClick={() => setExpandedPostId((current) => (current === post.publicationId ? null : post.publicationId))} style={styles.contentToggle}>
                  {contentExpanded ? t("appI18n.showcase.collapse") : t("appI18n.showcase.viewAll")}
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
        <MetricCard icon={ThumbsUp} label={t("appI18n.showcase.likes")} value={post.likes || 0} />
        <MetricCard icon={MessageCircle} label={t("appI18n.showcase.commentsShort")} value={totalComments} />
        <MetricCard icon={Bookmark} label={t("appI18n.showcase.savedShort")} value={post.saves || 0} />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <h4 style={{ margin: 0, fontFamily: "var(--f-title)", fontSize: ".98rem", color: "var(--text)" }}>{t("appI18n.showcase.comments")}</h4>
          <span style={{ ...dashboardShell.badge, padding: "6px 9px", fontSize: ".72rem" }}>{totalComments}</span>
        </div>

        {loadingComments ? <p style={dashboardShell.body}>{t("appI18n.showcase.loadingComments")}</p> : null}
        {!loadingComments && shownComments.length ? (
          <div style={styles.commentsScroll(isCompact)}>
            {shownComments.map((comment) => <CommentItem key={comment.id} comment={comment} />)}
          </div>
        ) : null}
        {!loadingComments && !totalComments ? <p style={dashboardShell.body}>{t("appI18n.showcase.noComments")}</p> : null}
        {!loadingComments && hasMore ? (
          <button type="button" onClick={onShowMore} style={{ ...dashboardShell.secondaryButton, justifyContent: "center" }}>
            {t("appI18n.showcase.viewMoreComments")}
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
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loadingPostId, setLoadingPostId] = useState(null);
  const [visibleComments, setVisibleComments] = useState(INITIAL_COMMENTS);
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [t]);

  const summary = useMemo(() => ({
    posts: posts.length,
    likes: statValue(posts, (post) => post.likes),
    comments: statValue(posts, countComments),
    saves: statValue(posts, (post) => post.saves),
  }), [posts]);

  const sortedPosts = useMemo(() => {
    const items = [...posts];
    const dateValue = (post) => new Date(post.createdAt || post.posted || 0).getTime() || 0;

    if (sortBy === "likes") {
      return items.sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0));
    }

    if (sortBy === "oldest") {
      return items.sort((a, b) => dateValue(a) - dateValue(b));
    }

    if (sortBy === "newest") {
      return items.sort((a, b) => dateValue(b) - dateValue(a));
    }

    return items.sort((a, b) => publicationScore(b) - publicationScore(a));
  }, [posts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const pagedPosts = sortedPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedPost = posts.find((post) => post.publicationId === selectedId) || sortedPosts[0] || null;
  const isCompact = width < 1120;
  const isMobile = width < 720;

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const loadPosts = useCallback(async ({ silent = false, force = false } = {}) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    setError("");

    try {
      const items = await fetchMyFeedPosts({ limit: 100, force });
      setPosts(items);
      setSelectedId((current) => current ?? items[0]?.publicationId ?? null);
    } catch (loadError) {
      setError(loadError.message || t("appI18n.showcase.loadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

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
          <div style={dashboardShell.eyebrow}>{t("appI18n.showcase.eyebrow")}</div>
          <p style={{ ...dashboardShell.body, marginTop: 4 }}>{t("appI18n.showcase.subtitle")}</p>
        </div>
        <button type="button" onClick={() => loadPosts({ silent: true, force: true })} disabled={loading || refreshing} style={dashboardShell.secondaryButton}>
          <RefreshCw size={14} />
          {refreshing ? t("appI18n.showcase.refreshing") : t("appI18n.common.refresh")}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <MetricCard icon={Newspaper} label={t("appI18n.showcase.shared")} value={summary.posts} />
        <MetricCard icon={ThumbsUp} label={t("appI18n.showcase.likeMetric")} value={summary.likes} />
        <MetricCard icon={MessageCircle} label={t("appI18n.showcase.comments")} value={summary.comments} />
        <MetricCard icon={Bookmark} label={t("appI18n.showcase.saved")} value={summary.saves} />
      </div>

      {!loading && !error && posts.length ? (
        <div style={styles.filterBar}>
          <label style={styles.sortField}>
            <span>{t("appI18n.showcase.sortLabel")}</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={styles.sortSelect}>
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`appI18n.showcase.sort.${option}`)}</option>
              ))}
            </select>
          </label>
          <div style={styles.pageSummary}>
            {t("appI18n.showcase.summary", { count: sortedPosts.length, page, totalPages })}
          </div>
        </div>
      ) : null}

      {error ? <section style={{ ...dashboardShell.surfaceCard, padding: 18 }}><p style={dashboardShell.body}>{error}</p></section> : null}
      {loading ? <section style={{ ...dashboardShell.surfaceCard, padding: 18 }}><p style={dashboardShell.body}>{t("appI18n.showcase.loading")}</p></section> : null}
      {!loading && !error && !posts.length ? (
        <section style={{ ...dashboardShell.surfaceCard, padding: 24, textAlign: "center" }}>
          <p style={{ ...dashboardShell.body, margin: 0 }}>{t("appI18n.showcase.empty")}</p>
        </section>
      ) : null}

      {!loading && !error && posts.length ? (
        <div style={styles.workspace(isCompact)}>
          <div style={styles.list}>
            {pagedPosts.map((post) => (
              <PublicationCard
                key={post.publicationId || post.id}
                post={post}
                active={selectedPost?.publicationId === post.publicationId}
                loading={loadingPostId === post.publicationId}
                onSelect={() => selectPost(post)}
              />
            ))}
            {totalPages > 1 ? (
              <div style={styles.pagination}>
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} style={styles.pageButton(page === 1)}>
                  <ChevronLeft size={14} />
                  {t("appI18n.showcase.previous")}
                </button>
                <span style={styles.pageCounter}>{page}/{totalPages}</span>
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} style={styles.pageButton(page === totalPages)}>
                  {t("appI18n.showcase.next")}
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : null}
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
