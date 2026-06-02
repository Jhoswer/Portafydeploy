import config from "../config";
import { permissionNamesForRole } from "../utils/permissions";

const USER_KEY = config.authStorageKeys.user;
const TOKEN_KEY = config.authStorageKeys.token;
const LEGACY_TOKEN_KEY = config.authStorageKeys.legacyToken;

function safeParse(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function resolvePhotoUrl(rawUser) {
  const rawUrl = rawUser?.foto_perfil_url || rawUser?.photoUrl || "";
  const rawPath = rawUser?.foto_perfil || rawUser?.photo || "";
  const backendOrigin = config.backendUrl.replace(/\/+$/, "");

  if (rawUrl) {
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    if (rawUrl.startsWith("/")) return `${backendOrigin}${rawUrl}`;
    return `${backendOrigin}/${rawUrl.replace(/^\/+/, "")}`;
  }

  if (!rawPath) return "";

  const normalizedPath = String(rawPath)
    .replace(/^public\//, "")
    .replace(/^storage\//, "")
    .replace(/^\/+/, "");

  return `${backendOrigin}/storage/${normalizedPath}`;
}

export function buildSessionUser(rawUser, token = "") {
  if (!rawUser) return null;

  const nombre = rawUser.nombre || rawUser.name || "";
  const apellido = rawUser.apellido || rawUser.lastName || "";
  const initials = nombre && apellido
    ? `${nombre[0]}${apellido[0]}`.toUpperCase()
    : nombre
      ? nombre.slice(0, 2).toUpperCase()
      : "??";

  return {
    id: rawUser.id,
    name: nombre,
    lastName: apellido,
    email: rawUser.email || "",
    rol: rawUser.rol || null,
    ubicacion: rawUser.ubicacion || rawUser.location || "",
    location: rawUser.location || rawUser.ubicacion || "",
    active_permissions: Array.isArray(rawUser.active_permissions)
      ? rawUser.active_permissions
      : permissionNamesForRole(rawUser.rol || rawUser.role),
    perfil_completado: Boolean(rawUser.perfil_completado),
    provider: rawUser.provider || null,
    foto_perfil: rawUser.foto_perfil || "",
    foto_perfil_url: rawUser.foto_perfil_url || "",
    verification: rawUser.verification || null,
    is_verified: Boolean(rawUser.is_verified || rawUser.isVerified || rawUser.verification?.is_verified),
    photoUrl: resolvePhotoUrl(rawUser),
    initials,
    token: token || rawUser.token || "",
  };
}

export function getStoredUser() {
  const raw = safeParse(localStorage.getItem(USER_KEY));

  if (!raw) return null;

  return buildSessionUser(raw, raw.token || "");
}

export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    getStoredUser()?.token ||
    ""
  );
}

export function persistSession(rawUser, token = "") {
  const user = buildSessionUser(rawUser, token);

  if (!user) return null;

  const authToken = token || user.token || "";

  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, token: authToken }));

  if (authToken) {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, authToken);
  }

  return { ...user, token: authToken };
}

export function updateStoredUser(updater) {
  const current = getStoredUser();
  if (!current) return null;

  const updatedUser = typeof updater === "function" ? updater(current) : { ...current, ...updater };
  const nextUser = buildSessionUser(
    {
      ...current,
      ...updatedUser,
    },
    updatedUser?.token || current.token || getToken()
  );

  if (!nextUser) return null;

  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  return nextUser;
}

export function markStoredProfileCompleted() {
  return updateStoredUser((current) => ({
    ...current,
    perfil_completado: true,
  }));
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

const COMPANY_KEY = "company";

export const persistCompany = (company) => {
    if (!company) return null;
    localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
    return company;
};

export const getStoredCompany = () => {
    try {
        const raw = localStorage.getItem(COMPANY_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearCompany = () => {
    localStorage.removeItem(COMPANY_KEY);
};
