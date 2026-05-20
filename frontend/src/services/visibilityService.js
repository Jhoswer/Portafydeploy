import { apiClient } from "./http/httpClient";

const VISIBILITY_DEFAULTS = {
  projects:   true,
  experience: true,
  education:  true,
  skills:     true,
  links:      true,
};

// Igual que normalizeSettings — convierte la respuesta del backend al shape del draft
export function normalizeVisibility(data = {}) {
  return {
    projects:   data.show_projects   ?? VISIBILITY_DEFAULTS.projects,
    experience: data.show_experience ?? VISIBILITY_DEFAULTS.experience,
    education:  data.show_education  ?? VISIBILITY_DEFAULTS.education,
    skills:     data.show_skills     ?? VISIBILITY_DEFAULTS.skills,
    links:      data.show_links      ?? VISIBILITY_DEFAULTS.links,
  };
}

// Igual que fetchAccountSettings — trae la config del backend
export async function fetchVisibility() {
  const data = await apiClient.get("profile/visibility");
  return normalizeVisibility(data);
}

// Igual que saveAccountSettings — guarda en el backend
export async function saveVisibility(visibility = {}) {
  const data = await apiClient.put("profile/visibility", {
    show_projects:   Boolean(visibility.projects),
    show_experience: Boolean(visibility.experience),
    show_education:  Boolean(visibility.education),
    show_skills:     Boolean(visibility.skills),
    show_links:      Boolean(visibility.links),
  });
  return normalizeVisibility(data);
}