// src/services/companyTrustService.js
import { apiClient } from "./http/httpClient";

export async function fetchCompanyFollowStatus(companyId) {
  return apiClient.get(`companies/${companyId}/follow-status`, {
    fallbackMessage: "No se pudo cargar el estado de seguimiento.",
  });
}

export async function followCompany(companyId) {
  return apiClient.post(`companies/${companyId}/follow`, {}, {
    fallbackMessage: "No se pudo seguir esta empresa.",
  });
}

export async function unfollowCompany(companyId) {
  return apiClient.delete(`companies/${companyId}/follow`, {
    fallbackMessage: "No se pudo dejar de seguir esta empresa.",
  });
}

export async function fetchCompanyFollowers(companyId) {
  return apiClient.get(`companies/${companyId}/followers`, {
    fallbackMessage: "No se pudo cargar la lista de seguidores.",
  });
}

export async function fetchCompanyFollowing(companyId) {
  return apiClient.get(`companies/${companyId}/following`, {
    fallbackMessage: "No se pudo cargar la lista de seguidos.",
  });
}

const COMPANY_CACHE_PREFIX = "pf_company_";

function readCompanyCache(id) {
  try {
    const raw = sessionStorage.getItem(`${COMPANY_CACHE_PREFIX}${id}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() > cached.expiresAt) return null;
    return cached.data;
  } catch { return null; }
}

function writeCompanyCache(id, data) {
  try {
    sessionStorage.setItem(`${COMPANY_CACHE_PREFIX}${id}`, JSON.stringify({
      data,
      expiresAt: Date.now() + 60000, // 1 minuto
    }));
  } catch {}
}

export async function fetchPublicCompany(companyId) {
  const cached = readCompanyCache(companyId);
  if (cached) return cached; 

  const data = await apiClient.get(`companies/${companyId}/public`, {
    fallbackMessage: "No se pudo cargar el perfil de la empresa.",
  });

  writeCompanyCache(companyId, data);   
  return data;
}