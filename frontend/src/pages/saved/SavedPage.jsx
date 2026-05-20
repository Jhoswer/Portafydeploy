import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  FolderKanban,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/landing/Navbar";
import LeftSidebar from "../../components/feed2/LeftSidebar";
import { FeedPostCard } from "../../components/feed2/FeedPostCard";
import { normalizeFeedPost } from "../../features/feed/feedMappers";
import {
  commentFeedPost,
  fetchFeedPost,
  fetchSavedFeedPosts,
  toggleFeedPostLike,
  toggleFeedPostSave,
} from "../../services/feedService";
import { useAuth } from "../../context/useAuth";

const SAVED_LIMIT = 40;

const FILTERS = [
  { key: "todos", label: "Todo", icon: Bookmark },
  { key: "project", label: "Proyectos", icon: FolderKanban },
  { key: "experience", label: "Experiencias", icon: BriefcaseBusiness },
];

export default function SavedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loadingCommentsId, setLoadingCommentsId] = useState(null);
  const [isPending, startTransition] = useTransition();

  const isOwnPost = useCallback((post) => {
    const authorId = post?.authorId;
    return Boolean(
      post?.ownedByMe ||
      (user?.id && authorId && String(user.id) === String(authorId))
    );
  }, [user?.id]);

  const normalizeSavedPost = useCallback((post) => {
    const normalized = normalizeFeedPost(post);
    const ownedByMe = isOwnPost(normalized);

    return {
      ...normalized,
      ownedByMe,
      savedAt: post.savedAt || normalized.savedAt || "",
      savedLabel: post.savedLabel || "",
    };
  }, [isOwnPost]);

  const loadSaved = useCallback(async ({ silent = false, signal, force = false } = {}) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    setError("");

    try {
      const items = await fetchSavedFeedPosts({ limit: SAVED_LIMIT, signal, force });
      startTransition(() => setPosts(items.map(normalizeSavedPost)));
    } catch (loadError) {
      if (loadError.name === "AbortError") return;
      setError(loadError.message || "No se pudieron cargar tus guardados.");
    } finally {
      if (!signal?.aborted) setLoading(false);
      if (!signal?.aborted) setRefreshing(false);
    }
  }, [normalizeSavedPost]);

  useEffect(() => {
    const controller = new AbortController();
    loadSaved({ signal: controller.signal, force: true });
    return () => controller.abort();
  }, [loadSaved]);

  const patchPost = useCallback((publicationId, updater) => {
    setPosts((currentPosts) => currentPosts.map((post) => (
      post.publicationId === publicationId ? updater(post) : post
    )));
  }, []);

  const mergePost = useCallback((nextPost) => {
    if (!nextPost?.publicationId) return;
    const normalized = normalizeSavedPost(nextPost);
    setPosts((currentPosts) => currentPosts.map((post) => (
      post.publicationId === normalized.publicationId
        ? {
            ...normalized,
            commentsList: normalized.commentsList.length >= post.commentsList.length
              ? normalized.commentsList
              : post.commentsList,
          }
        : post
    )));
  }, [normalizeSavedPost]);

  const removePost = useCallback((publicationId) => {
    setPosts((currentPosts) => currentPosts.filter((post) => String(post.publicationId) !== String(publicationId)));
  }, []);

  const filteredPosts = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (activeFilter !== "todos" && post.sourceType !== activeFilter) return false;
      if (!cleanQuery) return true;

      const haystack = [
        post.author,
        post.authorTitle,
        post.description,
        post.project?.title,
        post.project?.description,
        post.experience?.title,
        post.experience?.company,
        post.experience?.description,
        ...(post.tags || []).map((tag) => tag.label),
      ].filter(Boolean).join(" ").toLowerCase();

      return haystack.includes(cleanQuery);
    });
  }, [activeFilter, posts, query]);

  const summary = useMemo(() => ({
    total: posts.length,
    projects: posts.filter((post) => post.sourceType === "project").length,
    experiences: posts.filter((post) => post.sourceType === "experience").length,
  }), [posts]);

  const runPostAction = async (post, action, key, optimisticUpdater = null) => {
    const actionKey = `${key}-${post.publicationId}`;
    if (busyAction === actionKey) return;

    setBusyAction(actionKey);
    const previousPosts = posts;

    if (optimisticUpdater) {
      patchPost(post.publicationId, optimisticUpdater);
    }

    try {
      const nextPost = await action(post.publicationId);
      mergePost(nextPost);
    } catch (actionError) {
      if (optimisticUpdater) setPosts(previousPosts);
      setError(actionError.message || "No se pudo actualizar el guardado.");
    } finally {
      setBusyAction("");
    }
  };

  const toggleComments = async (post) => {
    const willOpen = commentingPostId !== post.publicationId;
    setCommentingPostId(willOpen ? post.publicationId : null);

    const visibleCommentTarget = Math.min(post.comments, 3);
    if (!willOpen || post.comments === 0 || post.commentsList?.length >= visibleCommentTarget) return;

    setLoadingCommentsId(post.publicationId);

    try {
      mergePost(await fetchFeedPost(post.publicationId));
    } finally {
      setLoadingCommentsId(null);
    }
  };

  const submitComment = async (event, post) => {
    event.preventDefault();
    const text = String(commentDrafts[post.publicationId] || "").trim();
    if (!text) return;

    setCommentDrafts((prev) => ({ ...prev, [post.publicationId]: "" }));
    patchPost(post.publicationId, (currentPost) => ({
      ...currentPost,
      comments: currentPost.comments + 1,
    }));

    await runPostAction(post, (id) => commentFeedPost(id, text), "comment");
  };

  const unSavePost = async (post) => {
    const actionKey = `save-${post.publicationId}`;
    if (busyAction === actionKey) return;

    const previousPosts = posts;
    setBusyAction(actionKey);
    removePost(post.publicationId);

    try {
      await toggleFeedPostSave(post.publicationId);
    } catch (actionError) {
      setPosts(previousPosts);
      setError(actionError.message || "No se pudo quitar de guardados.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div className="page-wrapper page-feed page-saved">
      <Navbar />
      <div className="layout saved-layout">
        <LeftSidebar />

        <main className="saved-main">
          <section className="saved-hero">
            <div className="saved-hero__copy">
              <span className="saved-kicker"><Sparkles size={15} /> Biblioteca personal</span>
              <h1>Guardados</h1>
              <p>Un espacio para volver a proyectos y experiencias que valen una segunda mirada.</p>
            </div>

            <div className="saved-hero__stats" aria-label="Resumen de guardados">
              <SavedMetric label="Total" value={summary.total} />
              <SavedMetric label="Proyectos" value={summary.projects} />
              <SavedMetric label="Experiencias" value={summary.experiences} />
            </div>
          </section>

          <section className="saved-toolbar">
            <div className="saved-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por autor, titulo, empresa o tecnologia"
              />
            </div>

            <div className="saved-filters" aria-label="Filtros de guardados">
              {FILTERS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={activeFilter === key ? "active" : ""}
                  onClick={() => setActiveFilter(key)}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <button
              className="saved-refresh"
              type="button"
              onClick={() => loadSaved({ silent: true, force: true })}
              disabled={loading || refreshing || isPending}
            >
              <RefreshCw size={15} />
              {refreshing || isPending ? "Sincronizando" : "Actualizar"}
            </button>
          </section>

          {loading ? <SavedSkeleton /> : null}
          {error && !loading ? <SavedState title="No se pudieron cargar tus guardados" text={error} /> : null}
          {!loading && !error && filteredPosts.length === 0 ? (
            <SavedState
              title={posts.length ? "No hay coincidencias" : "Aun no tienes guardados"}
              text={posts.length ? "Prueba con otro filtro o una busqueda mas corta." : "Cuando guardes una publicacion del feed, aparecera aqui para revisarla despues."}
            />
          ) : null}

          {!loading && !error && filteredPosts.length ? (
            <div className="saved-stack">
              {filteredPosts.map((post) => (
                <div key={post.publicationId || post.id} className="saved-card-wrap">
                  <div className="saved-card-wrap__ribbon">
                    <Bookmark size={14} fill="currentColor" />
                    {post.savedLabel ? `Guardado ${post.savedLabel}` : "Guardado"}
                  </div>
                  <FeedPostCard
                    post={{ ...post, savedByMe: true }}
                    commentDraft={commentDrafts[post.publicationId] || ""}
                    isCommentingOpen={commentingPostId === post.publicationId}
                    isLiking={busyAction === `like-${post.publicationId}`}
                    isSaving={busyAction === `save-${post.publicationId}`}
                    isCommenting={busyAction === `comment-${post.publicationId}`}
                    isLoadingComments={loadingCommentsId === post.publicationId}
                    onLike={() => runPostAction(
                      post,
                      toggleFeedPostLike,
                      "like",
                      (currentPost) => {
                        const likedByMe = !currentPost.likedByMe;
                        return { ...currentPost, likedByMe, likes: Math.max(0, currentPost.likes + (likedByMe ? 1 : -1)) };
                      }
                    )}
                    onSave={() => unSavePost(post)}
                    onToggleComment={() => toggleComments(post)}
                    onCommentDraftChange={(value) => setCommentDrafts((prev) => ({ ...prev, [post.publicationId]: value }))}
                    onSubmitComment={(event) => submitComment(event, post)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </main>

        <aside className="saved-insights">
          <div className="card">
            <div className="card-body">
              <div className="card-title">Lectura rapida</div>
              <div className="saved-insight-list">
                <SavedInsight value={summary.total} label="items listos para revisar" />
                <SavedInsight value={summary.projects} label="proyectos con ideas tecnicas" />
                <SavedInsight value={summary.experiences} label="experiencias para comparar trayectorias" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SavedMetric({ label, value }) {
  return (
    <div className="saved-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SavedInsight({ value, label }) {
  return (
    <div className="saved-insight">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SavedState({ title, text }) {
  return (
    <section className="saved-state">
      <Bookmark size={28} />
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function SavedSkeleton() {
  return (
    <div className="saved-skeleton">
      {[0, 1, 2].map((item) => (
        <div key={item} className="saved-skeleton__card">
          <span />
          <strong />
          <p />
          <div />
        </div>
      ))}
    </div>
  );
}
