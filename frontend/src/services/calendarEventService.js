// CAMBIO: nuevo servicio para eventos del calendario
import { apiClient } from "./http/httpClient";

const ENDPOINT = "calendar/events";

/**
 * Obtiene los eventos del calendario agrupados por fecha.
 * @param {number} profileId
 * @returns {Promise<Record<string, Array>>} objeto { "2026-06-03": [...] }
 */
export async function getCalendarEvents() {
  const data = await apiClient.get('calendar/events');
  const grouped = {};
  data.forEach((ev) => {
    const key = ev.date;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  });
  return grouped;
}


/**
 * Crea un nuevo evento en el calendario.
 * @param {number} profileId
 * @param {string} date  "2026-06-03"
 * @param {{ title: string, description: string, time: string, priority: string, tag: string }} form
 * @returns {Promise<Object>} evento creado
 */
// CAMBIO: quitar profileId, date es el primer parámetro
export async function createCalendarEvent(date, form) {
  return apiClient.post(ENDPOINT, {
    date,
    ...form,
  });
}