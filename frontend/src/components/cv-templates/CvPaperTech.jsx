// ─── Layout Tech / Dev ────────────────────────────────────────────────────────
// Fondo oscuro completo, monospace, estilo terminal

const FONTS = [
  { id: "serif", value: "Georgia, 'Times New Roman', serif" },
  { id: "sans",  value: "system-ui, -apple-system, sans-serif" },
  { id: "mono",  value: "'Courier New', Courier, monospace" },
];

function formatDateShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-BO", { month: "short", year: "numeric" });
}

export default function CvPaperTech({
  template,
  fontId,
  sections,
  profile,
  zoom,
  experience    = [],
  education     = [],
  skills        = [],
  projects      = [],
  customEntries = [],
  hiddenItems   = new Set(),
}) {
  const customExp    = customEntries.filter(e => e.entry_type === "experience");
  const customSkills = customEntries.filter(e => e.entry_type === "skill");
  const customEdu    = customEntries.filter(e => e.entry_type === "education");
  // eslint-disable-next-line no-unused-vars
  const font         = FONTS.find(f => f.id === fontId)?.value ?? FONTS[0].value;
  const enabledSections = new Set(sections.filter(s => s.enabled).map(s => s.key));

  const bg     = template.headerBg;
  const accent = template.accentColor;
  const mono   = "'Courier New', Courier, monospace";

  const paperStyle = {
    width: 595, minHeight: 842,
    background: bg, padding: "28px 32px",
    display: "flex", flexDirection: "column", gap: 20,
    boxShadow: "0 4px 32px rgba(0,0,0,.16), 0 1px 4px rgba(0,0,0,.08)",
    transformOrigin: "top center",
    transform: `scale(${zoom / 100})`,
    flexShrink: 0,
    marginBottom: zoom < 90 ? -(842 * (1 - zoom / 100)) : 0,
  };

  const nameStyle    = { fontFamily: mono, fontSize: "22px", fontWeight: 700, color: accent, letterSpacing: "-.02em" };
  const promptStyle  = { fontFamily: mono, fontSize: "10px", color: `${accent}99`, marginTop: 4 };
  const contactStyle = { display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 8 };
  const contactItem  = { fontFamily: mono, fontSize: "8.5px", color: "#8b949e" };
  const expTitle     = { fontFamily: mono, fontSize: "10.5px", fontWeight: 700, color: "#e6edf3" };
  const expCompany   = { fontFamily: mono, fontSize: "9px", color: accent, marginTop: 1 };
  const expDate      = { fontFamily: mono, fontSize: "8px", color: "#6e7681" };
  const expDesc      = { fontFamily: mono, fontSize: "8.5px", color: "#8b949e", lineHeight: 1.6, marginTop: 3 };
  const skillChip    = { fontFamily: mono, fontSize: "8px", padding: "2px 8px", border: `1px solid ${accent}55`, borderRadius: 2, color: accent, background: `${accent}0f`, display: "inline-block", marginRight: 4, marginBottom: 4 };
  const bioText      = { fontFamily: mono, fontSize: "9px", color: "#8b949e", lineHeight: 1.7 };

  const SectionHeader = ({ label }) => (
    <div style={{ fontFamily: mono, fontSize: "8.5px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: `${accent}99` }}>{">"}</span>
      {label}
      <div style={{ flex: 1, height: 1, background: `${accent}33` }} />
    </div>
  );

  const fullName = profile
    ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim()
    : "Tu Nombre Completo";

  return (
    <div style={paperStyle}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${accent}33`, paddingBottom: 16 }}>
        <div style={nameStyle}>{fullName}</div>
        <div style={promptStyle}>$ {profile?.profesion || "desarrollador"}</div>
        <div style={contactStyle}>
          {profile?.email     && <span style={contactItem}>{profile.email}</span>}
          {profile?.ubicacion && <span style={contactItem}>{profile.ubicacion}</span>}
          {profile?.github    && <span style={contactItem}>{profile.github}</span>}
          {profile?.linkedin  && <span style={contactItem}>{profile.linkedin}</span>}
        </div>
      </div>

      {enabledSections.has("bio") && profile?.biografia && (
        <div>
          <SectionHeader label="SOBRE MÍ" />
          <div style={bioText}>{profile.biografia}</div>
        </div>
      )}

      {enabledSections.has("experience") && (
        <div>
          <SectionHeader label="EXPERIENCIA" />
          {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={expTitle}>{exp.cargo || exp.title}</div>
                <div style={expDate}>{formatDateShort(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "present" : formatDateShort(exp.fecha_fin || exp.end_date)}</div>
              </div>
              <div style={expCompany}>{exp.empresa || exp.company}</div>
              {(exp.descripcion || exp.description) && <div style={expDesc}>{exp.descripcion || exp.description}</div>}
            </div>
          ))}
          {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
            <div key={`ce-${i}`} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={expTitle}>{e.title}</div>
                <div style={expDate}>{e.date_start} — {e.is_current ? "present" : e.date_end}</div>
              </div>
              <div style={expCompany}>{e.subtitle}</div>
              {e.description && <div style={expDesc}>{e.description}</div>}
            </div>
          ))}
        </div>
      )}

      {enabledSections.has("skills") && (
        <div>
          <SectionHeader label="HABILIDADES" />
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {skills.filter(s => !hiddenItems.has(`skill-${s.id}`)).map((s, i) => (
              <span key={i} style={skillChip}>{s.nombre || s.name}</span>
            ))}
            {customSkills.filter(e => !hiddenItems.has(`cskill-${e.id_cv_custom_entry}`)).map((e, i) => (
              <span key={`cs-${i}`} style={skillChip}>{e.title}</span>
            ))}
          </div>
        </div>
      )}

      {enabledSections.has("education") && (
        <div>
          <SectionHeader label="EDUCACIÓN" />
          {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontFamily: mono, fontSize: "10.5px", fontWeight: 700, color: "#e6edf3" }}>{edu.nombre_programa || edu.careerName}</div>
                <div style={expDate}>{formatDateShort(edu.fecha_inicio || edu.start_date)} — {edu.actualmente ? "present" : formatDateShort(edu.fecha_fin || edu.end_date)}</div>
              </div>
              <div style={expCompany}>{edu.institucion || edu.university?.name}</div>
            </div>
          ))}
          {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
            <div key={`cedu-${i}`} style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: mono, fontSize: "10.5px", fontWeight: 700, color: "#e6edf3" }}>{e.title}</div>
              <div style={expCompany}>{e.subtitle}</div>
            </div>
          ))}
        </div>
      )}

      {enabledSections.has("projects") && projects.length > 0 && (
        <div>
          <SectionHeader label="PROYECTOS" />
          {projects.filter(p => !hiddenItems.has(`proj-${p.id}`)).map((proj, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={expTitle}>{proj.titulo || proj.title}</div>
              {(proj.descripcion || proj.description) && <div style={expDesc}>{proj.descripcion || proj.description}</div>}
            </div>
          ))}
        </div>
      )}

      {enabledSections.has("social") && (profile?.github || profile?.linkedin) && (
        <div>
          <SectionHeader label="REDES" />
          {profile?.github   && <div style={{ fontFamily: mono, fontSize: "9px", color: "#8b949e", marginBottom: 2 }}>github: {profile.github}</div>}
          {profile?.linkedin && <div style={{ fontFamily: mono, fontSize: "9px", color: "#8b949e" }}>linkedin: {profile.linkedin}</div>}
        </div>
      )}
    </div>
  );
}
