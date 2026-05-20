import { useEffect, useState } from "react";
import Navbar from "../../components/landing/Navbar";
import { FilterBar } from "../../components/search/FilterBar";
import { SearchInput } from "../../components/search/SearchInput";
import { ResultsHeader } from "../../components/search/ResultsHeader";
import { SkeletonGrid } from "../../components/search/SkeletonGrid";
import { EmptyState } from "../../components/search/EmptyState";
import { SearchCard } from "../../components/search/SearchResultCard";
import { useSearchState } from "../../hooks/useSearchState";
import { searchUsersByFilters } from "../../services/searchService";

export default function NuevaBusqueda() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [requestMeta, setRequestMeta] = useState(null);

  const {
    inputValue,
    openCategoryId,
    openFilters,
    filterValues,
    isLoading,
    debouncedQuery,
    debouncedFilterValues,
    activeFilterCount,
    setInputValue,
    handleToggleCategory,
    handleToggleFilter,
    handleFilterValueChange,
    handleClearFilter,
    handleClearAllFilters,
    handleClearAll,
  } = useSearchState();

  const hasSearchCriteria =
    debouncedQuery.trim() !== "" ||
    Object.values(debouncedFilterValues).some((value) => String(value || "").trim() !== "");

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function runSearch() {
      if (!hasSearchCriteria) {
        setProfiles([]);
        setRequestMeta(null);
        setSearchError("");
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setSearchError("");

      try {
        const response = await searchUsersByFilters({
          query: debouncedQuery,
          filters: debouncedFilterValues,
          activeCategory: openCategoryId,
          signal: controller.signal,
        });

        if (!isMounted) return;

        setProfiles(response.items);
        setRequestMeta(response.meta);
      } catch (error) {
        if (error.name === "AbortError" || !isMounted) return;

        setProfiles([]);
        setRequestMeta(null);
        setSearchError(error.message || "No se pudo cargar la busqueda.");
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }

    runSearch();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedQuery, debouncedFilterValues, hasSearchCriteria, openCategoryId]);

  const handleClearAllAndClose = () => {
    handleClearAllFilters();
    setFiltersOpen(false);
  };

  const isBusy = isLoading || isSearching;
  const resultCount = requestMeta?.total || profiles.length;

  return (
    <div className="page-wrapper page-search">
      <Navbar />

      <div className="layout">
        <main
          className="feed feed--search"
          style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}
        >
          {/* Buscador sticky debajo del navbar */}
          <div
            className="search-header"
            style={{
              position: "sticky",
              top: "76px",
              zIndex: 10,
              background: "rgba(234,243,251,.92)",
              backdropFilter: "blur(14px)",
              paddingBottom: "0px",
            }}
          >
            <SearchInput
              value={inputValue}
              onChange={setInputValue}
              filtersOpen={filtersOpen}
              onToggleFilters={() => setFiltersOpen((prev) => !prev)}
              activeFilterCount={activeFilterCount}
            />

            <FilterBar
              filtersOpen={filtersOpen}
              openCategoryId={openCategoryId}
              openFilters={openFilters}
              filterValues={filterValues}
              onToggleCategory={handleToggleCategory}
              onToggleFilter={handleToggleFilter}
              onFilterValueChange={handleFilterValueChange}
              onClearFilter={handleClearFilter}
              onClearAllFilters={handleClearAllAndClose}
            />
          </div>

          {/* Resultados con margen para no quedar bajo el sticky */}
          <div style={{ paddingTop: "70px" }}>
            <ResultsHeader
              isLoading={isBusy}
              resultCount={resultCount}
              activeFilterCount={activeFilterCount}
              debouncedQuery={debouncedQuery}
            />

            {searchError && !isBusy && (
              <div
                className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {searchError}
              </div>
            )}

            {isBusy ? (
              <SkeletonGrid />
            ) : profiles.length > 0 ? (
              <div className="search-grid">
                {profiles.map((profile) => (
                  <SearchCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <EmptyState
                isIdle={!hasSearchCriteria}
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearAllAndClose}
                onClearAll={handleClearAll}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
