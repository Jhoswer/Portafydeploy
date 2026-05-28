import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { LockKeyhole, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hasPermission, PERMISSION_NAMES } from "../../utils/permissions";
import {
  COMMENT_MAX_LENGTH,
  commentFeedPost,
  FEED_UPDATED_EVENT,
  fetchFeedPost,
  fetchFeedPosts,
  fetchTrendingFeedPosts,
  getCachedFeedPosts,
  sanitizeCommentInput,
  toggleFeedPostLike,
  toggleFeedPostSave,
  unshareFeedPost,
  validateCommentText,
} from "../../services/feedService";
import { FeedPostCard, PostCommentsModal } from "./FeedPostCard";
import { FeedOfferCard } from "./FeedOfferCard/FeedOfferCard";
import { ReportPublicationModal } from "./ReportPublicationModal";
import { normalizeFeedPost } from "../../features/feed/feedMappers";
import { ConfirmModal } from "../../features/dashboard-portfolio/portfolioWorkspaceControls";
import { useAuth } from "../../context/useAuth";
import { createCommentReport, createPublicationReport } from "../../services/reportService";
import { followProfile, unfollowProfile } from "../../services/profileTrustService";

const FEED_LIMIT = 20;
const REFRESH_INTERVAL_MS = 30000;

