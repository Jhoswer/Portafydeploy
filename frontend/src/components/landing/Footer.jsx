import { useTranslation } from "react-i18next";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLUMN_KEYS = [
  {
    key: "Product",
    links: [
      { index: 0, href: "/#how-it-works" },
      { index: 1, href: "/#features" },
      { index: 2, href: "/#recruiter" },
    ],
  },
  {
    key: "Community",
    links: [
      { index: 0, href: "/feed" },
      { index: 1, href: "/search" },
    ],
  },
  {
    key: "Company",
    links: [
      { index: 0, href: "/#about" },
      { index: 1, href: "mailto:contacto@portafy.com" },
    ],
  },
];

const SOCIALS = [
  { Icon: Twitter,   href: "https://twitter.com" },
  { Icon: Instagram, href: "https://instagram.com" },
  { Icon: Linkedin,  href: "https://linkedin.com" },
  { Icon: Github,    href: "https://github.com" },
];

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <footer className="pf-footer">

      <div className="pf-wrap pf-footer__inner">

        {/* Marca */}
        <div className="pf-footer__brand">

          <button
            type="button"
            className="pf-logo pf-logo--footer"
            onClick={() => navigate("/")}
          >
            <img src="/logos/portafy.png" alt="PortaFy" className="pf-logo__img" />
            <span className="pf-logo__text">
              Porta<span className="pf-logo__fy">Fy</span>
            </span>
          </button>

          <p className="pf-footer__tagline">
            {t("footer.tagline")}
          </p>

          <p className="pf-footer__desc">
            {t("footer.desc")}
          </p>

          <div className="pf-footer__socials">
            {SOCIALS.map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-footer__social"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Columnas */}
        {COLUMN_KEYS.map(({ key, links }) => {
          const heading = t(`footer.columns.${key}.heading`);
          const labels  = t(`footer.columns.${key}.links`, { returnObjects: true });

          return (
            <div key={key} className="pf-footer__col">
              <h4 className="pf-footer__col-heading">{heading}</h4>
              {links.map(({ index, href }) => (
                <a key={index} href={href} className="pf-footer__link">
                  {labels[index]}
                </a>
              ))}
            </div>
          );
        })}

      </div>

      {/* Bottom */}
      <div className="pf-wrap pf-footer__bottom">
        <span>© {new Date().getFullYear()} PortaFy · {t("footer.rights")}</span>
        <div className="pf-footer__bottom-links">
          <a href="mailto:contacto@portafy.com" className="pf-footer__bottom-link">
            {t("footer.bottom.contact")}
          </a>
        </div>
      </div>

    </footer>
  );
}