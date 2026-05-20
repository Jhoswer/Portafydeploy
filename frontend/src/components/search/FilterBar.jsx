import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { FilterInput, SUGGESTIONS } from "./FilterInput";

// ─── Configuración ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "ubicacion",   label: "Ubicación"   },
  { id: "profesion",   label: "Profesión"   },
  { id: "habilidades", label: "Habilidades" },
  { id: "experiencia", label: "Experiencia" },
  { id: "academico",   label: "Estudios"    },
];

const FILTER_OPTIONS = {
  ubicacion:   [{ key: "ubicacion",       label: "Ubicación",   type: "text"   }],
  profesion:   [{ key: "profesion",       label: "Profesión",   type: "text"   }],
  habilidades: [
    { key: "habilidad", label: "Habilidad", type: "text" },
    { key: "hab_tipo",  label: "Tipo",      type: "select", options: ["tecnica", "blanda"] },
  ],
  experiencia: [
    { key: "exp_cargo",   label: "Cargo",   type: "text" },
    { key: "exp_empresa", label: "Empresa", type: "text" },
  ],
  academico: [
    { key: "institucion",     label: "Institución", type: "text" },
    { key: "nivel_formacion", label: "Nivel",       type: "select", options: ["tecnico","tecnologo","licenciatura","ingenieria","maestria","doctorado"] },
  ],
};

function findFilterOption(filterKey) {
  for (const opts of Object.values(FILTER_OPTIONS)) {
    const found = opts.find((o) => o.key === filterKey);
    if (found) return found;
  }
  return null;
}

function getCatLabel(filterKey) {
  const entry = Object.entries(FILTER_OPTIONS).find(([, opts]) =>
    opts.some((o) => o.key === filterKey)
  );
  return entry ? (CATEGORIES.find((c) => c.id === entry[0])?.label ?? "") : "";
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   filtersOpen: boolean,
 *   openCategoryId: string | null,
 *   filterValues: Record<string, string>,
 *   onToggleCategory: (id: string) => void,
 *   onFilterValueChange: (key: string, val: string) => void,
 *   onClearFilter: (key: string) => void,
 *   onClearAllFilters: () => void,
 * }} props
 */
