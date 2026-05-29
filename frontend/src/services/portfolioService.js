import { apiClient } from "./http/httpClient";
import { EXPERIENCE_ROLE_LIBRARY, SKILL_DESCRIPTION_LIBRARY, SKILL_LIBRARY } from "../features/dashboard-portfolio/portfolioConfig";
import { normalizeEducationList } from "../features/dashboard-profile/profileUtils";

const ENDPOINTS = {
  skills: "skills",
  experience: "experience",
  projects: "projects",
  social: "socials",
  education: "formacion",
};

const OVERVIEW_CACHE_TTL_MS = 15000;
const SECTION_CACHE_TTL_MS = 60000;

let overviewCache = {
  expiresAt: 0,
  promise: null,
  value: null,
};

const sectionCache = new Map();

async function request(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  try {
    if (method === "GET") {
      return await apiClient.get(endpoint, {
        ...options,
        fallbackMessage: "No se pudo completar la solicitud.",
      });
    }

    if (method === "POST") {
      return await apiClient.post(endpoint, options.body, {
        ...options,
        fallbackMessage: "No se pudo completar la solicitud.",
      });
    }

    if (method === "PUT") {
      return await apiClient.put(endpoint, options.body, {
        ...options,
        fallbackMessage: "No se pudo completar la solicitud.",
      });
    }

    if (method === "DELETE") {
      return await apiClient.delete(endpoint, {
        ...options,
        fallbackMessage: "No se pudo completar la solicitud.",
      });
    }

    return await apiClient.post(endpoint, options.body, {
      ...options,
      method,
      fallbackMessage: "No se pudo completar la solicitud.",
    });
  } catch (error) {
    error.validationErrors = error.validationErrors
      ? mapValidationErrors(endpoint, error.validationErrors)
      : {};
    throw error;
  }
}

function mapValidationErrors(endpoint, errors) {
  const sectionKey = Object.entries(ENDPOINTS).find(([, value]) => endpoint.startsWith(value))?.[0];

  if (!sectionKey) return errors;

  const fieldMap = {
    skills: {
      nombre: "name",
      tipo: "category",
      nivel_texto: "level",
      nivel_numero: "level",
      nivel_cuantitativo: "level",
      nivel_cualitativo: "level",
    },
    experience: {
      tipo: "type",
      empresa: "company",
      cargo: "title",
      descripcion: "description",
      fecha_inicio: "startDate",
      fecha_fin: "endDate",
      actualmente: "isCurrent",
      company: "company",
      title: "title",
    },
    projects: {
      titulo: "title",
      descripcion: "description",
      tecnologias: "tags",
      url_demo: "demoUrl",
      url_repositorio: "repoUrl",
      estado: "status",
      imagen: "cover",
      cover: "cover",
    },
    social: {
      plataforma: "platform",
      nombre_plataforma: "platform",
      url: "url",
      url_plataforma: "url",
    },
    education: {
      nivel_formacion: "level",
      tipo_formacion: "level",
      institucion: "institution",
      nombre_programa: "program",
      nombre_carrera: "program",
      fecha_inicio: "startDate",
      fecha_fin: "endDate",
      actualmente: "isCurrent",
    },
  };

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      fieldMap[sectionKey]?.[key] ?? key,
      Array.isArray(value) ? value[0] : value,
    ])
  );
}

function levelFromPoints(points) {
  if (points >= 80) return "Senior";
  if (points >= 50) return "Mid";
  if (points > 0) return "Junior";
  return "Junior";
}

function levelFromLegacyRank(rank) {
  if (rank >= 5) return "Senior";
  if (rank >= 3) return "Mid";
  if (rank > 0) return "Junior";
  return "";
}

function levelFromText(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (["experto", "avanzado"].includes(normalized)) return "Senior";
  if (normalized === "intermedio") return "Mid";
  if (["basico", "junior"].includes(normalized)) return "Junior";
  if (normalized === "mid") return "Mid";
  if (normalized === "senior") return "Senior";
  return "";
}

function serializeSkillLevelText(level) {
  if (level === "Senior") return "avanzado";
  if (level === "Mid") return "intermedio";
  if (level === "Junior") return "basico";
  return "";
}

function serializeSkillLevelNumber(level) {
  if (level === "Senior") return 85;
  if (level === "Mid") return 60;
  if (level === "Junior") return 30;
  return null;
}

