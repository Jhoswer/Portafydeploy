// pages/ExplorarTalento.jsx
const CANDIDATES = [
  { name: "Laura G.",   role: "Frontend Developer", skills: ["React", "TypeScript"], match: 95 },
  { name: "Diego R.",   role: "Backend Developer",  skills: ["Node.js", "PostgreSQL"], match: 88 },
  { name: "Valeria M.", role: "UX Designer",         skills: ["Figma", "Research"],  match: 82 },
  { name: "Mateo S.",   role: "DevOps Engineer",     skills: ["Docker", "AWS"],       match: 79 },
];

export default function ExplorarTalento() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>Explorar talento</h2>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>Candidatos disponibles en la plataforma</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CANDIDATES.map(({ name, role, skills, match }) => (
          <div key={name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(55,138,221,0.10)", color: "#185FA5", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{role}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {skills.map(s => (
                  <span key={s} style={{ fontSize: 11, background: "rgba(55,138,221,0.08)", color: "#185FA5", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: match >= 90 ? "#0F6E56" : "#185FA5" }}>{match}%</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>match</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}