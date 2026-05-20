/**
 * sugerenciaService.js
 *
 * Servicio para el módulo de Sugerencias.
 * Los valores de `type` coinciden exactamente con el ENUM de la tabla SUGGESTION en BD:
 *   ENUM('agregar', 'idea', 'mejora', 'eliminar')
 */

import { apiClient }    from "./http/httpClient";
import { getStoredUser } from "./sessionService";

/* ════════════════════════════════════════════════════════
   CONSTANTES DE FILTRO
   Claves = valores exactos del ENUM en BD
════════════════════════════════════════════════════════ */
export const SUGERENCIA_TYPE_OPTIONS = [
  { key: "todos",    label: "Todos"                   },
  { key: "agregar",  label: "Nueva funcionalidad"     },
  { key: "idea",     label: "Idea"                    },
  { key: "mejora",   label: "Mejora"                  },
  { key: "eliminar", label: "Eliminar funcionalidad"  },
];

/* ════════════════════════════════════════════════════════
   METADATOS VISUALES POR TIPO
════════════════════════════════════════════════════════ */
export const TYPE_META = {
  agregar: {
    label:       "Nueva funcionalidad",
    badge:       "Nueva funcionalidad",
    badgeClass:  "badge--blue",
    avatarClass: "sugerencia-avatar--agregar",
  },
  idea: {
    label:       "Idea",
    badge:       "Idea",
    badgeClass:  "badge--purple",
    avatarClass: "sugerencia-avatar--idea",
  },
  mejora: {
    label:       "Mejora",
    badge:       "Mejora",
    badgeClass:  "badge--abierto",
    avatarClass: "sugerencia-avatar--mejora",
  },
  eliminar: {
    label:       "Eliminar funcionalidad",
    badge:       "Eliminar",
    badgeClass:  "badge--critico",
    avatarClass: "sugerencia-avatar--eliminar",
  },
};

/* ════════════════════════════════════════════════════════
   ✅ NUEVO — Etiquetas legibles para estados de ATTENDED
   Usadas por SugerenciaOpen para mostrar el estado
   devuelto por GET /suggestions/{id}/context
════════════════════════════════════════════════════════ */
export const ATTENDED_STATE_LABELS = {
  pending:       "Pendiente",
  accepted:      "Aceptada",
  rejected:      "Rechazada",
  in_discussion: "En discusión",
  higher:        "Escalada",
  ignored:       "Ignorada",
};

/* ════════════════════════════════════════════════════════
   HELPERS INTERNOS
════════════════════════════════════════════════════════ */

/** Construye query string ignorando valores vacíos y "todos" */
function toQueryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    const normalized = typeof value === "string" ? value.trim() : value;
    // Omitir vacíos y el comodín "todos" (el backend no lo entiende)
    if (normalized !== "" && normalized != null && normalized !== "todos") {
      params.set(key, String(normalized));
    }
  });
  return params.toString();
}

/** Devuelve los metadatos visuales para un tipo dado */
function resolveMeta(type) {
  return (
    TYPE_META[type] ?? {
      label:       type || "Sugerencia",
      badge:       "Pendiente",
      badgeClass:  "badge--pendiente",
      avatarClass: "sugerencia-avatar--idea",
    }
  );
}

/** Obtiene el id_profile del administrador autenticado */
function resolveAdministratorProfileId() {
  const user = getStoredUser();
  return (
    user?.id_profile          ||
    user?.profile_id          ||
    user?.profileId           ||
    user?.profile?.id_profile ||
    user?.profile?.id         ||
    user?.id                  ||
    null
  );
}

/* ════════════════════════════════════════════════════════
   NORMALIZACIÓN
════════════════════════════════════════════════════════ */

/**
 * Normaliza un ítem crudo del backend al shape que consumen los componentes.
 * Garantiza que siempre existan: meta, postulant (con initials).
 */
export function normalizeSugerencia(item = {}) {
  const meta = resolveMeta(item.type);

  const rawName   = item.postulant?.name ?? "";
  const initials  = item.postulant?.initials ||
    rawName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") ||
    "US";

  return {
    ...item,
    meta,
    postulant: {
      id:       item.postulant?.id    ?? null,
      name:     rawName || "Usuario",
      initials,
      photo:    item.postulant?.photo ?? "",
    },
  };
}