function buildSkillPayload(draft) {
  const nivelTexto = serializeSkillLevelText(draft.level);
  const nivelNumero = serializeSkillLevelNumber(draft.level);
  const description = getSkillDescription(draft.name, draft.category);

  return {
    nombre: draft.name,
    name: draft.name,
    tipo: draft.category === "Blandas" ? "blanda" : "tecnica",
    category: draft.category,
    nivel_texto: nivelTexto,
    nivel_numero: nivelNumero,
    nivel_cuantitativo: nivelTexto,
    nivel_cualitativo: nivelNumero,
    level: draft.level,
    nivel: nivelNumero ? Math.max(1, Math.min(5, Math.round(nivelNumero / 20))) : undefined,
    descripcion: description,
    description,
  };
}

function normalizeProjectStatus(status) {
  if (status === "completado") return "Completo";
  if (status === "en_progreso") return "En proceso";
  if (status === "pausado") return "Pausado";
  return status || "En proceso";
}

function serializeProjectStatus(status) {
  if (status === "Completo") return "completado";
  if (status === "En proceso") return "en_progreso";
  if (status === "Pausado") return "pausado";
  return "en_progreso";
}

function normalizeExperienceType(type) {
  const normalized = String(type || "").trim().toLowerCase();

  if (["academica", "academico", "academic", "education"].includes(normalized)) return "Academica";
  if (["freelance", "independiente", "freelancer"].includes(normalized)) return "Freelance";
  return "Profesional";
}

function serializeExperienceType(type) {
  if (type === "Academica") return "academico";
  if (type === "Freelance") return "freelance";
  return "profesional";
}

function splitTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeSocialPlatformDisplay(platform) {
  const normalized = String(platform || "").trim().toLowerCase();

  if (!normalized) return "";
  if (normalized === "github") return "GitHub";
  if (normalized === "linkedin") return "LinkedIn";
  if (normalized === "gitlab") return "GitLab";
  if (normalized === "facebook") return "Facebook";
  if (normalized === "instagram") return "Instagram";
  if (normalized === "x" || normalized === "twitter") return "X (Twitter)";
  if (normalized === "youtube") return "YouTube";
  if (normalized === "behance") return "Behance";
  if (normalized === "dribbble") return "Dribbble";
  if (normalized === "medium") return "Medium";
  if (normalized === "stackoverflow" || normalized === "stack overflow") return "Stack Overflow";
  if (normalized === "tiktok" || normalized === "tik tok") return "TikTok";
  if (normalized === "portafolio" || normalized === "portfolio") return "Sitio web / Portafolio";
  if (normalized === "otro" || normalized === "otra") return "Otra";
  return platform;
}

function serializeSocialPlatform(platform) {
  const normalized = String(platform || "").trim().toLowerCase();

  if (!normalized) return "";
  if (normalized === "github") return "github";
  if (normalized === "linkedin") return "linkedin";
  if (normalized === "gitlab") return "gitlab";
  if (normalized === "facebook") return "facebook";
  if (normalized === "instagram") return "instagram";
  if (normalized === "x (twitter)" || normalized === "x" || normalized === "twitter") return "x";
  if (normalized === "youtube") return "youtube";
  if (normalized === "behance") return "behance";
  if (normalized === "dribbble") return "dribbble";
  if (normalized === "medium") return "medium";
  if (normalized === "stack overflow" || normalized === "stackoverflow") return "stackoverflow";
  if (normalized === "tiktok" || normalized === "tik tok") return "tiktok";
  if (normalized === "sitio web / portafolio" || normalized === "portfolio" || normalized === "portafolio") return "portafolio";
  return "otro";
}

function guessExperienceRoleArea(title, type) {
  const normalizedTitle = String(title || "").trim().toLowerCase();
  const normalizedType = normalizeExperienceType(type);

  if (normalizedType === "Academica") return "Academica";
  if (normalizedType === "Freelance") return "Freelance";

  const found = Object.entries(EXPERIENCE_ROLE_LIBRARY).find(([, roles]) =>
    roles.some((role) => role.toLowerCase() === normalizedTitle)
  );

  return found?.[0] || "Otra";
}

