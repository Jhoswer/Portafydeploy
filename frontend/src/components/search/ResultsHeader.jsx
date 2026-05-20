import { SlidersHorizontal } from "lucide-react";

/**
 * Muestra el contador de resultados y el indicador de búsqueda activa.
 *
 * @param {{
 *   isLoading: boolean,
 *   resultCount: number,
 *   activeFilterCount: number,
 *   debouncedQuery: string,
 * }} props
 */
export function ResultsHeader({ isLoading, resultCount, activeFilterCount, debouncedQuery }) {
  const hasActiveSearch = debouncedQuery || activeFilterCount > 0;

  return (
    <div className="flex items-center justify-between mb-5">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {isLoading ? (
          <span className="animate-pulse">Buscando...</span>
        ) : (
          <>
            <span className="font-semibold text-foreground">{resultCount}</span>{" "}
            resultado{resultCount !== 1 ? "s" : ""}
            {activeFilterCount > 0 && (
              <>
                {" · "}
                <span className="text-primary font-semibold">{activeFilterCount}</span>{" "}
                filtro{activeFilterCount !== 1 ? "s" : ""} activo{activeFilterCount !== 1 ? "s" : ""}
              </>
            )}
          </>
        )}
      </p>

      {hasActiveSearch && !isLoading && resultCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Búsqueda activa
        </div>
      )}
    </div>
  );
}