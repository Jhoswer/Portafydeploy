import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { fetchSuggestedUsers } from "../../services/searchService";

const projects = [
  { icon: "EC", name: "E-Commerce Platform", desc: "React · Node.js · Stripe" },
  { icon: "AI", name: "AI Analytics Dashboard", desc: "GPT-4 · TypeScript · Docker" },
];

function initialsFromName(name) {
  return String(name || "P")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function RightSidebar() {
  const navigate = useNavigate();
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
          limit: 8,
          signal: controller.signal,
        });
        setSuggestions(
          users
            .filter((item) => String(item.id) !== currentUserId)
            .slice(0, 3)
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
            ? suggestions.map((user, index) => (
                <SuggestionItem
                  key={user.id}
                  user={user}
                  index={index}
                  onOpen={() =>
                    navigate(user.profileUrl || `/perfil-profesional?usuario=${user.id}`)
                  }
                />
              ))
            : null}
        </div>
      </div>

      <div className="card feed-side-card">
        <div className="card-body">
          <div className="card-title">Proyectos destacados</div>
          {projects.map((project) => (
            <div key={project.name} className="project-item">
              <div className="project-icon">{project.icon}</div>
              <div>
                <div className="project-name">{project.name}</div>
                <div className="project-desc">{project.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <button className="btn-outline btn-full" style={{ fontSize: 12 }}>
              Ver todos →
            </button>
          </div>
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

function SuggestionSkeleton() {
  return (
    <div className="suggestion-loading">
      <LoaderCircle size={16} />
      Cargando perfiles...
    </div>
  );
}
