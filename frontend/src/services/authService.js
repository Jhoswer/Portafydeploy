import { apiClient } from "./http/httpClient";
import { getToken } from "./sessionService";

const EDUCATION_LEVEL_MAP = {
  universitaria: "licenciatura",
  tecnica: "tecnico",
  posgrado: "diplomado",
  maestria: "maestria",
  doctorado: "doctorado",
  curso: "curso",
  certificacion: "otro",
};

const PROFILE_OVERVIEW_CACHE_TTL_MS = 15000;
const PROFILE_CACHE_TTL_MS = 60000;

const profileOverviewCache = new Map();
const profileCache = new Map();

function getProfileCacheKey(userId) {
  return userId ? `public:${userId}` : "self";
}

function getProfileCacheEntry(userId) {
  const cacheKey = getProfileCacheKey(userId);

  if (!profileOverviewCache.has(cacheKey)) {
    profileOverviewCache.set(cacheKey, {
      expiresAt: 0,
      promise: null,
      value: null,
    });
  }

  return profileOverviewCache.get(cacheKey);
}

function normalizeEducationPayload(formacion = {}) {
  const legacyType = formacion.tipo_formacion || formacion.type || "";
  const normalizedLevel = EDUCATION_LEVEL_MAP[legacyType] || formacion.nivel_formacion || legacyType || "";

  return {
    ...formacion,
    tipo_formacion: legacyType,
    nivel_formacion: normalizedLevel,
    nombre_carrera: formacion.nombre_carrera || formacion.careerName || "",
    nombre_programa: formacion.nombre_programa || formacion.nombre_carrera || formacion.careerName || "",
  };
}

export async function loginUser({ email, password }) {
  return apiClient.post(
    "login",
    { email, password },
    {
      auth: false,
      fallbackMessage: "Credenciales incorrectas.",
    }
  );
}

export async function registerUser(userData) {
  return apiClient.post(
    "register",
    {
      nombre: userData.role === "RECLUTADOR"
        ? userData.company
        : userData.name,

      apellido: userData.role === "RECLUTADOR"
        ? null
        : userData.lastName,

      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password_confirmation,
      captcha_token: userData.captcha_token,
      role: userData.role,
    },
    {
      auth: false,
      fallbackMessage: "Error al registrar usuario.",
    }
  );
}

export async function forgotPassword(email) {
  return apiClient.post(
    "forgot-password",
    { email },
    {
      auth: false,
      fallbackMessage: "No se pudo enviar el correo de recuperacion.",
    }
  );
}

export async function resetPassword(payload) {
  return apiClient.post(
    "reset-password",
    payload,
    {
      auth: false,
      fallbackMessage: "No se pudo restablecer la contrasena.",
    }
  );
}

export async function guardarFormacion(formacion) {
  return apiClient.post("formacion", normalizeEducationPayload(formacion), {
    fallbackMessage: "Error al guardar formacion.",
  });
}

export async function completarPerfil(formData) {
  return apiClient.post("perfil/completar", formData, {
    fallbackMessage: "Error al completar perfil.",
  });
}

export function clearProfileCache(userId = null) {
  if (userId === null) {
    profileCache.clear();
    return;
  }

  profileCache.delete(`self:${userId}`);
  profileCache.delete(`public:${userId}`);
}

export async function actualizarPerfil(payload) {
  return apiClient.post("perfil/actualizar", payload, {
    fallbackMessage: "Error al actualizar perfil.",
  });
}

export async function fetchProfile() {
  const cacheKey = `self:${getToken()}`;
  const cached = profileCache.get(cacheKey);
  const now = Date.now();

  if (cached?.value && cached.expiresAt > now) {
    return cached.value;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = apiClient.get("perfil/me", {
    fallbackMessage: "No se pudo cargar el perfil.",
  }).then((profile) => {
    profileCache.set(cacheKey, {
      value: profile,
      expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
      promise: null,
    });
    return profile;
  }).catch((error) => {
    profileCache.delete(cacheKey);
    throw error;
  });

  profileCache.set(cacheKey, {
    value: cached?.value ?? null,
    expiresAt: cached?.expiresAt ?? 0,
    promise,
  });

  return promise;
}

export async function fetchProfileOverview(userId = null) {
  const cacheEntry = getProfileCacheEntry(userId);
  const now = Date.now();

  if (cacheEntry.value && cacheEntry.expiresAt > now) {
    return cacheEntry.value;
  }

  if (cacheEntry.promise) {
    return cacheEntry.promise;
  }

  const endpoint = userId ? `perfil/public/${userId}/overview` : "perfil/overview";

  cacheEntry.promise = apiClient.get(endpoint, {
    auth: !userId,
    fallbackMessage: "No se pudo cargar el perfil profesional.",
  }).then((data) => {
    profileOverviewCache.set(getProfileCacheKey(userId), {
      value: data,
      expiresAt: Date.now() + PROFILE_OVERVIEW_CACHE_TTL_MS,
      promise: null,
    });
    return data;
  }).catch((error) => {
    clearProfileOverviewCache(userId);
    throw error;
  });

  return cacheEntry.promise;
}

export function clearProfileOverviewCache(userId = null) {
  if (userId === null) {
    profileCache.clear();
  }

  if (userId === null) {
    profileOverviewCache.clear();
    return;
  }

  profileOverviewCache.delete(getProfileCacheKey(userId));
}

export async function fetchFormaciones() {
  const data = await apiClient.get("formacion", {
    fallbackMessage: "Error al cargar formacion.",
  });

  return data?.formaciones ?? [];
}
