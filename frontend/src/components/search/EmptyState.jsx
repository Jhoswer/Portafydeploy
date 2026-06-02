import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyState({ isIdle = false, activeFilterCount, onClearFilters, onClearAll }) {
  const { t } = useTranslation();

  return (
    <div className="empty-state" data-testid="empty-state">
      <div className="empty-state__icon">
        <SearchX style={{ width: 36, height: 36 }} />
      </div>

      <h3 className="empty-state__title">
        {isIdle ? t("portafySearch.empty.idleTitle") : t("portafySearch.empty.noResultsTitle")}
      </h3>
      <p className="empty-state__body">
        {isIdle
          ? t("portafySearch.empty.idleBody")
          : t("portafySearch.empty.noResultsBody")}
        {!isIdle && activeFilterCount > 0 && ` ${t("portafySearch.empty.hintFilters")}`}
        {!isIdle && activeFilterCount === 0 && ` ${t("portafySearch.empty.hintTerms")}`}
      </p>

      <div className="empty-state__actions">
        {activeFilterCount > 0 && (
          <button
            aria-label={t("portafySearch.empty.clearFilters")}
            data-testid="button-clear-filters-empty"
            onClick={onClearFilters}
            className="btn-ghost"
          >
            {t("portafySearch.empty.clearFilters")}
          </button>
        )}
        {!isIdle && (
          <button
            aria-label={t("portafySearch.empty.newSearch")}
            data-testid="button-clear-all-empty"
            onClick={onClearAll}
            className="btn-cta"
          >
            {t("portafySearch.empty.newSearch")}
          </button>
        )}
      </div>
    </div>
  );
}