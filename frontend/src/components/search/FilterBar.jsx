import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterInput, SUGGESTIONS } from "./FilterInput";

const FILTER_OPTIONS = {
  ubicacion:   [{ key: "ubicacion",       label: "portafySearch.filters.fields.ubicacion",   type: "text"   }],
  profesion:   [{ key: "profesion",       label: "portafySearch.filters.fields.profesion",   type: "text"   }],
  habilidades: [
    { key: "habilidad", label: "portafySearch.filters.fields.habilidad", type: "text" },
    { key: "hab_tipo",  label: "portafySearch.filters.fields.hab_tipo",  type: "select", options: ["tecnica", "blanda"] },
  ],
  experiencia: [
    { key: "exp_cargo",   label: "portafySearch.filters.fields.exp_cargo",   type: "text" },
    { key: "exp_empresa", label: "portafySearch.filters.fields.exp_empresa", type: "text" },
  ],
  academico: [
    { key: "institucion",     label: "portafySearch.filters.fields.institucion",     type: "text" },
    { key: "nivel_formacion", label: "portafySearch.filters.fields.nivel_formacion", type: "select", options: ["tecnico","tecnologo","licenciatura","ingenieria","maestria","doctorado"] },
  ],
};

function findFilterOption(filterKey) {
  for (const opts of Object.values(FILTER_OPTIONS)) {
    const found = opts.find((o) => o.key === filterKey);
    if (found) return found;
  }
  return null;
}

function getCatLabel(filterKey, categories) {
  const catIds = {
    ubicacion:      "ubicacion",
    profesion:      "profesion",
    habilidad:      "habilidades",
    hab_tipo:       "habilidades",
    exp_cargo:      "experiencia",
    exp_empresa:    "experiencia",
    institucion:    "academico",
    nivel_formacion:"academico",
  };
  const catId = catIds[filterKey];
  return categories.find((c) => c.id === catId)?.label ?? "";
}