function guessCategoryFromTags(tags) {
  const lowerTags = tags.map((tag) => tag.toLowerCase());
  if (lowerTags.some((tag) => ["react", "vue", "angular", "next.js", "tailwind css"].includes(tag))) return "Frontend";
  if (lowerTags.some((tag) => ["laravel", "node.js", "express", "spring boot", "django"].includes(tag))) return "Backend";
  if (lowerTags.some((tag) => ["mysql", "postgresql", "mongodb", "firebase", "sqlite"].includes(tag))) return "Base de datos";
  if (lowerTags.some((tag) => ["figma", "adobe xd", "photoshop", "illustrator"].includes(tag))) return "Diseno";
  return "Otra";
}

function guessSkillCategory(name, type) {
  if (type === "blanda") return "Blandas";
  if (type && type !== "tecnica" && Object.hasOwn(SKILL_LIBRARY, type)) return type;

  const normalized = (name || "").toLowerCase();
  const categoryFromLibrary = Object.entries(SKILL_LIBRARY).find(([, skills]) =>
    skills.some((skill) => skill.toLowerCase() === normalized)
  )?.[0];

  if (categoryFromLibrary) return categoryFromLibrary;

  if ([
    "react", "vue", "html", "css", "javascript", "typescript",
    "next.js", "tailwind", "angular", "svelte", "sass", "bootstrap",
  ].includes(normalized)) return "Frontend";

  if ([
    "laravel", "node.js", "express", "php", "python", "java",
    "django", "spring", "ruby", "rails", "fastapi", "nestjs", "kotlin",
  ].includes(normalized)) return "Backend";

  if ([
    "mysql", "postgresql", "mongodb", "firebase", "redis",
    "sqlite", "sql", "supabase", "cassandra", "oracle", "mariadb",
  ].includes(normalized)) return "Base de datos";

  if ([
    "figma", "adobe xd", "photoshop", "illustrator", "canva", "sketch",
  ].includes(normalized)) return "Diseno";

  return "Otra";
}

function getSkillDescription(name, category) {
  if (SKILL_DESCRIPTION_LIBRARY[name]) return SKILL_DESCRIPTION_LIBRARY[name];
  if (category === "Blandas") return "Habilidad blanda clave para colaborar, comunicar y resolver mejor.";
  if (category && category !== "Otra") return `Conocimiento aplicado en ${category.toLowerCase()} para aportar valor en proyectos reales.`;
  return "Tecnologia o habilidad registrada para fortalecer el perfil profesional.";
}

function mapSkill(item) {
  const name = item.nombre || item.name || "";
  const category = guessSkillCategory(name, item.category || item.tipo);
  const level = levelFromText(item.nivel_texto)
    || levelFromText(item.nivel_cuantitativo)
    || levelFromText(item.level)
    || levelFromPoints(Number(item.nivel_numero || item.nivel_cualitativo))
    || levelFromLegacyRank(Number(item.nivel));

  return {
    id: String(item.id),
    category,
    name,
    level,
    levelLabel: item.nivel_label || level,
    levelDots: Number(item.level_dots || item.nivel_puntos) || (level === "Senior" ? 3 : level === "Mid" ? 2 : 1),
    description: getSkillDescription(name, category),
  };
}

function mapExperience(item) {
  const type = normalizeExperienceType(item.tipo || item.type);
  const title = item.cargo || item.title || "";

  return {
    id: String(item.id),
    type,
    roleArea: item.roleArea || item.area || guessExperienceRoleArea(title, type),
    title,
    company: item.empresa || item.company || "",
    description: item.descripcion || "",
    startDate: item.fecha_inicio || "",
    endDate: item.fecha_fin || "",
    isCurrent: Boolean(item.actualmente || item.isCurrent || !item.fecha_fin),
  };
}

function mapProject(item) {
  const tags = splitTags(item.tecnologias);
  return {
    id: String(item.id),
    title: item.titulo,
    description: item.descripcion || "",
    techCategory: guessCategoryFromTags(tags),
    tags,
    repoUrl: item.url_repositorio || "",
    demoUrl: item.url_demo || "",
    status: normalizeProjectStatus(item.estado),
    cover: item.url_imagen || item.imagen || "",
  };
}

