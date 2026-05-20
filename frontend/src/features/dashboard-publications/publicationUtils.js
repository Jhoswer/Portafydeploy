export function getPublicationTitle(post = {}) {
  return post.project?.title || post.experience?.title || "Publicacion";
}

export function getPublicationSubtitle(post = {}) {
  return post.project?.status || post.experience?.company || "Compartido desde tu portafolio";
}

export function getPublicationKind(post = {}) {
  return post.sourceType === "experience" ? "Experiencia" : "Proyecto";
}

export function countComments(post = {}) {
  return Number(post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0));
}

export function statValue(posts, getter) {
  return posts.reduce((total, post) => total + Number(getter(post) || 0), 0);
}

export function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "UP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
