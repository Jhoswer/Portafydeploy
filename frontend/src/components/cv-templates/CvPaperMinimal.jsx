// ─── Layout Minimalista ───────────────────────────────────────────────────────
// Todo blanco, color principal solo en acentos y líneas finas

const FONTS = [
  { id: "serif", value: "Georgia, 'Times New Roman', serif" },
  { id: "sans",  value: "system-ui, -apple-system, sans-serif" },
  { id: "mono",  value: "'Courier New', Courier, monospace" },
];

function formatDateShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-BO", { month: "short", year: "numeric" });
}

export default function CvPaperMinimal({
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
  const font         = FONTS.find(f => f.id === fontId)?.value ?? FONTS[0].value;
  const enabledSections = new Set(sections.filter(s => s.enabled).map(s => s.key));
  const accent = template.accentColor;

  const paperStyle = {
    width: 595, minHeight: 842,
    background: "#fff", padding: "40px 40px 32px",
    boxShadow: "0 4px 32px rgba(0,0,0,.16), 0 1px 4px rgba(0,0,0,.08)",
    transformOrigin: "top center",
    transform: `scale(${zoom / 100})`,
    flexShrink: 0,
    marginBottom: zoom < 90 ? -(842 * (1 - zoom / 100)) : 0,
  };

  const nameStyle    = { fontFamily: font, fontSize: "26px", fontWeight: 700, color: accent, letterSpacing: "-.01em" };
  const titleStyle   = { fontSize: "11px", color: "#64748b", marginTop: 4, letterSpacing: ".06em", textTransform: "uppercase" };
  const contactRow   = { display: "flex", flexWrap: "wrap", gap: "3px 20px", marginTop: 10 };
  const contactItem  = { fontSize: "8.5px", color: "#94a3b8" };
  const sectionTitle = { fontSize: "8px", fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid ${accent}30` };
  const expTitle     = { fontFamily: font, fontSize: "11px", fontWeight: 700, color: "#1a202c" };
  const expCompany   = { fontSize: "9.5px", color: accent, marginTop: 1 };
  const expDate      = { fontSize: "8.5px", color: "#cbd5e1", fontStyle: "italic" };
  const expDesc      = { fontSize: "9px", color: "#64748b", lineHeight: 1.6, marginTop: 3 };
  const skillChip    = { fontSize: "8px", padding: "2px 10px", border: `1px solid ${accent}40`, borderRadius: 20, color: accent, display: "inline-block", marginRight: 5, marginBottom: 5 };
  const bioText      = { fontSize: "9.5px", color: "#4a5568", lineHeight: 1.8 };
  const leftBorder   = { paddingLeft: 10, borderLeft: `2px solid ${accent}30` };

  const fullName = profile
    ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim()
    : "Tu Nombre Completo";

  return (
    <div style={paperStyle}>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 16, marginBottom: 24 }}>
        <div style={nameStyle}>{fullName}</div>
        <div style={titleStyle}>{profile?.profesion || "Tu título profesional"}</div>
        <div style={contactRow}>
          {profile?.email     && <span style={contactItem}>{profile.email}</span>}
          {profile?.ubicacion && <span style={contactItem}>{profile.ubicacion}</span>}
          {profile?.github    && <span style={contactItem}>{profile.github}</span>}
          {profile?.linkedin  && <span style={contactItem}>{profile.linkedin}</span>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {enabledSections.has("bio") && profile?.biografia && (
          <div>
            <div style={sectionTitle}>Perfil profesional</div>
            <div style={bioText}>{profile.biografia}</div>
          </div>
        )}

        {enabledSections.has("experience") && (
          <div>
            <div style={sectionTitle}>Experiencia</div>
            {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
              <div key={i} style={{ ...leftBorder, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={expTitle}>{exp.cargo || exp.title}</div>
                  <div style={expDate}>{formatDateShort(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "Presente" : formatDateShort(exp.fecha_fin || exp.end_date)}</div>
                </div>
                <div style={expCompany}>{exp.empresa || exp.company}</div>
                {(exp.descripcion || exp.description) && <div style={expDesc}>{exp.descripcion || exp.description}</div>}
              </div>
            ))}
            {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
              <div key={`ce-${i}`} style={{ ...leftBorder, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={expTitle}>{e.title}</div>
                  <div style={expDate}>{e.date_start} — {e.is_current ? "Presente" : e.date_end}</div>
                </div>
                <div style={expCompany}>{e.subtitle}</div>
                {e.description && <div style={expDesc}>{e.description}</div>}
              </div>
            ))}
          </div>
        )}

        {enabledSections.has("education") && (
          <div>
            <div style={sectionTitle}>Educación</div>
            {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
              <div key={i} style={{ ...leftBorder, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={expTitle}>{edu.nombre_programa || edu.careerName}</div>
                  <div style={expDate}>{formatDateShort(edu.fecha_inicio || edu.start_date)} — {edu.actualmente ? "Presente" : formatDateShort(edu.fecha_fin || edu.end_date)}</div>
                </div>
                <div style={expCompany}>{edu.institucion || edu.university?.name}</div>
              </div>
            ))}
            {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
              <div key={`cedu-${i}`} style={{ ...leftBorder, marginBottom: 10 }}>
                <div style={expTitle}>{e.title}</div>
                <div style={expCompany}>{e.subtitle}</div>
              </div>
            ))}
          </div>
        )}

        {enabledSections.has("skills") && (
          <div>
            <div style={sectionTitle}>Habilidades</div>
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

        {enabledSections.has("projects") && projects.length > 0 && (
          <div>
            <div style={sectionTitle}>Proyectos</div>
            {projects.filter(p => !hiddenItems.has(`proj-${p.id}`)).map((proj, i) => (
              <div key={i} style={{ ...leftBorder, marginBottom: 8 }}>
                <div style={expTitle}>{proj.titulo || proj.title}</div>
                {(proj.descripcion || proj.description) && <div style={expDesc}>{proj.descripcion || proj.description}</div>}
              </div>
            ))}
          </div>
        )}

        {enabledSections.has("social") && (profile?.github || profile?.linkedin) && (
          <div>
            <div style={sectionTitle}>Redes profesionales</div>
            {profile?.github   && <div style={{ fontSize: "9px", color: "#4a5568", marginBottom: 2 }}>GitHub: {profile.github}</div>}
            {profile?.linkedin && <div style={{ fontSize: "9px", color: "#4a5568" }}>LinkedIn: {profile.linkedin}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
