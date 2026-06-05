import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import { useClickOutside } from "../../hooks/useClickOutside";
import ThemeToggle from "../ui/ThemeTongle";
import NotificationBell from "../notifications/NotificationBell";
import "../../styles/components/professional/MobileNavigation.css";

const languages = [
  { code: "en", label: "English", native: "English", flag: "US" },
  { code: "es", label: "Español", native: "Spanish", flag: "ES" },
  { code: "pt", label: "Português", native: "Portuguese", flag: "PT" },
];

const visitorProductLinks = [
  { label: "Feed", route: "/feed" },
];

const userProductLinks = [
  ...visitorProductLinks,
  { label: "Dashboard", route: "/dashboard" },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((item) => item.code === i18n.language) ?? languages[1];

  useClickOutside(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="pf-lang">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pf-lang__trigger"
      >
        <span className="pf-lang__flag">{current.flag}</span>
        <span>{current.label}</span>
      </button>

      {open ? (
        <div className="pf-lang__menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`pf-lang__option${current.code === lang.code ? " is-active" : ""}`}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
            >
              <span className="pf-lang__flag">{lang.flag}</span>
              <span>
                <strong>{lang.label}</strong>
                <small>{lang.native}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar({ hideAuthButtons = false, mobileNavGroups = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [failedPhotoUrl, setFailedPhotoUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pageTheme = location.pathname === "/dashboard" ? "white" : "blue";
  const shouldShowPhoto = Boolean(user?.photoUrl) && failedPhotoUrl !== user.photoUrl;
  const navClass = `pf-nav pf-nav--theme-${pageTheme}${scrolled ? " pf-nav--scrolled" : ""}`;
  const productLinks = user ? userProductLinks : visitorProductLinks;
  const userVerified = Boolean(user?.is_verified || user?.isVerified || user?.verification?.is_verified);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const openRoute = (route) => {
    navigate(route);
    setMobileOpen(false);
  };

  return (
    <header className={navClass}>
      <div className="pf-wrap pf-nav-top">
        <div className="pf-nav-logos">
          <button type="button" className="pf-nav-inst" onClick={() => openRoute("/")}>
            <img src="/logos/umss.png" alt="UMSS" className="pf-nav-inst__logo" />
            <span className="pf-nav-inst__text">
              <span className="pf-nav-inst__name">UMSS</span>
              <span className="pf-nav-inst__sub">Univ. Mayor de San Simón</span>
            </span>
          </button>

          <div className="pf-nav-logos__sep" />

          <button type="button" className="pf-logo" onClick={() => openRoute("/")}>
            <img src="/logos/portafy.png" alt="PortaFy" className="pf-logo__img" />
            <span className="pf-logo__text">
              Porta<span className="pf-logo__fy">Fy</span>
            </span>
          </button>
        </div>

        <nav className="pf-product-nav" aria-label="Navegacion principal">
          {productLinks.map(({ label, route }) => {
            const active = location.pathname === route;
            return (
              <button
                key={route}
                type="button"
                className={`pf-product-nav__item${active ? " is-active" : ""}`}
                onClick={() => openRoute(route)}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="pf-nav-actions">
          <LanguageSwitcher />

          <div className="pf-nav-actions__sep" />

          <ThemeToggle />


          {user ? <NotificationBell /> : null}


          <div className="pf-nav-auth">
            {hideAuthButtons ? null : user ? (
              <div className="pf-user-menu">
                <button
                  className="pf-user-trigger"
                  type="button"
                  onClick={() => setUserMenuOpen((value) => !value)}
                >
                  <div className={`pf-user__avatar pf-user__avatar--theme-${pageTheme}`}>
                    {shouldShowPhoto ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        onError={() => setFailedPhotoUrl(user.photoUrl)}
                      />
                    ) : (
                      user.initials
                    )}
                  </div>
                  <span className="pf-user__name">
                    {user.name}
                    {userVerified ? (
                      <ShieldCheck className="pf-user-verified" size={15} aria-label={t("appI18n.common.verifiedAccount")} />
                    ) : null}
                  </span>
                </button>

                {userMenuOpen ? (
                  <>
                    <div className="pf-user-dropdown">
                      <div className="pf-user-dropdown__header">
                        <div className={`pf-user-dropdown__avatar pf-user__avatar--theme-${pageTheme}`}>
                          {shouldShowPhoto ? (
                            <img
                              src={user.photoUrl}
                              alt={user.name}
                              onError={() => setFailedPhotoUrl(user.photoUrl)}
                            />
                          ) : (
                            user.initials
                          )}
                        </div>
                        <div className="pf-user-dropdown__identity">
                          <p className="pf-user-dropdown__name-row">
                            <span>{user.name} {user.lastName}</span>
                            {userVerified ? (
                              <ShieldCheck className="pf-user-verified pf-user-verified--dropdown" size={15} aria-label={t("appI18n.common.verifiedAccount")} />
                            ) : null}
                          </p>
                          <span>{user.email}</span>
                        </div>
                      </div>
                      <button
                        className="pf-user-dropdown__item"
                        type="button"
                        onClick={() => {
                          navigate("/dashboard");
                          setUserMenuOpen(false);
                        }}
                      >
                        {t("nav.myProfile")}
                      </button>
                      <button
                        className="pf-user-dropdown__item"
                        type="button"
                        onClick={() => {
                          navigate("/configuracion");
                          setUserMenuOpen(false);
                        }}
                      >
                        {t("nav.settings")}
                      </button>
                      <button className="pf-user-dropdown__logout" type="button" onClick={handleLogout}>
                        {t("nav.logout")}
                      </button>
                    </div>
                    <div className="pf-user-overlay" onClick={() => setUserMenuOpen(false)} />
                  </>
                ) : null}
              </div>
            ) : (
              <>
                <button className="pf-btn pf-btn--ghost" type="button" onClick={() => openRoute("/register")}>
                  {t("nav.register")}
                </button>
                <button className="pf-btn pf-btn--red" type="button" onClick={() => openRoute("/login")}>
                  {t("nav.login")}
                </button>
              </>
            )}
          </div>

          <button className="pf-nav__toggle" type="button" onClick={() => setMobileOpen((value) => !value)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="pf-nav__drawer">
          <div className="pf-nav__drawer-status">
            Red profesional UMSS Portafy
          </div>

          <div className="pf-nav__drawer-links">
            {productLinks.map(({ label, route }) => (
              <button
                key={route}
                type="button"
                className={`pf-product-nav__item${location.pathname === route ? " is-active" : ""}`}
                onClick={() => openRoute(route)}
              >
                {label}
              </button>
            ))}
          </div>

          {mobileNavGroups.length ? (
            <div className="pf-nav__context">
              {mobileNavGroups.map((group) => (
                <div className="pf-nav__context-group" key={group.title}>
                  <p className="pf-nav__context-title">{group.title}</p>
                  <div className="pf-nav__context-list">
                    {group.items.map((item) => {
                      const ContextIcon = item.icon;
                      return (
                        <button
                          key={item.key || item.label}
                          type="button"
                          className={`pf-nav__context-item${item.active ? " is-active" : ""}`}
                          onClick={() => {
                            item.onClick?.();
                            setMobileOpen(false);
                          }}
                        >
                          <span className="pf-nav__context-icon">
                            {ContextIcon ? <ContextIcon size={16} /> : null}
                          </span>
                          <span className="pf-nav__context-copy">
                            <span>{item.label}</span>
                            {item.meta ? <small>{item.meta}</small> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="pf-nav__drawer-tools">
            <LanguageSwitcher />
          </div>

          {user ? (
            <div className="pf-user__mobile">
              <div className={`pf-user__avatar pf-user__avatar--theme-${pageTheme}`}>
                {shouldShowPhoto ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    onError={() => setFailedPhotoUrl(user.photoUrl)}
                  />
                ) : (
                  user.initials
                )}
              </div>
              <div>
                <div className="pf-user__mobile-name">
                  <span>{user.name}</span>
                  {userVerified ? (
                    <ShieldCheck className="pf-user-verified pf-user-verified--mobile" size={15} aria-label={t("appI18n.common.verifiedAccount")} />
                  ) : null}
                </div>
                <div className="pf-user__mobile-email">{user.email}</div>
              </div>
            </div>
          ) : null}

          <div className="pf-nav__drawer-cta">
            {user ? (
              <>
              <NotificationBell mobile /> 
                <button className="pf-btn pf-btn--ghost pf-btn--full" type="button" onClick={() => openRoute("/dashboard")}>
                  {t("nav.myProfile")}
                </button>
                <button className="pf-btn pf-btn--ghost pf-btn--full" type="button" onClick={() => openRoute("/configuracion")}>
                  {t("nav.settings")}
                </button>
                <button className="pf-btn pf-btn--red pf-btn--full" type="button" onClick={handleLogout}>
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <button className="pf-btn pf-btn--ghost pf-btn--full" type="button" onClick={() => openRoute("/register")}>
                  {t("nav.register")}
                </button>
                <button className="pf-btn pf-btn--red pf-btn--full" type="button" onClick={() => openRoute("/login")}>
                  {t("nav.login")}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
