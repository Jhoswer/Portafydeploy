import { useState, useEffect } from "react";

const images = [
  "/images/hero1.png",
  "/images/hero2.png",
  "/images/hero3.png",
];

export function ImageSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pf-slider">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`slide ${i + 1}`}
          className={`pf-slider__img ${i === index ? "pf-slider__img--active" : ""}`}
        />
      ))}

      {/* Dots indicadores */}
      <div className="pf-slider__dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`pf-slider__dot ${i === index ? "pf-slider__dot--active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}