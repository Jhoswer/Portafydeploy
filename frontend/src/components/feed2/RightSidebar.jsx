import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

function postTitle(post = {}) {
  return post.project?.title || post.experience?.title || post.title || "Publicacion destacada";
}

function postType(post = {}) {
  return post.type === "experience" ? "Experiencia" : "Proyecto";
}

export default function RightSidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const currentUserId = String(user?.id || user?.id_user || "");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSuggestions() {
      setLoadingSuggestions(true);
      try {
        const users = await fetchSuggestedUsers({
          limit: 8,
          signal: controller.signal,
        });
        setSuggestions(
          users
            .filter((item) => String(item.id) !== currentUserId)
            .slice(0, 3),
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
  }, [currentUserId]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTrending() {
      setLoadingTrending(true);
      try {
        const posts = await fetchTrendingFeedPosts({
          limit: 5,
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
  }, []);

  const hasSuggestions = suggestions.length > 0;

  return (
    <aside className="sidebar-right">
      <div className="card feed-side-card">
        <div className="card-body">
          <div className="card-title">Personas sugeridas</div>

          {loadingSuggestions ? <SuggestionSkeleton /> : null}

          {!loadingSuggestions && !hasSuggestions ? (
            <div className="suggestion-empty">
              Aun no hay perfiles sugeridos.
            </div>
          ) : null}

          {!loadingSuggestions && hasSuggestions
            ? suggestions.map((suggestedUser, index) => (
                <SuggestionItem
                  key={suggestedUser.id}
                  user={suggestedUser}
                  index={index}
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
          <div className="card-title">Tendencias</div>
          {loadingTrending ? <SuggestionSkeleton label="Cargando tendencias..." /> : null}
          {!loadingTrending && !trendingPosts.length ? (
            <div className="suggestion-empty">Aun no hay publicaciones con actividad.</div>
          ) : null}
          {!loadingTrending && trendingPosts.length
            ? trendingPosts.map((post, index) => (
                <TrendingItem
                  key={post.publicationId || post.id}
                  post={post}
                  index={index}
                  onOpen={() => navigate("/tendencias")}
                />
              ))
            : null}
        </div>
      </div>
    </aside>
  );
}

function SuggestionItem({ user, index, onOpen }) {
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
        <div className="suggestion-role">{user.title || "Profesional Portafy"}</div>
      </div>
      <span className="connect-btn" aria-hidden="true">
        Ver
      </span>
    </button>
  );
}

function TrendingItem({ post, index, onOpen }) {
  return (
    <button type="button" className="project-item project-item--button" onClick={onOpen}>
      <div className="project-icon">{index + 1}</div>
      <div>
        <div className="project-name">{postTitle(post)}</div>
        <div className="project-desc">{post.author?.name || "Portafy"} - {postType(post)}</div>
      </div>
    </button>
  );
}

function SuggestionSkeleton({ label = "Cargando perfiles..." }) {
  return (
    <div className="suggestion-loading">
      <LoaderCircle size={16} />
      {label}
    </div>
  );
}