export default function FeedReal({ activeFilter }) {
  const { user, cvs } = useAuth();
  const navigate = useNavigate();
  const cachedPosts = useMemo(() => (
    activeFilter === "tendencias" ? [] : getCachedFeedPosts({ limit: FEED_LIMIT }).map(normalizeFeedPost)
  ), [activeFilter]);
  const [posts, setPosts] = useState(cachedPosts);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(cachedPosts.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [busyAction, setBusyAction] = useState("");
  const [loadingCommentsId, setLoadingCommentsId] = useState(null);
  const [commentsModalPost, setCommentsModalPost] = useState(null);
  const [commentsModalLoadingId, setCommentsModalLoadingId] = useState(null);
  const [pendingUnsharePost, setPendingUnsharePost] = useState(null);
  const [pendingReportPost, setPendingReportPost] = useState(null);
  const [pendingReportComment, setPendingReportComment] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(null);
  const [reportError, setReportError] = useState("");
  const [followingAuthorId, setFollowingAuthorId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const postsLengthRef = useRef(posts.length);
  const pendingFollowAuthorRef = useRef(null);

  useEffect(() => {
    postsLengthRef.current = posts.length;
  }, [posts.length]);

  const canReact = hasPermission(user, PERMISSION_NAMES.FEED_REACT);
  const canComment = hasPermission(user, PERMISSION_NAMES.FEED_COMMENT);

  const requireAuthenticated = useCallback((action = "interactuar") => {
    if (user) return true;
    setAuthPrompt(action);
    return false;
  }, [user]);

  const loadPosts = useCallback(async ({ silent = false, signal, force = false } = {}) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    setError("");

    try {
      const fetcher = activeFilter === "tendencias" ? fetchTrendingFeedPosts : fetchFeedPosts;
      const items = await fetcher({ limit: FEED_LIMIT, signal, force });
      startTransition(() => {
        setPosts(items.map(normalizeFeedPost));
      });
    } catch (loadError) {
      if (loadError.name === "AbortError") return;
      if (!postsLengthRef.current) setError(loadError.message || "No se pudo cargar el feed.");
    } finally {
      if (!signal?.aborted) setLoading(false);
      if (!signal?.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (activeFilter === "tendencias") setPosts([]);
    loadPosts({
      signal: controller.signal,
      silent: cachedPosts.length > 0,
      force: true,
    });
    return () => controller.abort();
  }, [activeFilter, cachedPosts.length, loadPosts]);

  const mergePost = useCallback((nextPost, { prependIfMissing = false } = {}) => {
    if (!nextPost?.publicationId) return;
    const normalized = normalizeFeedPost(nextPost);
    setPosts((currentPosts) => {
      const exists = currentPosts.some((post) => post.publicationId === normalized.publicationId);

      if (exists) {
        return currentPosts.map((post) => (
          post.publicationId === normalized.publicationId
            ? {
                ...normalized,
                commentsList: normalized.commentsList.length >= post.commentsList.length
                  ? normalized.commentsList
                  : post.commentsList,
              }
            : post
        ));
      }

      return prependIfMissing ? [normalized, ...currentPosts] : currentPosts;
    });
  }, []);

  const patchPost = useCallback((publicationId, updater) => {
    setPosts((currentPosts) => currentPosts.map((post) => (
      post.publicationId === publicationId ? updater(post) : post
    )));
  }, []);

  const removePost = useCallback((publicationId) => {
    setPosts((currentPosts) => currentPosts.filter((post) => String(post.publicationId) !== String(publicationId)));
  }, []);

  useEffect(() => {
    const handleFeedUpdated = (event) => {
      const post = event.detail?.post;
      const removedPublicationId = event.detail?.removedPublicationId;

      if (removedPublicationId) {
        removePost(removedPublicationId);
        return;
      }

      if (post?.publicationId) {
        mergePost(post, { prependIfMissing: true });
        return;
      }

      loadPosts({ silent: true, force: true });
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadPosts({ silent: true, force: true });
      }
    };

    window.addEventListener(FEED_UPDATED_EVENT, handleFeedUpdated);
    window.addEventListener("focus", handleFocus);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadPosts({ silent: true, force: true });
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener(FEED_UPDATED_EVENT, handleFeedUpdated);
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(intervalId);
    };
  }, [loadPosts, mergePost, removePost]);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "tendencias") return posts;
    if (activeFilter === "todos") return posts;
    return posts.filter((post) => post.type === activeFilter);
  }, [activeFilter, posts]);

  const isOwnPost = useCallback((post) => {
    const authorId = post?.authorId;
    return Boolean(
      post?.ownedByMe ||
      (user?.id && authorId && String(user.id) === String(authorId))
    );
  }, [user?.id]);

  const runPostAction = async (post, action, key, optimisticUpdater = null, requiredPermission = null) => {
    if (!requireAuthenticated(key)) return;
    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      setError("No tienes permisos para realizar esta accion.");
      return;
    }

    const actionKey = `${key}-${post.publicationId}`;
    if (busyAction === actionKey) return;

    setBusyAction(actionKey);
    const previousPosts = posts;

    if (optimisticUpdater) {
      patchPost(post.publicationId, optimisticUpdater);
    }

    try {
      mergePost(await action(post.publicationId));
    } catch (actionError) {
      if (optimisticUpdater) setPosts(previousPosts);
      setError(actionError.message || "No se pudo actualizar la publicacion.");
    } finally {
      setBusyAction("");
    }
  };

  const toggleComments = async (post) => {
    if (!requireAuthenticated("comentar")) return;
    if (!canComment) {
      setError("No tienes permisos para comentar publicaciones.");
      return;
    }

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

  const openProfile = useCallback((authorId) => {
    if (!authorId) return;
    navigate(`/perfil-profesional?usuario=${authorId}`);
  }, [navigate]);

  const openAllComments = useCallback(async (post) => {
    if (!post?.publicationId) return;

    setCommentsModalPost(post);

    const loadedCount = post.commentsList?.length || 0;
    if (loadedCount >= Number(post.comments || 0)) return;

    setCommentsModalLoadingId(post.publicationId);
    try {
      const fullPost = await fetchFeedPost(post.publicationId);
      const normalized = normalizeFeedPost(fullPost);
      mergePost(fullPost);
      setCommentsModalPost(normalized);
    } catch (actionError) {
      setError(actionError.message || "No se pudieron cargar todos los comentarios.");
    } finally {
      setCommentsModalLoadingId(null);
    }
  }, [mergePost]);

  const patchAuthorFollowState = useCallback((authorId, summary = {}) => {
    setPosts((currentPosts) => currentPosts.map((item) => {
      if (String(item.authorId) !== String(authorId)) return item;

      return {
        ...item,
        authorFollowers: Number(summary.followers ?? item.authorFollowers),
        authorFollowing: Number(summary.following ?? item.authorFollowing),
        authorIsFollowing: Boolean(summary.is_following),
      };
    }));

    setCommentsModalPost((current) => {
      if (!current || String(current.authorId) !== String(authorId)) return current;
      return {
        ...current,
        authorFollowers: Number(summary.followers ?? current.authorFollowers),
        authorFollowing: Number(summary.following ?? current.authorFollowing),
        authorIsFollowing: Boolean(summary.is_following),
      };
    });
  }, [activeFilter]);

  const toggleAuthorFollow = useCallback(async (post) => {
    if (!requireAuthenticated("seguir")) return;
    if (!post?.authorId || String(post.authorId) === String(user?.id)) return;
    if (pendingFollowAuthorRef.current && String(pendingFollowAuthorRef.current) === String(post.authorId)) return;

    const previousPosts = posts;
    const nextFollowing = !post.authorIsFollowing;
    pendingFollowAuthorRef.current = post.authorId;
    setFollowingAuthorId(post.authorId);

    patchAuthorFollowState(post.authorId, {
      followers: Math.max(0, Number(post.authorFollowers || 0) + (nextFollowing ? 1 : -1)),
      following: post.authorFollowing,
      is_following: nextFollowing,
    });

    try {
      const payload = nextFollowing
        ? await followProfile(post.authorId)
        : await unfollowProfile(post.authorId);
      patchAuthorFollowState(post.authorId, payload.summary || {});
    } catch (actionError) {
      setPosts(previousPosts);
      setError(actionError.message || "No se pudo actualizar el seguimiento.");
    } finally {
      pendingFollowAuthorRef.current = null;
      setFollowingAuthorId(null);
    }
  }, [patchAuthorFollowState, posts, requireAuthenticated, user?.id]);

  const submitComment = async (event, post) => {
    event.preventDefault();
    if (!requireAuthenticated("comentar")) return;
    if (!canComment) {
      setError("No tienes permisos para comentar publicaciones.");
      return;
    }

    const text = String(commentDrafts[post.publicationId] || "").trim();
    const validationError = validateCommentText(text);

    if (validationError) {
      setCommentErrors((prev) => ({ ...prev, [post.publicationId]: validationError }));
      return;
    }

    setCommentErrors((prev) => ({ ...prev, [post.publicationId]: "" }));

    setCommentDrafts((prev) => ({ ...prev, [post.publicationId]: "" }));
    patchPost(post.publicationId, (currentPost) => ({
      ...currentPost,
      comments: currentPost.comments + 1,
    }));

    await runPostAction(post, (id) => commentFeedPost(id, text), "comment");
  };

  const unsharePost = async (post) => {
    if (!requireAuthenticated("dejar de compartir")) return;

    const actionKey = `unshare-${post.publicationId}`;
    if (!post?.publicationId || busyAction === actionKey) return;

    const previousPosts = posts;
    setBusyAction(actionKey);
    removePost(post.publicationId);

    try {
      await unshareFeedPost(post.publicationId);
      setPendingUnsharePost(null);
    } catch (actionError) {
      setPosts(previousPosts);
      setError(actionError.message || "No se pudo dejar de compartir.");
    } finally {
      setBusyAction("");
    }
  };

  const reportPost = async (payload) => {
    if (!requireAuthenticated("reportar")) return;
    if (!pendingReportPost?.publicationId) return;

    const actionKey = `report-${pendingReportPost.publicationId}`;
    if (busyAction === actionKey) return;

    setBusyAction(actionKey);
    setReportError("");

    try {
      await createPublicationReport(pendingReportPost.publicationId, payload);
      setPendingReportPost(null);
    } catch (actionError) {
      setReportError(actionError.message || "No se pudo enviar el reporte.");
    } finally {
      setBusyAction("");
    }
  };

  const reportComment = async (payload) => {
    if (!requireAuthenticated("reportar")) return;
    if (!pendingReportComment?.id) return;

    const actionKey = `report-comment-${pendingReportComment.id}`;
    if (busyAction === actionKey) return;

    setBusyAction(actionKey);
    setReportError("");

    try {
      await createCommentReport(pendingReportComment.id, payload);
      setPendingReportComment(null);
    } catch (actionError) {
      setReportError(actionError.message || "No se pudo enviar el reporte de comentario.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <>
      <main className="feed">
        <div className="card" style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--f-title)", fontWeight: 850, color: "var(--text)", marginBottom: 3 }}>
              {activeFilter === "tendencias" ? "Tendencias profesionales" : "Feed profesional"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {activeFilter === "tendencias" ? "Publicaciones populares ordenadas por actividad de la plataforma." : "Contenido real compartido desde portafolios y perfiles."}
            </div>
          </div>
          <button className="composer-btn" type="button" onClick={() => loadPosts({ silent: true, force: true })} disabled={loading || isPending || refreshing} style={{ border: "1px solid var(--border-soft)", background: "var(--dashboard-soft-bg, #fbfdff)" }}>
            <RefreshCw size={15} />
            {refreshing || isPending ? "Sincronizando" : "Actualizar"}
          </button>
        </div>

        {refreshing && posts.length ? <FeedSyncHint /> : null}
        {loading ? <FeedSkeleton /> : null}
        {error && !loading ? <FeedState title="No se pudo cargar el feed" text={error} /> : null}
        {!loading && !error && filteredPosts.length === 0 ? <FeedState title="Aun no hay contenido compartido" text="Comparte un proyecto o experiencia desde tu perfil para verlo aqui." /> : null}

        {!loading && !error ? filteredPosts.map((post) => {
          if (post.sourceType === "offer") {
            return (
              <FeedOfferCard
                key={post.id}
                post={post}
                userCvs={cvs}
                onRequireAuth={requireAuthenticated}
                canReact={canReact}
                canComment={canComment}
              />
            );
          }

          const ownedByMe = isOwnPost(post);
          const displayPost = ownedByMe === post.ownedByMe ? post : { ...post, ownedByMe };

          return (
            <FeedPostCard
              key={post.publicationId || post.id}
              post={displayPost}
              commentDraft={commentDrafts[post.publicationId] || ""}
              commentError={commentErrors[post.publicationId] || ""}
              commentMaxLength={COMMENT_MAX_LENGTH}
              isCommentingOpen={commentingPostId === post.publicationId}
              isLiking={busyAction === `like-${post.publicationId}`}
              isSaving={busyAction === `save-${post.publicationId}`}
              isCommenting={busyAction === `comment-${post.publicationId}`}
              isUnsharing={busyAction === `unshare-${post.publicationId}`}
              isLoadingComments={loadingCommentsId === post.publicationId}
              isLoadingAllComments={commentsModalLoadingId === post.publicationId}
              canReact={canReact}
              canComment={canComment}
              currentUserId={user?.id ?? null}
              onOpenProfile={openProfile}
              onViewAllComments={() => openAllComments(displayPost)}
              onFollowAuthor={() => toggleAuthorFollow(displayPost)}
              isFollowingAuthor={Boolean(displayPost.authorIsFollowing)}
              isFollowAuthorBusy={String(followingAuthorId) === String(displayPost.authorId)}
              onReportComment={(comment) => {
                if (!requireAuthenticated("reportar")) return;
                setReportError("");
                setPendingReportComment({ ...comment, post: displayPost });
              }}
              onUnshare={ownedByMe ? () => setPendingUnsharePost(displayPost) : null}
              onReport={!ownedByMe ? () => {
                if (!requireAuthenticated("reportar")) return;
                setReportError("");
                setPendingReportPost(displayPost);
              } : null}
              onLike={() => runPostAction(
                post, toggleFeedPostLike, "like",
                (currentPost) => {
                  const likedByMe = !currentPost.likedByMe;
                  return { ...currentPost, likedByMe, likes: Math.max(0, currentPost.likes + (likedByMe ? 1 : -1)) };
                },
                PERMISSION_NAMES.FEED_REACT
              )}
              onSave={() => runPostAction(
                post, toggleFeedPostSave, "save",
                (currentPost) => {
                  const savedByMe = !currentPost.savedByMe;
                  return { ...currentPost, savedByMe, saves: Math.max(0, currentPost.saves + (savedByMe ? 1 : -1)) };
                }
              )}
              onToggleComment={() => toggleComments(post)}
              onCommentDraftChange={(value) => {
                const sanitized = sanitizeCommentInput(value);
                setCommentDrafts((prev) => ({ ...prev, [post.publicationId]: sanitized }));
                if (commentErrors[post.publicationId]) {
                  setCommentErrors((prev) => ({ ...prev, [post.publicationId]: "" }));
                }
              }}
              onSubmitComment={(event) => submitComment(event, post)}
            />
          );
        }) : null}
      </main>

      {pendingUnsharePost ? (
        <ConfirmModal
          title="Dejar de compartir"
          description="Este contenido se retirara del feed y de tu vitrina. El proyecto o experiencia original seguira guardado en tu portafolio."
          confirmLabel="Dejar de compartir"
          tone="danger"
          onCancel={() => setPendingUnsharePost(null)}
          onConfirm={() => unsharePost(pendingUnsharePost)}
          isBusy={busyAction === `unshare-${pendingUnsharePost.publicationId}`}
        />
      ) : null}

      {pendingReportPost ? (
        <ReportPublicationModal
          key={pendingReportPost.publicationId}
          post={pendingReportPost}
          isOpen
          isBusy={busyAction === `report-${pendingReportPost.publicationId}`}
          error={reportError}
          onClose={() => {
            if (busyAction.startsWith("report-")) return;
            setPendingReportPost(null);
            setReportError("");
          }}
          onSubmit={reportPost}
        />
      ) : null}

      {commentsModalPost ? (
        <PostCommentsModal
          post={commentsModalPost}
          isLoading={commentsModalLoadingId === commentsModalPost.publicationId}
          onClose={() => setCommentsModalPost(null)}
          onOpenProfile={openProfile}
          currentUserId={user?.id ?? null}
          onReportComment={(comment) => {
            if (!requireAuthenticated("reportar")) return;
            setReportError("");
            setPendingReportComment({ ...comment, post: commentsModalPost });
          }}
        />
      ) : null}

      {pendingReportComment ? (
        <ReportPublicationModal
          key={`comment-${pendingReportComment.id}`}
          post={pendingReportComment.post}
          comment={pendingReportComment}
          reportKind="comment"
          isOpen
          isBusy={busyAction === `report-comment-${pendingReportComment.id}`}
          error={reportError}
          onClose={() => {
            if (busyAction.startsWith("report-comment-")) return;
            setPendingReportComment(null);
            setReportError("");
          }}
          onSubmit={reportComment}
        />
      ) : null}

      {authPrompt ? (
        <VisitorAuthPrompt
          action={authPrompt}
          onClose={() => setAuthPrompt(null)}
          onLogin={() => {
            setAuthPrompt(null);
            navigate("/login");
          }}
          onRegister={() => {
            setAuthPrompt(null);
            navigate("/register");
          }}
        />
      ) : null}
    </>
  );
}

function VisitorAuthPrompt({ action, onClose, onLogin, onRegister }) {
  const actionCopy = {
    like: "reaccionar a publicaciones",
    save: "guardar publicaciones",
    comment: "comentar publicaciones",
    comentar: "comentar publicaciones",
    reportar: "reportar contenido",
    "dejar de compartir": "administrar publicaciones",
    postular: "postularte a ofertas",
    compartir: "compartir contenido",
    guardar: "guardar contenido",
    seguir: "seguir perfiles",
  };

  return (
    <div className="feed-auth-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="feed-auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feed-auth-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="feed-auth-modal__icon">
          <LockKeyhole size={22} />
        </div>
        <div>
          <h3 id="feed-auth-modal-title">Inicia sesion para interactuar</h3>
          <p>
            Puedes explorar el feed libremente. Para {actionCopy[action] || "interactuar con publicaciones"},
            entra a tu cuenta o crea una nueva.
          </p>
        </div>
        <div className="feed-auth-modal__actions">
          <button type="button" onClick={onClose}>Seguir explorando</button>
          <button type="button" onClick={onRegister}>Registrarme</button>
          <button type="button" onClick={onLogin}>Iniciar sesion</button>
        </div>
      </section>
    </div>
  );
}

function FeedState({ title, text }) {
  return (
    <div className="card" style={{ padding: "36px 28px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--f-title)", fontSize: "1.05rem", fontWeight: 850, color: "var(--text)", marginBottom: 6 }}>{title}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{text}</div>
    </div>
  );
}

function FeedSyncHint() {
  return (
    <div style={{ height: 0, position: "relative", zIndex: 2 }}>
      <div
        style={{
          position: "absolute",
          right: 12,
          top: -8,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,.94)",
          border: "1px solid rgba(205,225,245,.84)",
          boxShadow: "0 10px 24px rgba(14,30,60,.08)",
          color: "#64748b",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa" }} />
        Sincronizando
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {[0, 1, 2].map((item) => (
        <div key={item} className="card" style={{ padding: 18, display: "grid", gap: 14, opacity: 0.88 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={skeletonCircle} />
            <div style={{ display: "grid", gap: 7, flex: 1 }}>
              <div style={{ ...skeletonLine, width: "36%" }} />
              <div style={{ ...skeletonLine, width: "52%", height: 9 }} />
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ ...skeletonLine, width: "86%" }} />
            <div style={{ ...skeletonLine, width: "64%" }} />
          </div>
          <div style={{ ...skeletonBlock, height: 165 }} />
        </div>
      ))}
    </div>
  );
}

const skeletonLine = {
  height: 11,
  borderRadius: 999,
  background: "linear-gradient(90deg, rgba(226,232,240,.82), rgba(248,250,252,.92), rgba(226,232,240,.82))",
  backgroundSize: "180% 100%",
};

const skeletonCircle = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(226,232,240,.9), rgba(248,250,252,.95))",
};

const skeletonBlock = {
  borderRadius: 18,
  border: "1px solid rgba(226,232,240,.8)",
  background: "linear-gradient(135deg, rgba(248,250,252,.95), rgba(239,246,255,.82))",
};
