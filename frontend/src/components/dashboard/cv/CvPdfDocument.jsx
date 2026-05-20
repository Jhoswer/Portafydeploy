import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Colores por plantilla ────────────────────────────────────────────────────

const TEMPLATE_COLORS = {
  navy:    { header: "#0E2A5C", accent: "#185FA5", bg: "#ffffff", text: "#1a202c" },
  slate:   { header: "#1e293b", accent: "#0d9488", bg: "#ffffff", text: "#1a202c" },
  forest:  { header: "#14532d", accent: "#16a34a", bg: "#ffffff", text: "#1a202c" },
  crimson: { header: "#7f1d1d", accent: "#dc2626", bg: "#ffffff", text: "#1a202c" },
  bicolor: { header: "#1e293b", accent: "#38bdf8", bg: "#ffffff", text: "#1a202c" },
  tech:    { header: "#0d1117", accent: "#58a6ff", bg: "#0d1117", text: "#e6edf3" },
  minimal: { header: "#ffffff", accent: "#1e293b", bg: "#ffffff", text: "#1a202c" },
};

function getColors(templateId) {
  return TEMPLATE_COLORS[templateId] ?? TEMPLATE_COLORS.navy;
}

function getLayout(templateId) {
  if (templateId === "bicolor") return "bicolor";
  if (templateId === "tech")    return "tech";
  if (templateId === "minimal") return "minimal";
  return "classic";
}

function formatDate(iso) {
  if (!iso) return "Presente";
  return new Date(iso).toLocaleDateString("es-BO", { month: "short", year: "numeric" });
}

// ─── Layout Clásico ───────────────────────────────────────────────────────────

