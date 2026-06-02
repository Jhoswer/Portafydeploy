import { apiClient } from "./http/httpClient";
import { getStoredUser } from "./sessionService";

const translate = (t, key, fallback) => (typeof t === "function" ? t(key) : fallback);

// ── Funciones UI que reciben t() ─────────────────────────────────────────────
// Llama estas desde los componentes: getReportTypeOptions(t), etc.

export function getReportTypeOptions(t) {
  return [
    { key: "todos",              label: translate(t, "adminReports.reportTypes.todos", "Todos") },
    { key: "hate_incitement",    label: translate(t, "adminReports.reportTypes.hate_incitement", "Incitacion al odio") },
    { key: "impersonation",      label: translate(t, "adminReports.reportTypes.impersonation", "Suplantacion") },
    { key: "prohibited_content", label: translate(t, "adminReports.reportTypes.prohibited_content", "Contenido Prohibido") },
    { key: "violence",           label: translate(t, "adminReports.reportTypes.violence", "Violencia") },
    { key: "terrorism",          label: translate(t, "adminReports.reportTypes.terrorism", "Terrorismo") },
    { key: "spam",               label: translate(t, "adminReports.reportTypes.spam", "Spam") },
  ];
}

export function getReportRefTypeOptions(t) {
  return [
    { key: "todos",     label: translate(t, "adminReports.reportRefTypes.todos", "Todos") },
    { key: "comment",   label: translate(t, "adminReports.reportRefTypes.comment", "Comentario") },
    { key: "group",     label: translate(t, "adminReports.reportRefTypes.group", "Grupo") },
    { key: "message",   label: translate(t, "adminReports.reportRefTypes.message", "Mensaje") },
    { key: "portfolio", label: translate(t, "adminReports.reportRefTypes.portfolio", "Portafolio") },
    { key: "profile",   label: translate(t, "adminReports.reportRefTypes.profile", "Perfil") },
    { key: "project",   label: translate(t, "adminReports.reportRefTypes.project", "Proyecto") },
    { key: "post",      label: translate(t, "adminReports.reportRefTypes.post", "Publicacion") },
    { key: "reply",     label: translate(t, "adminReports.reportRefTypes.reply", "Respuesta") },
  ];
}

// ── Constantes internas (van al backend — NO traducir) ────────────────────────

const REPORT_REASON_PAYLOAD = {
  hate_incitement:    "Incitacion al odio",
  impersonation:      "Suplantacion",
  prohibited_content: "Contenido Prohibido",
  violence:           "Violencia",
  terrorism:          "Terrorismo",
  spam:               "Spam",
};

const REPORT_TYPE_VALUE_MAP = {
  hate_incitement:    "Incitacion al odio",
  impersonation:      "Suplantacion",
  prohibited_content: "Contenido Prohibido",
  violence:           "Violencia",
  terrorism:          "Terrorismo",
  spam:               "Spam",
};

const MOTIVO_KEY_MAP = {
  "Incitacion al odio":  "hate_incitement",
  "Suplantacion":        "impersonation",
  "Contenido Prohibido": "prohibited_content",
  "Comtenido Prohibido": "prohibited_content", // typo en la BD
  "Violencia":           "violence",
  "Terrorismo":          "terrorism",
  "Spam":                "spam",
};

// ── Meta visual — badges/clases (labels se resuelven con t() en componentes) ──

export const MOTIVO_META = {
  hate_incitement: {
    labelKey:    "adminReports.reportTypes.hate_incitement",
    badgeKey:    "adminReports.motivoBadge.critico",
    badgeClass:  "badge--critico",
    avatarClass: "report-avatar--critico",
  },
  impersonation: {
    labelKey:    "adminReports.reportTypes.impersonation",
    badgeKey:    "adminReports.motivoBadge.pendiente",
    badgeClass:  "badge--pendiente",
    avatarClass: "report-avatar--pendiente",
  },
  prohibited_content: {
    labelKey:    "adminReports.reportTypes.prohibited_content",
    badgeKey:    "adminReports.motivoBadge.pendiente",
    badgeClass:  "badge--pendiente",
    avatarClass: "report-avatar--pendiente",
  },
  violence: {
    labelKey:    "adminReports.reportTypes.violence",
    badgeKey:    "adminReports.motivoBadge.abierto",
    badgeClass:  "badge--abierto",
    avatarClass: "report-avatar--abierto",
  },
  terrorism: {
    labelKey:    "adminReports.reportTypes.terrorism",
    badgeKey:    "adminReports.motivoBadge.critico",
    badgeClass:  "badge--critico",
    avatarClass: "report-avatar--critico",
  },
  spam: {
    labelKey:    "adminReports.reportTypes.spam",
    badgeKey:    "adminReports.motivoBadge.pendiente",
    badgeClass:  "badge--pendiente",
    avatarClass: "report-avatar--pendiente",
  },
};

