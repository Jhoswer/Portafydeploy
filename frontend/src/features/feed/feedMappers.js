export function tagClass(index) {
  return ["tag-blue", "tag-teal", "tag-violet"][index % 3];
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeProjectStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (["completo", "completado", "complete", "done", "finalizado"].includes(value)) return "Completo";
  if (["pausado", "paused", "pause"].includes(value)) return "Pausado";
  return "En proceso";
}

function normalizeTags(post) {
  const source = Array.isArray(post.tags) && post.tags.length
    ? post.tags
    : Array.isArray(post.project?.tags)
      ? post.project.tags
      : [];

  return source.slice(0, 8).map((label, index) => ({ label, cls: tagClass(index) }));
}

export function normalizeFeedPost(post) {
  if (post.sourceType === "offer") {
    return normalizeOffer(post);
  }

  const authorName  = post.author?.name  || "Usuario Portafy";
  const authorTitle = post.author?.title || "Profesional";
  const posted      = post.posted ? ` · ${post.posted}` : "";

  return {
    id:            post.id || `publication-${post.publicationId}`,
    publicationId: post.publicationId,
    sourceType: post.sourceType === "experience" ? "experience" : "project",
    type: "portafolios",
    author: authorName,
    authorId: post.author?.id ?? post.authorId ?? null,
    authorTitle,
    avatar: post.author?.avatar || "",
    subtitle: `${authorTitle}${posted} · publico`,
    posted: post.posted || "",
    visibility: post.visibility === false ? "private" : (post.visibility || "public"),
    ownedByMe: Boolean(post.ownedByMe || post.owner || post.isOwner),
    description: post.content || post.project?.description || post.experience?.description || "Publicacion de portafolio.",
    tags: normalizeTags(post),
    likes: Number(post.likes || 0),
    comments: Number(post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0)),
    commentsList: Array.isArray(post.comments) ? post.comments : [],
    saves: Number(post.saves || 0),
    likedByMe: Boolean(post.likedByMe),
    savedByMe: Boolean(post.savedByMe),
    image: post.image,
    project: post.project ? {
      ...post.project,
      status: normalizeProjectStatus(post.project.status),
    } : null,
    experience: post.experience,
  };
}

export function normalizeOffer(post) {
  const authorName  = post.author?.name  || "Empresa";
  const authorTitle = post.author?.title || "Empresa";
  const posted      = post.posted ? ` · ${post.posted}` : "";

  return {
    id:            post.id || `offer-${post.offerId}`,
    publicationId: post.publicationId,
    offerId:       post.offerId,
    sourceType:    "offer",
    type:          "oferta",
    author:        authorName,
    authorId: post.author?.id ?? null,
    authorSlug:  post.author?.id ? `${slugify(post.author.name)}-${post.author.id}` : null,
    avatar:        post.author?.avatar || "",
    subtitle:      `${authorTitle}${posted} · oferta`,
    title:         post.title,
    description:   post.content || "",
    tipo_contrato: post.type_contrato,
    modalidad:     post.modalidad,
    ubicacion:     post.ubicacion,
    nivel:         post.nivel,
    area:          post.area,
    salaryMin:     post.salary_min,
    salaryMax:     post.salary_max,
    currency:      post.currency,
    showSalary:    post.show_salary,
    closedAt:      post.closed_at,
    bannerUrl:     post.banner_url,
    tags:          (post.tags || []).slice(0, 6).map((label, index) => ({ label, cls: tagClass(index) })),
    likes:        Number(post.likes ?? 0),
    comments:     Number(post.commentsCount ?? 0), 
    commentsList: Array.isArray(post.comments)       
                    ? post.comments
                    : [],
    saves:         Number(post.saves ?? 0),
    likedByMe:     Boolean(post.likedByMe),
    savedByMe:     Boolean(post.savedByMe),
    image:         post.banner_url || null,
  };
}
