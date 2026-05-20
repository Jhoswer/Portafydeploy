const STATE_LABELS = {
  activate: "Activado",
  deactivate: "Desactivado",
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
};

const SKILL_TYPE_LABELS = {
  soft: "Blanda",
  hard: "Dura",
};

export function getStateLabel(state) {
  return STATE_LABELS[state] ?? state ?? "Sin estado";
}

export function getSkillTypeLabel(type) {
  return SKILL_TYPE_LABELS[type] ?? type ?? "Sin tipo";
}
