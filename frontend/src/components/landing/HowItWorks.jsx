import { useTranslation } from "react-i18next";
import { User, Upload, TrendingUp, Zap } from "lucide-react";

const ICONS = [User, Upload, TrendingUp];
const NUMBERS = ["01", "02", "03"];

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = t("howItWorks.steps", { returnObjects: true });

  return (
    <section className="pf-section pf-how" id="como-funciona">

      <div className="pf-how__bg" />

      <div className="pf-wrap">

        <div className="pf-section__header">
          <div className="pf-section__tag">
            <Zap size={14} /> {t("howItWorks.tag")}
          </div>

          <h2 className="pf-section__title">
            {t("howItWorks.title")}
          </h2>

          <p className="pf-section__sub">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="pf-how__grid">
          {steps.map(function(step, i) {
            var Icon = ICONS[i];
            return (
              <div key={i} className="pf-step">

                <div className="pf-step__number">{NUMBERS[i]}</div>

                <div className="pf-step__icon-wrap">
                  <Icon size={24} className="pf-step__icon" />
                </div>

                <h3 className="pf-step__title">{step.title}</h3>

                <p className="pf-step__desc">{step.desc}</p>

                {i < steps.length - 1 && (
                  <div className="pf-step__connector" />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}