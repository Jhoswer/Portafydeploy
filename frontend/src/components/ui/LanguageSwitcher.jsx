import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../../hooks/useClickOutside";

const languages = [
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", native: "Spanish", flag: "🇪🇸" },
  { code: "pt", label: "Português", native: "Portuguese", flag: "🇧🇷" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fix bug silencioso: "es-ES" no matchea "es"
  const current = languages.find((l) => i18n.language.startsWith(l.code)) ?? languages[0];

  useClickOutside(ref, open, () => setOpen(false));

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-sm py-1.5 z-50">
          {languages.map((lang, i) => (
            <div key={lang.code}>
              {i > 0 && <div className="my-1 border-t border-gray-100" />}
              <button
                onClick={() => handleSelect(lang.code)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">{lang.label}</p>
                  <p className="text-xs text-gray-400">{lang.native}</p>
                </div>
                {current.code === lang.code && (
                  <svg className="w-4 h-4 text-gray-800" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}