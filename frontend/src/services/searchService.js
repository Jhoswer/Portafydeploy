import config from "../config";
import { apiClient } from "./http/httpClient";

export async function searchUsers({ query, category, filter }) {
  const params = new URLSearchParams({
    q: String(query || "").trim(),
    category,
    filter,
  });

  return apiClient.get(`user/search?${params.toString()}`, {
    auth: false,
    fallbackMessage: "Error al conectar con el servidor.",
  });
}

const SEARCH_USERS_FILTERS_ENDPOINT = "user/search/filters";
const suggestedUsersCache = new Map();

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildSearchFiltersPayload({
  query = "",
  filters = {},
  activeCategory = null,
  page = 1,
  perPage = 12,
} = {}) {
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => normalizeText(value) !== "")
  );

  return {
    q: normalizeText(query),
    page,
    per_page: perPage,
    active_category: activeCategory || null,
    filters: cleanedFilters,
    usuario: {
      ubicacion: cleanedFilters.ubicacion ?? "",
      profesion: cleanedFilters.profesion ?? "",
    },
    habilidades: {
      nombre: cleanedFilters.habilidad ?? "",
      tipo: cleanedFilters.hab_tipo ?? "",
    },
    experiencias: {
      cargo: cleanedFilters.exp_cargo ?? "",
      empresa: cleanedFilters.exp_empresa ?? "",
    },
    formaciones: {
      institucion: cleanedFilters.institucion ?? "",
      nivel_formacion: cleanedFilters.nivel_formacion ?? "",
    },
  };
}

function extractItemsFromResponse(payload) {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.data?.data,
    payload?.data?.usuarios,
    payload?.data?.users,
    payload?.usuarios,
    payload?.users,
    payload?.results,
    payload?.items,
    payload?.data,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function extractMetaFromResponse(payload, fallbackCount) {
  const metaSource = payload?.meta || payload?.data?.meta || {};
  const paginationSource = payload?.pagination || payload?.data?.pagination || payload?.data || {};

  return {
    total: Number(metaSource.total ?? paginationSource.total ?? fallbackCount ?? 0) || 0,
    currentPage:
      Number(metaSource.current_page ?? paginationSource.current_page ?? paginationSource.currentPage ?? 1) || 1,
    perPage: Number(metaSource.per_page ?? paginationSource.per_page ?? paginationSource.perPage ?? 12) || 12,
    lastPage: Number(metaSource.last_page ?? paginationSource.last_page ?? paginationSource.lastPage ?? 1) || 1,
  };
}

function splitList(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeText(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function toComparableDate(value) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeSkillNames(user) {
  const rawSkills = user?.habilidades || user?.skills || [];

  if (Array.isArray(rawSkills) && rawSkills.length > 0) {
    return [...new Set(rawSkills.map((skill) => normalizeText(skill?.nombre || skill?.label || skill)).filter(Boolean))];
  }

  return splitList(user?.skills_text || user?.tecnologias || user?.habilidades_texto);
}

function resolveDisplayTitle(user) {
  const directTitle = normalizeText(user?.titulo || user?.profesion || user?.headline || user?.cargo_actual);
  if (directTitle) return directTitle;

  const experiences = Array.isArray(user?.experiencias) ? [...user.experiencias] : [];
  experiences.sort((left, right) => {
    const rightDate = toComparableDate(right?.fecha_inicio || right?.created_at);
    const leftDate = toComparableDate(left?.fecha_inicio || left?.created_at);
    return rightDate - leftDate;
  });

  const currentExperience =
    experiences.find((item) => Boolean(item?.actualmente || item?.actual || item?.isCurrent)) || experiences[0];

  const experienceTitle = normalizeText(currentExperience?.cargo || currentExperience?.rol || currentExperience?.title);
  if (experienceTitle) return experienceTitle;

  const education = Array.isArray(user?.formaciones_academicas)
    ? user.formaciones_academicas
    : Array.isArray(user?.formaciones)
      ? user.formaciones
      : [];

  return normalizeText(education[0]?.nombre_programa || education[0]?.titulo || education[0]?.degree) || "Profesional";
}

function normalizeSearchUser(user, index) {
  const id = user?.id || user?.usuario_id || `search-user-${index}`;
  const firstName = normalizeText(user?.nombre || user?.name);
  const lastName = normalizeText(user?.apellido || user?.last_name || user?.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Usuario";
  const skills = normalizeSkillNames(user);

  return {
    id,
    type: normalizeText(user?.type) || "usuario",
    name: fullName,
    title: resolveDisplayTitle(user),
    location: normalizeText(user?.ubicacion || user?.location),
    bio: normalizeText(user?.biografia || user?.bio || user?.descripcion),
    skills,
    avatar: resolveUserPhoto(user?.foto_perfil || user?.avatar || user?.photo),
    cover: resolveUserPhoto(user?.foto_portada || user?.cover),
    profileUrl: normalizeText(user?.profile_url || user?.url_perfil || user?.url),
    raw: user,
  };
}

export async function searchUsersByFilters(options = {}) {
  const { signal } = options;
  const payload = buildSearchFiltersPayload(options);
  const response = await apiClient.post(SEARCH_USERS_FILTERS_ENDPOINT, payload, {
    auth: false,
    signal,
    fallbackMessage: "No se pudieron obtener los resultados de busqueda.",
  });

  const items = extractItemsFromResponse(response);
  const normalizedItems = items.map(normalizeSearchUser).filter(Boolean);

  return {
    items: normalizedItems,
    meta: extractMetaFromResponse(response, normalizedItems.length),
    raw: response,
    request: payload,
  };
}

export async function fetchSuggestedUsers({ limit = 3, signal, force = false } = {}) {
  const cacheKey = `suggested:${limit}`;
  if (!force && suggestedUsersCache.has(cacheKey)) {
    return suggestedUsersCache.get(cacheKey);
  }

  const response = await searchUsersByFilters({
    query: "",
    perPage: Math.max(limit, 1),
    page: 1,
    signal,
  });

  const items = response.items.slice(0, limit);
  suggestedUsersCache.set(cacheKey, items);
  return items;
}

export function resolveUserPhoto(photo) {
  if (!photo) return "";
  if (/^https?:\/\//i.test(photo)) return photo;
  return `${config.backendUrl}/storage/${photo.replace(/^\/+/, "")}`;
}
