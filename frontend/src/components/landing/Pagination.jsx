import { useTranslation } from "react-i18next";

// src/components/landing/Pagination.jsx
// Mini sistema de paginacion.
// Props:
//   currentPage  -> numero de pagina actual (1-based)
//   totalPages   -> total de paginas disponibles
//   onPageChange -> funcion (newPage) => void

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation();

  // No renderizar si no hay mas de una pagina
  if (!totalPages || totalPages <= 1) return null;

  const goFirst = () => onPageChange(1);
  const goPrev = () => onPageChange(Math.max(1, currentPage - 1));
  const goNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const goLast = () => onPageChange(totalPages);

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <div className="pf-pagination">
      <button
        className="pf-pagination__btn"
        onClick={goFirst}
        disabled={isFirst}
        title={t("pagination.firstPage")}
        aria-label={t("pagination.firstPage")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3L3 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 3L8 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        className="pf-pagination__btn"
        onClick={goPrev}
        disabled={isFirst}
        title={t("pagination.previousPage")}
        aria-label={t("pagination.previousPage")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="pf-pagination__indicator" aria-current="page">
        <span className="pf-pagination__current">{currentPage}</span>
        <span className="pf-pagination__sep">/</span>
        <span className="pf-pagination__total">{totalPages}</span>
      </div>

      <button
        className="pf-pagination__btn"
        onClick={goNext}
        disabled={isLast}
        title={t("pagination.nextPage")}
        aria-label={t("pagination.nextPage")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        className="pf-pagination__btn"
        onClick={goLast}
        disabled={isLast}
        title={t("pagination.lastPage")}
        aria-label={t("pagination.lastPage")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
