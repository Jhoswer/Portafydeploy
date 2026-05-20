import { yearsOfExperience } from "./profileUtils";

export function buildStats(projects, experience, skills, metrics = {}, options = {}) {
  const stats = [
    { label: "Seguidores", value: metrics.followers ?? 0, action: "followers" },
    { label: "Seguidos", value: metrics.following ?? 0, action: "following" },
    { label: "Proyectos", value: projects.length },
    { label: "Años de exp.", value: yearsOfExperience(experience) },
    {
      label: "Empresas",
      value: new Set(experience.map((item) => item.company).filter(Boolean))
        .size,
    },
    { label: "Habilidades", value: skills.length },
  ];

  if (options.showProfileViews) {
    stats.splice(2, 0, { label: "Visitas", value: metrics.profile_views ?? 0, action: "views" });
  }

  return stats;
}

export function clearImageDrafts(setters) {
  setters.setAvatarFile(null);
  setters.setCoverFile(null);
  setters.setAvatarPreview("");
  setters.setCoverPreview("");
}

export function upsertPublication(posts, nextPost) {
  if (!nextPost?.publicationId) return posts;

  if (posts.some((post) => post.publicationId === nextPost.publicationId)) {
    return posts.map((post) =>
      post.publicationId === nextPost.publicationId ? nextPost : post,
    );
  }

  return [nextPost, ...posts];
}

export function publicationIds(posts, key) {
  return new Set(
    posts
      .map((post) => post[key])
      .filter(Boolean)
      .map(String),
  );
}
