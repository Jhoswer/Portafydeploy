import config from "../../config";

export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export function assetUrl(path, version = 0) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path)
    .replace(/^public\//, "")
    .replace(/^storage\//, "")
    .replace(/^\/+/, "");
  return `${config.apiUrl.replace(/\/api\/?$/, "")}/storage/${normalized}?v=${version}`;
}

export function resolveMediaUrl(rawUrl, fallbackPath, version) {
  const backendOrigin = config.apiUrl.replace(/\/api\/?$/, "");

  if (rawUrl) {
    // ✅ Si es URL externa (Cloudinary u otro CDN), devolverla tal cual
    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }

    // Rutas relativas — construir con backendOrigin (imágenes legacy en storage local)
    if (rawUrl.startsWith("/")) {
      return `${backendOrigin}${rawUrl}${rawUrl.includes("?") ? "" : `?v=${version}`}`;
    }

    return `${backendOrigin}/${rawUrl.replace(/^\/+/, "")}${rawUrl.includes("?") ? "" : `?v=${version}`}`;
  }

  return assetUrl(fallbackPath, version);
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function yearsOfExperience(experience) {
  const first = experience
    .map((item) => item.startDate)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => a - b)[0];

  if (!first) return 0;
  return Math.max(
    1,
    Math.floor((Date.now() - first.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
  );
}

export function groupSkills(skills) {
  return skills.reduce((acc, item) => {
    const key = item.category || "General";
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {});
}

export function normalizeEducation(item = {}) {
  const program =
    item.nombre_programa ||
    item.nombre_carrera ||
    item.careerName ||
    item.carrera ||
    item.program ||
    "";
  const institution =
    item.institucion ||
    item.universidad ||
    item.university ||
    item.institution ||
    "";
  const level =
    item.nivel_formacion ||
    item.tipo_formacion ||
    item.type ||
    item.training_type ||
    "";
  const supportStatus = item.supportStatus || item.support_status || "none";

  return {
    id: String(item.id || item.id_university_career || `${program}-${institution}`),
    program: String(program).trim(),
    institution: String(institution).trim(),
    level: String(level).trim(),
    startDate: item.fecha_inicio || item.start_date || "",
    endDate: item.fecha_fin || item.end_date || "",
    isCurrent: Boolean(item.actualmente || item.isCurrent || item.is_current || !item.fecha_fin),
    supportDocumentUrl: item.supportDocumentUrl || item.support_document_url || "",
    supportStatus,
    supportIsVerified: Boolean(item.supportIsVerified || item.support_is_verified || supportStatus === "approved"),
    supportRejectionReason: item.supportRejectionReason || item.support_rejection_reason || "",
  };
}

export function normalizeEducationList(items = []) {
  if (!Array.isArray(items)) return [];

  return items
    .map(normalizeEducation)
    .filter((item) => item.program || item.institution || item.level);
}

export function educationHeadline(education = []) {
  const primary = education.find((item) => {
    const level = normalizeLevel(item.level);
    return ["ingenieria", "licenciatura", "tecnico", "tecnologo"].includes(level);
  });

  if (!primary?.program) return "";

  const levelLabel = formatPrimaryLevel(primary.level);
  return [primary.program, levelLabel].filter(Boolean).join(" - ");
}

function normalizeLevel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatPrimaryLevel(value) {
  const labels = {
    ingenieria: "Ingenieria",
    licenciatura: "Licenciatura",
    tecnico: "Tecnico",
    tecnologo: "Tecnologo",
  };

  return labels[normalizeLevel(value)] || "";
}

export function makeDraft(profile) {
  return {
    nombre: profile?.nombre || "",
    apellido: profile?.apellido || "",
    profesion: profile?.profesion?.trim() || "",
    biografia: profile?.biografia || "",
    ubicacion: profile?.ubicacion ?? "",
  };
}
