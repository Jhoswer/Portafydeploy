import { useEffect, useState } from "react";

export function useViewport(defaultWidth = 1280) {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? defaultWidth : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}
