import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageSlider } from "./ImagenSlider";

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="pf-hero" id="inicio">

      {/* Fondos decorativos */}
      <div className="pf-hero__blob pf-hero__blob--1" />
      <div className="pf-hero__blob pf-hero__blob--2" />
      <div className="pf-hero__grid-lines" />

      <div className="pf-wrap pf-hero__inner">

        {/* ── TEXTO ─────────────────────────────────── */}
        <div className="pf-hero__content">

          <div className="pf-hero__badge">
            <Sparkles size={13} />
            {t("hero.badge")}
          </div>

          <h1 className="pf-hero__title">
            {t("hero.title")}
          </h1>

          <p className="pf-hero__subtitle">
            {t("hero.subtitle")}
          </p>

          <div className="pf-hero__actions">
            <button
              className="pf-btn pf-btn--red pf-btn--lg"
              onClick={() => navigate("/register")}
            >
              {t("hero.cta.start")} <ArrowRight size={18} />
            </button>

            <button
              className="pf-btn pf-btn--glass pf-btn--lg"
              onClick={() => navigate("/explorar")}
            >
              <Play size={16} /> {t("hero.cta.explore")}
            </button>
          </div>

          {/* Social proof */}
          <div className="pf-hero__proof">
            <div className="pf-hero__avatars">
              {["MG", "CR", "AM", "LP"].map((i, idx) => (
                <div key={idx} className="pf-hero__av" style={{ zIndex: 4 - idx }}>
                  {i}
                </div>
              ))}
            </div>
            <p className="pf-hero__proof-text">
              <strong>{t("hero.proof.count")}</strong> {t("hero.proof.text")}
            </p>
          </div>
        </div>

        {/* ── VISUAL — slider ───────────────────────── */}
        <div className="pf-hero__visual">
          <div className="pf-hero__slider-wrap">
            <ImageSlider />
          </div>
        </div>

      </div>
    </section>
  );
}