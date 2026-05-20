import { useRef, useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

// ─── Sugerencias predefinidas por clave de filtro ────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const SUGGESTIONS = {
  ubicacion: [
    "Cochabamba, Bolivia",
    "La Paz, Bolivia",
    "Santa Cruz, Bolivia",
    "Oruro, Bolivia",
    "Sucre, Bolivia",
    "Buenos Aires, Argentina",
    "Bogotá, Colombia",
    "Lima, Perú",
    "Ciudad de México",
    "Madrid, España",
    "Barcelona, España",
    "Remoto",
  ],
  profesion: [
    "Desarrollador Frontend",
    "Desarrollador Backend",
    "Desarrollador Full Stack",
    "Diseñador UX/UI",
    "Data Scientist",
    "DevOps Engineer",
    "Product Manager",
    "QA Engineer",
    "Arquitecto de Software",
    "Scrum Master",
    "Analista de Datos",
    "Mobile Developer",
  ],
  habilidad: [
    "JavaScript",
    "TypeScript",
    "Python",
    "React",
    "Vue.js",
    "Node.js",
    "SQL",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "Figma",
    "AWS",
    "Git",
    "GraphQL",
    "Java",
    "Kotlin",
    "Swift",
  ],
  exp_cargo: [
    "Desarrollador Senior",
    "Desarrollador Semi-Senior",
    "Desarrollador Junior",
    "Tech Lead",
    "Engineering Manager",
    "CTO",
    "Director de Tecnología",
    "Analista de Datos",
    "Ingeniero de Software",
    "Consultor TI",
    "Gerente de Proyectos",
  ],
  exp_empresa: [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Mercado Libre",
    "Globant",
    "Accenture",
    "Deloitte",
    "IBM",
    "Oracle",
    "Startup",
    "Freelance",
  ],
  institucion: [
    "UMSS",
    "UMSA",
    "UAGRM",
    "UCB",
    "UAB",
    "UPSA",
    "Pontificia Universidad Javeriana",
    "UNAM",
    "UBA",
    "UdeA",
    "PUCP",
    "MIT",
    "Stanford",
  ],
};

// ─── FilterInput ─────────────────────────────────────────────────────────────

/**
 * @param {{
 *   option: { key: string, label: string, type: string, options?: string[] },
 *   value: string,
 *   inputValue: string,
 *   customOptions: string[],
 *   suggestions: string[],
 *   onChange: (val: string) => void,
 *   onInputChange: (val: string) => void,
 *   onClear: () => void,
 *   onAddCustom: (val: string) => void,
 *   onDeleteCustom: (val: string) => void,
 * }} props
 */