function mapSocial(item) {
  const platform = normalizeSocialPlatformDisplay(
    item.platform_name || item.display_name || item.plataforma || item.nombre_plataforma || "Otra"
  );

  return {
    id: String(item.id),
    platform,
    platformName: item.platform_name || item.display_name || platform,
    platformIcon: item.platform_icon || "",
    platformColor: item.platform_color || "",
    url: item.url || item.url_plataforma || "",
  };
}

function mapEducation(item) {
  return normalizeEducationList([item])[0] ?? {
    id: String(item?.id ?? item?.id_university_career ?? Date.now()),
    program: item?.nombre_programa || item?.nombre_carrera || item?.careerName || "",
    institution: item?.institucion || "",
    level: item?.nivel_formacion || item?.tipo_formacion || "",
    startDate: item?.fecha_inicio || "",
    endDate: item?.fecha_fin || "",
    isCurrent: Boolean(item?.actualmente || item?.isCurrent || !item?.fecha_fin),
  };
}

function buildEducationPayload(draft) {
  return {
    nivel_formacion: draft.level || "otro",
    tipo_formacion: draft.level || "otro",
    institucion: draft.institution,
    nombre_programa: draft.program,
    nombre_carrera: draft.program,
    fecha_inicio: draft.startDate || null,
    fecha_fin: draft.isCurrent ? null : draft.endDate || null,
    actualmente: Boolean(draft.isCurrent),
    isCurrent: Boolean(draft.isCurrent),
  };
}

export function normalizeOverviewPayload(data = {}) {
  const socialsPayload = data.socials || {};

  return {
    profile: data.profile || null,
    skills: Array.isArray(data.skills) ? data.skills.map(mapSkill) : [],
    experience: Array.isArray(data.experience) ? data.experience.map(mapExperience) : [],
    projects: Array.isArray(data.projects) ? data.projects.map(mapProject) : [],
    social: Array.isArray(socialsPayload.links)
      ? socialsPayload.links.map((item) => mapSocial(item))
      : [],
    socialExtra: {
      cvUrl: data.profile?.url_cv || data.url_cv || "",
    },
    profilePosts: Array.isArray(data.profilePosts)
      ? data.profilePosts
      : Array.isArray(data.posts)
        ? data.posts
        : [],
    formacion: normalizeEducationList(data.formacion),
    education: normalizeEducationList(data.formacion),
  };
}

export function clearPortfolioOverviewCache() {
  overviewCache = {
    expiresAt: 0,
    promise: null,
    value: null,
  };
  sectionCache.clear();
}

export async function fetchPortfolioOverview() {
  const now = Date.now();

  if (overviewCache.value && overviewCache.expiresAt > now) {
    return overviewCache.value;
  }

  if (overviewCache.promise) {
    return overviewCache.promise;
  }

  overviewCache.promise = request("perfil/overview")
    .then((data) => {
      const normalized = normalizeOverviewPayload(data);
      overviewCache = {
        value: normalized,
        expiresAt: Date.now() + OVERVIEW_CACHE_TTL_MS,
        promise: null,
      };
      return normalized;
    })
    .catch((error) => {
      clearPortfolioOverviewCache();
      throw error;
    });

  return overviewCache.promise;
}

