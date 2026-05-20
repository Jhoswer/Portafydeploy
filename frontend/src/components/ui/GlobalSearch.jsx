import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function GlobalSearch({ variant = "desktop" }) {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

 const handleSearch = () => {
  const value = searchValue.trim().toLowerCase();

  if (!value) return;

  // reglas simples
  if (value.includes("perfil")) {
    navigate("/dashboard");
    return;
  }

  if (value.includes("inicio")) {
    navigate("/feed");
    return;
  }

  if (value.includes("explorar")) {
    navigate("/search");
    return;
  }

  // default → búsqueda normal
  navigate(`/search?q=${encodeURIComponent(value)}`);
};


  return (
    <div className={`pf-nav-search ${variant === "mobile" ? "pf-nav-search--mobile" : ""}`}>
      
      <Search
        size={15}
        className="pf-nav-search__icon"
        style={{
          pointerEvents: searchValue ? "auto" : "none",
          cursor: searchValue ? "pointer" : "default"
        }}
        onClick={handleSearch}
      />

      <input
        type="search"
        className="pf-nav-search__input"
        placeholder={variant === "mobile" ? t("nav.searchMobile") : t("nav.search")}
        value={searchValue}
        onChange={e =>
          setSearchValue(e.target.value.replace(/[^\p{L}\p{N}\s]/gu, ""))
        }
        onKeyDown={e => {
          if (e.key === "Enter") handleSearch();
        }}
      />

      {searchValue && (
        <button
          className="auth-topbar__search-clear"
          onClick={() => setSearchValue("")}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
