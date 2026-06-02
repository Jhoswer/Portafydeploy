import { useTranslation } from "react-i18next";

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

/**
 * Hook: devuelve TIPOS con labels traducidos.
 * Úsalo dentro de componentes React.
 *
 * const TIPOS = useTipos();
 */
export function useTipos() {
  const { t } = useTranslation();
  return [
    { value: "",       label: t("historial.utils.tipos.todos") },
    { value: "create", label: t("historial.utils.tipos.creado") },
    { value: "update", label: t("historial.utils.tipos.editado") },
    { value: "delete", label: t("historial.utils.tipos.eliminado") },
  ];
}

/**
 * Hook: devuelve ROL_CONFIG con labels traducidos.
 * Úsalo dentro de componentes React.
 *
 * const ROL_CONFIG = useRolConfig();
 */
export function useRolConfig() {
  const { t } = useTranslation();
  return {
    "super administrador": {
      color: "#7c3aed",
      bg: "rgba(124,58,237,.12)",
      label: t("historial.utils.roles.super_admin"),
    },
    administrador: {
      color: "#ef5759",
      bg: "rgba(239,87,89,.12)",
      label: t("historial.utils.roles.admin"),
    },
    reclutador: {
      color: "#0284c7",
      bg: "rgba(2,132,199,.12)",
      label: t("historial.utils.roles.reclutador"),
    },
    profesional: {
      color: "#059669",
      bg: "rgba(5,150,105,.12)",
      label: t("historial.utils.roles.profesional"),
    },
  };
}

/**
 * Hook: devuelve ROL_DEFAULT con label traducido.
 */
export function useRolDefault() {
  const { t } = useTranslation();
  return {
    color: "#64748b",
    bg: "rgba(100,116,139,.12)",
    label: t("historial.utils.roles.usuario"),
  };
}

/**
 * Hook: devuelve TIPO_STYLES con labels traducidos.
 */
export function useTipoStyles() {
  const { t } = useTranslation();
  return {
    create: { label: t("historial.utils.tipos.creado"),    color: "#059669", bg: "rgba(5,150,105,.10)" },
    update: { label: t("historial.utils.tipos.editado"),   color: "#0284c7", bg: "rgba(2,132,199,.10)" },
    delete: { label: t("historial.utils.tipos.eliminado"), color: "#ef5759", bg: "rgba(239,87,89,.10)" },
  };
}

/* ─── Constantes estáticas (sin texto visible) ─── */

export const AVATAR_PALETTE = [
  { bg: "#FEE2E2", fg: "#B91C1C" },
  { bg: "#DBEAFE", fg: "#1D4ED8" },
  { bg: "#D1FAE5", fg: "#065F46" },
  { bg: "#EDE9FE", fg: "#6D28D9" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#FCE7F3", fg: "#9D174D" },
];

/* ─── Utilidades puras (sin texto visible) ─── */

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