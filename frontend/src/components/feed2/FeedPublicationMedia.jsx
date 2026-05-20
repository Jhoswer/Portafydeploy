export function FeedPublicationMedia({ post }) {
  if (post.sourceType === "experience") {
    return <ExperienceMedia post={post} />;
  }

  return <ProjectMedia post={post} />;
}

function ProjectMedia({ post }) {
  if (post.image) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: 220,
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,.08), rgba(15,23,42,.24)), url(${post.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  return (
    <div className="project-cover-fallback">
      <div className="project-cover-fallback__mark">{(post.project?.title || "P").slice(0, 1)}</div>
      <div className="project-cover-fallback__title">{post.project?.title || "Proyecto de portafolio"}</div>
    </div>
  );
}

function ExperienceMedia({ post }) {
  const experience = post.experience || {};

  return (
    <div className="dash-mockup" style={{ padding: 22 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 20 }}>{experience.title || "Trayectoria destacada"}</div>
        <div style={{ color: "#475569", fontWeight: 700 }}>{experience.company || "Empresa / organizacion"}</div>
      </div>
    </div>
  );
}
