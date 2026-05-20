import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import "../../../styles/components/admin/Adminsearchbar.css";

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  filtersOpen,
  onToggleFilters,
  activeFilterCount = 0,
}) {
  return (
    <div className="adm-searchbar">
      <div className="adm-searchbar__input-wrap">
        <Search size={16} className="adm-searchbar__icon" />
        <input
          type="search"
          className="adm-searchbar__input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={placeholder}
        />
      </div>
    </div>
  );
}
