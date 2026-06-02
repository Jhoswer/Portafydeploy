import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ResultsHeader({ isLoading, resultCount, activeFilterCount, debouncedQuery }) {
  const { t } = useTranslation();
  const hasActiveSearch = debouncedQuery || activeFilterCount > 0;

  return (
    <div className="results-header">
      <p className="results-header__count" aria-live="polite">
        {isLoading ? (
          <span>{t("portafySearch.results.searching")}</span>
        ) : (
          <>
            <strong>{resultCount}</strong>{" "}
            {resultCount === 1
              ? t("portafySearch.results.count_one", { count: resultCount })
              : t("portafySearch.results.count_other", { count: resultCount })}
            {activeFilterCount > 0 && (
              <>
                {" · "}
                <span className="count-filters">{activeFilterCount}</span>{" "}
                {activeFilterCount === 1
                  ? t("portafySearch.results.filterActive_one", { count: activeFilterCount })
                  : t("portafySearch.results.filterActive_other", { count: activeFilterCount })}
              </>
            )}
          </>
        )}
      </p>

      {hasActiveSearch && !isLoading && resultCount > 0 && (
        <div className="results-header__active">
          <SlidersHorizontal style={{ width: 14, height: 14 }} />
          {t("portafySearch.results.activeSearch")}
        </div>
      )}
    </div>
  );
}