export function FilterInput({
  option,
  value,
  inputValue = "",
  customOptions = [],
  suggestions = [],
  onChange,
  onInputChange,
  onClear,
  onAddCustom,
  onDeleteCustom,
}) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setFocusedIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Toggle / Select ──────────────────────────────────────────────────────

  if (option.type === "toggle") {
    const isOn = value === "true";
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-card w-fit min-w-48">
        <span className="text-sm text-foreground flex-1">{option.label}</span>
        <button
          role="switch"
          aria-checked={isOn}
          onClick={() => onChange(isOn ? "" : "true")}
          className={[
            "relative h-5 w-9 rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30",
            isOn ? "bg-primary border-primary" : "bg-muted border-border",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
              isOn ? "translate-x-4" : "translate-x-0",
            ].join(" ")}
          />
        </button>
        {isOn && (
          <button
            onClick={onClear}
            className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  if (option.type === "select") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card w-fit min-w-48">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {option.label}:
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm bg-transparent text-foreground focus:outline-none cursor-pointer flex-1"
        >
          <option value="">Cualquiera</option>
          {option.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {value && (
          <button
            onClick={onClear}
            className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  // ── Text con dropdown tipo LinkedIn ─────────────────────────────────────

  const query = inputValue.toLowerCase().trim();

  const filteredCustom = customOptions.filter((v) =>
    v.toLowerCase().includes(query)
  );
  const filteredBase = suggestions.filter(
    (v) =>
      v.toLowerCase().includes(query) &&
      !customOptions.some((c) => c.toLowerCase() === v.toLowerCase())
  );

  const allItems = [...filteredCustom, ...filteredBase];

  // ¿El texto escrito no coincide exactamente con ninguna opción?
  const showAddOption =
    inputValue.trim() !== "" &&
    !allItems.some((v) => v.toLowerCase() === inputValue.toLowerCase().trim());

  // Lista completa de items navegables (para teclado)
  const navigableItems = [
    ...allItems.map((v) => ({ type: "option", value: v })),
    ...(showAddOption
      ? [{ type: "add", value: inputValue.trim() }]
      : []),
  ];

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        setFocusedIdx(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setFocusedIdx((i) => Math.min(i + 1, navigableItems.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setFocusedIdx((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIdx >= 0 && navigableItems[focusedIdx]) {
        const item = navigableItems[focusedIdx];
        if (item.type === "add") {
          handleAdd(item.value);
        } else {
          handleSelect(item.value);
        }
      } else if (inputValue.trim()) {
        // Enter con texto sin foco → agregar/seleccionar
        if (showAddOption) {
          handleAdd(inputValue.trim());
        } else if (allItems.length > 0) {
          handleSelect(allItems[0]);
        }
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocusedIdx(-1);
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    onInputChange(val);
    setOpen(false);
    setFocusedIdx(-1);
  };

  const handleAdd = (val) => {
    onAddCustom(val);
    onChange(val);
    onInputChange(val);
    setOpen(false);
    setFocusedIdx(-1);
  };

  const handleDeleteCustom = (e, val) => {
    e.stopPropagation();
    onDeleteCustom(val);
    if (value === val) {
      onClear();
      onInputChange("");
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">
      {/* Input */}
      <div
        className={[
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card transition-all",
          open
            ? "border-primary/50 ring-1 ring-primary/20"
            : "border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
        ].join(" ")}
      >
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
          {option.label}:
        </span>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          autoFocus
          placeholder={`Buscar ${option.label.toLowerCase()}...`}
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onInputChange(e.target.value);
            // Limpiar selección si el usuario borra el texto
            if (e.target.value === "") onChange("");
            setOpen(true);
            setFocusedIdx(-1);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
        />
        {(value || inputValue) && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              onClear();
              onInputChange("");
              inputRef.current?.focus();
            }}
            className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-card border border-border rounded-lg shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          {/* Sección: guardados */}
          {filteredCustom.length > 0 && (
            <>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Guardados
              </p>
              {filteredCustom.map((v, i) => {
                const idx = i;
                const isFocused = focusedIdx === idx;
                const isSelected = value === v;
                return (
                  <div
                    key={v}
                    onMouseEnter={() => setFocusedIdx(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(v);
                    }}
                    className={[
                      "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : isFocused
                        ? "bg-accent"
                        : "hover:bg-accent",
                    ].join(" ")}
                  >
                    <span
                      className="flex-1 truncate"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(v, inputValue),
                      }}
                    />
                    <button
                      onMouseDown={(e) => handleDeleteCustom(e, v)}
                      className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 ml-1"
                      title="Eliminar guardado"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {/* Sección: sugerencias */}
          {filteredBase.length > 0 && (
            <>
              {filteredCustom.length > 0 && (
                <div className="border-t border-border/50 my-0.5" />
              )}
              {filteredCustom.length > 0 && (
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sugerencias
                </p>
              )}
              {filteredBase.map((v, i) => {
                const idx = filteredCustom.length + i;
                const isFocused = focusedIdx === idx;
                const isSelected = value === v;
                return (
                  <div
                    key={v}
                    onMouseEnter={() => setFocusedIdx(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(v);
                    }}
                    className={[
                      "flex items-center px-3 py-2 cursor-pointer text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : isFocused
                        ? "bg-accent"
                        : "hover:bg-accent",
                    ].join(" ")}
                  >
                    <span
                      className="flex-1 truncate"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(v, inputValue),
                      }}
                    />
                  </div>
                );
              })}
            </>
          )}

          {/* Sin resultados */}
          {allItems.length === 0 && !showAddOption && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              Sin resultados para "{inputValue}"
            </p>
          )}

          {/* Opción: agregar valor personalizado */}
          {showAddOption && (
            <>
              {allItems.length > 0 && (
                <div className="border-t border-border/50 my-0.5" />
              )}
              <div
                onMouseEnter={() => setFocusedIdx(navigableItems.length - 1)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAdd(inputValue.trim());
                }}
                className={[
                  "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm text-primary transition-colors",
                  focusedIdx === navigableItems.length - 1
                    ? "bg-primary/10"
                    : "hover:bg-primary/5",
                ].join(" ")}
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Agregar{" "}
                  <span className="font-medium">"{inputValue.trim()}"</span>
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helper: resaltar coincidencia ───────────────────────────────────────────

function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<strong class="text-primary font-medium">$1</strong>'
  );
}