export function FilterBar({
  filtersOpen,
  openCategoryId,
  filterValues,
  onToggleCategory,
  onFilterValueChange,
  onClearFilter,
  onClearAllFilters,
}) {
  const { t } = useTranslation();
  const [pendingFilters, setPendingFilters] = useState([]);
  const [inputValues, setInputValues]       = useState({});
  const [customOptions, setCustomOptions]   = useState({});

  const CATEGORIES = [
    { id: "ubicacion",   label: t("portafySearch.filters.categories.ubicacion")   },
    { id: "profesion",   label: t("portafySearch.filters.categories.profesion")   },
    { id: "habilidades", label: t("portafySearch.filters.categories.habilidades") },
    { id: "experiencia", label: t("portafySearch.filters.categories.experiencia") },
    { id: "academico",   label: t("portafySearch.filters.categories.academico")   },
  ];

  const openPending = (key) => {
    if (!pendingFilters.includes(key)) {
      setPendingFilters((prev) => [...prev, key]);
      setInputValues((prev) => ({ ...prev, [key]: filterValues[key] ?? "" }));
    }
  };

  const closePending = (key) => {
    setPendingFilters((prev) => prev.filter((k) => k !== key));
    setInputValues((prev) => ({ ...prev, [key]: "" }));
  };

  const handleConfirm = (key, val) => { onFilterValueChange(key, val); closePending(key); };
  const handleClear   = (key)       => { onClearFilter(key); closePending(key); };

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

  const handleSubFilterClick = (key) => {
    const hasValue  = (filterValues[key] ?? "").trim() !== "";
    const isPending = pendingFilters.includes(key);
    if (isPending && !hasValue) closePending(key);
    else openPending(key);
  };

  const subFilters = openCategoryId ? (FILTER_OPTIONS[openCategoryId] ?? []) : [];

  const allConfirmedEntries = Object.entries(filterValues).filter(([key, val]) => {
    const opt = findFilterOption(key);
    if (!opt) return false;
    return opt.type === "toggle" ? val === "true" : val.trim() !== "";
  });

  const hasActiveFilters = allConfirmedEntries.length > 0;

  if (!filtersOpen) return null;

  return (
    <div id="filters-panel" className="filters-panel">

      {/* Categorías */}
      <div className="filters-panel__cats">
        {CATEGORIES.map((cat) => {
          const isOpen     = openCategoryId === cat.id;
          const catFilters = FILTER_OPTIONS[cat.id] ?? [];
          const catActive  = catFilters.some((o) => {
            const v = filterValues[o.key] ?? "";
            return o.type === "toggle" ? v === "true" : v.trim() !== "";
          });

          let btnClass = "filters-panel__cat-btn";
          if (isOpen)          btnClass += " filters-panel__cat-btn--open";
          else if (catActive)  btnClass += " filters-panel__cat-btn--active";

          return (
            <button
              key={cat.id}
              aria-label={`${t("portafySearch.filters.categories." + cat.id)}`}
              aria-expanded={isOpen}
              onClick={() => onToggleCategory(cat.id)}
              className={btnClass}
            >
              {catActive && !isOpen && <span className="filters-panel__cat-dot" />}
              {cat.label}
              <ChevronDown
                style={{
                  width: 13, height: 13,
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
          );
        })}

        {hasActiveFilters && (
          <button onClick={handleClearAll} className="filters-panel__clear-all">
            {t("portafySearch.filters.clearAll")}
          </button>
        )}
      </div>

      {/* Sub-filtros */}
      {openCategoryId && subFilters.length > 0 && (
        <div className="filters-panel__subs">
          {subFilters.map((opt) => {
            const val      = filterValues[opt.key] ?? "";
            const hasValue = opt.type === "toggle" ? val === "true" : val.trim() !== "";
            const isActive = hasValue || pendingFilters.includes(opt.key);

            return (
              <button
                key={opt.key}
                aria-label={t(opt.label)}
                aria-pressed={isActive}
                onClick={() => handleSubFilterClick(opt.key)}
                className={`filters-panel__sub-btn${isActive ? " filters-panel__sub-btn--active" : ""}`}
              >
                {t(opt.label)}
              </button>
            );
          })}
        </div>
      )}

      {/* Inputs pendientes */}
      {pendingFilters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pendingFilters.map((filterKey) => {
            const opt = findFilterOption(filterKey);
            if (!opt) return null;
            return (
              <FilterInput
                key={filterKey}
                option={{ ...opt, label: t(opt.label) }}
                value={filterValues[filterKey] ?? ""}
                inputValue={inputValues[filterKey] ?? ""}
                customOptions={customOptions[filterKey] ?? []}
                suggestions={SUGGESTIONS[filterKey] ?? []}
                onChange={(val) => handleConfirm(filterKey, val)}
                onInputChange={(val) => setInputValues((prev) => ({ ...prev, [filterKey]: val }))}
                onClear={() => handleClear(filterKey)}
                onAddCustom={(val) => handleAddCustom(filterKey, val)}
                onDeleteCustom={(val) => handleDeleteCustom(filterKey, val)}
              />
            );
          })}
        </div>
      )}

      {/* Chips activos */}
      {hasActiveFilters && (
        <div className="filters-panel__chips">
          <span className="filters-panel__chips-label">
            {t("portafySearch.filters.active")}
          </span>
          {allConfirmedEntries.map(([key, value]) => {
            const opt = findFilterOption(key);
            if (!opt) return null;
            const catLabel     = getCatLabel(key, CATEGORIES);
            const displayValue = opt.type === "toggle" ? "✓" : value;

            return (
              <span key={key} className="filters-panel__chip">
                <span className="filters-panel__chip-dim">{catLabel} ›</span>
                {t(opt.label)}
                {displayValue !== "✓" && (
                  <span className="filters-panel__chip-dim">: {displayValue}</span>
                )}
                <button
                  aria-label={`${t("portafySearch.filters.clearAll")} ${t(opt.label)}`}
                  onClick={() => handleClear(key)}
                  className="filters-panel__chip-x"
                >
                  <X style={{ width: 10, height: 10 }} />
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