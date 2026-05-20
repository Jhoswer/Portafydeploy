import { useTranslation } from "react-i18next";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

const COLUMN_KEYS = ["Product", "Community", "Company"];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="pf-footer">

      <div className="pf-wrap pf-footer__inner">

        {/* Marca */}
        <div className="pf-footer__brand">

          <div className="pf-logo pf-logo--lg pf-logo--light">
            <span className="pf-logo__mark">P</span>ortaFy
          </div>

          <p className="pf-footer__tagline">
            {t("footer.tagline")}
          </p>

          <p className="pf-footer__desc">
            {t("footer.desc")}
          </p>

          <div className="pf-footer__socials">
            {[Twitter, Instagram, Linkedin, Github].map(function(Icon, i) {
              return (
                <a key={i} href="#" className="pf-footer__social">
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Columnas */}
        {COLUMN_KEYS.map(function(key) {
          var heading = t("footer.columns." + key + ".heading");
          var links = t("footer.columns." + key + ".links", { returnObjects: true });
          return (
            <div key={key} className="pf-footer__col">
              <h4 className="pf-footer__col-heading">{heading}</h4>
              {links.map(function(link, i) {
                return (
                  <a key={i} href="#" className="pf-footer__link">
                    {link}
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="pf-wrap pf-footer__bottom">

        <span>
          © {new Date().getFullYear()} PortaFy · {t("footer.rights")}
        </span>

        <div className="pf-footer__bottom-links">
          <a href="#" className="pf-footer__bottom-link">{t("footer.bottom.privacy")}</a>
          <a href="#" className="pf-footer__bottom-link">{t("footer.bottom.terms")}</a>
          <a href="#" className="pf-footer__bottom-link">{t("footer.bottom.cookies")}</a>
        </div>

      </div>
    </footer>
  );
}