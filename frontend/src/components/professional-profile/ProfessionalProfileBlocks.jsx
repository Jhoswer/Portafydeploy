import {
  Download,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  MessageCircle,
  Pencil,
  Plus,
  Share2,
  Star,
  Twitter,
  X,
} from "lucide-react";

function getSocialIcon(platform) {
  const normalized = String(platform || "").toLowerCase();
  if (normalized.includes("github")) return Github;
  if (normalized.includes("linkedin")) return Linkedin;
  if (normalized.includes("twitter") || normalized.includes("x")) return Twitter;
  return Globe;
}

export function ProfessionalProfileAvatar({ nombre, apellido }) {
  const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase() || "PP";
  return <div className="pprof-avatar">{initials}</div>;
}

export function ProfessionalProfileCard({ children, compact = false, reveal = false }) {
  return (
    <section className={`pprof-card${compact ? " pprof-card--compact" : ""}${reveal ? " pprof-reveal" : ""}`}>
      {children}
    </section>
  );
}

export function ProfessionalProfileCardTitle({ children, onEdit }) {
  return (
    <div className="pprof-card-title">
      <span>{children}</span>
      {onEdit ? (
        <button type="button" className="pprof-inline-action" onClick={onEdit}>
          <Pencil size={12} />
          Editar
        </button>
      ) : null}
    </div>
  );
}

export function ProfessionalProfileModal({ title, onClose, children }) {
  return (
    <div className="pprof-modal-backdrop">
      <div className="pprof-modal">
        <div className="pprof-modal__header">
          <h3>{title}</h3>
          <button type="button" className="pprof-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="pprof-modal__body">{children}</div>
        <div className="pprof-modal__actions">
          <button type="button" className="pf-btn pf-btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="pf-btn pf-btn--red" onClick={onClose}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfessionalProfileActions() {
  return (
    <div className="pprof-actions">
      <button type="button" className="pf-btn pf-btn--ghost pprof-action-button">
        <Share2 size={14} />
      </button>
      <button type="button" className="pf-btn pf-btn--ghost pprof-action-button">
        <Download size={14} />
        Descargar CV
      </button>
      <button type="button" className="pf-btn pf-btn--red pprof-action-button">
        <MessageCircle size={14} />
        Contactar
      </button>
    </div>
  );
}

export function ProfessionalProfileStats({ stats, profileUrl }) {
  const items = [
    { label: "Proyectos", value: stats?.proyectos || 0 },
    { label: "Años de exp.", value: stats?.experiencia || 0 },
    { label: "Empleadores", value: stats?.empleadores || 0 },
    { label: "Vistas esta semana", value: stats?.visitas || 0 },
  ];

  return (
    <div className="pprof-stats">
      {items.map((item, index) => (
        <div key={item.label} className="pprof-stat">
          {index > 0 ? <span className="pprof-stat__divider" /> : null}
          <div>
            <div className="pprof-stat__value">{item.value}</div>
            <div className="pprof-stat__label">{item.label}</div>
          </div>
        </div>
      ))}
      <div className="pprof-stat">
        <span className="pprof-stat__divider" />
        <div>
          <div className="pprof-stat__value pprof-stat__value--link">{profileUrl}</div>
          <div className="pprof-stat__label">URL pública</div>
        </div>
      </div>
    </div>
  );
}

export function ProfessionalProfileSocialList({ items }) {
  return (
    <div className="pprof-stack">
      {items.map((item) => {
        const Icon = getSocialIcon(item.platform);

        return (
          <a
            key={item.id || item.label}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="pprof-social-link"
          >
            <span className="pprof-social-link__icon">
              <Icon size={14} />
            </span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}

export function ProfessionalProfileSkills({ items }) {
  return (
    <div className="pprof-stack">
      {items.map((group) => (
        <div key={group.grupo}>
          <div className="pprof-skill-group">{group.grupo}</div>
          <div className="pprof-skill-tags">
            {group.tags.map((tag) => (
              <span
                key={tag.id || tag.label}
                className={`pprof-skill-tag${tag.expert ? " pprof-skill-tag--expert" : ""}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfessionalProfileEducation({ items }) {
  return (
    <div className="pprof-stack">
      {items.map((item, index) => (
        <div key={item.id || `${item.titulo}-${index}`} className="pprof-education-item">
          {index > 0 ? <div className="pprof-education-divider" /> : null}
          <div className="pprof-education-title">{item.titulo}</div>
          <div className="pprof-education-subtitle">{item.inst}</div>
          <div className="pprof-education-period">{item.period}</div>
        </div>
      ))}
    </div>
  );
}

export function ProfessionalProfileProjectsTab({ items }) {
  return (
    <div className="pprof-project-grid">
      {items.map((item) => (
        <article key={item.id} className="pprof-project-card pprof-reveal">
          <div className="pprof-project-card__media" style={{ background: item.bg }}>
            <span className="pprof-project-card__emoji">{item.emoji}</span>
            <span className={`pprof-project-badge${item.badge === "LIVE" ? " pprof-project-badge--live" : ""}`}>
              {item.badge}
            </span>
          </div>

          <div className="pprof-project-card__body">
            <h3 className="pprof-project-card__title">{item.titulo}</h3>
            <p className="pprof-project-card__text">{item.desc}</p>
            <div className="pprof-project-tags">
              {item.tags.map((tag) => (
                <span key={`${item.id}-${tag}`} className="pprof-project-tag">{tag}</span>
              ))}
            </div>
            <div className="pprof-project-card__footer">
              <div className="pprof-project-card__links">
                {item.demo ? (
                  <a href={item.url_demo} target="_blank" rel="noreferrer" className="pf-btn pf-btn--red pprof-link-button">
                    Demo
                  </a>
                ) : null}
                <a href={item.url_repositorio} target="_blank" rel="noreferrer" className="pf-btn pf-btn--ghost pprof-link-button">
                  Repo
                </a>
              </div>
              <span className="pprof-project-card__date">{item.fecha}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProfessionalProfileExperienceTab({ items }) {
  return (
    <div className="pprof-timeline">
      {items.map((item, index) => (
        <div key={item.id || `${item.rol}-${index}`} className="pprof-timeline__item pprof-reveal">
          {index < items.length - 1 ? <span className="pprof-timeline__line" /> : null}
          <div className="pprof-timeline__icon">{item.icon}</div>
          <div className="pprof-timeline__content">
            <div className="pprof-timeline__header">
              <div className="pprof-timeline__title-row">
                <span className="pprof-timeline__title">{item.rol}</span>
                {item.actual ? <span className="pprof-timeline__badge">Actual</span> : null}
              </div>
              <span className="pprof-timeline__date">{item.fecha}</span>
            </div>
            <div className="pprof-timeline__company">{item.empresa}</div>
            <p className="pprof-timeline__text">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfessionalProfileAchievementsTab() {
  return (
    <div className="pprof-empty-state">
      <Star size={30} className="pprof-empty-state__icon" />
      <p className="pprof-empty-state__text">Aún no hay logros registrados.</p>
      <button type="button" className="pf-btn pf-btn--ghost pprof-link-button">
        <Plus size={13} />
        Agregar logro
      </button>
    </div>
  );
}

export function ProfessionalProfileEducationTitle() {
  return (
    <div className="pprof-title-with-icon">
      <GraduationCap size={14} />
      <span>Formación</span>
    </div>
  );
}