export function FilterBar({
  filtersOpen,
  openCategoryId,
  filterValues,
  onToggleCategory,
  onFilterValueChange,
  onClearFilter,
  onClearAllFilters,
}) {
  // Sub-filtros cuyo input está abierto (pendiente de confirmar valor)
  const [pendingFilters, setPendingFilters] = useState([]);
  // Texto vivo del input mientras el usuario escribe
  const [inputValues, setInputValues] = useState({});
  // Opciones personalizadas agregadas por el usuario
  const [customOptions, setCustomOptions] = useState({});

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openPending = (key) => {
    if (!pendingFilters.includes(key)) {
      setPendingFilters((prev) => [...prev, key]);
      // Pre-llenar con el valor actual si ya había uno (edición)
      setInputValues((prev) => ({ ...prev, [key]: filterValues[key] ?? "" }));
    }
  };

  const closePending = (key) => {
    setPendingFilters((prev) => prev.filter((k) => k !== key));
    setInputValues((prev) => ({ ...prev, [key]: "" }));
  };

  // Confirmar valor → persistir y cerrar input
  const handleConfirm = (key, val) => {
    onFilterValueChange(key, val);
    closePending(key);
  };

  // Limpiar filtro (desde chip o desde input)
  const handleClear = (key) => {
    onClearFilter(key);
    closePending(key);
  };

  const handleClearAll = () => {
    onClearAllFilters();
    setPendingFilters([]);
    setInputValues({});
  };

  const handleAddCustom = (key, val) => {
    setCustomOptions((prev) => {
      const existing = prev[key] ?? [];
      if (existing.some((v) => v.toLowerCase() === val.toLowerCase())) return prev;
      return { ...prev, [key]: [val, ...existing] };
    });
  };

  const handleDeleteCustom = (key, val) => {
    setCustomOptions((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((v) => v !== val),
    }));
    if (filterValues[key] === val) handleClear(key);
  };

  // Clic en sub-filtro:
  // · tiene valor confirmado → re-abre para editar
  // · está pendiente y sin valor → cierra (toggle off)
  // · sin valor y sin pending → abre el input
  const handleSubFilterClick = (key) => {
    const hasValue = (filterValues[key] ?? "").trim() !== "";
    const isPending = pendingFilters.includes(key);

    if (isPending && !hasValue) {
      closePending(key);
    } else {
      openPending(key);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const subFilters = openCategoryId ? (FILTER_OPTIONS[openCategoryId] ?? []) : [];

  const allConfirmedEntries = Object.entries(filterValues).filter(([key, val]) => {
    const opt = findFilterOption(key);
    if (!opt) return false;
    return opt.type === "toggle" ? val === "true" : val.trim() !== "";
  });

  const hasActiveFilters = allConfirmedEntries.length > 0;

  if (!filtersOpen) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      id="filters-panel"
      className="space-y-2 pt-3 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* ── Fila 1: categorías ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {CATEGORIES.map((cat) => {
          const isOpen = openCategoryId === cat.id;
          const catFilters = FILTER_OPTIONS[cat.id] ?? [];
          const catActive = catFilters.some((o) => {
            const v = filterValues[o.key] ?? "";
            return o.type === "toggle" ? v === "true" : v.trim() !== "";
          });

          return (
            <button
              key={cat.id}
              aria-label={`Categoría ${cat.label}`}
              aria-expanded={isOpen}
              onClick={() => onToggleCategory(cat.id)}
              className={[
                "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                isOpen
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : catActive
                  ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:text-primary",
              ].join(" ")}
            >
              {catActive && !isOpen && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
              {cat.label}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
          >
            Quitar todos
          </button>
        )}
      </div>

      {/* ── Fila 2: sub-filtros de la categoría abierta ── */}
      {openCategoryId && subFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {subFilters.map((opt) => {
            const val = filterValues[opt.key] ?? "";
            const hasValue = opt.type === "toggle" ? val === "true" : val.trim() !== "";
            const isPending = pendingFilters.includes(opt.key);
            const isActive = hasValue || isPending;

            return (
              <button
                key={opt.key}
                aria-label={`Sub-filtro ${opt.label}`}
                aria-pressed={isActive}
                onClick={() => handleSubFilterClick(opt.key)}
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                  isActive
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Fila 3: inputs solo mientras el usuario está eligiendo ── */}
      {pendingFilters.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {pendingFilters.map((filterKey) => {
            const opt = findFilterOption(filterKey);
            if (!opt) return null;

            return (
              <FilterInput
                key={filterKey}
                option={opt}
                value={filterValues[filterKey] ?? ""}
                inputValue={inputValues[filterKey] ?? ""}
                customOptions={customOptions[filterKey] ?? []}
                suggestions={SUGGESTIONS[filterKey] ?? []}
                onChange={(val) => handleConfirm(filterKey, val)}
                onInputChange={(val) =>
                  setInputValues((prev) => ({ ...prev, [filterKey]: val }))
                }
                onClear={() => handleClear(filterKey)}
                onAddCustom={(val) => handleAddCustom(filterKey, val)}
                onDeleteCustom={(val) => handleDeleteCustom(filterKey, val)}
              />
            );
          })}
        </div>
      )}

      {/* ── Fila 4: chips resumen — única huella visible de los filtros activos ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-1 items-center animate-in fade-in duration-200">
          <span className="text-xs text-muted-foreground mr-0.5">Activos:</span>
          {allConfirmedEntries.map(([key, value]) => {
            const opt = findFilterOption(key);
            if (!opt) return null;
            const catLabel = getCatLabel(key);
            const displayValue = opt.type === "toggle" ? "✓" : value;

            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <span className="opacity-60">{catLabel} ›</span>
                <span>{opt.label}</span>
                {displayValue !== "✓" && (
                  <span className="opacity-70">: {displayValue}</span>
                )}
                <button
                  aria-label={`Quitar filtro ${opt.label}`}
                  onClick={() => handleClear(key)}
                  className="ml-0.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { FILTER_OPTIONS };