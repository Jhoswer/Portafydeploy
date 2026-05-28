import { apiClient } from "./http/httpClient";

const FEED_CACHE_TTL_MS = 20000;
export const COMMENT_MAX_LENGTH = 280;
const COMMENT_ALLOWED_PATTERN = /^[\p{L}\p{N}\s.,;:!?¡¿'"()@#%&+\-_/]+$/u;
const FEED_CACHE_STORAGE_PREFIX = "portafy.feed.";
export const FEED_UPDATED_EVENT = "feed:updated";
const feedCache = new Map();

function readStoredCache(key) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(`${FEED_CACHE_STORAGE_PREFIX}${key}`) || "null");
    if (!cached?.value) return null;
    feedCache.set(key, cached);
    return cached;
  } catch {
    return null;
  }
}

function writeStoredCache(key, payload) {
  try {
    sessionStorage.setItem(`${FEED_CACHE_STORAGE_PREFIX}${key}`, JSON.stringify(payload));
  } catch {
    // Cache storage is a performance nice-to-have; the feed still works without it.
  }
}

function getCache(key, { allowStale = false } = {}) {
  const cached = feedCache.get(key) || readStoredCache(key);
  if (!cached?.value) return null;
  if (allowStale || cached.expiresAt > Date.now()) return cached.value;
  return null;
}

function setCache(key, value) {
  const payload = {
    value,
    expiresAt: Date.now() + FEED_CACHE_TTL_MS,
  };

  feedCache.set(key, payload);
  writeStoredCache(key, payload);
}

function notifyFeedUpdated(post = null, extra = {}) {
  window.dispatchEvent(new CustomEvent(FEED_UPDATED_EVENT, {
    detail: { post, ...extra },
  }));
}

function updateCachedPost(post) {
  if (!post?.publicationId) return;

  if (!feedCache.size) {
    setCache("feed:20", [post]);
    setCache("mine:30", [post]);
    return;
  }

  for (const [key, cached] of feedCache.entries()) {
    if (!Array.isArray(cached.value)) continue;

    const nextValue = cached.value.some((item) => item.publicationId === post.publicationId)
      ? cached.value.map((item) => (item.publicationId === post.publicationId ? post : item))
      : key.startsWith("feed:") || key.startsWith("mine:")
        ? [post, ...cached.value]
        : cached.value;

    setCache(key, nextValue);
  }
}

function removeCachedPost(publicationId, shouldRemoveFromKey = () => true) {
  if (!publicationId) return;

  for (const [key, cached] of feedCache.entries()) {
    if (!Array.isArray(cached.value)) continue;
    if (!shouldRemoveFromKey(key)) continue;
    setCache(key, cached.value.filter((item) => String(item.publicationId) !== String(publicationId)));
  }
}

function syncSavedCache(post, saved) {
  if (!post?.publicationId) return;

  for (const [key, cached] of feedCache.entries()) {
    if (!key.startsWith("saved:") || !Array.isArray(cached.value)) continue;

    if (!saved) {
      setCache(key, cached.value.filter((item) => String(item.publicationId) !== String(post.publicationId)));
      continue;
    }

    const nextPost = { ...post, savedByMe: true };
    const nextValue = cached.value.some((item) => String(item.publicationId) === String(post.publicationId))
      ? cached.value.map((item) => (String(item.publicationId) === String(post.publicationId) ? nextPost : item))
      : [nextPost, ...cached.value];

    setCache(key, nextValue);
  }
}

