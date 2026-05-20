import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./use-debounce";

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? null;

  const filterValues = {};
  const fvParam = params.get("fv") ?? "";
  if (fvParam) {
    fvParam.split("|").forEach((entry) => {
      const sep = entry.indexOf(":");
      if (sep > 0) {
        const key = entry.slice(0, sep);
        const val = decodeURIComponent(entry.slice(sep + 1));
        filterValues[key] = val;
      }
    });
  }

  const openFilters = Object.keys(filterValues);
  return { q, cat, filterValues, openFilters };
}

function writeUrlParams(q, filterValues, openCategoryId) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (openCategoryId) params.set("cat", openCategoryId);

  const activeEntries = Object.entries(filterValues).filter(([, v]) => v !== "");
  if (activeEntries.length > 0) {
    params.set(
      "fv",
      activeEntries
        .map(([k, v]) => `${k}:${encodeURIComponent(v)}`)
        .join("|")
    );
  }

  const search = params.toString();
  window.history.replaceState(
    null,
    "",
    search ? `${window.location.pathname}?${search}` : window.location.pathname
  );
}

export function useSearchState() {
  const initial = readUrlParams();

  const [inputValue, setInputValue]         = useState(initial.q);
  const [openCategoryId, setOpenCategoryId] = useState(initial.cat);
  const [openFilters, setOpenFilters]       = useState(initial.openFilters);
  const [filterValues, setFilterValues]     = useState(initial.filterValues);
  const [isLoading, setIsLoading]           = useState(false);

  const debouncedQuery        = useDebounce(inputValue, 300);
  const debouncedFilterValues = useDebounce(filterValues, 300);

  // Sync URL
  useEffect(() => {
    writeUrlParams(debouncedQuery, debouncedFilterValues, openCategoryId);
  }, [debouncedQuery, debouncedFilterValues, openCategoryId]);

  // Loading pulse on query/filter change
  useEffect(() => {
    const start = setTimeout(() => setIsLoading(true), 0);
    const end = setTimeout(() => setIsLoading(false), 320);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [debouncedQuery, debouncedFilterValues]);

  const handleToggleCategory = useCallback((catId) => {
    setOpenCategoryId((prev) => (prev === catId ? null : catId));
  }, []);

  const handleToggleFilter = useCallback((filterId) => {
    setOpenFilters((prev) => {
      if (prev.includes(filterId)) {
        setFilterValues((fv) => {
          const next = { ...fv };
          delete next[filterId];
          return next;
        });
        return prev.filter((f) => f !== filterId);
      }
      return [...prev, filterId];
    });
  }, []);

  const handleFilterValueChange = useCallback((filterId, value) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
  }, []);

  const handleClearFilter = useCallback((filterId) => {
    setFilterValues((prev) => {
      const next = { ...prev };
      delete next[filterId];
      return next;
    });
    setOpenFilters((prev) => prev.filter((f) => f !== filterId));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilterValues({});
    setOpenFilters([]);
  }, []);

  const handleClearAll = useCallback(() => {
    setInputValue("");
    setFilterValues({});
    setOpenFilters([]);
  }, []);

  const activeFilterCount = Object.values(debouncedFilterValues).filter(
    (v) => v !== ""
  ).length;

  return {
    // valores
    inputValue,
    openCategoryId,
    openFilters,
    filterValues,
    isLoading,
    debouncedQuery,
    debouncedFilterValues,
    activeFilterCount,
    // setters / handlers
    setInputValue,
    handleToggleCategory,
    handleToggleFilter,
    handleFilterValueChange,
    handleClearFilter,
    handleClearAllFilters,
    handleClearAll,
  };
}