// ── Helpers internos ──────────────────────────────────────────────────────────

function toQueryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    const normalized = typeof value === "string" ? value.trim() : value;
    if (normalized !== "" && normalized != null) params.set(key, String(normalized));
  });
  return params.toString();
}

function formatDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(parsed);
}

function resolveMeta(motivo) {
  const key = MOTIVO_KEY_MAP[motivo] || motivo;
  return MOTIVO_META[key] ?? {
    labelKey:    "adminReports.reportTypes.spam", // fallback genérico
    badgeKey:    "adminReports.motivoBadge.abierto",
    badgeClass:  "badge--abierto",
    avatarClass: "report-avatar--abierto",
  };
}

export function normalizeReport(report = {}) {
  const meta = resolveMeta(report.motivo);

  return {
    ...report,
    meta,
    refType:       report.ref_type || "General",
    formattedDate: formatDate(report.created_at),
    reported_user: {
      id:       report.reported_user?.id       ?? null,
      name:     report.reported_user?.name     || null, // null → componente usa t()
      initials: report.reported_user?.initials || "UR",
      photo:    report.reported_user?.photo    || "",
    },
    reporter_user: {
      id:       report.reporter_user?.id       ?? null,
      name:     report.reporter_user?.name     || null,
      initials: report.reporter_user?.initials || "US",
      photo:    report.reporter_user?.photo    || "",
    },
  };
}

// ── API calls (strings al backend sin cambios) ────────────────────────────────

export async function fetchReports(filters = {}, options = {}) {
  const normalizedFilters = { ...filters };
  if (normalizedFilters.motivo && normalizedFilters.motivo !== "todos") {
    normalizedFilters.motivo = REPORT_TYPE_VALUE_MAP[normalizedFilters.motivo] ?? normalizedFilters.motivo;
  }
  const query    = toQueryString(normalizedFilters);
  const endpoint = query ? `reports?${query}` : "reports";
  const response = await apiClient.get(endpoint, {
    signal: options.signal,
    fallbackMessage: "No se pudieron cargar los reportes.",
  });
  const items = Array.isArray(response?.items) ? response.items.map(normalizeReport) : [];
  return { items, meta: response?.meta ?? { total: items.length }, raw: response };
}

export function getPublicationReportReasons(t) {
  return getReportTypeOptions(t).filter((option) => option.key !== "todos");
}

export async function createPublicationReport(publicationId, payload = {}) {
  const motivo = REPORT_REASON_PAYLOAD[payload.motivo] || payload.motivo;
  return apiClient.post(`reports/publications/${publicationId}`, {
    motivo, description: payload.description || "", tests_url: payload.tests_url || "",
  }, { fallbackMessage: "No se pudo enviar el reporte." });
}

export async function createCommentReport(commentId, payload = {}) {
  const motivo = REPORT_REASON_PAYLOAD[payload.motivo] || payload.motivo;
  return apiClient.post(`reports/comments/${commentId}`, {
    motivo, description: payload.description || "", tests_url: payload.tests_url || "",
  }, { fallbackMessage: "No se pudo enviar el reporte de comentario." });
}

function resolveAdministratorProfileId() {
  const user = getStoredUser();
  return user?.id_profile || user?.profile_id || user?.profileId
    || user?.profile?.id_profile || user?.profile?.id || user?.id || null;
}

function buildAttendPayload(state, payload = {}) {
  return {
    administrator_profile_id: resolveAdministratorProfileId(),
    state,
    action_taken: payload.action_taken || "",
    test_url:     payload.test_url     || "",
  };
}

export async function rejectReport(reportId) {
  return apiClient.post(`reports/${reportId}/reject`,
    { administrator_profile_id: resolveAdministratorProfileId() },
    { fallbackMessage: "No se pudo registrar la eliminacion del reporte." }
  );
}

export async function attendReport(reportId, state, payload = {}) {
  return apiClient.post(`reports/${reportId}/attend`,
    buildAttendPayload(state, payload),
    { fallbackMessage: "No se pudo registrar la atencion del reporte." }
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
