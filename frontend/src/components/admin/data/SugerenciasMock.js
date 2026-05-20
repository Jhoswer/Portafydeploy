/**
 * sugerenciasMock.js
 * Datos de prueba derivados del INSERT INTO "SUGGESTION".
 * Ubicación: src/components/admin/data/sugerenciasMock.js
 *
 * Tabla SUGGESTION: id_suggestion, id_profile, description,
 * type (agregar|idea|mejora|eliminar), created_at, updated_at
 *
 * Tabla ATTENDED registra la acción tomada por el admin:
 * state: ignored | accepted | rejected | deleted | in_discussion | higher
 */

export const SUGGESTION_TYPE_META = {
  agregar: {
    label:       "Nueva funcionalidad",
    badge:       "Nueva funcionalidad",
    badgeClass:  "badge--blue",
    avatarClass: "sug-avatar--agregar",
    avatarIcon:  "✦",
  },
  idea: {
    label:       "Idea",
    badge:       "Idea",
    badgeClass:  "badge--purple",
    avatarClass: "sug-avatar--idea",
    avatarIcon:  "💡",
  },
  mejora: {
    label:       "Mejora",
    badge:       "Mejora",
    badgeClass:  "badge--abierto",
    avatarClass: "sug-avatar--mejora",
    avatarIcon:  "↑",
  },
  eliminar: {
    label:       "Eliminar funcionalidad",
    badge:       "Eliminar",
    badgeClass:  "badge--critico",
    avatarClass: "sug-avatar--eliminar",
    avatarIcon:  "✕",
  },
};

/** Resuelve meta por type, con fallback seguro */
function resolveMeta(type) {
  return SUGGESTION_TYPE_META[type] ?? {
    label:       "Sugerencia",
    badge:       "Pendiente",
    badgeClass:  "badge--pendiente",
    avatarClass: "sug-avatar--idea",
    avatarIcon:  "?",
  };
}

const RAW = [
  {
    id: 1,
    id_suggestion: 1,
    id_profile: 2,
    description: "Idea para integrar autenticación con Google",
    type: "idea",
    created_at: "2026-04-23T10:15:00",
    updated_at: "2026-04-23T10:15:00",
    // datos del perfil que hizo la sugerencia (viene del JOIN con PROFILE)
    postulant: {
      id:       2,
      name:     "María Chen",
      initials: "MC",
      photo:    "",
    },
  },
  {
    id: 2,
    id_suggestion: 2,
    id_profile: 3,
    description: "Mejorar el rendimiento del sistema en búsquedas avanzadas con múltiples filtros activos",
    type: "mejora",
    created_at: "2026-04-22T14:30:00",
    updated_at: "2026-04-22T14:30:00",
    postulant: {
      id:       3,
      name:     "Juan Rodríguez",
      initials: "JR",
      photo:    "",
    },
  },
  {
    id: 3,
    id_suggestion: 3,
    id_profile: 4,
    description: "Eliminar funcionalidad obsoleta de reportes manuales en PDF, ya no se usa desde la migración",
    type: "eliminar",
    created_at: "2026-04-21T09:45:00",
    updated_at: "2026-04-21T09:45:00",
    postulant: {
      id:       4,
      name:     "Laura Pérez",
      initials: "LP",
      photo:    "",
    },
  },
  {
    id: 4,
    id_suggestion: 4,
    id_profile: 5,
    description: "Agregar sección de portafolio descargable en formato PDF para compartir con reclutadores",
    type: "agregar",
    created_at: "2026-04-20T16:00:00",
    updated_at: "2026-04-20T16:00:00",
    postulant: {
      id:       5,
      name:     "Carlos Medina",
      initials: "CM",
      photo:    "",
    },
  },
];

/** Datos enriquecidos listos para consumir en componentes */
export const SUGERENCIAS_MOCK = RAW.map((s) => ({
  ...s,
  meta: resolveMeta(s.type),
  formattedDate: new Date(s.created_at).toLocaleDateString("es-BO", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }),
}));

/**
 * Opciones de filtro por tipo para AdminFilterBar.
 * Coincide con SUGERENCIA_TYPE_OPTIONS del service real.
 */
export const SUGERENCIA_FILTER_OPTIONS = [
  { key: "todos",    label: "Todos"                  },
  { key: "agregar",  label: "Nueva funcionalidad"    },
  { key: "idea",     label: "Idea"                   },
  { key: "mejora",   label: "Mejora"                 },
  { key: "eliminar", label: "Eliminar funcionalidad" },
];