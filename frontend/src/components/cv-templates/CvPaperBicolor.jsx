// ─── Layout Bicolor ───────────────────────────────────────────────────────────
// Sidebar izquierdo con el color principal + contenido blanco a la derecha

const FONTS = [
  { id: "serif", value: "Georgia, 'Times New Roman', serif" },
  { id: "sans",  value: "system-ui, -apple-system, sans-serif" },
  { id: "mono",  value: "'Courier New', Courier, monospace" },
];

function formatDateShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-BO", { month: "short", year: "numeric" });
}

export default function CvPaperBicolor({
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
    width: 595, minHeight: 842,
    display: "flex", flexDirection: "row",
    background: "#fff",
    boxShadow: "0 4px 32px rgba(0,0,0,.16), 0 1px 4px rgba(0,0,0,.08)",
    transformOrigin: "top center",
    transform: `scale(${zoom / 100})`,
    flexShrink: 0,
    marginBottom: zoom < 90 ? -(842 * (1 - zoom / 100)) : 0,
  };

  const sidebar = {
    width: 190, minHeight: 842,
    background: template.headerBg,
    padding: "28px 16px",
    display: "flex", flexDirection: "column", gap: 20, flexShrink: 0,
  };

  const main = {
    flex: 1, padding: "28px 22px",
    display: "flex", flexDirection: "column", gap: 16,
    background: "#fff",
  };

  const sideTitle    = { fontSize: "8px", fontWeight: 800, color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,.2)", paddingBottom: 4 };
  const sideText     = { fontSize: "9px", color: "rgba(255,255,255,.82)", lineHeight: 1.6 };
  const sideSkill    = { fontSize: "8px", fontWeight: 600, padding: "2px 7px", border: `1px solid ${template.accentColor}`, borderRadius: 2, color: template.accentColor, background: "rgba(255,255,255,.06)", display: "inline-block", marginRight: 4, marginBottom: 4 };
  const mainTitle    = { fontSize: "8.5px", fontWeight: 800, color: template.accentColor, textTransform: "uppercase", letterSpacing: ".10em", borderBottom: `2px solid ${template.accentColor}`, paddingBottom: 3, marginBottom: 8 };
  const expTitle     = { fontFamily: font, fontSize: "11px", fontWeight: 700, color: "#1a202c" };
  const expCompany   = { fontSize: "9.5px", color: template.accentColor, fontWeight: 600, marginTop: 1 };
  const expDate      = { fontSize: "8.5px", color: "#94a3b8", fontStyle: "italic" };
  const expDesc      = { fontSize: "9px", color: "#64748b", lineHeight: 1.6, marginTop: 3 };
  const eduDegree    = { fontFamily: font, fontSize: "10.5px", fontWeight: 700, color: "#1a202c" };
  const eduInst      = { fontSize: "9px", color: "#64748b", marginTop: 1 };

  const fullName = profile
    ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim()
    : "Tu Nombre Completo";

  return (
    <div style={paperStyle}>
      {/* Sidebar */}
      <div style={sidebar}>
        <div>
          <div style={{ fontFamily: font, fontSize: "17px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{fullName}</div>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,.65)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>
            {profile?.profesion || "Tu título profesional"}
          </div>
        </div>

        <div>
          <div style={sideTitle}>Contacto</div>
          {profile?.email     && <div style={sideText}>{profile.email}</div>}
          {profile?.ubicacion && <div style={sideText}>{profile.ubicacion}</div>}
          {profile?.github    && <div style={sideText}>{profile.github}</div>}
          {profile?.linkedin  && <div style={sideText}>{profile.linkedin}</div>}
        </div>

        {enabledSections.has("skills") && (
          <div>
            <div style={sideTitle}>Habilidades</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {skills.filter(s => !hiddenItems.has(`skill-${s.id}`)).map((s, i) => (
                <span key={i} style={sideSkill}>{s.nombre || s.name}</span>
              ))}
              {customSkills.filter(e => !hiddenItems.has(`cskill-${e.id_cv_custom_entry}`)).map((e, i) => (
                <span key={`cs-${i}`} style={sideSkill}>{e.title}</span>
              ))}
            </div>
          </div>
        )}

        {enabledSections.has("education") && (
          <div>
            <div style={sideTitle}>Educación</div>
            {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#fff" }}>{edu.nombre_programa || edu.careerName}</div>
                <div style={sideText}>{edu.institucion || edu.university?.name}</div>
              </div>
            ))}
            {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
              <div key={`cedu-${i}`} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#fff" }}>{e.title}</div>
                <div style={sideText}>{e.subtitle}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div style={main}>
        {enabledSections.has("bio") && profile?.biografia && (
          <div>
            <div style={mainTitle}>Sobre mí</div>
            <div style={{ fontSize: "9.5px", color: "#4a5568", lineHeight: 1.7 }}>{profile.biografia}</div>
          </div>
        )}

        {enabledSections.has("experience") && (
          <div>
            <div style={mainTitle}>Experiencia</div>
            {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={expTitle}>{exp.cargo || exp.title}</div>
                  <div style={expDate}>{formatDateShort(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "Presente" : formatDateShort(exp.fecha_fin || exp.end_date)}</div>
                </div>
                <div style={expCompany}>{exp.empresa || exp.company}</div>
                {(exp.descripcion || exp.description) && <div style={expDesc}>{exp.descripcion || exp.description}</div>}
              </div>
            ))}
            {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
              <div key={`ce-${i}`} style={{ marginBottom: 10 }}>
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

        {enabledSections.has("projects") && projects.length > 0 && (
          <div>
            <div style={mainTitle}>Proyectos</div>
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
            <div style={mainTitle}>Redes profesionales</div>
            {profile?.github   && <div style={{ fontSize: "9px", color: "#4a5568", marginBottom: 2 }}>GitHub: {profile.github}</div>}
            {profile?.linkedin && <div style={{ fontSize: "9px", color: "#4a5568" }}>LinkedIn: {profile.linkedin}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
