// src/components/admin/components/Edicion/EdicionSearchBar.jsx

import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";

export default function EdicionSearchBar({
  query = "", onChange, onSearch, onClear, isLoading = false,
}) {
  const { t } = useTranslation();
  const e = "adminEdicion.searchBar";

  const handleKeyDown = (ev) => {
    if (ev.key === "Enter") onSearch?.();
  };

  return (
    <div className="edicion-searchbar">
      <div className="edicion-searchbar__input-wrap">
        <Search size={16} className="edicion-searchbar__icon" />
        <input type="text" className="edicion-searchbar__input"
          placeholder={t(`${e}.placeholder`)}
          value={query}
          onChange={(ev) => onChange?.(ev.target.value)}
          onKeyDown={handleKeyDown} />
      </div>

      <button className="edicion-searchbar__btn" onClick={onSearch}
        disabled={isLoading || !query.trim()}>
        <Search size={14} />
        {isLoading ? t(`${e}.searching`) : t(`${e}.searchBtn`)}
      </button>

      {query.trim() && (
        <button className="edicion-searchbar__clear" onClick={onClear}>
          <X size={13} />
          {t(`${e}.clearBtn`)}
        </button>
      )}
    </div>
  );
}