export function clearFeedCache() {
  feedCache.clear();
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(FEED_CACHE_STORAGE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}

export function getCachedFeedPosts({ limit = 20, allowStale = true } = {}) {
  return getCache(`feed:${limit}`, { allowStale }) || [];
}

export async function fetchFeedPosts({ limit = 20, signal, force = false } = {}) {
  const cacheKey = `feed:${limit}`;
  const cached = getCache(cacheKey);
  if (cached && !force) return cached;

  const payload = await apiClient.get(`feed/posts?limit=${limit}`, {
    signal,
    fallbackMessage: "No se pudo cargar el feed.",
    timeoutMs: 180000,
  });

  const value = Array.isArray(payload?.data) ? payload.data : [];
  setCache(cacheKey, value);
  return value;
}

export async function fetchTrendingFeedPosts({ limit = 6, signal, force = false } = {}) {
  const cacheKey = `trending:${limit}`;
  const cached = getCache(cacheKey);
  if (cached && !force) return cached;

  const payload = await apiClient.get(`feed/trending?limit=${limit}`, {
    signal,
    fallbackMessage: "No se pudieron cargar las tendencias.",
    timeoutMs: 180000,
  });

  const value = Array.isArray(payload?.data) ? payload.data : [];
  setCache(cacheKey, value);
  return value;
}

export async function fetchMyFeedPosts({ limit = 30, signal, force = false } = {}) {
  const cacheKey = `mine:${limit}`;
  const cached = getCache(cacheKey);
  if (cached && !force) return cached;

  const payload = await apiClient.get(`feed/me?limit=${limit}`, {
    signal,
    fallbackMessage: "No se pudo cargar tu vitrina.",
    timeoutMs: 180000,
  });

  const value = Array.isArray(payload?.data) ? payload.data : [];
  setCache(cacheKey, value);
  return value;
}

export async function fetchSavedFeedPosts({ limit = 40, signal, force = false } = {}) {
  const cacheKey = `saved:${limit}`;
  const cached = getCache(cacheKey);
  if (cached && !force) return cached;

  const payload = await apiClient.get(`feed/saved?limit=${limit}`, {
    signal,
    fallbackMessage: "No se pudieron cargar tus guardados.",
    timeoutMs: 180000,
  });

  const value = Array.isArray(payload?.data) ? payload.data : [];
  setCache(cacheKey, value);
  return value;
}

export async function fetchFeedPost(publicationId) {
  const payload = await apiClient.get(`feed/posts/${publicationId}`, {
    fallbackMessage: "No se pudo cargar la publicacion.",
  });

  const post = payload?.post ?? null;
  updateCachedPost(post);
  return post;
}

export async function publishProjectToFeed(projectId, content = "") {
  const payload = await apiClient.post(
    `projects/${projectId}/publish`,
    { content },
    {
      fallbackMessage: "No se pudo compartir el proyecto en el feed.",
    }
  );

  const post = payload?.post ?? null;
  updateCachedPost(post);
  syncSavedCache(post, Boolean(payload?.saved));
  notifyFeedUpdated(post);
  return post;
}

export async function publishExperienceToFeed(experienceId, content = "") {
  const payload = await apiClient.post(
    `experience/${experienceId}/publish`,
    { content },
    {
      fallbackMessage: "No se pudo compartir la experiencia en el feed.",
    }
  );

  const post = payload?.post ?? null;
  updateCachedPost(post);
  notifyFeedUpdated(post);
  return post;
}

export async function unshareFeedPost(publicationId) {
  const payload = await apiClient.post(`feed/posts/${publicationId}/unshare`, null, {
    fallbackMessage: "No se pudo dejar de compartir este contenido.",
  });

  const removedPublicationId = payload?.publicationId ?? publicationId;
  removeCachedPost(removedPublicationId);
  notifyFeedUpdated(null, {
    removedPublicationId,
    projectId: payload?.projectId ?? null,
    experienceId: payload?.experienceId ?? null,
  });

  return payload;
}

export async function toggleFeedPostLike(publicationId) {
  const payload = await apiClient.post(`feed/posts/${publicationId}/like`, null, {
    fallbackMessage: "No se pudo actualizar el me gusta.",
  });

  const post = payload?.post ?? null;
  updateCachedPost(post);
  notifyFeedUpdated(post);
  return post;
}

export async function toggleFeedPostSave(publicationId) {
  const payload = await apiClient.post(`feed/posts/${publicationId}/save`, null, {
    fallbackMessage: "No se pudo actualizar el guardado.",
  });

  const post = payload?.post ?? null;
  updateCachedPost(post);
  notifyFeedUpdated(post);
  return post;
}

export async function commentFeedPost(publicationId, comment) {
  const normalizedComment = normalizeCommentText(comment);
  const validationError = validateCommentText(normalizedComment);

  if (validationError) {
    throw new Error(validationError);
  }

  const payload = await apiClient.post(
    `feed/posts/${publicationId}/comments`,
    { comment: normalizedComment },
    {
      fallbackMessage: "No se pudo publicar el comentario.",
    }
  );

  const post = payload?.post ?? null;
  updateCachedPost(post);
  notifyFeedUpdated(post);
  return post;
}

export function normalizeCommentText(value) {
  return stripControlCharacters(value)
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeCommentInput(value) {
  return stripControlCharacters(value).slice(0, COMMENT_MAX_LENGTH);
}

export function validateCommentText(value) {
  const comment = normalizeCommentText(value);

  if (!comment) {
    return "Escribe un comentario antes de enviarlo.";
  }

  if (comment.length > COMMENT_MAX_LENGTH) {
    return `El comentario no puede superar ${COMMENT_MAX_LENGTH} caracteres.`;
  }

  if (!COMMENT_ALLOWED_PATTERN.test(comment)) {
    return "Usa solo letras, numeros, espacios y puntuacion comun.";
  }

  return "";
}

function stripControlCharacters(value) {
  return Array.from(String(value || ""), (char) => {
    const code = char.charCodeAt(0);
    return code <= 31 || code === 127 ? " " : char;
  }).join("");
}
