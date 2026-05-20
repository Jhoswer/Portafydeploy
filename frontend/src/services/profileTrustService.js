import { apiClient } from "./http/httpClient";

export const SUGGESTION_TYPES = [
  { value: "idea", label: "Idea" },
  { value: "mejora", label: "Mejora" },
  { value: "agregar", label: "Agregar funcionalidad" },
  { value: "eliminar", label: "Eliminar funcionalidad" },
];

export const SUGGESTION_AREAS = [
  { value: "perfil", label: "Perfil" },
  { value: "proyectos", label: "Proyectos" },
  { value: "experiencia", label: "Experiencia" },
  { value: "cv", label: "CV" },
  { value: "feed", label: "Feed" },
  { value: "busqueda", label: "Busqueda" },
  { value: "notificaciones", label: "Notificaciones" },
  { value: "general", label: "General" },
];

export function validateSuggestion(payload) {
  const title = String(payload.title || "").trim();
  const description = String(payload.description || "").trim();
  const safeTitle = /^[\p{L}\p{N}\s.,:;()_-]+$/u;

  if (!SUGGESTION_TYPES.some((item) => item.value === payload.type)) {
    return "Selecciona un tipo de sugerencia valido.";
  }
  if (!SUGGESTION_AREAS.some((item) => item.value === payload.area)) {
    return "Selecciona un area valida.";
  }
  if (title.length < 3 || title.length > 120 || !safeTitle.test(title)) {
    return "El nombre debe tener 3 a 120 caracteres validos.";
  }
  if (description.length < 10 || description.length > 255) {
    return "El motivo debe tener entre 10 y 255 caracteres.";
  }
  return "";
}

export async function sendSuggestion(payload) {
  return apiClient.post("suggestions", payload, {
    fallbackMessage: "No se pudo enviar la sugerencia.",
  });
}

export async function fetchRelations(userId, type) {
  return apiClient.get(`perfil/public/${userId}/relations?type=${type}`, {
    fallbackMessage: "No se pudo cargar la lista.",
  });
}

export async function fetchFollowStatus(userId) {
  return apiClient.get(`perfil/public/${userId}/follow-status`, {
    fallbackMessage: "No se pudo cargar el estado de seguimiento.",
  });
}

export async function followProfile(userId) {
  return apiClient.post(`perfil/public/${userId}/follow`, {}, {
    fallbackMessage: "No se pudo seguir este perfil.",
  });
}

export async function unfollowProfile(userId) {
  return apiClient.delete(`perfil/public/${userId}/follow`, {
    fallbackMessage: "No se pudo dejar de seguir este perfil.",
  });
}

export async function recordProfileView(userId) {
  return apiClient.post(`perfil/public/${userId}/view`, { source: "profile" }, {
    fallbackMessage: "No se pudo registrar la visualizacion.",
  });
}

export async function fetchProfileViews() {
  return apiClient.get("perfil/views", {
    fallbackMessage: "No se pudieron cargar las visualizaciones.",
  });
}

export async function fetchProfileAnalytics() {
  return apiClient.get("perfil/analytics", {
    fallbackMessage: "No se pudieron cargar las analiticas.",
  });
}

export async function recordAnalyticsEvent(payload) {
  return apiClient.post("perfil/analytics/events", payload, {
    fallbackMessage: "No se pudo registrar la analitica.",
  });
}

export async function fetchVerificationStatus() {
  return apiClient.get("perfil/verification", {
    fallbackMessage: "No se pudo cargar la verificacion.",
  });
}

export async function submitVerification(formData) {
  return apiClient.post("perfil/verification", formData, {
    fallbackMessage: "No se pudo enviar la solicitud de verificacion.",
  });
}

export async function createProfileReport(userId, payload) {
  return apiClient.post(`reports/profiles/${userId}`, payload, {
    fallbackMessage: "No se pudo enviar el reporte de perfil.",
  });
}
