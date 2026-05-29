// src/hooks/useCompanyRelations.js
import { useCallback, useEffect, useState } from "react";

import {
  fetchCompanyFollowers,
  fetchCompanyFollowing,
} from "../services/companyTrustService";

export function useCompanyRelations(companyId, type = "followers") {
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const load = useCallback(
    async (force = false) => {
      if (!companyId) return;

      setItems([]);
      setTotal(0);
      setError("");
      setLoading(true);

      try {
        const data =
          type === "following"
            ? await fetchCompanyFollowing(companyId, force)
            : await fetchCompanyFollowers(companyId, force);

        const payload = data?.data ?? data;

        const parsedItems =
          payload.items     ||
          payload.followers ||
          payload.following ||
          [];

        setItems(parsedItems);
        setTotal(payload.total ?? parsedItems.length ?? 0);
      } catch (err) {
        setItems([]);
        setTotal(0);
        setError(err.message || "No se pudieron cargar las relaciones.");
      } finally {
        setLoading(false);
      }
    },
    [companyId, type]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    items,
    total,
    loading,
    error,
    reload: () => load(true),
  };
}
