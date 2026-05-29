import { apiClient } from "./http/httpClient";

const COMPANY_CACHE_PREFIX = "pf_company_";
const COMPANY_RELATIONS_CACHE_PREFIX = "pf_company_relations_";

const COMPANY_TTL = 60000; // 1 minuto
const COMPANY_RELATIONS_TTL = 60000; // 1 minuto

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (Date.now() > cached.expiresAt) return null;

    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(key, data, ttl = 60000) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        expiresAt: Date.now() + ttl,
      })
    );
  } catch {}
}

function getCompanyCacheKey(companyId) {
  return `${COMPANY_CACHE_PREFIX}${companyId}`;
}

function getCompanyRelationsCacheKey(companyId, type) {
  return `${COMPANY_RELATIONS_CACHE_PREFIX}${companyId}_${type}`;
}

export async function fetchCompanyFollowStatus(companyId) {
  return apiClient.get(`companies/${companyId}/follow-status`, {
    fallbackMessage: "No se pudo cargar el estado de seguimiento.",
  });
}

export async function followCompany(companyId) {
  clearCompanyRelationsCache(companyId);

  return apiClient.post(
    `companies/${companyId}/follow`,
    {},
    {
      fallbackMessage: "No se pudo seguir esta empresa.",
    }
  );
}

export async function unfollowCompany(companyId) {
  clearCompanyRelationsCache(companyId);

  return apiClient.delete(`companies/${companyId}/follow`, {
    fallbackMessage: "No se pudo dejar de seguir esta empresa.",
  });
}

export async function fetchCompanyFollowers(companyId, force = false) {
  const key = getCompanyRelationsCacheKey(companyId, "followers");

  if (!force) {
    const cached = readCache(key);
    if (cached) return cached;
  }

  const data = await apiClient.get(`companies/${companyId}/followers`, {
    fallbackMessage: "No se pudo cargar la lista de seguidores.",
  });

  writeCache(key, data, COMPANY_RELATIONS_TTL);

  return data;
}

export async function fetchCompanyFollowing(companyId, force = false) {
  const key = getCompanyRelationsCacheKey(companyId, "following");

  if (!force) {
    const cached = readCache(key);
    if (cached) return cached;
  }

  const data = await apiClient.get(`companies/${companyId}/following`, {
    fallbackMessage: "No se pudo cargar la lista de seguidos.",
  });

  writeCache(key, data, COMPANY_RELATIONS_TTL);

  return data;
}

export function clearCompanyRelationsCache(companyId) {
  try {
    sessionStorage.removeItem(getCompanyRelationsCacheKey(companyId, "followers"));
    sessionStorage.removeItem(getCompanyRelationsCacheKey(companyId, "following"));
  } catch {}
}

export async function fetchPublicCompany(companyId, force = false) {
  const key = getCompanyCacheKey(companyId);

  if (!force) {
    const cached = readCache(key);
    if (cached) return cached;
  }

  const data = await apiClient.get(`companies/${companyId}/public`, {
    fallbackMessage: "No se pudo cargar el perfil de la empresa.",
  });

  writeCache(key, data, COMPANY_TTL);

  return data;
}

export function clearCompanyCache(companyId) {
  try {
    sessionStorage.removeItem(getCompanyCacheKey(companyId));
  } catch {}
}