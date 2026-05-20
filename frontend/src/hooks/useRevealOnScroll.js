import { useEffect } from "react";

export function useRevealOnScroll(selector = ".pprof-reveal", activeClassName = "pprof-reveal--visible") {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;

          window.setTimeout(() => {
            entry.target.classList.add(activeClassName);
          }, index * 60);

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [activeClassName, selector]);
}
