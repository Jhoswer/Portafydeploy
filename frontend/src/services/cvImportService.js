import { apiClient  } from './http/httpClient';

/**
 * Envía el archivo CV al backend y recibe los datos estructurados por Groq.
 * El backend acepta: PDF, DOCX, DOC, TXT.
 *
 * @param {File} file - Archivo seleccionado por el usuario
 * @returns {Promise<object>} datos estructurados del CV
 */
export async function importarCv(file) {
  const formData = new FormData();
  formData.append('cv_file', file);

  const response = await apiClient.post('/cv/importar', formData);
  return response;
}