import { useTranslation } from "react-i18next";
import {
  Star,
  Palette,
  BarChart3,
  Smartphone,
  Share2,
  BadgeCheck,
} from "lucide-react";

const ICONS = [Star, Palette, BarChart3, Smartphone, Share2, BadgeCheck];

export default function Features() {
  const { t } = useTranslation();

  const items = t("features.items", { returnObjects: true });

  return (
    <section className="pf-section pf-features" id="features">
      <div className="pf-wrap">

        <div className="pf-section__header">
          <div className="pf-section__tag">{t("features.tag")}</div>

          <h2 className="pf-section__title">
            {t("features.title")}
          </h2>

          <p className="pf-section__sub">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="pf-features__grid">
          {items.map(function(item, i) {
            var Icon = ICONS[i];
            return (
              <div key={i} className="pf-fcard">
                <div className="pf-fcard__icon-wrap">
                  <Icon size={22} className="pf-fcard__icon" />
                </div>
                <h3 className="pf-fcard__title">{item.title}</h3>
                <p className="pf-fcard__desc">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}