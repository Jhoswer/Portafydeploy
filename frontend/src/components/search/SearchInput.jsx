import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

/**
 * Barra de búsqueda con botón de filtros integrado.
 *
 * @param {{
 *   value: string,
 *   onChange: (val: string) => void,
 *   filtersOpen: boolean,
 *   onToggleFilters: () => void,
 *   activeFilterCount: number
 * }} props
 */
export function SearchInput({ value, onChange, filtersOpen, onToggleFilters, activeFilterCount }) {
  return (
    <div className="flex items-center gap-2 w-full">

      {/* ── Barra de búsqueda pill ── */}
      <div className="relative flex-1 group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground
            group-focus-within:text-primary transition-colors duration-200 pointer-events-none"
        />
        <input
          role="searchbox"
          aria-label="Búsqueda global"
          data-testid="input-search"
          type="search"
          placeholder="Buscar en todos los perfiles, proyectos y habilidades..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-border bg-card
            hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20
            focus:border-primary/60 transition-all placeholder:text-muted-foreground/60
            text-foreground shadow-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {/* ── Botón de filtros ── */}
      <button
        aria-expanded={filtersOpen}
        aria-controls="filters-panel"
        onClick={onToggleFilters}
        className={[
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium",
          "transition-all duration-200 whitespace-nowrap shadow-sm shrink-0",
          filtersOpen
            ? "bg-primary/10 border-primary/40 text-primary"
            : "bg-card border-border text-foreground hover:border-primary/40 hover:text-primary",
        ].join(" ")}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full
            bg-primary text-primary-foreground text-xs font-semibold leading-none">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}