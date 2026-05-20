import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Users, Eye, Briefcase, Monitor, Award,
  DollarSign, Pencil, Trash2, ChevronRight, MoreHorizontal,
  Building2, Globe, FolderCheck, Play, Pause, Megaphone, Calendar
} from "lucide-react";
import { Button } from "../../ui/button";

const statusStyles = {
  Activa:    { dot: "#10b981", bg: "#f0fdf4", text: "#065f46", border: "#a7f3d0", label: "Activa"    },
  Borrador:  { dot: "#f59e0b", bg: "#fffbeb", text: "#78350f", border: "#fde68a", label: "Borrador"  },
  Cerrada:   { dot: "#f43f5e", bg: "#fff1f2", text: "#881337", border: "#fda4af", label: "Cerrada"   },
  Eliminada: { dot: "#6b7280", bg: "#f9fafb", text: "#374151", border: "#d1d5db", label: "Eliminada" },
};

const statusLabels = {
  open: "Activa", visible: "Activa",
  private: "Borrador", closed: "Cerrada", removed: "Eliminada",
};

function formatDate(date) {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleDateString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function CardMenu({ onViewDetail, onEdit, onDelete, onToggleStatus, statusLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="job-card__menu">
      <button
        type="button"
        className="job-card__menu-trigger"
        onMouseDown={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="job-card__menu-dropdown">
          <button type="button" className="job-card__menu-item"
            onMouseDown={(e) => { e.stopPropagation(); onViewDetail(); setOpen(false); }}>
            Ver detalle
          </button>
          {onEdit && (
            <button type="button" className="job-card__menu-item"
              onMouseDown={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}>
              <Pencil size={13} /> Editar
            </button>
          )}
          {onToggleStatus && (
            <button type="button" className="job-card__menu-item"
              onMouseDown={(e) => { e.stopPropagation(); onToggleStatus(); setOpen(false); }}>
              {statusLabel === "Activa"   && <><span>🔒</span> Cerrar convocatoria</>}
              {statusLabel === "Cerrada"  && <><span>🔓</span> Reabrir convocatoria</>}
              {statusLabel === "Borrador" && <><span>📢</span> Publicar</>}
            </button>
          )}
          {onDelete && (
            <>
              <div className="job-card__menu-divider" />
              <button type="button" className="job-card__menu-item job-card__menu-item--danger"
                onMouseDown={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}>
                <Trash2 size={13} /> Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Pill({ icon: Icon, label, color }) {
  return (
    <span className="job-pill" style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}>
      <Icon size={11} />{label}
    </span>
  );
}

function DetailModal({ job, onClose, onEdit, onDelete }) {
  const {
    title, description, companyName, companyLogo, ubicacion, publishedDate,
    type, modalidad, nivel, salaryMin, salaryMax, currency, skills,
    bannerImage, postulantesCount, viewsCount, finalStatus,
  } = job;

  const hasSalary = salaryMin && salaryMax;
  const initials = companyName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  const chips = [
    { icon: Briefcase, value: type,      color: "#185FA5" },
    { icon: Monitor,   value: modalidad, color: "#7c3aed" },
    { icon: Award,     value: nivel,     color: "#059669" },
  ].filter((c) => c.value);

  return (
    <div className="job-modal-overlay" onClick={onClose}>
      <motion.div
        className="job-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="job-modal__body">
          <div className="job-modal__header">
            <div className="job-modal__company">
              <div className="job-modal__logo">
                {companyLogo ? <img src={companyLogo} alt={companyName} /> : initials}
              </div>
              <div>
                <p className="job-modal__company-name">{companyName}</p>
                <div className="job-modal__company-meta">
                  <MapPin size={11} />{ubicacion || "Sin ubicación"}
                  <span>·</span>
                  <Clock size={11} />{publishedDate}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {onEdit   && <Button variant="ghost" size="sm" onClick={onEdit}><Pencil size={14} /> Editar</Button>}
              {onDelete && <Button variant="red"   size="sm" onClick={onDelete}><Trash2 size={14} /> Eliminar</Button>}
            </div>
          </div>

          <h2 className="job-modal__title">{title}</h2>
          <p className="job-modal__section-label">Estado: {finalStatus}</p>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map(({ icon, value, color }) => (
                <Pill key={value} icon={icon} label={value} color={color} />
              ))}
            </div>
          )}

          <div>
            <p className="job-modal__section-label">Descripción</p>
            <p className="job-modal__desc">{description || "Sin descripción"}</p>
          </div>

          {bannerImage && (
            <div className="job-modal__banner"><img src={bannerImage} alt="Banner" /></div>
          )}

          {hasSalary && (
            <div className="job-modal__salary">
              <DollarSign size={15} color="#059669" />
              {currency} {Number(salaryMin).toLocaleString()} – {Number(salaryMax).toLocaleString()}
              <span>/ mes</span>
            </div>
          )}

          {skills?.length > 0 && (
            <div>
              <p className="job-modal__section-label">Habilidades</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => <span key={s} className="job-modal__skill">{s}</span>)}
              </div>
            </div>
          )}

          <div className="job-modal__stats">
            <span className="job-modal__stat">
              <Users size={13} />{postulantesCount ?? 0} postulantes
            </span>
            {viewsCount != null && (
              <span className="job-modal__stat"><Eye size={13} />{viewsCount} vistas</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteModal({ title, onConfirm, onCancel, loading }) {
  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <motion.div
        className="delete-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.18 }}
      >
        <div className="delete-modal__icon"><Trash2 size={22} color="#be123c" /></div>
        <h3 className="delete-modal__title">¿Eliminar convocatoria?</h3>
        <p className="delete-modal__desc">"<strong>{title}</strong>" se eliminará permanentemente.</p>
        <div className="delete-modal__actions">
          <button className="delete-modal__cancel" onClick={onCancel}>Cancelar</button>
          <button className="delete-modal__confirm" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PipeItem({ color, label, count }) {
  return (
    <div className="job-card__pipe-item">
      <span className="job-card__pipe-dot" style={{ background: color }} />
      <span className="job-card__pipe-label">{label}</span>
      <span className="job-card__pipe-count">{count ?? 0}</span>
    </div>
  );
}

export function JobPostCard(props) {
  const {
    compact = false,
    id, title, description, companyName, companyLogo,
    ubicacion, createdAt, created_at, timeAgo,
    type, modalidad, nivel, salaryMin, salaryMax, currency,
    skills, status, realState, real_state, state,
    bannerImage, postulantesCount, viewsCount,
    interviewsCount, hiredCount,
    pipeline,
    showStatus = true, onApply, onEdit, onDelete, onToggleStatus,
  } = props;

  const [showDetail, setShowDetail]               = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting]                   = useState(false);

  const resolvedState = realState ?? real_state ?? state;
  const finalStatus   = status ?? statusLabels[resolvedState] ?? "Activa";
  const publishedDate = timeAgo ?? formatDate(createdAt ?? created_at);
  const sStyle        = statusStyles[finalStatus] ?? statusStyles.Activa;
  const initials      = companyName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try { await onDelete(id); }
    finally { setDeleting(false); setShowDeleteConfirm(false); }
  };

  const jobData = {
    id, title, description, companyName, companyLogo, ubicacion,
    publishedDate: timeAgo ?? `Publicado el ${formatDate(createdAt ?? created_at)}`,
    type, modalidad, nivel, salaryMin, salaryMax, currency, skills,
    finalStatus, bannerImage, postulantesCount, viewsCount,
  };

  return (
    <>
      <motion.article
        className="job-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="job-card__body">

          {/* ── Header: logo + empresa + estado + menú ── */}
          <div className="job-card__header">
            <div className="job-card__logo">
              {companyLogo ? <img src={companyLogo} alt={companyName} /> : initials}
            </div>
            <div className="job-card__company">
              <p className="job-card__company-name">{companyName || "Empresa"}</p>
              <div className="job-card__company-meta">
                <Building2 size={10} /><span>Empresa</span>
              </div>
            </div>

            {showStatus && (
              <span
                className="job-card__status"
                style={{ background: sStyle.bg, color: sStyle.text, border: `1px solid ${sStyle.border}` }}
              >
                <span className="job-card__status-dot" style={{ background: sStyle.dot }} />
                {sStyle.label}
              </span>
            )}

            <CardMenu
              onViewDetail={() => setShowDetail(true)}
              onEdit={onEdit}
              onDelete={onDelete ? () => setShowDeleteConfirm(true) : null}
              onToggleStatus={onToggleStatus}
              statusLabel={finalStatus}
            />
          </div>

          {/* ── Título ── */}
          <h2 className="job-card__title">{title}</h2>

          {/* ── Meta: ubicación + fecha ── */}
          <div className="job-card__meta-row">
            <MapPin size={11} />
            <span>{ubicacion || "Sin ubicación"}</span>
            <span className="job-card__meta-sep">·</span>
            <Calendar size={11} />
            <span>Publicado el {formatDate(createdAt ?? created_at)}</span>
            {type && (
              <>
                <span className="job-card__meta-sep">·</span>
                <Globe size={11} />
                <span>{type}</span>
              </>
            )}
          </div>

          <div className="job-card__divider" />

          {/* ── Métricas: Postulantes / Entrevistas / Contratado ── */}
          <div className="job-card__metrics">
            <div className="job-card__metric">
              <div className="job-card__metric-icon job-card__metric-icon--users">
                <Users size={15} />
              </div>
              <div className="job-card__metric-text">
                <p className="job-card__metric-value">{postulantesCount ?? 0}</p>
                <p className="job-card__metric-label">Postulantes</p>
              </div>
            </div>
            <div className="job-card__metric">
              <div className="job-card__metric-icon job-card__metric-icon--clock">
                <Clock size={15} />
              </div>
              <div className="job-card__metric-text">
                <p className="job-card__metric-value">{interviewsCount ?? 0}</p>
                <p className="job-card__metric-label">Entrevistas</p>
              </div>
            </div>
            <div className="job-card__metric">
              <div className="job-card__metric-icon job-card__metric-icon--folder">
                <FolderCheck size={15} />
              </div>
              <div className="job-card__metric-text">
                <p className="job-card__metric-value">{hiredCount ?? 0}</p>
                <p className="job-card__metric-label">Contratado</p>
              </div>
            </div>
          </div>

          {/* ── Pipeline ── */}
          {pipeline && (
            <div className="job-card__pipeline">
              <PipeItem color="#10b981" label="Nuevos"      count={pipeline.nuevos}     />
              <PipeItem color="#6366f1" label="En revisión" count={pipeline.enRevision} />
              <PipeItem color="#e879f9" label="Entrevista"  count={pipeline.entrevista} />
              <PipeItem color="#f59e0b" label="Oferta"      count={pipeline.oferta}     />
            </div>
          )}
        </div>

        {/* ── Footer: solo Ver postulantes + Ver detalle ── */}
        <div className="job-card__footer">
          {onApply && (
            <button className="job-card__action-btn" onClick={onApply}>
              <Users size={14} /> Ver postulantes
            </button>
          )}
          <button className="job-card__detail-btn" onClick={() => setShowDetail(true)}>
            Ver detalle <ChevronRight size={12} />
          </button>
        </div>
      </motion.article>

      <AnimatePresence>
        {showDetail && (
          <DetailModal
            job={jobData}
            onClose={() => setShowDetail(false)}
            onEdit={onEdit ? () => { setShowDetail(false); onEdit(); } : null}
            onDelete={onDelete ? () => { setShowDetail(false); setShowDeleteConfirm(true); } : null}
          />
        )}
        {showDeleteConfirm && (
          <DeleteModal
            title={title} loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}