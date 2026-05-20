import { FileText, CheckCircle } from "lucide-react";

export function CvOption({ cv, selected, onSelect }) {
  const isSelected = selected?.id === cv.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(isSelected ? null : cv)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", textAlign: "left",
        background: isSelected ? "#eff6ff" : "#f9fafb",
        border: `1.5px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
        borderRadius: 10, padding: "10px 14px",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: isSelected ? "#dbeafe" : "#e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <FileText size={16} color={isSelected ? "#2563eb" : "#6b7280"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {cv.name}
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          {cv.updatedAt ? `Actualizado el ${cv.updatedAt}` : "CV guardado"}
        </div>
      </div>
      {isSelected && <CheckCircle size={16} color="#2563eb" style={{ flexShrink: 0 }} />}
    </button>
  );
}