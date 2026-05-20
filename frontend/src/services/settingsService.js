import { actualizarPerfil, clearProfileOverviewCache, fetchProfile } from "./authService";

const CONTACT_VISIBILITY_KEY = "portafy.settings.contactVisibility";

function currentUserKey(profile = {}) {
  return profile?.id ? `${CONTACT_VISIBILITY_KEY}.${profile.id}` : CONTACT_VISIBILITY_KEY;
}

function readLocalContactVisibility(profile = {}) {
  try {
    return localStorage.getItem(currentUserKey(profile)) || "";
  } catch {
    return "";
  }
}

function writeLocalContactVisibility(profile = {}, value = "public") {
  try {
    localStorage.setItem(currentUserKey(profile), value);
  } catch {
    // Local preference is only a fallback until the API returns this field.
  }
}

export function splitLocation(profile = {}) {
  const city = profile.ciudad || profile.city || "";
  const country = profile.pais || profile.country || "";

  if (city || country) {
    return { city, country };
  }

  const parts = String(profile.ubicacion || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts[0] || "",
    country: parts.slice(1).join(", ") || "",
  };
}

export function joinLocation({ city = "", country = "" } = {}) {
  return [city, country].map((part) => part.trim()).filter(Boolean).join(", ");
}

export function normalizeSettings(profile = {}) {
  const location = splitLocation(profile);
  const contactVisibility =
    profile.visibilidad_contacto ||
    (typeof profile.contacto_publico === "boolean" ? (profile.contacto_publico ? "public" : "private") : "") ||
    readLocalContactVisibility(profile) ||
    "public";

  return {
    language: profile.idioma || profile.language || "",
    city: location.city,
    country: location.country,
    locationText: profile.ubicacion || joinLocation(location),
    contactVisibility: contactVisibility === "private" ? "private" : "public",
  };
}

export async function fetchAccountSettings() {
  const profile = await fetchProfile();
  return {
    profile,
    settings: normalizeSettings(profile),
  };
}

export async function saveAccountSettings(profile, settings) {
  const nextLocation = joinLocation({ city: settings.city, country: settings.country });
  const contactVisibility = settings.contactVisibility === "private" ? "private" : "public";
  const formData = new FormData();

  formData.append("ubicacion", nextLocation);
  formData.append("ciudad", settings.city.trim());
  formData.append("pais", settings.country.trim());
  formData.append("visibilidad_contacto", contactVisibility);
  formData.append("contacto_publico", contactVisibility === "public" ? "1" : "0");

  await actualizarPerfil(formData);
  writeLocalContactVisibility(profile, contactVisibility);
  clearProfileOverviewCache();

  const refreshedProfile = await fetchProfile();
  return {
    profile: refreshedProfile,
    settings: normalizeSettings(refreshedProfile),
  };
}

export function isContactPublic(profile = {}) {
  return normalizeSettings(profile).contactVisibility === "public";
}