/* ════════════════════════════════════════════════════════
   API CALLS
════════════════════════════════════════════════════════ */

/**
 * Obtiene la lista de sugerencias con filtros opcionales.
 *
 * Filtros soportados (todos opcionales):
 *   search    string   Búsqueda libre
 *   type      string   'agregar' | 'idea' | 'mejora' | 'eliminar'  (omitir para "todos")
 *   date_from string   YYYY-MM-DD
 *   date_to   string   YYYY-MM-DD
 */
export async function fetchSugerencias(filters = {}, options = {}) {
  const query    = toQueryString(filters);
  const endpoint = query ? `suggestions?${query}` : "suggestions";

  const response = await apiClient.get(endpoint, {
    signal:          options.signal,
    fallbackMessage: "No se pudieron cargar las sugerencias.",
  });

  const items = Array.isArray(response?.items)
    ? response.items.map(normalizeSugerencia)
    : [];

  return {
    items,
    meta: response?.meta ?? { total: items.length },
    raw:  response,
  };
}

/* ════════════════════════════════════════════════════════
   ✅ NUEVO — Contexto de una sugerencia
   GET /suggestions/{id}/context
   Retorna: { suggestion, attended, postulant_history, profile }
     - attended.exists       bool
     - attended.state        'pending' | 'accepted' | 'rejected' | ...
     - attended.state_label  string legible
     - attended.admin        { id, name } | null
     - attended.created_at   string formateado | null
     - attended.updated_at   string formateado | null
     - attended.note         string | null
     - postulant_history.total_activas   number
     - postulant_history.in_discussion   number
     - postulant_history.escaladas       number
════════════════════════════════════════════════════════ */
export async function fetchSuggestionContext(sugerenciaId, options = {}) {
  const response = await apiClient.get(
    `suggestions/${sugerenciaId}/context`,
    {
      signal:          options.signal,
      fallbackMessage: "No se pudo obtener el contexto de la sugerencia.",
    }
  );

  // Normalizar la sugerencia dentro del contexto si viene en el payload
  if (response?.suggestion) {
    response.suggestion = normalizeSugerencia(response.suggestion);
  }

  return response;
}

/**
 * Acepta una sugerencia.
 * POST /suggestions/{id}/accept
 */
export async function acceptSugerencia(sugerenciaId, note = null) {
  return apiClient.post(
    `suggestions/${sugerenciaId}/accept`,
    { 
      administrator_profile_id: resolveAdministratorProfileId(),
      note: note || null,
    },
    { fallbackMessage: "No se pudo aceptar la sugerencia." }
  );
}

/**
 * Rechaza una sugerencia.
 * POST /suggestions/{id}/reject
 */
export async function rejectSugerencia(sugerenciaId, note = null) {
  return apiClient.post(
    `suggestions/${sugerenciaId}/reject`,
    { 
      administrator_profile_id: resolveAdministratorProfileId(),
      note: note || null,
    },
    { fallbackMessage: "No se pudo rechazar la sugerencia." }
  );
}

/**
 * Marca una sugerencia como en discusión.
 * POST /suggestions/{id}/discuss
 */
export async function discussSugerencia(sugerenciaId, note = null) {
  return apiClient.post(
    `suggestions/${sugerenciaId}/discuss`,
    { 
      administrator_profile_id: resolveAdministratorProfileId(),
      note: note || null,
    },
    { fallbackMessage: "No se pudo marcar la sugerencia como en discusión." }
  );
}

/**
 * Escala una sugerencia a un nivel superior.
 * POST /suggestions/{id}/escalate
 */
export async function escalateSugerencia(sugerenciaId, note = null) {
  return apiClient.post(
    `suggestions/${sugerenciaId}/escalate`,
    { 
      administrator_profile_id: resolveAdministratorProfileId(),
      note: note || null,
    },
    { fallbackMessage: "No se pudo escalar la sugerencia." }
  );
}

/**
 * Ignora una sugerencia.
 * POST /suggestions/{id}/ignore
 */
export async function ignoreSugerencia(sugerenciaId, note = null) {
  return apiClient.post(
    `suggestions/${sugerenciaId}/ignore`,
    { 
      administrator_profile_id: resolveAdministratorProfileId(),
      note: note || null,
    },
    { fallbackMessage: "No se pudo ignorar la sugerencia." }
  );
}