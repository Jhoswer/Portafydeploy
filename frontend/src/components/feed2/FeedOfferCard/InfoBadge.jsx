export function InfoBadge({ icon: Icon, label }) {
  if (!label) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#f9fafb", color: "#374151",
      fontSize: 12, fontWeight: 500,
      padding: "5px 10px", borderRadius: 999,
      border: "1px solid #e5e7eb",
    }}>
      <Icon size={12} style={{ color: "#6b7280" }} /> {label}
    </span>
  );
}