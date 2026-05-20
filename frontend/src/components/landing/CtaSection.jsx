import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CtaSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="pf-cta">
      <div className="pf-wrap pf-cta__inner">

        <div className="pf-cta__content">
          <h2 className="pf-cta__title">
            {t("cta.title")}
          </h2>

          <p className="pf-cta__sub">
            {t("cta.subtitle")}
          </p>
        </div>

        <div className="pf-cta__actions">
          <button
            className="pf-btn pf-btn--red pf-btn--xl"
            onClick={() => navigate("/register")}
          >
            {t("cta.createPortfolio")} <ArrowRight size={20} />
          </button>

          <button
            className="pf-btn pf-btn--glass pf-btn--xl"
            onClick={() => navigate("/demo")}
          >
            {t("cta.viewDemo")}
          </button>
        </div>

      </div>
    </section>
  );
}