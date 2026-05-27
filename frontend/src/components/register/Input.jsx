import FieldError from "./FieldError";

export default function Input({
  label, type = "text", value, onChange,
  placeholder, icon: Icon, error, rightElement, autoComplete
}) {
  return (
    <div>
      <label className="auth-input-label">
        {label}
      </label>

      <div className="auth-input-wrap">
        {Icon && (
          <Icon size={13} className="auth-input-icon" />
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={[
            "auth-input",
            Icon        ? "auth-input--has-icon"  : "",
            rightElement ? "auth-input--has-right" : "",
            error       ? "auth-input--error"     : "",
          ].join(" ")}
        />

        {rightElement && (
          <div className="auth-input-right">
            {rightElement}
          </div>
        )}
      </div>

      <FieldError message={error} />
    </div>
  );
}