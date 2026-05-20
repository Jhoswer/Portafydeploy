import { useState, useEffect } from "react";
import { listarCvs } from "../services/cvService";

export function useCvs() {
  const [cvs, setCvs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCvs() {
      try {
        const data = await listarCvs();
        if (!cancelled) {
          // Normaliza al shape que FeedOfferCard espera: { id, name, updatedAt }
          const normalized = (data ?? []).map(cv => ({
            id:        cv.id_cv ?? cv.id,
            name:      cv.name_cv ?? cv.name ?? `CV ${cv.id_cv ?? cv.id}`,
            updatedAt: cv.updated_at
              ? formatDate(cv.updated_at)
              : null,
          }));
          setCvs(normalized);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCvs();
    return () => { cancelled = true; };
  }, []);

  return { cvs, loading, error };
}

/* ── helper ── */
const MONTHS = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.",
                "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}