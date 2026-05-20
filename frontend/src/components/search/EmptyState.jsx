import { SearchX } from "lucide-react";

/**
 * Estado vacio cuando no hay resultados o aun no se inicio una busqueda.
 *
 * @param {{
 *   isIdle?: boolean,
 *   activeFilterCount: number,
 *   onClearFilters: () => void,
 *   onClearAll: () => void,
 * }} props
 */
export function EmptyState({ isIdle = false, activeFilterCount, onClearFilters, onClearAll }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-28 text-center animate-in fade-in zoom-in-95 duration-300"
      data-testid="empty-state"
    >
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <SearchX className="h-9 w-9 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        {isIdle ? "Busca perfiles y habilidades" : "Sin resultados"}
      </h3>
      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
        {isIdle
          ? "Escribe un nombre, una profesion o aplica filtros para encontrar perfiles."
          : "No hay coincidencias para los criterios aplicados."}
        {!isIdle && activeFilterCount > 0 ? " Intenta ajustar o quitar algun filtro." : ""}
        {!isIdle && activeFilterCount === 0 ? " Prueba con otros terminos." : ""}
      </p>

      <div className="flex gap-2 mt-6 flex-wrap justify-center">
        {activeFilterCount > 0 && (
          <button
            aria-label="Limpiar todos los filtros"
            data-testid="button-clear-filters-empty"
            onClick={onClearFilters}
            className="rounded-full px-5 py-2 text-sm font-medium border border-border bg-card text-foreground hover:border-primary/50 hover:text-primary transition-all"
          >
            Quitar filtros
          </button>
        )}
        {!isIdle && (
          <button
            aria-label="Limpiar busqueda"
            data-testid="button-clear-all-empty"
            onClick={onClearAll}
            className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
          >
            Nueva busqueda
          </button>
        )}
      </div>
    </div>
  );
}