export async function fetchPortfolioSection(sectionKey) {
  const endpoint = ENDPOINTS[sectionKey];
  const now = Date.now();
  const cached = sectionCache.get(sectionKey);

  if (cached?.value && cached.expiresAt > now) {
    return cached.value;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = request(endpoint).then((data) => {
    let value = [];

    if (sectionKey === "skills") value = data.map(mapSkill);
    if (sectionKey === "experience") value = data.map(mapExperience);
    if (sectionKey === "projects") value = data.map(mapProject);
    if (sectionKey === "social") value = (data.links || []).map((item) => mapSocial(item));
    if (sectionKey === "education") value = normalizeEducationList(data.formaciones || data.formacion || []);

    sectionCache.set(sectionKey, {
      value,
      expiresAt: Date.now() + SECTION_CACHE_TTL_MS,
      promise: null,
    });

    return value;
  }).catch((error) => {
    sectionCache.delete(sectionKey);
    throw error;
  });

  sectionCache.set(sectionKey, {
    value: cached?.value ?? null,
    expiresAt: cached?.expiresAt ?? 0,
    promise,
  });

  return promise;
}

export async function createPortfolioItem(sectionKey, draft) {
  const endpoint = ENDPOINTS[sectionKey];

  if (sectionKey === "skills") {
    clearPortfolioOverviewCache();
    return mapSkill(
      await request(endpoint, {
        method: "POST",
        body: JSON.stringify(buildSkillPayload(draft)),
      })
    );
  }

  if (sectionKey === "experience") {
    clearPortfolioOverviewCache();
    return mapExperience(
      await request(endpoint, {
        method: "POST",
        body: JSON.stringify({
          type: serializeExperienceType(draft.type),
          tipo: serializeExperienceType(draft.type),
          title: draft.title,
          company: draft.company,
          description: draft.description,
          startDate: draft.startDate,
          endDate: draft.endDate,
          isCurrent: draft.isCurrent,
        }),
      })
    );
  }

  if (sectionKey === "projects") {
    const formData = new FormData();
    formData.append("titulo", draft.title);
    formData.append("descripcion", draft.description || "");
    formData.append("url_demo", draft.demoUrl || "");
    formData.append("url_repositorio", draft.repoUrl || "");
    formData.append("estado", serializeProjectStatus(draft.status));
    formData.append("tecnologias", (draft.tags || []).join(", "));
    if (draft.cover instanceof File) formData.append("imagen", draft.cover);

    clearPortfolioOverviewCache();
    return mapProject(
      await request(endpoint, {
        method: "POST",
        body: formData,
      })
    );
  }

  if (sectionKey === "social") {
    const formData = new FormData();
    formData.append("platform", serializeSocialPlatform(draft.platform));
    formData.append("url", draft.url || "");

    clearPortfolioOverviewCache();
    return mapSocial(
      await request(endpoint, {
        method: "POST",
        body: formData,
      })
    );
  }

  if (sectionKey === "education") {
    clearPortfolioOverviewCache();
    const response = await request(endpoint, {
      method: "POST",
      body: JSON.stringify(buildEducationPayload(draft)),
    });
    return mapEducation(response.formacion ?? response);
  }

  return null;
}

export async function updatePortfolioItem(sectionKey, itemId, draft) {
  const endpoint = `${ENDPOINTS[sectionKey]}/${itemId}`;

  if (sectionKey === "skills") {
    clearPortfolioOverviewCache();
    return mapSkill(
      await request(endpoint, {
        method: "PUT",
        body: JSON.stringify(buildSkillPayload(draft)),
      })
    );
  }

  if (sectionKey === "experience") {
    clearPortfolioOverviewCache();
    return mapExperience(
      await request(endpoint, {
        method: "PUT",
        body: JSON.stringify({
          type: serializeExperienceType(draft.type),
          tipo: serializeExperienceType(draft.type),
          title: draft.title,
          company: draft.company,
          description: draft.description,
          startDate: draft.startDate,
          endDate: draft.endDate,
          isCurrent: draft.isCurrent,
        }),
      })
    );
  }

  if (sectionKey === "projects") {
    const formData = new FormData();
    formData.append("titulo", draft.title);
    formData.append("descripcion", draft.description || "");
    formData.append("url_demo", draft.demoUrl || "");
    formData.append("url_repositorio", draft.repoUrl || "");
    formData.append("estado", serializeProjectStatus(draft.status));
    formData.append("_method", "PUT");
    formData.append("tecnologias", (draft.tags || []).join(", "));
    if (draft.cover instanceof File) formData.append("imagen", draft.cover);

    clearPortfolioOverviewCache();
    return mapProject(
      await request(endpoint, {
        method: "POST",
        body: formData,
      })
    );
  }

  if (sectionKey === "social") {
    const formData = new FormData();
    formData.append("platform", serializeSocialPlatform(draft.platform));
    formData.append("url", draft.url || "");
    formData.append("_method", "PUT");

    clearPortfolioOverviewCache();
    return mapSocial(
      await request(endpoint, {
        method: "POST",
        body: formData,
      })
    );
  }

  if (sectionKey === "education") {
    clearPortfolioOverviewCache();
    const response = await request(`${endpoint}/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(buildEducationPayload(draft)),
    });
    return mapEducation(response.formacion ?? response);
  }

  return null;
}


export async function deletePortfolioItem(sectionKey, itemId) {
  await request(`${ENDPOINTS[sectionKey]}/${itemId}`, {
    method: "DELETE",
  });
  clearPortfolioOverviewCache();
}
