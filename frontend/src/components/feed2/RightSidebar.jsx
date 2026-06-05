import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import { fetchTrendingFeedPosts } from "../../services/feedService";
import { fetchSuggestedUsers } from "../../services/searchService";

function initialsFromName(name) {
  return String(name || "P")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function postTitle(post = {}, t) {
  return post.project?.title || post.experience?.title || post.title || t("appI18n.feed.right.featuredPublication");
}

function postType(post = {}, t) {
  return post.type === "experience" ? t("appI18n.feed.right.experience") : t("appI18n.feed.right.project");
}

export default function RightSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { suggestions, loadingSuggestions } = useSuggestedUsers();
  const { trendingPosts, loadingTrending } = useTrendingPosts();

  const hasSuggestions = suggestions.length > 0;

  return (
    <aside className="sidebar-right">
      <div className="card feed-side-card">
        <div className="card-body">
          <div className="card-title">{t("appI18n.feed.right.suggestedPeople")}</div>

          {loadingSuggestions ? <SuggestionSkeleton /> : null}

          {!loadingSuggestions && !hasSuggestions ? (
            <div className="suggestion-empty">
              {t("appI18n.feed.right.suggestionsEmpty")}
            </div>
          ) : null}

          {!loadingSuggestions && hasSuggestions
            ? suggestions.map((suggestedUser, index) => (
                <SuggestionItem
                  key={suggestedUser.id}
                  user={suggestedUser}
                  index={index}
                  t={t}
                  onOpen={() =>
                    navigate(suggestedUser.profileUrl || `/perfil-profesional?usuario=${suggestedUser.id}`)
                  }
                />
              ))
            : null}
        </div>
      </div>

      <div className="card feed-side-card">
        <div className="card-body">
          <div className="card-title">{t("appI18n.feed.right.trending")}</div>
          {loadingTrending ? <SuggestionSkeleton label={t("appI18n.feed.right.loadingTrending")} /> : null}
          {!loadingTrending && !trendingPosts.length ? (
            <div className="suggestion-empty">{t("appI18n.feed.right.trendingEmpty")}</div>
          ) : null}
          {!loadingTrending && trendingPosts.length
            ? trendingPosts.map((post, index) => (
                <TrendingItem
                  key={post.publicationId || post.id}
                  post={post}
                  index={index}
                  t={t}
                  onOpen={() => navigate("/tendencias")}
                />
              ))
            : null}
        </div>
      </div>
    </aside>
  );
}

export function SuggestedPeopleInline() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { suggestions, loadingSuggestions } = useSuggestedUsers(8);

  if (!loadingSuggestions && suggestions.length === 0) return null;

  return (
    <section className="feed-inline-module feed-inline-module--suggestions">
      <div className="feed-inline-module__head">
        <div>
          <p>{t("appI18n.feed.right.suggestedPeople")}</p>
          <span>{t("appI18n.feed.right.professionalFallback")}</span>
        </div>
      </div>
      <div className="feed-inline-module__rail" aria-label={t("appI18n.feed.right.suggestedPeople")}>
        {loadingSuggestions ? (
          <InlineSkeleton label={t("appI18n.feed.right.loadingProfiles")} />
        ) : suggestions.map((suggestedUser, index) => (
          <SuggestionItem
            key={suggestedUser.id}
            user={suggestedUser}
            index={index}
            t={t}
            variant="inline"
            onOpen={() => navigate(suggestedUser.profileUrl || `/perfil-profesional?usuario=${suggestedUser.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

export function TrendingPostsInline() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trendingPosts, loadingTrending } = useTrendingPosts(6);

  if (!loadingTrending && trendingPosts.length === 0) return null;

  return (
    <section className="feed-inline-module feed-inline-module--trending">
      <div className="feed-inline-module__head">
        <div>
          <p>{t("appI18n.feed.right.trending")}</p>
          <span>{t("appI18n.feed.header.trendingSubtitle")}</span>
        </div>
      </div>
      <div className="feed-inline-module__rail" aria-label={t("appI18n.feed.right.trending")}>
        {loadingTrending ? (
          <InlineSkeleton label={t("appI18n.feed.right.loadingTrending")} />
        ) : trendingPosts.map((post, index) => (
          <TrendingItem
            key={post.publicationId || post.id}
            post={post}
            index={index}
            t={t}
            variant="inline"
            onOpen={() => navigate("/tendencias")}
          />
        ))}
      </div>
    </section>
  );
}

function useSuggestedUsers(limit = 3) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const currentUserId = String(user?.id || user?.id_user || "");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSuggestions() {
      setLoadingSuggestions(true);
      try {
        const users = await fetchSuggestedUsers({
          limit: Math.max(limit, 8),
          signal: controller.signal,
        });
        setSuggestions(
          users
            .filter((item) => String(item.id) !== currentUserId)
            .slice(0, limit),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSuggestions(false);
        }
      }
    }

    loadSuggestions();

    return () => controller.abort();
  }, [currentUserId, limit]);

  return { suggestions, loadingSuggestions };
}

function useTrendingPosts(limit = 5) {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTrending() {
      setLoadingTrending(true);
      try {
        const posts = await fetchTrendingFeedPosts({
          limit,
          signal: controller.signal,
        });
        setTrendingPosts(posts);
      } catch (error) {
        if (error.name !== "AbortError") {
          setTrendingPosts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTrending(false);
        }
      }
    }

    loadTrending();

    return () => controller.abort();
  }, [limit]);

  return { trendingPosts, loadingTrending };
}

function SuggestionItem({ user, index, onOpen, t }) {
  const initials = useMemo(() => initialsFromName(user.name), [user.name]);
  const colorClass = `sug-${(index % 3) + 1}`;

  return (
    <button className="suggestion-item" type="button" onClick={onOpen}>
      {user.avatar ? (
        <img className="suggestion-avatar suggestion-avatar-img" src={user.avatar} alt="" />
      ) : (
        <div className={`suggestion-avatar ${colorClass}`}>{initials}</div>
      )}
      <div className="suggestion-info">
        <div className="suggestion-name">{user.name}</div>
        <div className="suggestion-role">{user.title || t("appI18n.feed.right.professionalFallback")}</div>
      </div>
      <span className="connect-btn" aria-hidden="true">
        {t("appI18n.common.view")}
      </span>
    </button>
  );
}

function TrendingItem({ post, index, onOpen, t }) {
  return (
    <button type="button" className="project-item project-item--button" onClick={onOpen}>
      <div className="project-icon">{index + 1}</div>
      <div>
        <div className="project-name">{postTitle(post, t)}</div>
        <div className="project-desc">{post.author?.name || "Portafy"} - {postType(post, t)}</div>
      </div>
    </button>
  );
}

function InlineSkeleton({ label }) {
  return (
    <div className="feed-inline-module__loading">
      <LoaderCircle size={16} />
      {label}
    </div>
  );
}

function SuggestionSkeleton({ label = null }) {
  const { t } = useTranslation();
  return (
    <div className="suggestion-loading">
      <LoaderCircle size={16} />
      {label || t("appI18n.feed.right.loadingProfiles")}
    </div>
  );
}
