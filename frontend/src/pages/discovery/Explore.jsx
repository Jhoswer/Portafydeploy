import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/landing/Navbar";
import FilterBar, { FILTER_OPTIONS } from "../../components/landing/FilterBar";
import Pagination from "../../components/landing/Pagination";
import FooterPage from "../../components/landing/FooterPage";
import { resolveUserPhoto, searchUsers } from "../../services/searchService";
import "../../styles/pages/explore.css";

const ITEMS_PER_PAGE = 12;
const MAX_SKILLS_VISIBLE = 4;
const DEFAULT_CATEGORY = "usuario";

function UserCard({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fullName = `${user.name} ${user.lastName}`;
  const visibleSkills = user.skills?.slice(0, MAX_SKILLS_VISIBLE) ?? [];
  const extraSkills = (user.skills?.length ?? 0) - MAX_SKILLS_VISIBLE;
  const photoSrc = resolveUserPhoto(user.photo);

  return (
    <article className="ex-card">
      <div className="ex-card__avatar-wrap">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={fullName}
            className="ex-card__avatar"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="ex-card__avatar-fallback"
          style={{ display: photoSrc ? "none" : "flex" }}
        >
          <UserCircle2 size={48} strokeWidth={1.2} />
        </div>
      </div>

      <div className="ex-card__body">
        <h3 className="ex-card__name">{fullName}</h3>
        <p className="ex-card__bio">{user.bio || t("explore.noBio")}</p>

        {visibleSkills.length > 0 && (
          <div className="ex-card__skills">
            {visibleSkills.map((skill, index) => (
              <span key={`${skill}-${index}`} className="ex-card__skill-tag">
                {skill}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="ex-card__skill-tag ex-card__skill-tag--more">
                +{extraSkills}
              </span>
            )}
          </div>
        )}
      </div>

      <button className="ex-card__btn" onClick={() => navigate(`/perfil/${user.id}`)}>
        {t("explore.viewProfile")}
        <ChevronRight size={15} />
      </button>
    </article>
  );
}

function EmptyState({ query }) {
  const { t } = useTranslation();

  return (
    <div className="ex-empty">
      <div className="ex-empty__icon">Busqueda</div>
      <p className="ex-empty__title">
        {t("explore.noResultsFor")} <strong>"{query}"</strong>
      </p>
    </div>
  );
}

function InitialState() {
  const { t } = useTranslation();

  return (
    <div className="ex-empty">
      <div className="ex-empty__icon">Talento</div>
      <p className="ex-empty__title">{t("explore.initialTitle")}</p>
      <p className="ex-empty__sub">{t("explore.initialSubtitle")}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="ex-card ex-card--skeleton">
      <div className="ex-card__avatar-wrap ex-skel ex-skel--circle" />
      <div className="ex-card__body">
        <div className="ex-skel ex-skel--line" style={{ width: "60%", marginBottom: 8 }} />
        <div className="ex-skel ex-skel--line" style={{ width: "90%", marginBottom: 4 }} />
        <div className="ex-skel ex-skel--line" style={{ width: "75%" }} />
        <div className="ex-card__skills" style={{ marginTop: 12 }}>
          {[1, 2, 3].map((item) => <div key={item} className="ex-skel ex-skel--tag" />)}
        </div>
      </div>
      <div className="ex-skel ex-skel--btn" />
    </div>
  );
}

export default function Explore() {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedQuery, setSearchedQuery] = useState(null);
  const [searchCategory, setSearchCategory] = useState(DEFAULT_CATEGORY);
  const [activeFilter, setActiveFilter] = useState(() => FILTER_OPTIONS[DEFAULT_CATEGORY][0]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageResults = allResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (newCategory) => {
    setSearchCategory(newCategory);
    setActiveFilter(FILTER_OPTIONS[newCategory][0]);
  };

  const handleSearch = useCallback(async (query) => {
    const normalizedQuery = query.trim().replace(/\s+/g, " ");
    if (!normalizedQuery) return;

    setLoading(true);
    setError(null);
    setSearchedQuery(normalizedQuery);
    setCurrentPage(1);

    try {
      const data = await searchUsers({
        query: normalizedQuery,
        category: searchCategory,
        filter: activeFilter.key ?? activeFilter,
      });

      setAllResults(Array.isArray(data) ? data : []);
    } catch {
      setError(t("explore.connectionError"));
      setAllResults([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchCategory, t]);

  useEffect(() => {
    if (!searchedQuery) return;
    const timeout = setTimeout(() => handleSearch(searchedQuery), 400);
    return () => clearTimeout(timeout);
  }, [activeFilter, handleSearch, searchCategory, searchedQuery]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    document.querySelector(".ex-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleSearch(inputValue);
  };

  const hasResults = !loading && !error && allResults.length > 0;

  return (
    <div className="portafy-home">
      <Navbar
        hideAuthButtons
        searchValue={inputValue}
        onSearchChange={(event) => setInputValue(event.target.value)}
        onSearchKeyDown={handleKeyDown}
        onSearchSubmit={() => handleSearch(inputValue)}
        searchCategory={searchCategory}
        onCategoryChange={handleCategoryChange}
      />

      <FilterBar
        category={searchCategory}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <main className="ex-main">
        <section className="ex-results">
          <div className="ex-results__inner">
            {error && (
              <div className="ex-error"><span>Alerta</span> {error}</div>
            )}

            {loading && (
              <div className="ex-grid">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            )}

            {!loading && !error && searchedQuery !== null && allResults.length === 0 && (
              <EmptyState query={searchedQuery} />
            )}

            {!loading && !error && searchedQuery === null && <InitialState />}

            {hasResults && (
              <>
                <p className="ex-results__count">
                  {allResults.length} {t("explore.resultsFor")}{" "}
                  <strong>"{searchedQuery}"</strong>
                  {totalPages > 1 && (
                    <span className="ex-results__page-info">
                      {" "}mostrando {startIndex + 1}-
                      {Math.min(startIndex + ITEMS_PER_PAGE, allResults.length)}
                    </span>
                  )}
                </p>

                <div className="ex-grid">
                  {pageResults.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {hasResults && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
      <FooterPage />
    </div>
  );
}
