import { apiClient } from "./http/httpClient";

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export async function getAreas() {
  const response = await apiClient.get("/admin/definition/areas", {
    fallbackMessage: "No se pudieron cargar las areas.",
  });

  return extractList(response);
}

export async function getCountries() {
  const response = await apiClient.get("/admin/definition/countries", {
    fallbackMessage: "No se pudieron cargar los paises.",
  });

  return extractList(response);
}

export async function getDefinitionRecords(catalog) {
  const response = await apiClient.get(`/admin/definition/${catalog}`, {
    fallbackMessage: "No se pudieron cargar los registros.",
  });

  return extractList(response);
}

export async function createDefinitionRecord(catalog, payload) {
  return apiClient.post(`/admin/definition/${catalog}`, payload, {
    fallbackMessage: "No se pudo guardar el registro.",
  });
}
