import FieldError from "./FieldError";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  rightElement,
  autoComplete
}) {
  return (
    <div>
      {/* Label */}
      <label className="text-xs font-medium text-foreground mb-1 block">
        {label}
      </label>

      {/* Input */}
      <div className="relative">
        {Icon && (
          <Icon
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-10 ${
            Icon ? "pl-9" : "pl-3"
          } ${rightElement ? "pr-10" : "pr-3"} rounded-xl bg-background text-sm placeholder-muted-foreground border outline-none transition-all focus:ring-2 ${
            error
              ? "border-red-500/60 focus:ring-red-500/20"
              : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
          }`}
        />

        {/* Elemento derecha (ej: ojo password) */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error */}
      <FieldError message={error} />
    </div>
  );
}
