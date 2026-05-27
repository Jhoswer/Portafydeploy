// src/services/adminCreacionService.js
// Servicio para el módulo de Creación del panel de administración.
// Maneja las 7 rutas POST del AdminCreacionController + carga de catálogos.

import { apiClient } from "./http/httpClient";
import { getAdminProfileTable } from "./adminProfileTableService";

export async function crearUsuarioDesdeRegistro(payload) {
  return apiClient.post(
    "register",
    {
      nombre: payload.role === "RECLUTADOR" ? payload.company : payload.name,
      apellido: payload.role === "RECLUTADOR" ? null : payload.lastName,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
      captcha_token: payload.captcha_token,
      role: payload.role,
    },
    {
      auth: true,
      fallbackMessage: "No se pudo crear el usuario.",
    }
  );
}

/* ════════════════════════════════════════════════════════════════
   STORE FUNCTIONS  (POST → AdminCreacionController)
════════════════════════════════════════════════════════════════ */

/** POST admin/profile/{profile}/cvs */
export async function crearCv(idProfile, payload) {
  const response = await apiClient.post(
    `admin/profile/${idProfile}/cvs`,
    payload,
    { fallbackMessage: "No se pudo crear el CV." }
  );
  return response?.data ?? response;
}

/** POST admin/profile/{profile}/experiences */
export async function crearExperiencia(idProfile, payload) {
  const response = await apiClient.post(
    `admin/profile/${idProfile}/experiences`,
    payload,
    { fallbackMessage: "No se pudo crear la experiencia." }
  );
  return response?.data ?? response;
}

/** POST admin/profile/{profile}/skills */
export async function crearHabilidad(idProfile, payload) {
  const response = await apiClient.post(
    `admin/profile/${idProfile}/skills`,
    payload,
    { fallbackMessage: "No se pudo asociar la habilidad al perfil." }
  );
  return response?.data ?? response;
}

/**
 * POST admin/profile/{profile}/offers
 * Si isFormData=true, payload ya es un FormData (con imagen de banner).
 */
export async function crearOferta(idProfile, payload, isFormData = false) {
  if (isFormData) {
    return apiClient.post(
      `admin/profile/${idProfile}/offers`,
      payload,
      { fallbackMessage: "No se pudo crear la oferta." }
    );
  }
  const response = await apiClient.post(
    `admin/profile/${idProfile}/offers`,
    payload,
    { fallbackMessage: "No se pudo crear la oferta." }
  );
  return response?.data ?? response;
}

/** POST admin/profile/{profile}/postulations */
export async function crearPostulacion(idProfile, payload) {
  const response = await apiClient.post(
    `admin/profile/${idProfile}/postulations`,
    payload,
    { fallbackMessage: "No se pudo crear la postulación." }
  );
  return response?.data ?? response;
}

/**
 * POST admin/profile/{profile}/projects
 * Si isFormData=true, payload ya es un FormData (con imagen de foto).
 */
export async function crearProyecto(idProfile, payload, isFormData = false) {
  if (isFormData) {
    return apiClient.post(
      `admin/profile/${idProfile}/projects`,
      payload,
      { fallbackMessage: "No se pudo crear el proyecto." }
    );
  }
  const response = await apiClient.post(
    `admin/profile/${idProfile}/projects`,
    payload,
    { fallbackMessage: "No se pudo crear el proyecto." }
  );
  return response?.data ?? response;
}

/** POST admin/profile/{profile}/publications */
export async function crearPublicacion(idProfile, payload) {
  const response = await apiClient.post(
    `admin/profile/${idProfile}/publications`,
    payload,
    { fallbackMessage: "No se pudo crear la publicación." }
  );
  return response?.data ?? response;
}

/* ════════════════════════════════════════════════════════════════
   CATÁLOGOS PARA FORMULARIOS DE CREACIÓN
   Usan admin/definition/{catalog} (global) y
   admin/profile/{profile}/tables/{resource} (por perfil).
════════════════════════════════════════════════════════════════ */

/** Helper: normaliza una fila a { value, label } */
function toOption(row, valueKey, labelKey, fallbackLabel = "") {
  return {
    value: row[valueKey],
    label: row[labelKey] || fallbackLabel || `#${row[valueKey]}`,
  };
}

/** Helper: llama a un endpoint de definición y devuelve el array. */
async function fetchDefinition(catalog) {
  try {
    const response = await apiClient.get(`admin/definition/${catalog}`, {
      fallbackMessage: "",
    });
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  } catch {
    return [];
  }
}

