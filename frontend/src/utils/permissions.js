export const PERMISSION_NAMES = {
  FEED_COMMENT: "feed_comment",
  FEED_REACT: "feed_react",
  FEED_PUBLISH: "feed_publish",
  OFFER_PUBLISH: "offer_publish",
};

const PERMISSION_LABELS = {
  [PERMISSION_NAMES.FEED_COMMENT]: "Comentar publicaciones",
  [PERMISSION_NAMES.FEED_REACT]: "Reaccionar a publicaciones",
  [PERMISSION_NAMES.FEED_PUBLISH]: "Publicar en el feed",
  [PERMISSION_NAMES.OFFER_PUBLISH]: "Publicar ofertas de trabajo",
};

export function hasPermission(user, permissionName) {
  if (!user) return false;
  const permissions = Array.isArray(user.active_permissions) ? user.active_permissions : [];
  return permissions.includes(permissionName);
}

export function permissionLabel(permissionName) {
  return PERMISSION_LABELS[permissionName] || permissionName;
}

export function permissionNamesForRole(role) {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "reclutador") {
    return [
      PERMISSION_NAMES.FEED_COMMENT,
      PERMISSION_NAMES.FEED_REACT,
      PERMISSION_NAMES.FEED_PUBLISH,
      PERMISSION_NAMES.OFFER_PUBLISH,
    ];
  }

  if (normalized === "profesional") {
    return [
      PERMISSION_NAMES.FEED_COMMENT,
      PERMISSION_NAMES.FEED_REACT,
      PERMISSION_NAMES.FEED_PUBLISH,
    ];
  }

  return Object.values(PERMISSION_NAMES);
}
