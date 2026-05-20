import { useEffect } from "react";

export function useClickOutside(ref, enabled, onOutsideClick) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerDown = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      onOutsideClick?.(event);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [enabled, onOutsideClick, ref]);
}
