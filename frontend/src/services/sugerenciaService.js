/**
 * sugerenciaService.js
 * Los valores de `type` coinciden exactamente con el ENUM de la tabla SUGGESTION en BD:
 *   ENUM('agregar', 'idea', 'mejora', 'eliminar')
 */

import { apiClient }     from "./http/httpClient";
import { getStoredUser } from "./sessionService";

/* ════════════════════════════════════════════════════════
   FUNCIONES UI — reciben t() desde los componentes
════════════════════════════════════════════════════════ */

export function getSugerenciaTypeOptions(t) {
  return [
    { key: "todos",    label: t("adminSugerencias.typeOptions.todos")    },
    { key: "agregar",  label: t("adminSugerencias.typeOptions.agregar")  },
    { key: "idea",     label: t("adminSugerencias.typeOptions.idea")     },
    { key: "mejora",   label: t("adminSugerencias.typeOptions.mejora")   },
    { key: "eliminar", label: t("adminSugerencias.typeOptions.eliminar") },
  ];
}

/* ════════════════════════════════════════════════════════
   METADATOS VISUALES POR TIPO
   labelKey / badgeKey → claves i18n; clases CSS sin cambios
════════════════════════════════════════════════════════ */
export const TYPE_META = {
  agregar: {
    labelKey:    "adminSugerencias.typeMeta.agregar",
    badgeKey:    "adminSugerencias.typeMeta.agregar",
    badgeClass:  "badge--blue",
    avatarClass: "sugerencia-avatar--agregar",
  },
  idea: {
    labelKey:    "adminSugerencias.typeMeta.idea",
    badgeKey:    "adminSugerencias.typeMeta.idea",
    badgeClass:  "badge--purple",
    avatarClass: "sugerencia-avatar--idea",
  },
  mejora: {
    labelKey:    "adminSugerencias.typeMeta.mejora",
    badgeKey:    "adminSugerencias.typeMeta.mejora",
    badgeClass:  "badge--abierto",
    avatarClass: "sugerencia-avatar--mejora",
  },
  eliminar: {
    labelKey:    "adminSugerencias.typeMeta.eliminar",
    badgeKey:    "adminSugerencias.typeMeta.eliminar",
    badgeClass:  "badge--critico",
    avatarClass: "sugerencia-avatar--eliminar",
  },
};

// ATTENDED_STATE_LABELS ya no hace falta como objeto —
// los componentes usan t("adminSugerencias.stateBadge.{state}") directamente.

/* ════════════════════════════════════════════════════════
   HELPERS INTERNOS — sin cambios
════════════════════════════════════════════════════════ */

function toQueryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    const normalized = typeof value === "string" ? value.trim() : value;
    if (normalized !== "" && normalized != null && normalized !== "todos") {
      params.set(key, String(normalized));
    }
  });
  return params.toString();
}

function resolveMeta(type) {
  return (
    TYPE_META[type] ?? {
      labelKey:    "adminSugerencias.typeMeta.fallback",
      badgeKey:    "adminSugerencias.stateBadge.pending",
      badgeClass:  "badge--pendiente",
      avatarClass: "sugerencia-avatar--idea",
    }
  );
}

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
   NORMALIZACIÓN — sin cambios excepto fallback de name
════════════════════════════════════════════════════════ */

export function normalizeSugerencia(item = {}) {
  const meta = resolveMeta(item.type);

  const rawName  = item.postulant?.name ?? "";
  const initials = item.postulant?.initials ||
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
      name:     rawName || null, // null → el componente usa t()
      initials,
      photo:    item.postulant?.photo ?? "",
    },
  };
}

/* ════════════════════════════════════════════════════════
   API CALLS — sin cambios
════════════════════════════════════════════════════════ */

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
  return { items, meta: response?.meta ?? { total: items.length }, raw: response };
}

export async function fetchSuggestionContext(sugerenciaId, options = {}) {
  const response = await apiClient.get(
    `suggestions/${sugerenciaId}/context`,
    { signal: options.signal, fallbackMessage: "No se pudo obtener el contexto de la sugerencia." }
  );
  if (response?.suggestion) {
    response.suggestion = normalizeSugerencia(response.suggestion);
  }
  return response;
}

export async function acceptSugerencia(sugerenciaId, note = null) {
  return apiClient.post(`suggestions/${sugerenciaId}/accept`,
    { administrator_profile_id: resolveAdministratorProfileId(), note: note || null },
    { fallbackMessage: "No se pudo aceptar la sugerencia." }
  );
}

export async function rejectSugerencia(sugerenciaId, note = null) {
  return apiClient.post(`suggestions/${sugerenciaId}/reject`,
    { administrator_profile_id: resolveAdministratorProfileId(), note: note || null },
    { fallbackMessage: "No se pudo rechazar la sugerencia." }
  );
}

export async function discussSugerencia(sugerenciaId, note = null) {
  return apiClient.post(`suggestions/${sugerenciaId}/discuss`,
    { administrator_profile_id: resolveAdministratorProfileId(), note: note || null },
    { fallbackMessage: "No se pudo marcar la sugerencia como en discusión." }
  );
}

export async function escalateSugerencia(sugerenciaId, note = null) {
  return apiClient.post(`suggestions/${sugerenciaId}/escalate`,
    { administrator_profile_id: resolveAdministratorProfileId(), note: note || null },
    { fallbackMessage: "No se pudo escalar la sugerencia." }
  );
}

export async function ignoreSugerencia(sugerenciaId, note = null) {
  return apiClient.post(`suggestions/${sugerenciaId}/ignore`,
    { administrator_profile_id: resolveAdministratorProfileId(), note: note || null },
    { fallbackMessage: "No se pudo ignorar la sugerencia." }
  );
}