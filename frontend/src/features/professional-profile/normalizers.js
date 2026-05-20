import { PROFESSIONAL_PROFILE_MOCK } from "./mockData";

function toTrimmedString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeProject(project, index) {
  if (!project) return null;

  const tags = Array.isArray(project.tags)
    ? project.tags
    : Array.isArray(project.tecnologias)
      ? project.tecnologias
      : typeof project.tecnologias === "string"
        ? project.tecnologias.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

  return {
    id: project.id || `project-${index}`,
    titulo: toTrimmedString(project.titulo || project.title, "Proyecto sin titulo"),
    desc: toTrimmedString(project.descripcion || project.desc, "Sin descripcion."),
    tags: tags.length ? tags : ["General"],
    badge: project.badge || (project.estado === "completado" ? "LIVE" : "WIP"),
    bg: project.bg || "linear-gradient(135deg,#2D3142,#4F5D75)",
    emoji: project.emoji || "Proyecto",
    fecha: project.fecha || (project.created_at ? String(new Date(project.created_at).getFullYear()) : "2024"),
    demo: typeof project.demo === "boolean" ? project.demo : Boolean(project.url_demo || project.demoUrl),
    url_demo: project.url_demo || project.demoUrl || "#",
    url_repositorio: project.url_repositorio || project.repoUrl || "#",
  };
}

function inferSkillGroup(skillName = "", skillType = "") {
  const normalizedName = skillName.toLowerCase();
  const normalizedType = skillType.toLowerCase();

  if (normalizedType === "blanda") return "Habilidades blandas";
  if (["react", "vue", "angular", "html", "css", "javascript", "typescript"].includes(normalizedName)) return "Frontend";
  if (["node.js", "php", "laravel", "java", "spring", "spring boot", "python"].includes(normalizedName)) return "Backend";
  if (["postgresql", "mysql", "redis", "mongodb", "sqlite"].includes(normalizedName)) return "Base de datos";
  return "Otras";
}

function normalizeSkills(skills) {
  if (!Array.isArray(skills) || !skills.length) return PROFESSIONAL_PROFILE_MOCK.habilidades;

  if (skills[0]?.grupo && Array.isArray(skills[0]?.tags)) {
    return skills;
  }

  const grouped = skills.reduce((accumulator, skill, index) => {
    const group = inferSkillGroup(skill?.nombre || skill?.label, skill?.tipo || "");
    const currentGroup = accumulator[group] || [];
    const rawLevel = skill?.nivel_texto || skill?.nivel_cuantitativo || skill?.level || skill?.nivel || "";
    const level = String(rawLevel).toLowerCase();

    currentGroup.push({
      id: skill?.id || `skill-${index}`,
      label: skill?.nombre || skill?.label || "Habilidad",
      expert: ["senior", "avanzado", "experto", "5", "4"].includes(level),
    });

    accumulator[group] = currentGroup;
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([grupo, tags]) => ({ grupo, tags }));
}

function normalizeExperience(experience) {
  if (!Array.isArray(experience) || !experience.length) return PROFESSIONAL_PROFILE_MOCK.experiencia;

  return experience.map((item, index) => ({
    id: item.id || `experience-${index}`,
    icon: item.icon || "Experiencia",
    rol: item.rol || item.cargo || item.title || "Experiencia profesional",
    actual: Boolean(item.actual || item.actualmente || item.isCurrent),
    fecha:
      item.fecha ||
      [item.fecha_inicio || item.startDate, item.fecha_fin || item.endDate || "Presente"].filter(Boolean).join(" - "),
    empresa: item.empresa || item.company || "Empresa",
    desc: item.desc || item.descripcion || item.description || "Sin descripcion.",
  }));
}

function normalizeSocial(socialLinks) {
  if (!Array.isArray(socialLinks) || !socialLinks.length) return PROFESSIONAL_PROFILE_MOCK.social;

  return socialLinks.map((item, index) => ({
    id: item.id || `social-${index}`,
    platform: (item.platform || item.plataforma || item.nombre_plataforma || "web").toLowerCase(),
    label: item.label || item.url || item.url_plataforma || "Enlace profesional",
    url: item.url || item.url_plataforma || "#",
  }));
}

function normalizeEducation(items) {
  if (!Array.isArray(items) || !items.length) return PROFESSIONAL_PROFILE_MOCK.formacion;

  return items.map((item, index) => ({
    id: item.id || `education-${index}`,
    titulo: item.titulo || item.nombre_programa || item.nombre_carrera || item.degree || "Formacion",
    inst: item.inst || item.institucion || item.school || "Institucion",
    period:
      item.period ||
      [item.fecha_inicio || item.startDate, item.fecha_fin || item.endDate].filter(Boolean).join(" - ") ||
      "Periodo no especificado",
  }));
}

export function buildProfessionalProfileState(data) {
  const profile = data?.profile || data || {};
  const projects = (data?.projects || data?.proyectos || []).map(normalizeProject).filter(Boolean);
  const experience = normalizeExperience(data?.experience || data?.experiencias);
  const skills = normalizeSkills(data?.skills || data?.habilidades);
  const social = normalizeSocial(data?.social || data?.socials?.links);
  const education = normalizeEducation(data?.formacion || data?.formaciones || data?.educacion);

  return {
    usuario: {
      ...PROFESSIONAL_PROFILE_MOCK.usuario,
      ...profile,
      titulo: profile?.titulo || profile?.profesion || PROFESSIONAL_PROFILE_MOCK.usuario.titulo,
      ubicacion: profile?.ubicacion || PROFESSIONAL_PROFILE_MOCK.usuario.ubicacion,
      biografia: profile?.biografia || PROFESSIONAL_PROFILE_MOCK.usuario.biografia,
      disponible: typeof profile?.disponible === "boolean" ? profile.disponible : PROFESSIONAL_PROFILE_MOCK.usuario.disponible,
      url: profile?.url || `${window.location.origin}/perfil-profesional`,
      stats: profile?.stats || {
        proyectos: projects.length || PROFESSIONAL_PROFILE_MOCK.usuario.stats.proyectos,
        experiencia: experience.length || PROFESSIONAL_PROFILE_MOCK.usuario.stats.experiencia,
        empleadores: new Set(experience.map((item) => item.empresa)).size || PROFESSIONAL_PROFILE_MOCK.usuario.stats.empleadores,
        visitas: PROFESSIONAL_PROFILE_MOCK.usuario.stats.visitas,
      },
    },
    proyectos: projects.length ? projects : PROFESSIONAL_PROFILE_MOCK.proyectos,
    experiencia: experience,
    habilidades: skills,
    social,
    formacion: education,
    biografia: profile?.biografia || PROFESSIONAL_PROFILE_MOCK.usuario.biografia,
  };
}
