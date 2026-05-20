export default function PasswordStrength({ password, labels, colors }) {
  const strength = Math.min(Math.floor(password.length / 3), 4);

  if (!password.length) return null;

  return (
    <div className="flex items-center gap-2 mt-1.5">
      {/* Barras */}
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background:
                level <= strength
                  ? colors[strength - 1]
                  : "rgba(255,255,255,0.08)"
            }}
          />
        ))}
      </div>

      {/* Texto */}
      <span
        className="text-[11px] font-medium"
        style={{ color: colors[strength - 1] }}
      >
        {labels[strength]}
      </span>
    </div>
  );
}
