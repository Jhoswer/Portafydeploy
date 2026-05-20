import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, Bell, House, LayoutDashboard,
  Compass, Bookmark, X, ChevronRight, Menu
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useTranslation } from "react-i18next";
import GlobalSearch from "../ui/GlobalSearch";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import ThemeToggle from "../ui/ThemeTongle";

const getDashboardRoute = (user) => {
  const routes = {
    reclutador: "/reclutador",
    admin:      "/admin",
  };
  return routes[user?.role] ?? "/dashboard";
};

const NAV_ITEMS = [
  { key: "home",      label: "nav.home",      icon: House,           route: "/feed"      },
  { key: "search",    label: "nav.search",    icon: Search,          route: "/search"    },
  { key: "dashboard", label: "nav.dashboard", icon: LayoutDashboard, route: null         },
  { key: "explore",   label: "nav.explore",   icon: Compass,         route: "#explorar"  },
  { key: "saved",     label: "nav.saved",     icon: Bookmark,        route: "#guardados" },
];

export default function AuthTopbar() {
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [searchValue,    setSearchValue]    = useState("");
  const [failedPhotoUrl, setFailedPhotoUrl] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const activePage = NAV_ITEMS.find(item =>
    item.route && location.pathname.startsWith(item.route)
  )?.key ?? "home";

  const shouldShowPhoto =
    Boolean(user?.photoUrl) && failedPhotoUrl !== user.photoUrl;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="auth-topbar">

        {/* FILA 1 */}
        <div className="auth-topbar__row-top">
          <div className="pf-wrap auth-topbar__row-top-inner">

            {/* Logos */}
            <div className="auth-topbar__logos">
              <div className="pf-nav-inst">
                <img src="/logos/umss.png" alt="UMSS" className="pf-nav-inst__logo" />
                <div className="pf-nav-inst__text">
                  <span className="pf-nav-inst__name">UMSS</span>
                  <span className="pf-nav-inst__sub">Univ. Mayor de San Simón</span>
                </div>
              </div>

              <div className="pf-nav-logos__sep" />

              <div className="pf-logo" onClick={() => navigate("/feed")}>
                <img src="/logos/portafy.png" alt="PortaFy" className="pf-logo__img" />
                <span className="pf-logo__text">
                  Porta<span className="pf-logo__fy">Fy</span>
                </span>
              </div>
            </div>

            {/* Search desktop */}
            <div className="pf-nav-search auth-topbar__search-desktop">
              <GlobalSearch />
            </div>

            {/* Acciones */}
            <div className="pf-nav-actions">
              <button className="pf-nav-bell" disabled>
                <Bell size={18} />
              </button>
              <LanguageSwitcher />
              <ThemeToggle />

              <div className="pf-nav-actions__sep auth-topbar__sep-desktop" />

              {/* User menu */}
              <div className="pf-user-menu auth-topbar__user-desktop">
                <button
                  className="pf-user-trigger"
                  onClick={() => setUserMenuOpen(v => !v)}
                >
                  <div className="pf-user__avatar pf-user__avatar--theme-blue" style={{ overflow: "hidden" }}>
                    {shouldShowPhoto ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={() => setFailedPhotoUrl(user.photoUrl)}
                      />
                    ) : user?.initials}
                  </div>
                  <span className="pf-user__name">{user?.name}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="pf-user-dropdown">
                      <div className="pf-user-dropdown__header">
                        <p>{user?.name} {user?.lastName}</p>
                        <span>{user?.email}</span>
                      </div>

                      <button
                        className="pf-user-dropdown__item"
                        onClick={() => {
                          navigate(getDashboardRoute(user));
                          setUserMenuOpen(false);
                        }}
                      >
                        {t("nav.myProfile")}
                      </button>

                      <button
                        className="pf-user-dropdown__item"
                        onClick={() => {
                          navigate("/configuracion");
                          setUserMenuOpen(false);
                        }}
                      >
                        {t("nav.settings")}
                      </button>

                      <button
                        className="pf-user-dropdown__logout"
                        onClick={handleLogout}
                      >
                        {t("nav.logout")}
                      </button>
                    </div>

                    <div
                      className="pf-user-overlay"
                      onClick={() => setUserMenuOpen(false)}
                    />
                  </>
                )}
              </div>

              {/* Mobile toggle */}
              <button
                className="auth-topbar__toggle"
                onClick={() => setMobileOpen(v => !v)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* FILA 2 */}
        <div className="auth-topbar__row-nav">
          <div className="pf-wrap auth-topbar__nav-inner">
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;

              return (
                <span key={item.key} className="pf-nav-menu__item">
                  <button
                    className={`auth-topbar__nav-btn${isActive ? " auth-topbar__nav-btn--active" : ""}`}
                    onClick={() => navigate(item.route ?? getDashboardRoute(user))}
                  >
                    <Icon size={14} />
                    <span className="auth-topbar__nav-label">{t(item.label)}</span>
                  </button>

                  {i < NAV_ITEMS.length - 1 && (
                    <ChevronRight size={13} className="pf-nav-menu__sep" />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Drawer mobile */}
        {mobileOpen && (
          <div className="auth-topbar__drawer">

            <div className="pf-nav-search pf-nav-search--mobile">
              <Search size={15} className="pf-nav-search__icon" />
              <input
                type="search"
                className="pf-nav-search__input"
                placeholder={t("nav.searchMobile")}
                value={searchValue}
                onChange={e =>
                  setSearchValue(e.target.value.replace(/[^\p{L}\p{N}\s]/gu, ""))
                }
                onKeyDown={e => {
                  if (e.key === "Enter" && searchValue.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                    setMobileOpen(false);
                  }
                }}
              />
            </div>

            {NAV_ITEMS.map(({ key, label, icon: Icon, route }) => (
              <button
                key={key}
                className={`auth-topbar__drawer-item${activePage === key ? " auth-topbar__drawer-item--active" : ""}`}
                onClick={() => {
                  navigate(route ?? getDashboardRoute(user));
                  setMobileOpen(false);
                }}
              >
                <Icon size={18} />
                {t(label)}
              </button>
            ))}

            {user && (
              <div className="pf-user__mobile">
                <div className="pf-user__avatar pf-user__avatar--theme-blue">
                  {shouldShowPhoto ? (
                    <img
                      src={user.photoUrl}
                      alt={user.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : user.initials}
                </div>

                <div>
                  <div className="pf-user__name">{user.name}</div>
                  <div style={{ fontSize: "12px" }}>{user.email}</div>
                </div>
              </div>
            )}

            <div className="auth-topbar__drawer-cta">
              <button
                className="pf-btn pf-btn--ghost pf-btn--full"
                onClick={() => {
                  navigate(getDashboardRoute(user));
                  setMobileOpen(false);
                }}
              >
                {t("nav.myProfile")}
              </button>

              <button
                className="pf-btn pf-btn--ghost pf-btn--full"
                onClick={() => {
                  navigate("/configuracion");
                  setMobileOpen(false);
                }}
              >
                {t("nav.settings")}
              </button>

              <button
                className="pf-btn pf-btn--red pf-btn--full"
                onClick={handleLogout}
              >
                {t("nav.logout")}
              </button>
            </div>
          </div>
        )}
      </header>

      <nav className="auth-topbar__mobile-nav">
        {NAV_ITEMS.map(({ key, icon: Icon, route }) => (
          <button
            key={key}
            className={`auth-topbar__mobile-nav-btn${activePage === key ? " auth-topbar__mobile-nav-btn--active" : ""}`}
            onClick={() => {
              navigate(route ?? getDashboardRoute(user));
              setMobileOpen(false);
            }}
          >
            <Icon size={22} />
          </button>
        ))}
      </nav>
    </>
  );
}
