import { apiClient } from "./http/httpClient";

const CACHE_PREFIX = "pf_recruiter_";

/* ─── Caché helpers ─── */
function readCache(key) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached?.data) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ data }));
  } catch {}
}

function invalidateCache(key) {
  try {
    sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {}
}

function invalidateAllOffers() {
  invalidateCache("offers");
}


export const obtenerMisOfertas = async ({ force = false } = {}) => {
  const cacheKey = "offers";

  if (!force) {
    const cached = readCache(cacheKey);
    if (cached) return { data: cached }; 
  }

  const res    = await apiClient.get("offers/mine");
  const offers = res?.data ?? [];        

  writeCache(cacheKey, offers);

  return { data: offers };             
};

export const obtenerOferta = async (id) => {
  const cached = readCache("offers");
  if (cached) {
    const found = cached.find((o) => String(o.id_offer) === String(id));
    if (found) return found;
  }

  const data = await apiClient.get(`offers/${id}`);
  return data?.offer ?? data;
};

/* ── Crear oferta ── */
export const crearOferta = async (datos) => {
  const formData = new FormData();
  formData.append("_method",           "POST");
  formData.append("title",             datos.title);
  formData.append("state",             datos.asDraft ? "private" : "open");
  formData.append("id_audience_type",  datos.id_audience_type);

  if (datos.description)   formData.append("description",    datos.description);
  if (datos.type)          formData.append("type",           datos.type);
  if (datos.modalidad)     formData.append("modalidad",      datos.modalidad);
  if (datos.ubicacion)     formData.append("ubicacion",      datos.ubicacion);
  if (datos.salaryMin)     formData.append("salary_min",     datos.salaryMin);
  if (datos.salaryMax)     formData.append("salary_max",     datos.salaryMax);
  if (datos.currency)      formData.append("currency",       datos.currency);
  if (datos.nivel)         formData.append("nivel",          datos.nivel);
  if (datos.area)          formData.append("area",           datos.area);
  if (datos.quotaQuantity) formData.append("quota_quantity", datos.quotaQuantity);
  if (datos.closedAt)      formData.append("closed_at",      datos.closedAt);
  if (datos.bannerFile)    formData.append("banner",         datos.bannerFile);

  formData.append("show_salary", datos.showSalary ? "1" : "0");

  if (datos.skills?.length) {
    datos.skills.forEach((skill) => formData.append("skills[]", skill));
  }

  if (datos.id_audience_type === 4 && datos.audienceFilters) {
    if (datos.audienceFilters.id_professional_area) {
      formData.append("audience_filters[id_professional_area]", datos.audienceFilters.id_professional_area);
    }
    if (datos.audienceFilters.career) {
      formData.append("audience_filters[career]", datos.audienceFilters.career);
    }
  }

  const data = await apiClient.post("offers", formData);

  invalidateAllOffers();

  return data;
};

/* ── Actualizar oferta ── */
export const actualizarOferta = async (id, datos) => {
  const formData = new FormData();
  formData.append("_method", "PUT");
  formData.append("state",   datos.asDraft ? "private" : "open");
  formData.append("id_audience_type", datos.id_audience_type);

  if (datos.title)       formData.append("title",       datos.title);
  if (datos.description) formData.append("description", datos.description);
  if (datos.type)        formData.append("type",        datos.type);
  if (datos.modalidad)   formData.append("modalidad",   datos.modalidad);
  if (datos.ubicacion)   formData.append("ubicacion",   datos.ubicacion);
  if (datos.nivel)       formData.append("nivel",       datos.nivel);
  if (datos.area)        formData.append("area",        datos.area);
  if (datos.closedAt)    formData.append("closed_at",   datos.closedAt);
  if (datos.salaryMin)   formData.append("salary_min",  datos.salaryMin);
  if (datos.salaryMax)   formData.append("salary_max",  datos.salaryMax);
  if (datos.currency)    formData.append("currency",    datos.currency);
  if (datos.bannerFile)  formData.append("banner",      datos.bannerFile);

  formData.append("show_salary", datos.showSalary ? "1" : "0");

  if (datos.skills?.length) {
    datos.skills.forEach((skill) => formData.append("skills[]", skill));
  }

  if (datos.id_audience_type === 4 && datos.audienceFilters) {
    if (datos.audienceFilters.id_professional_area) {
      formData.append("audience_filters[id_professional_area]", datos.audienceFilters.id_professional_area);
    }
    if (datos.audienceFilters.career) {
      formData.append("audience_filters[career]", datos.audienceFilters.career);
    }
  } else {
    formData.append("audience_filters[id_professional_area]", "");
    formData.append("audience_filters[career]",               "");
  }

  const data = await apiClient.post(`offers/${id}`, formData);

  invalidateAllOffers();

  return data;
};

export const eliminarOferta = async (id) => {
  const data = await apiClient.delete(`offers/${id}`);

  const cached = readCache("offers");
  if (cached) {
    writeCache("offers", cached.filter((o) => String(o.id_offer) !== String(id)));
  }

  return data;
};

export const obtenerFeed = async (page = 1) => {
  return await apiClient.get(`feed/posts?page=${page}`);
};

export const cambiarEstadoOferta = async (id, nuevoState) => {
  const formData = new FormData();
  formData.append("_method", "PUT");
  formData.append("state",   nuevoState);

  const data = await apiClient.post(`offers/${id}`, formData);

  const cached = readCache("offers");
  if (cached) {
    writeCache(
      "offers",
      cached.map((o) =>
        String(o.id_offer) === String(id) ? { ...o, state: nuevoState } : o
      )
    );
  }

  return data;
};

export const invalidateOffersCache = invalidateAllOffers;