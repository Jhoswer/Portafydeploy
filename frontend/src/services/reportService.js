import { apiClient } from "./http/httpClient";
import { getStoredUser } from "./sessionService";

export const REPORT_TYPE_OPTIONS = [
  { key: "todos", label: "Todos" },
  { key: "hate_incitement", label: "Incitacion al odio" },
  { key: "impersonation", label: "Suplantacion" },
  { key: "prohibited_content", label: "Contenido Prohibido" },
  { key: "violence", label: "Violencia" },
  { key: "terrorism", label: "Terrorismo" },
  { key: "spam", label: "Spam" },
];

const REPORT_REASON_PAYLOAD = {
  hate_incitement: "Incitacion al odio",
  impersonation: "Suplantacion",
  prohibited_content: "Contenido Prohibido",
  violence: "Violencia",
  terrorism: "Terrorismo",
  spam: "Spam",
};

export const REPORT_REF_TYPE_OPTIONS = [
  { key: "todos", label: "Todos" },
  { key: "comment", label: "Comentario" },
  { key: "group", label: "Grupo" },
  { key: "message", label: "Mensaje" },
  { key: "portfolio", label: "Portafolio" },
  { key: "profile", label: "Perfil" },
  { key: "project", label: "Proyecto" },
  { key: "post", label: "Publicacion" },
  { key: "reply", label: "Respuesta" },
];

const REPORT_TYPE_VALUE_MAP = {
  hate_incitement: "Incitacion al odio",
  impersonation: "Suplantacion",
  prohibited_content: "Contenido Prohibido",
  violence: "Violencia",
  terrorism: "Terrorismo",
  spam: "Spam",
};

export const MOTIVO_META = {
  hate_incitement: {
    label: "Incitacion al odio",
    badge: "Critico",
    badgeClass: "badge--critico",
    avatarClass: "report-avatar--critico",
  },
  impersonation: {
    label: "Suplantacion",
    badge: "Pendiente",
    badgeClass: "badge--pendiente",
    avatarClass: "report-avatar--pendiente",
  },
  prohibited_content: {
    label: "Contenido Prohibido",
    badge: "Pendiente",
    badgeClass: "badge--pendiente",
    avatarClass: "report-avatar--pendiente",
  },
  violence: {
    label: "Violencia",
    badge: "Abierto",
    badgeClass: "badge--abierto",
    avatarClass: "report-avatar--abierto",
  },
  terrorism: {
    label: "Terrorismo",
    badge: "Critico",
    badgeClass: "badge--critico",
    avatarClass: "report-avatar--critico",
  },
  spam: {
    label: "Spam",
    badge: "Pendiente",
    badgeClass: "badge--pendiente",
    avatarClass: "report-avatar--pendiente",
  },
};

function toQueryString(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const normalized = typeof value === "string" ? value.trim() : value;
    if (normalized !== "" && normalized != null) {
      params.set(key, String(normalized));
    }
  });

  return params.toString();
}

function formatDate(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

// Mapeo de valores de BD (español) a keys (inglés)
const MOTIVO_KEY_MAP = {
  "Incitacion al odio": "hate_incitement",
  "Suplantacion": "impersonation",
  "Contenido Prohibido": "prohibited_content",
  "Comtenido Prohibido": "prohibited_content", // typo en la BD
  "Violencia": "violence",
  "Terrorismo": "terrorism",
  "Spam": "spam",
};

function resolveMeta(motivo) {
  // Buscar primero por key directa, luego por mapeo de valores español
  const key = MOTIVO_KEY_MAP[motivo] || motivo;
  return MOTIVO_META[key] ?? {
    label: motivo || "Reporte",
    badge: "Abierto",
    badgeClass: "badge--abierto",
    avatarClass: "report-avatar--abierto",
  };
}

export function normalizeReport(report = {}) {
  const meta = resolveMeta(report.motivo);

  return {
    ...report,
    meta,
    refType: report.ref_type || "General",
    formattedDate: formatDate(report.created_at),
    reported_user: {
      id: report.reported_user?.id ?? null,
      name: report.reported_user?.name || "Usuario reportado",
      initials: report.reported_user?.initials || "UR",
      photo: report.reported_user?.photo || "",
    },
    reporter_user: {
      id: report.reporter_user?.id ?? null,
      name: report.reporter_user?.name || "Usuario",
      initials: report.reporter_user?.initials || "US",
      photo: report.reporter_user?.photo || "",
    },
  };
}

export async function fetchReports(filters = {}, options = {}) {
  const normalizedFilters = { ...filters };

  if (normalizedFilters.motivo && normalizedFilters.motivo !== "todos") {
    normalizedFilters.motivo = REPORT_TYPE_VALUE_MAP[normalizedFilters.motivo] ?? normalizedFilters.motivo;
  }

  const query = toQueryString(normalizedFilters);
  const endpoint = query ? `reports?${query}` : "reports";
  const response = await apiClient.get(endpoint, {
    signal: options.signal,
    fallbackMessage: "No se pudieron cargar los reportes.",
  });

  const items = Array.isArray(response?.items) ? response.items.map(normalizeReport) : [];

  return {
    items,
    meta: response?.meta ?? { total: items.length },
    raw: response,
  };
}

export function getPublicationReportReasons() {
  return REPORT_TYPE_OPTIONS.filter((option) => option.key !== "todos");
}

export async function createPublicationReport(publicationId, payload = {}) {
  const motivo = REPORT_REASON_PAYLOAD[payload.motivo] || payload.motivo;

  return apiClient.post(
    `reports/publications/${publicationId}`,
    {
      motivo,
      description: payload.description || "",
      tests_url: payload.tests_url || "",
    },
    {
      fallbackMessage: "No se pudo enviar el reporte.",
    }
  );
}

function resolveAdministratorProfileId() {
  const user = getStoredUser();

  return (
    user?.id_profile ||
    user?.profile_id ||
    user?.profileId ||
    user?.profile?.id_profile ||
    user?.profile?.id ||
    user?.id ||
    null
  );
}

function buildAttendPayload(state, payload = {}) {
  return {
    administrator_profile_id: resolveAdministratorProfileId(),
    state,
    action_taken: payload.action_taken || "",
    test_url: payload.test_url || "",
  };
}

export async function rejectReport(reportId) {
  return apiClient.post(
    `reports/${reportId}/reject`,
    {
      administrator_profile_id: resolveAdministratorProfileId(),
    },
    {
      fallbackMessage: "No se pudo registrar la eliminacion del reporte.",
    }
  );
}

export async function attendReport(reportId, state, payload = {}) {
  return apiClient.post(
    `reports/${reportId}/attend`,
    buildAttendPayload(state, payload),
    {
      fallbackMessage: "No se pudo registrar la atencion del reporte.",
    }
  );
}

export function acceptReport(reportId, payload = {}) {
  return attendReport(reportId, "accepted", {
    action_taken: payload.action_taken || "Reporte aceptado por administrador.",
    test_url: payload.test_url || "",
  });
}

export function ignoreReport(reportId) {
  return attendReport(reportId, "ignored", {
    action_taken: "Reporte ignorado por administrador.",
    test_url: "",
  });
}

export function redirectReport(reportId) {
  return attendReport(reportId, "higher", {
    action_taken: "Reporte redirigido a otro administrador.",
    test_url: "",
  });
}