/* ── Catálogos para CreacionFormHabilidades ── */
export async function getCatalogosHabilidades() {
  const skills = await fetchDefinition("skills");
  return skills.map((s) =>
    s.value !== undefined ? s : toOption(s, "id_skill", "name")
  );
}

/* ── Catálogos para CreacionFormOferta ── */
export async function getCatalogosOferta() {
  const [audienceTypes, skills, jobTitles, areas, careers] = await Promise.all([
    fetchDefinition("audience_types"),
    fetchDefinition("skills"),
    fetchDefinition("job_titles"),
    fetchDefinition("professional_areas"),
    fetchDefinition("professional_careers"),
  ]);

  const normalize = (arr, valueKey, labelKey) =>
    arr.map((r) => (r.value !== undefined ? r : toOption(r, valueKey, labelKey)));

  return {
    audience_types:     normalize(audienceTypes, "id_audience_type", "name"),
    skills:             normalize(skills,         "id_skill",         "name"),
    job_titles:         normalize(jobTitles,       "id_job_title",     "name"),
    professional_areas: normalize(areas,           "id_professional_area",   "name"),
    /**
     * Las carreras conservan `area_id` para que el formulario pueda
     * filtrar client-side según el área seleccionada.
     */
    professional_careers: careers.map((r) => {
      // El endpoint puede devolver la fila ya normalizada o cruda
      if (r.value !== undefined) return r;
      return {
        value:   r.id_professional_career,
        label:   r.name,
        area_id: r.id_professional_area,
      };
    }),
  };
}

/* ── Catálogos para CreacionFormPostulacion ── */
export async function getCatalogosPostulacion(idProfile) {
  const [cvsResult, offersResult] = await Promise.all([
    getAdminProfileTable(idProfile, "cvs").catch(() => ({ rows: [] })),
    // ← ya no usamos getAdminProfileTable para ofertas
    apiClient.get("admin/offers/available", { fallbackMessage: "" }).catch(() => ({})),
  ]);

  const cvs = (cvsResult.rows ?? []).map((r) =>
    toOption(r, "id_cv", "name_cv", "CV sin nombre")
  );

  // El endpoint devuelve { data: [...] }
  const offersRaw = Array.isArray(offersResult?.data) ? offersResult.data : [];
  const offers = offersRaw.map((r) =>
    toOption(r, "id_offer", "title", "Oferta sin título")
  );

  return { cvs, offers };
}

/* ── Catálogos para CreacionFormProyecto ── */
export async function getCatalogosProyecto() {
  const skills = await fetchDefinition("skills");
  return {
    skills: skills.map((s) =>
      s.value !== undefined ? s : toOption(s, "id_skill", "name")
    ),
  };
}

/* ── Catálogos para CreacionFormPublicacion ── */
export async function getCatalogosPublicacion(idProfile) {
  const [
    audienceTypes,
    areas,
    careers,
    offersResult,
    projectsResult,
    cvsResult,
    expResult,
  ] = await Promise.all([
    fetchDefinition("audience_types"),
    fetchDefinition("professional_areas"),
    fetchDefinition("professional_careers"),
    getAdminProfileTable(idProfile, "offers").catch(() => ({ rows: [] })),
    getAdminProfileTable(idProfile, "projects").catch(() => ({ rows: [] })),
    getAdminProfileTable(idProfile, "cvs").catch(() => ({ rows: [] })),
    getAdminProfileTable(idProfile, "experiences").catch(() => ({ rows: [] })),
  ]);

  const norm = (arr, valueKey, labelKey) =>
    arr.map((r) => (r.value !== undefined ? r : toOption(r, valueKey, labelKey)));

  return {
    audience_types:       norm(audienceTypes, "id_audience_type", "name"),
    professional_areas:   norm(areas,         "id_professional_area",   "name"),
    professional_careers: norm(careers,       "id_professional_career", "name"),
    offers:      (offersResult.rows ?? []).map((r) => toOption(r, "id_offer",      "title",   "Oferta sin título")),
    projects:    (projectsResult.rows ?? []).map((r) => toOption(r, "id_project",   "title",   "Proyecto sin título")),
    cvs:         (cvsResult.rows ?? []).map((r) => toOption(r, "id_cv",        "name_cv", "CV sin nombre")),
    experiences: (expResult.rows ?? []).map((r) => toOption(r, "id_experience", "title",   "Experiencia sin título")),
  };
}
