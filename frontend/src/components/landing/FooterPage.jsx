import { useTranslation } from "react-i18next";

export default function FooterPage() {
  const { t } = useTranslation();

  return (
    <footer className="pf-footer pf-footer--compact">
      <div className="pf-wrap pf-footer__bottom">
        <span>
          © 2026 PortaFy · {t("footer.rights")}
        </span>
      </div>
    </footer>
  );
}