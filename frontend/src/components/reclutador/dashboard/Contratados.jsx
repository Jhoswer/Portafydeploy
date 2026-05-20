// pages/Contratados.jsx
const CONTRATADOS = [
  { nombre: "Laura G.",   puesto: "Frontend Developer", fecha: "Mar 2025", color: "#0F6E56", bg: "rgba(29,158,117,0.10)" },
  { nombre: "Roberto A.", puesto: "Backend Engineer",   fecha: "Feb 2025", color: "#0F6E56", bg: "rgba(29,158,117,0.10)" },
  { nombre: "Isabel M.",  puesto: "UX Designer",        fecha: "Ene 2025", color: "#0F6E56", bg: "rgba(29,158,117,0.10)" },
  { nombre: "Felipe C.",  puesto: "DevOps Engineer",    fecha: "Dic 2024", color: "#0F6E56", bg: "rgba(29,158,117,0.10)" },
];

export default function Contratados() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>Contratados</h2>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>Candidatos que completaron el proceso exitosamente</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CONTRATADOS.map(({ nombre, puesto, fecha, color, bg }) => (
          <div key={nombre} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, color, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {nombre[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{nombre}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{puesto}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{fecha}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: bg, color }}>✓ Contratado</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}