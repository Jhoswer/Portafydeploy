import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SearchInput({ value, onChange, filtersOpen, onToggleFilters, activeFilterCount }) {
  const { t } = useTranslation();

  return (
    <div className="search-bar">
      <div className="search-bar__field">
        <Search className="search-bar__field-icon" style={{ width: 16, height: 16 }} />
        <input
          role="searchbox"
          aria-label={t("portafySearch.input.ariaLabel")}
          data-testid="input-search"
          type="search"
          placeholder={t("portafySearch.input.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <button
        aria-expanded={filtersOpen}
        aria-controls="filters-panel"
        onClick={onToggleFilters}
        className={`search-bar__filters-btn${filtersOpen ? " search-bar__filters-btn--active" : ""}`}
      >
        <SlidersHorizontal style={{ width: 15, height: 15 }} />
        {t("portafySearch.input.filtersBtn")}
        {activeFilterCount > 0 && (
          <span className="search-bar__badge">{activeFilterCount}</span>
        )}
        <ChevronDown
          style={{
            width: 13,
            height: 13,
            transition: "transform 0.2s",
            transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
    </div>
  );
}