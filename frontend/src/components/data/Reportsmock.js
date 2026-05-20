/**
 * reportsMock.js
 * Datos de prueba derivados del INSERT INTO "REPORT".
 * Ubicación: src/components/admin/data/reportsMock.js
 *
 * Campos del INSERT original:
 * id_comment, id_response, id_profile, id_publication,
 * id_project, id_message, id_group, id_reported_user,
 * id_portfolio, description, tests_url, created_at, motivo
 */

export const MOTIVO_META = {
  hate_incitement: {
    label: "Incitación al odio",
    badge: "Crítico",
    badgeClass: "badge--critico",
    color: "#c62525",
    bg: "#fff0f0",
    initials: "⚠",
    avatarClass: "report-avatar--critico",
  },
  impersonation: {
    label: "Suplantación",
    badge: "Pendiente",
    badgeClass: "badge--pendiente",
    color: "#b45309",
    bg: "#fffbeb",
    initials: null, // usa iniciales del reportado
    avatarClass: "report-avatar--pendiente",
  },
  violence: {
    label: "Violencia",
    badge: "Abierto",
    badgeClass: "badge--abierto",
    color: "#1d4ed8",
    bg: "#eff6ff",
    initials: null,
    avatarClass: "report-avatar--abierto",
  },
};

/** Devuelve "Perfil", "Proyecto", etc. según qué campo está relleno */
function resolveRefType(report) {
  if (report.id_profile)     return "Perfil";
  if (report.id_project)     return "Proyecto";
  if (report.id_publication) return "Publicación";
  if (report.id_comment)     return "Comentario";
  if (report.id_message)     return "Mensaje";
  return "General";
}

const RAW = [
  {
    id: 1,
    id_comment: null, id_response: null,
    id_profile: 1,   id_publication: null,
    id_project: null, id_message: null,
    id_group: null,  id_reported_user: 9,
    id_portfolio: null,
    description: "Esta persona tiene foto de perfil de una esvástica.",
    tests_url: "",
    created_at: "2026-04-23T10:15:00",
    motivo: "hate_incitement",
    // datos ficticios del usuario reportado
    reported_user: { initials: "JL", name: "Jorge L." },
    reporter_user: { initials: "AM", name: "Ana M." },
  },
  {
    id: 2,
    id_comment: null, id_response: null,
    id_profile: 2,   id_publication: null,
    id_project: null, id_message: null,
    id_group: null,  id_reported_user: 3,
    id_portfolio: null,
    description: "Este usuario ha suplantado mi identidad. Suspéndanle la cuenta.",
    tests_url: "",
    created_at: "2026-04-22T14:30:00",
    motivo: "impersonation",
    reported_user: { initials: "DP", name: "Diego P." },
    reporter_user: { initials: "MC", name: "María C." },
  },
  {
    id: 3,
    id_comment: null, id_response: null,
    id_profile: 6,   id_publication: null,
    id_project: null, id_message: null,
    id_group: null,  id_reported_user: 3,
    id_portfolio: null,
    description: "El usuario está suplantando mi propia identidad. Tomen acción cuanto antes.",
    tests_url: "",
    created_at: "2026-04-21T09:45:00",
    motivo: "impersonation",
    reported_user: { initials: "DP", name: "Diego P." },
    reporter_user: { initials: "LR", name: "Laura R." },
  },
  {
    id: 4,
    id_comment: null, id_response: null,
    id_profile: null, id_publication: null,
    id_project: 1,   id_message: null,
    id_group: null,  id_reported_user: 8,
    id_portfolio: null,
    description: "En su proyecto dice que necesita personas con experiencia golpeando personas.",
    tests_url: "",
    created_at: "2026-04-17T18:20:00",
    motivo: "violence",
    reported_user: { initials: "RV", name: "Roberto V." },
    reporter_user: { initials: "KS", name: "Karen S." },
  },
];

/** Datos enriquecidos listos para consumir en componentes */
export const REPORTS_MOCK = RAW.map((r) => ({
  ...r,
  refType: resolveRefType(r),
  meta: MOTIVO_META[r.motivo] ?? MOTIVO_META.violence,
  formattedDate: new Date(r.created_at).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
}));

/** Opciones del dropdown de tipo (para AdminFilterBar) */
export const REPORT_TYPE_OPTIONS = [
  { key: "todos",           label: "Todos"              },
  { key: "hate_incitement", label: "Incitación al odio" },
  { key: "impersonation",   label: "Suplantación"       },
  { key: "violence",        label: "Violencia"          },
  { key: "spam",            label: "Spam"               },
  { key: "other",           label: "Otro"               },
];