function ClassicLayout({ colors, enabled, profile, experience, education, skills, projects, customExp, customSkills, customEdu, hiddenItems, fullName }) {
  const s = StyleSheet.create({
    page:        { fontFamily: "Helvetica", fontSize: 10, backgroundColor: "#ffffff" },
    header:      { backgroundColor: colors.header, padding: "24 28 18 28" },
    name:        { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#fff", letterSpacing: 0.3 },
    jobTitle:    { fontSize: 9, color: "rgba(255,255,255,0.75)", marginTop: 3, textTransform: "uppercase" },
    contactRow:  { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 12 },
    contactItem: { fontSize: 8, color: "rgba(255,255,255,0.7)" },
    body:        { padding: "16 28 24 28", gap: 14 },
    secTitle:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.accent, textTransform: "uppercase", letterSpacing: 1.2, borderBottomWidth: 1.5, borderBottomColor: colors.accent, paddingBottom: 3, marginBottom: 8 },
    bio:         { fontSize: 9, color: "#4a5568", lineHeight: 1.6 },
    expTitle:    { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a202c" },
    expCompany:  { fontSize: 9, color: colors.accent, fontFamily: "Helvetica-Bold", marginTop: 1 },
    expDate:     { fontSize: 8, color: "#94a3b8" },
    expDesc:     { fontSize: 8.5, color: "#64748b", lineHeight: 1.5, marginTop: 3 },
    expHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    skill:       { fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.accent, borderWidth: 1, borderColor: colors.accent, borderRadius: 2, padding: "2 7", marginRight: 4, marginBottom: 4 },
    skillsRow:   { flexDirection: "row", flexWrap: "wrap", gap: 4 },
    eduDegree:   { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a202c" },
    eduInst:     { fontSize: 9, color: "#64748b", marginTop: 1 },
    item:        { marginBottom: 10 },
    placeholder: { fontSize: 8.5, color: "#94a3b8" },
  });

  return (
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        <Text style={s.name}>{fullName}</Text>
        {profile?.profesion ? <Text style={s.jobTitle}>{profile.profesion}</Text> : null}
        <View style={s.contactRow}>
          {profile?.email     ? <Text style={s.contactItem}>{profile.email}</Text>     : null}
          {profile?.ubicacion ? <Text style={s.contactItem}>{profile.ubicacion}</Text> : null}
          {profile?.github    ? <Text style={s.contactItem}>{profile.github}</Text>    : null}
          {profile?.linkedin  ? <Text style={s.contactItem}>{profile.linkedin}</Text>  : null}
        </View>
      </View>

      <View style={s.body}>
        {enabled.has("bio") && profile?.biografia ? (
          <View style={s.item}><Text style={s.secTitle}>Sobre mí</Text><Text style={s.bio}>{profile.biografia}</Text></View>
        ) : null}

        {enabled.has("experience") ? (
          <View style={s.item}>
            <Text style={s.secTitle}>Experiencia profesional</Text>
            {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
              <View key={i} style={s.item}>
                <View style={s.expHeader}>
                  <Text style={s.expTitle}>{exp.cargo || exp.title}</Text>
                  <Text style={s.expDate}>{formatDate(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "Presente" : formatDate(exp.fecha_fin || exp.end_date)}</Text>
                </View>
                <Text style={s.expCompany}>{exp.empresa || exp.company}</Text>
                {(exp.descripcion || exp.description) ? <Text style={s.expDesc}>{exp.descripcion || exp.description}</Text> : null}
              </View>
            ))}
            {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
              <View key={`ce-${i}`} style={s.item}>
                <View style={s.expHeader}>
                  <Text style={s.expTitle}>{e.title}</Text>
                  <Text style={s.expDate}>{e.date_start} — {e.is_current ? "Presente" : e.date_end}</Text>
                </View>
                <Text style={s.expCompany}>{e.subtitle}</Text>
                {e.description ? <Text style={s.expDesc}>{e.description}</Text> : null}
              </View>
            ))}
            {experience.length === 0 && customExp.length === 0 ? <Text style={s.placeholder}>Sin experiencias registradas.</Text> : null}
          </View>
        ) : null}

        {enabled.has("education") ? (
          <View style={s.item}>
            <Text style={s.secTitle}>Educación</Text>
            {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={s.expHeader}>
                  <Text style={s.eduDegree}>{edu.nombre_programa || edu.careerName}</Text>
                  <Text style={s.expDate}>{formatDate(edu.fecha_inicio || edu.start_date)} — {edu.actualmente ? "Presente" : formatDate(edu.fecha_fin || edu.end_date)}</Text>
                </View>
                <Text style={s.eduInst}>{edu.institucion || edu.university?.name}</Text>
              </View>
            ))}
            {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
              <View key={`cedu-${i}`} style={{ marginBottom: 8 }}>
                <Text style={s.eduDegree}>{e.title}</Text>
                <Text style={s.eduInst}>{e.subtitle}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {enabled.has("skills") ? (
          <View style={s.item}>
            <Text style={s.secTitle}>Habilidades</Text>
            <View style={s.skillsRow}>
              {skills.filter(s2 => !hiddenItems.has(`skill-${s2.id}`)).map((sk, i) => <Text key={i} style={s.skill}>{sk.nombre || sk.name}</Text>)}
              {customSkills.filter(e => !hiddenItems.has(`cskill-${e.id_cv_custom_entry}`)).map((e, i) => <Text key={`cs-${i}`} style={s.skill}>{e.title}</Text>)}
            </View>
          </View>
        ) : null}

        {enabled.has("projects") && projects.length > 0 ? (
          <View style={s.item}>
            <Text style={s.secTitle}>Proyectos</Text>
            {projects.filter(p => !hiddenItems.has(`proj-${p.id}`)).map((proj, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={s.expTitle}>{proj.titulo || proj.title}</Text>
                {(proj.descripcion || proj.description) ? <Text style={s.expDesc}>{proj.descripcion || proj.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {enabled.has("social") && (profile?.github || profile?.linkedin) ? (
          <View style={s.item}>
            <Text style={s.secTitle}>Redes profesionales</Text>
            {profile?.github   ? <Text style={{ fontSize: 9, color: "#4a5568", marginBottom: 2 }}>GitHub: {profile.github}</Text>   : null}
            {profile?.linkedin ? <Text style={{ fontSize: 9, color: "#4a5568" }}>LinkedIn: {profile.linkedin}</Text> : null}
          </View>
        ) : null}
      </View>
    </Page>
  );
}

// ─── Layout Bicolor ───────────────────────────────────────────────────────────

function BicolorLayout({ colors, enabled, profile, experience, education, skills, projects, customExp, customSkills, customEdu, hiddenItems, fullName }) {
  const s = StyleSheet.create({
    page:       { fontFamily: "Helvetica", fontSize: 10, backgroundColor: "#ffffff", flexDirection: "row" },
    sidebar:    { width: 170, backgroundColor: colors.header, padding: "24 14", gap: 16 },
    main:       { flex: 1, padding: "24 20", gap: 14 },
    name:       { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#fff" },
    profession: { fontSize: 8, color: "rgba(255,255,255,0.65)", marginTop: 3, textTransform: "uppercase" },
    sideSecTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.2)", paddingBottom: 3, marginBottom: 6 },
    sideText:   { fontSize: 8, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 },
    sideSkill:  { fontSize: 7, fontFamily: "Helvetica-Bold", color: colors.accent, borderWidth: 0.5, borderColor: colors.accent, padding: "2 5", marginRight: 3, marginBottom: 3 },
    skillsRow:  { flexDirection: "row", flexWrap: "wrap" },
    mainSecTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.accent, textTransform: "uppercase", letterSpacing: 1, borderBottomWidth: 1.5, borderBottomColor: colors.accent, paddingBottom: 3, marginBottom: 8 },
    expTitle:   { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a202c" },
    expCompany: { fontSize: 9, color: colors.accent, marginTop: 1 },
    expDate:    { fontSize: 8, color: "#94a3b8" },
    expDesc:    { fontSize: 8.5, color: "#64748b", lineHeight: 1.5, marginTop: 2 },
    expHeader:  { flexDirection: "row", justifyContent: "space-between" },
    item:       { marginBottom: 9 },
    eduDegree:  { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a202c" },
    eduInst:    { fontSize: 9, color: "#64748b" },
    bio:        { fontSize: 9, color: "#4a5568", lineHeight: 1.6 },
  });

  return (
    <Page size="A4" style={s.page}>
      {/* Sidebar */}
      <View style={s.sidebar}>
        <View>
          <Text style={s.name}>{fullName}</Text>
          <Text style={s.profession}>{profile?.profesion || ""}</Text>
        </View>
        <View>
          <Text style={s.sideSecTitle}>Contacto</Text>
          {profile?.email     ? <Text style={s.sideText}>{profile.email}</Text>     : null}
          {profile?.ubicacion ? <Text style={s.sideText}>{profile.ubicacion}</Text> : null}
          {profile?.github    ? <Text style={s.sideText}>{profile.github}</Text>    : null}
          {profile?.linkedin  ? <Text style={s.sideText}>{profile.linkedin}</Text>  : null}
        </View>
        {enabled.has("skills") ? (
          <View>
            <Text style={s.sideSecTitle}>Habilidades</Text>
            <View style={s.skillsRow}>
              {skills.filter(sk => !hiddenItems.has(`skill-${sk.id}`)).map((sk, i) => <Text key={i} style={s.sideSkill}>{sk.nombre || sk.name}</Text>)}
              {customSkills.filter(e => !hiddenItems.has(`cskill-${e.id_cv_custom_entry}`)).map((e, i) => <Text key={`cs-${i}`} style={s.sideSkill}>{e.title}</Text>)}
            </View>
          </View>
        ) : null}
        {enabled.has("education") ? (
          <View>
            <Text style={s.sideSecTitle}>Educación</Text>
            {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#fff" }}>{edu.nombre_programa || edu.careerName}</Text>
                <Text style={s.sideText}>{edu.institucion || edu.university?.name}</Text>
              </View>
            ))}
            {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
              <View key={`cedu-${i}`} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#fff" }}>{e.title}</Text>
                <Text style={s.sideText}>{e.subtitle}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* Main */}
      <View style={s.main}>
        {enabled.has("bio") && profile?.biografia ? (
          <View style={s.item}><Text style={s.mainSecTitle}>Sobre mí</Text><Text style={s.bio}>{profile.biografia}</Text></View>
        ) : null}
        {enabled.has("experience") ? (
          <View style={s.item}>
            <Text style={s.mainSecTitle}>Experiencia</Text>
            {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
              <View key={i} style={s.item}>
                <View style={s.expHeader}><Text style={s.expTitle}>{exp.cargo || exp.title}</Text><Text style={s.expDate}>{formatDate(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "Presente" : formatDate(exp.fecha_fin || exp.end_date)}</Text></View>
                <Text style={s.expCompany}>{exp.empresa || exp.company}</Text>
                {(exp.descripcion || exp.description) ? <Text style={s.expDesc}>{exp.descripcion || exp.description}</Text> : null}
              </View>
            ))}
            {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
              <View key={`ce-${i}`} style={s.item}>
                <View style={s.expHeader}><Text style={s.expTitle}>{e.title}</Text><Text style={s.expDate}>{e.date_start} — {e.is_current ? "Presente" : e.date_end}</Text></View>
                <Text style={s.expCompany}>{e.subtitle}</Text>
                {e.description ? <Text style={s.expDesc}>{e.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
        {enabled.has("projects") && projects.length > 0 ? (
          <View style={s.item}>
            <Text style={s.mainSecTitle}>Proyectos</Text>
            {projects.filter(p => !hiddenItems.has(`proj-${p.id}`)).map((proj, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={s.expTitle}>{proj.titulo || proj.title}</Text>
                {(proj.descripcion || proj.description) ? <Text style={s.expDesc}>{proj.descripcion || proj.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Page>
  );
}

// ─── Layout Tech ──────────────────────────────────────────────────────────────

function renderTechSectionTitle(label, s, colors) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
      <Text style={{ fontSize: 8, fontFamily: "Courier-Bold", color: colors.accent, textTransform: "uppercase", letterSpacing: 1 }}>{">"} {label}</Text>
      <View style={s.secLine} />
    </View>
  );
}

function TechLayout({ colors, enabled, profile, experience, education, skills, projects: _projects, customExp, customSkills, customEdu, hiddenItems, fullName }) {
  const s = StyleSheet.create({
    page:       { fontFamily: "Courier", fontSize: 10, backgroundColor: colors.header, padding: "28 32", gap: 18 },
    name:       { fontSize: 20, fontFamily: "Courier-Bold", color: colors.accent },
    prompt:     { fontSize: 9, color: `${colors.accent}99`, marginTop: 3 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 6 },
    contactItem:{ fontSize: 8, color: "#8b949e" },
    divider:    { borderBottomWidth: 0.5, borderBottomColor: `${colors.accent}44`, marginBottom: 4 },
    secTitle:   { fontSize: 8, fontFamily: "Courier-Bold", color: colors.accent, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, flexDirection: "row", alignItems: "center" },
    secLine:    { flex: 1, borderBottomWidth: 0.5, borderBottomColor: `${colors.accent}44`, marginLeft: 6 },
    expTitle:   { fontSize: 10, fontFamily: "Courier-Bold", color: "#e6edf3" },
    expCompany: { fontSize: 9, color: colors.accent, marginTop: 1 },
    expDate:    { fontSize: 8, color: "#6e7681" },
    expDesc:    { fontSize: 8.5, color: "#8b949e", lineHeight: 1.5, marginTop: 2 },
    expHeader:  { flexDirection: "row", justifyContent: "space-between" },
    item:       { marginBottom: 9 },
    skill:      { fontSize: 8, color: colors.accent, borderWidth: 0.5, borderColor: `${colors.accent}66`, padding: "2 7", marginRight: 4, marginBottom: 4 },
    skillsRow:  { flexDirection: "row", flexWrap: "wrap" },
    bio:        { fontSize: 9, color: "#8b949e", lineHeight: 1.6 },
    eduDegree:  { fontSize: 10, fontFamily: "Courier-Bold", color: "#e6edf3" },
    eduInst:    { fontSize: 9, color: colors.accent },
  });

  return (
    <Page size="A4" style={s.page}>
      <View style={{ borderBottomWidth: 0.5, borderBottomColor: `${colors.accent}44`, paddingBottom: 14 }}>
        <Text style={s.name}>{fullName}</Text>
        <Text style={s.prompt}>$ {profile?.profesion || "developer"}</Text>
        <View style={s.contactRow}>
          {profile?.email     ? <Text style={s.contactItem}>{profile.email}</Text>     : null}
          {profile?.ubicacion ? <Text style={s.contactItem}>{profile.ubicacion}</Text> : null}
          {profile?.github    ? <Text style={s.contactItem}>{profile.github}</Text>    : null}
          {profile?.linkedin  ? <Text style={s.contactItem}>{profile.linkedin}</Text>  : null}
        </View>
      </View>

      {enabled.has("bio") && profile?.biografia ? (
        <View>{renderTechSectionTitle("SOBRE MÍ", s, colors)}<Text style={s.bio}>{profile.biografia}</Text></View>
      ) : null}

      {enabled.has("experience") ? (
        <View>
          {renderTechSectionTitle("EXPERIENCIA", s, colors)}
          {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
            <View key={i} style={s.item}>
              <View style={s.expHeader}><Text style={s.expTitle}>{exp.cargo || exp.title}</Text><Text style={s.expDate}>{formatDate(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "present" : formatDate(exp.fecha_fin || exp.end_date)}</Text></View>
              <Text style={s.expCompany}>{exp.empresa || exp.company}</Text>
              {(exp.descripcion || exp.description) ? <Text style={s.expDesc}>{exp.descripcion || exp.description}</Text> : null}
            </View>
          ))}
          {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
            <View key={`ce-${i}`} style={s.item}>
              <View style={s.expHeader}><Text style={s.expTitle}>{e.title}</Text><Text style={s.expDate}>{e.date_start} — {e.is_current ? "present" : e.date_end}</Text></View>
              <Text style={s.expCompany}>{e.subtitle}</Text>
              {e.description ? <Text style={s.expDesc}>{e.description}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {enabled.has("skills") ? (
        <View>
          {renderTechSectionTitle("HABILIDADES", s, colors)}
          <View style={s.skillsRow}>
            {skills.filter(sk => !hiddenItems.has(`skill-${sk.id}`)).map((sk, i) => <Text key={i} style={s.skill}>{sk.nombre || sk.name}</Text>)}
            {customSkills.filter(e => !hiddenItems.has(`cskill-${e.id_cv_custom_entry}`)).map((e, i) => <Text key={`cs-${i}`} style={s.skill}>{e.title}</Text>)}
          </View>
        </View>
      ) : null}

      {enabled.has("education") ? (
        <View>
          {renderTechSectionTitle("EDUCACIÓN", s, colors)}
          {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
            <View key={i} style={s.item}>
              <View style={s.expHeader}><Text style={s.eduDegree}>{edu.nombre_programa || edu.careerName}</Text><Text style={s.expDate}>{formatDate(edu.fecha_inicio || edu.start_date)} — {edu.actualmente ? "present" : formatDate(edu.fecha_fin || edu.end_date)}</Text></View>
              <Text style={s.eduInst}>{edu.institucion || edu.university?.name}</Text>
            </View>
          ))}
          {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
            <View key={`cedu-${i}`} style={s.item}><Text style={s.eduDegree}>{e.title}</Text><Text style={s.eduInst}>{e.subtitle}</Text></View>
          ))}
        </View>
      ) : null}
    </Page>
  );
}

// ─── Layout Minimal ───────────────────────────────────────────────────────────

function MinimalLayout({ colors, enabled, profile, experience, education, skills, projects, customExp, customSkills, customEdu, hiddenItems, fullName }) {
  const s = StyleSheet.create({
    page:       { fontFamily: "Helvetica", fontSize: 10, backgroundColor: "#ffffff", padding: "40 40 32" },
    name:       { fontSize: 24, fontFamily: "Helvetica-Bold", color: colors.accent },
    profession: { fontSize: 10, color: "#64748b", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.6 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 18, marginTop: 8 },
    contactItem:{ fontSize: 8, color: "#94a3b8" },
    headerLine: { borderBottomWidth: 2.5, borderBottomColor: colors.accent, marginTop: 14, marginBottom: 22 },
    secTitle:   { fontSize: 7, fontFamily: "Helvetica-Bold", color: colors.accent, textTransform: "uppercase", letterSpacing: 1.4, borderBottomWidth: 0.5, borderBottomColor: `${colors.accent}44`, paddingBottom: 4, marginBottom: 10 },
    expTitle:   { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a202c" },
    expCompany: { fontSize: 9, color: colors.accent, marginTop: 1 },
    expDate:    { fontSize: 8, color: "#cbd5e1" },
    expDesc:    { fontSize: 8.5, color: "#64748b", lineHeight: 1.5, marginTop: 2 },
    expHeader:  { flexDirection: "row", justifyContent: "space-between" },
    item:       { marginBottom: 10, paddingLeft: 8, borderLeftWidth: 1.5, borderLeftColor: `${colors.accent}30` },
    skill:      { fontSize: 8, color: colors.accent, borderWidth: 0.5, borderColor: `${colors.accent}44`, borderRadius: 10, padding: "2 9", marginRight: 5, marginBottom: 5 },
    skillsRow:  { flexDirection: "row", flexWrap: "wrap" },
    bio:        { fontSize: 9, color: "#4a5568", lineHeight: 1.7 },
    eduDegree:  { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a202c" },
    eduInst:    { fontSize: 9, color: colors.accent },
    section:    { marginBottom: 16 },
  });

  return (
    <Page size="A4" style={s.page}>
      <Text style={s.name}>{fullName}</Text>
      <Text style={s.profession}>{profile?.profesion || ""}</Text>
      <View style={s.contactRow}>
        {profile?.email     ? <Text style={s.contactItem}>{profile.email}</Text>     : null}
        {profile?.ubicacion ? <Text style={s.contactItem}>{profile.ubicacion}</Text> : null}
        {profile?.github    ? <Text style={s.contactItem}>{profile.github}</Text>    : null}
        {profile?.linkedin  ? <Text style={s.contactItem}>{profile.linkedin}</Text>  : null}
      </View>
      <View style={s.headerLine} />

      {enabled.has("bio") && profile?.biografia ? (
        <View style={s.section}><Text style={s.secTitle}>Perfil profesional</Text><Text style={s.bio}>{profile.biografia}</Text></View>
      ) : null}

      {enabled.has("experience") ? (
        <View style={s.section}>
          <Text style={s.secTitle}>Experiencia</Text>
          {experience.filter(e => !hiddenItems.has(`exp-${e.id}`)).map((exp, i) => (
            <View key={i} style={s.item}>
              <View style={s.expHeader}><Text style={s.expTitle}>{exp.cargo || exp.title}</Text><Text style={s.expDate}>{formatDate(exp.fecha_inicio || exp.start_date)} — {exp.actualmente ? "Presente" : formatDate(exp.fecha_fin || exp.end_date)}</Text></View>
              <Text style={s.expCompany}>{exp.empresa || exp.company}</Text>
              {(exp.descripcion || exp.description) ? <Text style={s.expDesc}>{exp.descripcion || exp.description}</Text> : null}
            </View>
          ))}
          {customExp.filter(e => !hiddenItems.has(`cexp-${e.id_cv_custom_entry}`)).map((e, i) => (
            <View key={`ce-${i}`} style={s.item}>
              <View style={s.expHeader}><Text style={s.expTitle}>{e.title}</Text><Text style={s.expDate}>{e.date_start} — {e.is_current ? "Presente" : e.date_end}</Text></View>
              <Text style={s.expCompany}>{e.subtitle}</Text>
              {e.description ? <Text style={s.expDesc}>{e.description}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {enabled.has("education") ? (
        <View style={s.section}>
          <Text style={s.secTitle}>Educación</Text>
          {education.filter(e => !hiddenItems.has(`edu-${e.id}`)).map((edu, i) => (
            <View key={i} style={s.item}>
              <View style={s.expHeader}><Text style={s.eduDegree}>{edu.nombre_programa || edu.careerName}</Text><Text style={s.expDate}>{formatDate(edu.fecha_inicio || edu.start_date)} — {edu.actualmente ? "Presente" : formatDate(edu.fecha_fin || edu.end_date)}</Text></View>
              <Text style={s.eduInst}>{edu.institucion || edu.university?.name}</Text>
            </View>
          ))}
          {customEdu.filter(e => !hiddenItems.has(`cedu-${e.id_cv_custom_entry}`)).map((e, i) => (
            <View key={`cedu-${i}`} style={s.item}><Text style={s.eduDegree}>{e.title}</Text><Text style={s.eduInst}>{e.subtitle}</Text></View>
          ))}
        </View>
      ) : null}

      {enabled.has("skills") ? (
        <View style={s.section}>
          <Text style={s.secTitle}>Habilidades</Text>
          <View style={s.skillsRow}>
            {skills.filter(sk => !hiddenItems.has(`skill-${sk.id}`)).map((sk, i) => <Text key={i} style={s.skill}>{sk.nombre || sk.name}</Text>)}
            {customSkills.filter(e => !hiddenItems.has(`cskill-${e.id_cv_custom_entry}`)).map((e, i) => <Text key={`cs-${i}`} style={s.skill}>{e.title}</Text>)}
          </View>
        </View>
      ) : null}

      {enabled.has("projects") && projects.length > 0 ? (
        <View style={s.section}>
          <Text style={s.secTitle}>Proyectos</Text>
          {projects.filter(p => !hiddenItems.has(`proj-${p.id}`)).map((proj, i) => (
            <View key={i} style={s.item}>
              <Text style={s.expTitle}>{proj.titulo || proj.title}</Text>
              {(proj.descripcion || proj.description) ? <Text style={s.expDesc}>{proj.descripcion || proj.description}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {enabled.has("social") && (profile?.github || profile?.linkedin) ? (
        <View style={s.section}>
          <Text style={s.secTitle}>Redes profesionales</Text>
          {profile?.github   ? <Text style={{ fontSize: 9, color: "#4a5568", marginBottom: 2 }}>GitHub: {profile.github}</Text>   : null}
          {profile?.linkedin ? <Text style={{ fontSize: 9, color: "#4a5568" }}>LinkedIn: {profile.linkedin}</Text> : null}
        </View>
      ) : null}
    </Page>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CvPdfDocument({
  profile,
  templateId    = "navy",
  sections      = [],
  experience    = [],
  education     = [],
  skills        = [],
  projects      = [],
  customEntries = [],
  hiddenItems   = new Set(),
}) {
  const colors  = getColors(templateId);
  const layout  = getLayout(templateId);
  const enabled = new Set(sections.filter(s => s.enabled).map(s => s.key));

  const customExp    = customEntries.filter(c => c.entry_type === "experience");
  const customSkills = customEntries.filter(c => c.entry_type === "skill");
  const customEdu    = customEntries.filter(c => c.entry_type === "education");

  const fullName = [profile?.nombre, profile?.apellido].filter(Boolean).join(" ") || "Tu Nombre";

  const layoutProps = { colors, enabled, profile, experience, education, skills, projects, customExp, customSkills, customEdu, hiddenItems, fullName };

  return (
    <Document>
      {layout === "bicolor"  ? <BicolorLayout  {...layoutProps} /> : null}
      {layout === "tech"     ? <TechLayout     {...layoutProps} /> : null}
      {layout === "minimal"  ? <MinimalLayout  {...layoutProps} /> : null}
      {layout === "classic"  ? <ClassicLayout  {...layoutProps} /> : null}
    </Document>
  );
}
