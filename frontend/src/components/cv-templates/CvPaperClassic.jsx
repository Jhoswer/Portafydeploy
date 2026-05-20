// ─── Layout Clásico ───────────────────────────────────────────────────────────
// Header coloreado + body blanco — el layout original

const FONTS = [
  { id: "serif", value: "Georgia, 'Times New Roman', serif" },
  { id: "sans",  value: "system-ui, -apple-system, sans-serif" },
  { id: "mono",  value: "'Courier New', Courier, monospace" },
];

function formatDateShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-BO", { month: "short", year: "numeric" });
}

export default function CvPaperClassic({
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

  const paperStyle = {
    width: 595, minHeight: 842, background: "#fff",
    boxShadow: "0 4px 32px rgba(0,0,0,.16), 0 1px 4px rgba(0,0,0,.08)",
    transformOrigin: "top center",
    transform: `scale(${zoom / 100})`,
    flexShrink: 0,
    marginBottom: zoom < 90 ? -(842 * (1 - zoom / 100)) : 0,
  };

  const headerStyle      = { background: template.headerBg, padding: "26px 30px 20px" };
  const nameStyle        = { fontFamily: font, fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: ".01em" };
  const jobTitleStyle    = { fontSize: "11px", color: "rgba(255,255,255,.75)", marginTop: 3, letterSpacing: ".05em", textTransform: "uppercase" };
  const contactStyle     = { display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 12 };
  const contactItemStyle = { fontSize: "9px", color: "rgba(255,255,255,.7)" };
  const bodyStyle        = { padding: "18px 30px 28px", display: "flex", flexDirection: "column", gap: 16 };
  const sectionTitleStyle = {
    fontSize: "9px", fontWeight: 800, color: template.accentColor,
    textTransform: "uppercase", letterSpacing: ".10em",
    borderBottom: `2px solid ${template.accentColor}`, paddingBottom: 3, marginBottom: 8,
  };
  const bioStyle      = { fontSize: "9.5px", color: "#4a5568", lineHeight: 1.7 };
  const skillStyle    = { fontSize: "8.5px", fontWeight: 600, padding: "2px 8px", border: `1px solid ${template.accentColor}`, borderRadius: 3, color: template.accentColor };
  const eduDegreeStyle = { fontFamily: font, fontSize: "11px", fontWeight: 700, color: "#1a202c" };

  const fullName = profile
    ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim()
    : "Tu Nombre Completo";

  return (
    <div style={paperStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={nameStyle}>{fullName}</div>
        <div style={jobTitleStyle}>{profile?.profesion || "Tu título profesional"}</div>
        <div style={contactStyle}>
          {profile?.email     && <span style={contactItemStyle}>{profile.email}</span>}
          {profile?.ubicacion && <span style={contactItemStyle}>{profile.ubicacion}</span>}
          {profile?.github    && <span style={contactItemStyle}>{profile.github}</span>}
          {profile?.linkedin  && <span style={contactItemStyle}>{profile.linkedin}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={bodyStyle}>

        {/* Sobre mí */}
        {enabledSections.has("bio") && profile?.biografia && (
          <div>
            <div style={sectionTitleStyle}>Sobre mí</div>
            <div style={bioStyle}>{profile.biografia}</div>
          </div>
        )}

        {/* Experiencia */}
        {enabledSections.has("experience") && (
          <div>
            <div style={sectionTitleStyle}>Experiencia profesional</div>
            {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, color: "#1a202c" }}>
                    {exp.cargo || exp.title || "Cargo"}
                  </div>
                  <div style={{ fontSize: "8.5px", color: "#94a3b8", fontStyle: "italic" }}>
                    {formatDateShort(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "Presente" : formatDateShort(exp.fecha_fin || exp.end_date)}
                  </div>
                </div>
                <div style={{ fontSize: "9.5px", color: template.accentColor, fontWeight: 600 }}>{exp.empresa || exp.company}</div>
                {(exp.descripcion || exp.description) && (
                  <div style={{ fontSize: "9px", color: "#64748b", lineHeight: 1.6, marginTop: 3 }}>{exp.descripcion || exp.description}</div>
                )}
              </div>
            ))}
            {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
              <div key={`ce-${i}`} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, color: "#1a202c" }}>{e.title}</div>
                  <div style={{ fontSize: "8.5px", color: "#94a3b8", fontStyle: "italic" }}>{e.date_start} — {e.is_current ? "Presente" : e.date_end}</div>
                </div>
                <div style={{ fontSize: "9.5px", color: template.accentColor, fontWeight: 600 }}>{e.subtitle}</div>
                {e.description && <div style={{ fontSize: "9px", color: "#64748b", lineHeight: 1.6, marginTop: 3 }}>{e.description}</div>}
              </div>
            ))}
            {experience.length === 0 && customExp.length === 0 && (
              <div style={{ fontSize: "9px", color: "#94a3b8", fontStyle: "italic" }}>Agrega experiencias en tu portafolio para verlas aquí.</div>
            )}
          </div>
        )}

        {/* Educación */}
        {enabledSections.has("education") && (
          <div>
            <div style={sectionTitleStyle}>Educación</div>
            {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={eduDegreeStyle}>{edu.nombre_programa || edu.careerName}</div>
                  <div style={{ fontSize: "8.5px", color: "#94a3b8", fontStyle: "italic" }}>
                    {formatDateShort(edu.fecha_inicio || edu.start_date)} — {edu.actualmente ? "Presente" : formatDateShort(edu.fecha_fin || edu.end_date)}
                  </div>
                </div>
                <div style={{ fontSize: "9.5px", color: "#64748b" }}>{edu.institucion || edu.university?.name}</div>
              </div>
            ))}
            {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
              <div key={`cedu-${i}`} style={{ marginBottom: 8 }}>
                <div style={eduDegreeStyle}>{e.title}</div>
                <div style={{ fontSize: "9.5px", color: "#64748b" }}>{e.subtitle}</div>
              </div>
            ))}
            {education.length === 0 && customEdu.length === 0 && (
              <div style={{ fontSize: "9px", color: "#94a3b8", fontStyle: "italic" }}>Agrega formaciones en tu portafolio para verlas aquí.</div>
            )}
          </div>
        )}

        {/* Habilidades */}
        {enabledSections.has("skills") && (
          <div>
            <div style={sectionTitleStyle}>Habilidades</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {skills.filter(s => !hiddenItems.has(`skill-${s.id}`)).map((skill, i) => (
                <span key={i} style={skillStyle}>{skill.nombre || skill.name}</span>
              ))}
              {customSkills.filter(e => !hiddenItems.has(`cskill-${e.id_cv_custom_entry}`)).map((e, i) => (
                <span key={`cs-${i}`} style={skillStyle}>{e.title}</span>
              ))}
              {skills.length === 0 && customSkills.length === 0 && (
                <div style={{ fontSize: "9px", color: "#94a3b8", fontStyle: "italic" }}>Agrega habilidades en tu portafolio para verlas aquí.</div>
              )}
            </div>
          </div>
        )}

        {/* Proyectos */}
        {enabledSections.has("projects") && projects.length > 0 && (
          <div>
            <div style={sectionTitleStyle}>Proyectos</div>
            {projects.filter(p => !hiddenItems.has(`proj-${p.id}`)).map((proj, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, color: "#1a202c" }}>{proj.titulo || proj.title}</div>
                {(proj.descripcion || proj.description) && (
                  <div style={{ fontSize: "9px", color: "#64748b", lineHeight: 1.6, marginTop: 2 }}>{proj.descripcion || proj.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Redes sociales */}
        {enabledSections.has("social") && (profile?.github || profile?.linkedin) && (
          <div>
            <div style={sectionTitleStyle}>Redes profesionales</div>
            {profile?.github   && <div style={{ fontSize: "9px", color: "#4a5568", marginBottom: 2 }}>GitHub: {profile.github}</div>}
            {profile?.linkedin && <div style={{ fontSize: "9px", color: "#4a5568" }}>LinkedIn: {profile.linkedin}</div>}
          </div>
        )}

      </div>
    </div>
  );
}
