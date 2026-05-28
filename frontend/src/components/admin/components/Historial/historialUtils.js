export const TABLAS = [
  "Todos",
  "PROFILE",
  "USER",
  "SKILL",
  "CERTIFICATE",
  "EXPERIENCE",
  "PROJECT",
  "OFFER",
  "PORTFOLIO",
  "PUBLICATION",
  "UNIVERSITY_CAREER",
  "SOCIAL_NETWORK",
  "CV",
];

export const TIPOS = [
  { value: "", label: "Todos" },
  { value: "create", label: "Creado" },
  { value: "update", label: "Editado" },
  { value: "delete", label: "Eliminado" },
];

export const ROL_CONFIG = {
  "super administrador": {
    color: "#7c3aed",
    bg: "rgba(124,58,237,.12)",
    label: "Super Admin",
  },
  administrador: {
    color: "#ef5759",
    bg: "rgba(239,87,89,.12)",
    label: "Admin",
  },
  reclutador: {
    color: "#0284c7",
    bg: "rgba(2,132,199,.12)",
    label: "Reclutador",
  },
  profesional: {
    color: "#059669",
    bg: "rgba(5,150,105,.12)",
    label: "Profesional",
  },
};

export const ROL_DEFAULT = {
  color: "#64748b",
  bg: "rgba(100,116,139,.12)",
  label: "Usuario",
};

export const TIPO_STYLES = {
  create: { label: "Creado", color: "#059669", bg: "rgba(5,150,105,.10)" },
  update: { label: "Editado", color: "#0284c7", bg: "rgba(2,132,199,.10)" },
  delete: { label: "Eliminado", color: "#ef5759", bg: "rgba(239,87,89,.10)" },
};

export const AVATAR_PALETTE = [
  { bg: "#FEE2E2", fg: "#B91C1C" },
  { bg: "#DBEAFE", fg: "#1D4ED8" },
  { bg: "#D1FAE5", fg: "#065F46" },
  { bg: "#EDE9FE", fg: "#6D28D9" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#FCE7F3", fg: "#9D174D" },
];

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function avatarColor(name = "") {
  if (!name) return AVATAR_PALETTE[0];
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

export function getUsuarioId(usuario) {
  return usuario?.id ?? usuario?.id_user ?? null;
}

export function getHistorialFullName(usuario) {
  const nombre = firstNonEmpty(usuario?.nombre, usuario?.name, "Usuario");
  const apellido = firstNonEmpty(usuario?.apellido, usuario?.last_name);
  return `${nombre} ${apellido}`.trim();
}

export function getHistorialInitials(usuario) {
  const fullName = getHistorialFullName(usuario);
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getHistorialPhoto(usuario) {
  return firstNonEmpty(
    usuario?.foto_perfil_url,
    usuario?.foto_perfil,
    usuario?.profile_photo,
    usuario?.photo,
    usuario?.avatar,
    usuario?.fotoPerfil,
    usuario?.profilePhoto
  );
}

export function normalizeHistorialUsuario(usuario) {
  if (!usuario) return null;

  const fotoPerfil = getHistorialPhoto(usuario);
  return {
    ...usuario,
    id: getUsuarioId(usuario),
    nombre: usuario?.nombre ?? usuario?.name ?? "Usuario",
    apellido: usuario?.apellido ?? usuario?.last_name ?? "",
    email: usuario?.email ?? usuario?.correo ?? "",
    rol: usuario?.rol ?? usuario?.role ?? "usuario",
    profesion: usuario?.profesion ?? usuario?.cargo ?? "",
    ubicacion: usuario?.ubicacion ?? usuario?.ciudad ?? "",
    biografia: usuario?.biografia ?? usuario?.bio ?? "",
    perfil_completado: usuario?.perfil_completado ?? usuario?.perfilCompletado ?? false,
    foto_perfil: fotoPerfil,
    foto_perfil_url: fotoPerfil,
    profile_photo: fotoPerfil,
  };
}
