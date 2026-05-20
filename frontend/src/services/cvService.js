import { apiClient } from './http/httpClient';

/**
 * Lista todos los CVs del usuario autenticado.
 */
export async function listarCvs() {
  return apiClient.get('/cv');
}

/**
 * Obtiene un CV específico con sus detalles.
 */
export async function obtenerCv(id) {
  return apiClient.get(`/cv/${id}`);
}

/**
 * Crea un nuevo CV.
 * @param {object} data - { name_cv, template, font, description, visible, details[] }
 */
export async function crearCv(data) {
  const res = await apiClient.post('/cv', data);
  sessionStorage.removeItem("user_cvs");
  return res;
}

/**
 * Actualiza un CV existente.
 * @param {number} id
 * @param {object} data - campos a actualizar
 */
export async function actualizarCv(id, data) {
  const res = await apiClient.put(`/cv/${id}`, data);
  sessionStorage.removeItem("user_cvs");
  return res;
}

/**
 * Elimina (soft delete) un CV.
 */
export async function eliminarCv(id) {
  const res = await apiClient.delete(`/cv/${id}`);
  sessionStorage.removeItem("user_cvs");
  return res;
}

/**
 * Alterna la visibilidad de un CV.
 */
export async function toggleVisibleCv(id) {
  const res = await apiClient.patch(`/cv/${id}/visible`);
  sessionStorage.removeItem("user_cvs");
  return res;
}

// ─── Datos del portafolio para el editor ─────────────────────────────────────

export async function cargarDatosPortafolio() {
  const [experience, formacionRes, skills, projects] = await Promise.all([
    apiClient.get('/experience'),
    apiClient.get('/formacion'),
    apiClient.get('/skills'),
    apiClient.get('/projects'),
  ]);

  return {
    experience: experience ?? [],
    education:  formacionRes?.formaciones ?? [],
    skills:     skills ?? [],
    projects:   projects ?? [],
  };
}

export async function obtenerCustomEntries(cvId) {
  return apiClient.get(`/cv/${cvId}/custom-entries`);
}