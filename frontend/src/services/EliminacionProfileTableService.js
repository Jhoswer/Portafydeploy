// src/services/EliminacionProfileTableService.js
import { apiClient } from "./http/httpClient";

/**
 * Obtiene las filas de una tabla de un perfil dado.
 * Ruta: GET admin/profile/{profile}/tables/{resource}
 */
export async function getEliminacionTable(idProfile, resource) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/tables/${resource}`,
    { fallbackMessage: "No se pudo cargar la tabla solicitada." }
  );

  return {
    rows: Array.isArray(response?.data) ? response.data : [],
    meta: response?.meta ?? {},
  };
}

/**
 * Elimina en bloque los registros seleccionados.
 * Ruta: POST admin/profile/{profile}/tables/{resource}/bulk-delete
 * Body: { ids: [1, 2, 3] }
 */
export async function deleteEliminacionRows(idProfile, resource, ids = []) {
  const response = await apiClient.post(
    `admin/eliminacion/${idProfile}/${resource}/bulk-delete`,
    { ids },
    { fallbackMessage: "No se pudieron eliminar los registros seleccionados." }
  );

  return response?.data ?? response;
}

/* ── DATOS PERSONALES ─────────────────────────────────────── */

/**
 * GET admin/eliminacion/{profile}/datos-personales
 * Devuelve: providers, company, socials, job_title, studies
 */
export async function getDatosPersonalesData(idProfile) {
  const response = await apiClient.get(
    `admin/eliminacion/${idProfile}/datos-personales`,
    { fallbackMessage: "No se pudieron cargar los datos personales." }
  );
  return response?.data ?? {
    providers: [], company: null,
    socials: [], job_title: null, studies: [],
  };
}

/**
 * POST admin/eliminacion/{profile}/datos-personales/delete
 * Body: { provider_ids, delete_company, social_network_ids,
 *         delete_job_title, university_career_ids }
 */
export async function deleteDatosPersonales(idProfile, payload) {
  const response = await apiClient.post(
    `admin/eliminacion/${idProfile}/datos-personales/delete`,
    payload,
    { fallbackMessage: "No se pudieron eliminar los datos personales." }
  );
  return response?.data ?? response;
}