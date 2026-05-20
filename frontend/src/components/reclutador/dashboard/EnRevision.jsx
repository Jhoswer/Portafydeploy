// pages/EnRevision.jsx
const EN_REVISION = [
  { nombre: "Diego R.",   puesto: "Backend Engineer",   nota: "Buena experiencia en microservicios" },
  { nombre: "Camila T.",  puesto: "Data Analyst",       nota: "Pendiente entrevista técnica"       },
  { nombre: "Andrés F.",  puesto: "Frontend Developer", nota: "Portfolio revisado, avanzar"        },
  { nombre: "María J.",   puesto: "UX Designer",        nota: "Agendar prueba de diseño"           },
  { nombre: "Luis P.",    puesto: "DevOps",             nota: "Verificar certificaciones AWS"      },
  { nombre: "Sofía N.",   puesto: "Data Analyst",       nota: "Segunda entrevista programada"      },
  { nombre: "Tomás H.",   puesto: "Backend Engineer",   nota: "Esperando referencias"              },
  { nombre: "Paula V.",   puesto: "Frontend Developer", nota: "Revisión de prueba técnica"         },
];

export default function EnRevision() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>En revisión</h2>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>Candidatos pendientes de evaluación</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {EN_REVISION.map(({ nombre, puesto, nota }) => (
          <div key={nombre} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(216,90,48,0.10)", color: "#993C1D", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {nombre[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{nombre}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{puesto}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#374151", background: "#fafafa", borderRadius: 8, padding: "8px 10px", borderLeft: "3px solid rgba(216,90,48,0.4)" }}>
              {nota}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}