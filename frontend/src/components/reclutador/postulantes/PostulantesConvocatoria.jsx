import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, LayoutGrid, List, X,
  Mail, Phone, MapPin, FileText, User,
  ChevronRight, GripVertical, Briefcase,
  Calendar, CheckCircle, XCircle, Clock, AlertCircle, Video, Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { actualizarEstadoPostulacion, crearEntrevista } from "../../../services/postulationService";
import { useEmpresa } from "../../../lib/EmpresaContext";
import { toast } from "sonner";
import InterviewModal from "./InterviewModal";

const REFRESH_INTERVAL_MS = 30_000;

const COLUMNS = [
  { key: "new",             label: "Nuevo",         color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)",  icon: AlertCircle },
  { key: "in_verification", label: "En revisión",   color: "#6366f1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.2)",  icon: Clock       },
  { key: "in_interview",    label: "En entrevista", color: "#e879f9", bg: "rgba(232,121,249,0.08)", border: "rgba(232,121,249,0.2)", icon: User        },
  { key: "accepted",        label: "Aceptado",      color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  icon: CheckCircle },
  { key: "refused",         label: "Rechazado",     color: "#f43f5e", bg: "rgba(244,63,94,0.08)",   border: "rgba(244,63,94,0.2)",   icon: XCircle     },
];

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function resolvePostulant(raw) {
  if (raw.id_postulation && raw.name) {
    return {
      id:        raw.id_postulation,
      userId:    raw.id_profile ?? raw.id_user ?? raw.id_postulant ?? raw.user_id ?? null,
      state:     raw.state ?? "new",
      reason:    raw.reason ?? "",
      createdAt: raw.created_at ?? null,
      name:      `${raw.name ?? ""} ${raw.last_name ?? ""}`.trim(),
      email:     raw.email ?? "",
      phone:     "",
      location:  "",
      photo:     raw.profile_photo ?? null,
      career:    raw.job_title ?? "",
      bio:       raw.biography ?? "",
      cvUrl:     raw.cv_url ?? raw.archive_pdf ?? null,
      cvName:    raw.cv_name ?? "Curriculum.pdf",
      has_cv:    raw.has_cv ?? !!raw.id_cv,
      id_cv:     raw.id_cv ?? null,
      experience: [],
      education:  [],
      interview: raw.interview ?? null,
    };
  }

  const p  = raw?.postulant ?? raw?.profile ?? raw?.user ?? raw ?? {};
  const cv = raw?.cv ?? raw?.CV ?? null;
  return {
    id:        raw.id_postulation ?? raw.id ?? raw.id_postulant,
    userId:    raw.id_profile ?? raw.id_user ?? raw.id_postulant ?? p.id ?? p.id_user ?? null,
    state:     raw.state ?? "new",
    reason:    raw.reason ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    name:      p.name ?? p.full_name ?? `Postulante #${raw.id_postulation ?? "?"}`,
    email:     p.email ?? p.correo ?? "",
    phone:     p.phone ?? p.telefono ?? "",
    location:  p.location ?? p.ubicacion ?? "",
    photo:     p.photo_url ?? p.profile_photo ?? null,
    career:    p.career ?? p.job_title ?? "",
    bio:       p.bio ?? p.biography ?? "",
    cvUrl:     cv?.url ?? raw.cv_url ?? raw.archive_pdf ?? null,
    cvName:    cv?.name ?? raw.cv_name ?? "Curriculum.pdf",
    has_cv:    raw.has_cv ?? !!cv,
    experience: [],
    education:  [],
  };
}

function Avatar({ name, photo, size = 36 }) {
  const initials = getInitials(name);
  if (photo) {
    return (
      <img src={photo} alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  const colors = ["#6366f1", "#10b981", "#f59e0b", "#e879f9", "#38bdf8", "#f43f5e"];
  const color  = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}22`, border: `1.5px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 600, color,
    }}>
      {initials}
    </div>
  );
}

function StateBadge({ state }) {
  const col = COLUMNS.find((c) => c.key === state) ?? COLUMNS[0];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: col.bg, border: `1px solid ${col.border}`,
      fontSize: 11, fontWeight: 500, color: col.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
      {col.label}
    </span>
  );
}

function PostulantRow({ postulant, onClick }) {
  const navigate = useNavigate();

  return (
    <motion.div className="post-row" onClick={() => onClick(postulant)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ x: 2 }}
    >
      <Avatar name={postulant.name} photo={postulant.photo} size={40} />
      <div className="post-row__info">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p className="post-row__name">{postulant.name}</p>
          <button
            className="ver-perfil-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/perfil-profesional?usuario=${postulant.userId ?? postulant.id}`);
            }}
          >
            Ver perfil
          </button>
          {postulant.email && (
            <button
              className="contactar-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(postulant.email);
                window.open(`https://mail.google.com/mail/?view=cm&to=${postulant.email}`, "_blank");
              }}
            >
              <Mail size={11} /> Contactar
            </button>
          )}
        </div>
        <div className="post-row__meta">
          {postulant.career   && <span><Briefcase size={10} /> {postulant.career}</span>}
          {postulant.location && <span><MapPin size={10} /> {postulant.location}</span>}
          {postulant.email    && <span><Mail size={10} /> {postulant.email}</span>}
        </div>
      </div>
      <StateBadge state={postulant.state} />
      <ChevronRight size={14} className="post-row__arrow" />
    </motion.div>
  );
}

function KanbanCard({ postulant, onDragStart, onClick }) {
  return (
    <motion.div className="kanban-card" draggable
      onDragStart={(e) => onDragStart(e, postulant)}
      onClick={() => onClick(postulant)}
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -2 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Avatar name={postulant.name} photo={postulant.photo} size={34} />
        <div style={{ minWidth: 0 }}>
          <p className="kanban-card__name">{postulant.name}</p>
          {postulant.career && <p className="kanban-card__career">{postulant.career}</p>}
        </div>
        <GripVertical size={13} className="kanban-card__grip" />
      </div>
      {postulant.location && <div className="kanban-card__meta"><MapPin size={10} />{postulant.location}</div>}
      {postulant.cvUrl    && <div className="kanban-card__cv"><FileText size={11} /> CV adjunto</div>}
    </motion.div>
  );
}

function KanbanColumn({ column, postulants, onDrop, onDragOver, onDragStart, onCardClick }) {
  const Icon = column.icon;
  return (
    <div className="kanban-col"
      onDragOver={(e) => { e.preventDefault(); onDragOver(column.key); }}
      onDrop={(e) => onDrop(e, column.key)}
      style={{ "--col-color": column.color, "--col-bg": column.bg, "--col-border": column.border }}
    >
      <div className="kanban-col__header">
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon size={13} style={{ color: column.color }} />
          <span className="kanban-col__title">{column.label}</span>
        </div>
        <span className="kanban-col__count">{postulants.length}</span>
      </div>
      <div className="kanban-col__body">
        <AnimatePresence>
          {postulants.map((p) => (
            <KanbanCard key={p.id} postulant={p} onDragStart={onDragStart} onClick={onCardClick} />
          ))}
        </AnimatePresence>
        {postulants.length === 0 && <div className="kanban-col__empty">Arrastra aquí</div>}
      </div>
    </div>
  );
}

function ProfileModal({ postulant, onClose, onStateChange }) {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState(postulant.state);

  useEffect(() => {
    setSelectedState(postulant.state);
  }, [postulant.state]);

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    onStateChange(postulant.id, newState);
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <motion.div className="profile-modal" onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="profile-modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name={postulant.name} photo={postulant.photo} size={52} />
            <div>
              <h2 className="profile-modal__name">{postulant.name}</h2>
              {postulant.career && <p className="profile-modal__career">{postulant.career}</p>}
              <button
                className="ver-perfil-btn"
                style={{ marginTop: 6 }}
                onClick={() => navigate(`/perfil-profesional?usuario=${postulant.userId ?? postulant.id}`)}
              >
                Ver perfil completo
              </button>
              {postulant.email && (
                <button
                  className="contactar-btn"
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    navigator.clipboard.writeText(postulant.email);
                    window.open(`https://mail.google.com/mail/?view=cm&to=${postulant.email}`, "_blank");
                  }}
                >
                  <Mail size={11} /> Contactar
                </button>
              )}
            </div>
          </div>
          <button className="profile-modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="profile-modal__body">
          <div className="profile-section">
            <p className="profile-section__label">Curriculum Vitae</p>
            {postulant.cvUrl ? (
              <a href={postulant.cvUrl} target="_blank" rel="noreferrer" className="profile-cv-btn">
                <FileText size={15} />
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 13 }}>{postulant.cvName}</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>Abrir o descargar CV</p>
                </div>
                <ChevronRight size={14} style={{ marginLeft: "auto" }} />
              </a>
            ) : (postulant.has_cv || postulant.id_cv) ? (
              <div className="profile-cv-btn" style={{ cursor: "default", opacity: 0.7 }}>
                <FileText size={15} style={{ color: "#10b981" }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 13 }}>CV registrado</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>El postulante tiene CV en el sistema</p>
                </div>
              </div>
            ) : (
              <p className="profile-section__empty">No adjuntó CV</p>
            )}
          </div>

          {postulant.reason && (
            <div className="profile-section">
              <p className="profile-section__label">Carta de presentación</p>
              <p className="profile-section__text">{postulant.reason}</p>
            </div>
          )}

          {postulant.bio && (
            <div className="profile-section">
              <p className="profile-section__label">Sobre el postulante</p>
              <p className="profile-section__text">{postulant.bio}</p>
            </div>
          )}

          {/* 👇 AQUÍ, después del CV */}
  {postulant.state === "in_interview" && postulant.interview && (
    <div className="profile-section">
      <p className="profile-section__label">Entrevista agendada</p>
      <div className="profile-cv-btn" style={{ cursor: "default", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {postulant.interview.type === "virtual"
            ? <Video size={14} style={{ color: "#e879f9" }} />
            : <Building2 size={14} style={{ color: "#e879f9" }} />
          }
          <span style={{ fontWeight: 500, fontSize: 13 }}>
            {postulant.interview.type === "virtual" ? "Virtual" : "Presencial"}
          </span>
        </div>
        {postulant.interview.interview_date && (
          <div style={{ fontSize: 12, opacity: 0.7, display: "flex", gap: 6 }}>
            <Calendar size={11} />
            {postulant.interview.interview_date}
            {postulant.interview.interview_time && ` — ${postulant.interview.interview_time}`}
          </div>
        )}
        {postulant.interview.type === "virtual" && postulant.interview.link && (
          <a href={postulant.interview.link} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "#6366f1", wordBreak: "break-all" }}>
            {postulant.interview.link}
          </a>
        )}
        {postulant.interview.type === "presencial" && postulant.interview.address && (
          <div style={{ fontSize: 12, opacity: 0.7, display: "flex", gap: 6 }}>
            <MapPin size={11} /> {postulant.interview.address}
          </div>
        )}
      </div>
    </div>
  )}

          <div className="profile-section">
            <p className="profile-section__label">Estado de la postulación</p>
            <div className="profile-states">
              {COLUMNS.map((col) => {
                const Icon = col.icon;
                const active = selectedState === col.key;
                return (
                  <button key={col.key}
                    className={`profile-state-btn${active ? " profile-state-btn--active" : ""}`}
                    style={active ? { background: col.bg, border: `1.5px solid ${col.color}`, color: col.color } : {}}
                    onClick={() => handleStateChange(col.key)}
                  >
                    <Icon size={13} />{col.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedState === "refused" && (
            <div className="profile-section">
              <p className="profile-section__label">Motivo de rechazo</p>
              <p className="profile-section__text" style={{ color: "#f43f5e" }}>
                {postulant.reason || "Sin motivo registrado"}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────
export default function PostulantesConvocatoria({ jobId, jobTitle, onBack }) {
  const {
    convocatorias,
    getPostulantes,
    refreshPostulantes,
    updatePostulanteState,
  } = useEmpresa();

  const [postulants, setPostulants]             = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [view, setView]                         = useState("lista");
  const [search, setSearch]                     = useState("");
  const [selected, setSelected]                 = useState(null);
  const [dragItem, setDragItem]                 = useState(null);
  const [dragOverCol, setDragOverCol]           = useState(null);
  const [interviewPending, setInterviewPending] = useState(null);

  // ── Carga inicial: muestra caché + refresca del backend ─
  useEffect(() => {
    if (!jobId) return;
    const fromContext = getPostulantes(jobId);
    if (fromContext.length > 0) {
      setPostulants(fromContext.map(resolvePostulant));
      setLoading(false);
    }
    refreshPostulantes(jobId).finally(() => setLoading(false));
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sincronizar con el contexto cuando cambia ──────────
  useEffect(() => {
    const fromContext = getPostulantes(jobId);
    if (fromContext.length > 0) {
      setPostulants(fromContext.map(resolvePostulant));
    }
  }, [convocatorias]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-refresh cada 30 segundos ──────────────────────
  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(() => {
      refreshPostulantes(jobId);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return postulants;
    return postulants.filter((p) =>
      p.name.toLowerCase().includes(q)    ||
      p.email.toLowerCase().includes(q)   ||
      p.career.toLowerCase().includes(q)  ||
      p.location.toLowerCase().includes(q)
    );
  }, [postulants, search]);

  const grouped = useMemo(() => {
    const map = {};
    COLUMNS.forEach((c) => { map[c.key] = []; });
    filtered.forEach((p) => {
      const key = map[p.state] !== undefined ? p.state : "new";
      map[key].push(p);
    });
    return map;
  }, [filtered]);

  // ── Cambiar estado: optimista + API + sync contexto ────
  const handleStateChange = async (id, newState, skipInterviewCheck = false) => {
    // Si va a "en entrevista", abrir el modal de entrevista primero
    if (newState === "in_interview" && !skipInterviewCheck) {
      const postulant = postulants.find((p) => p.id === id);
      setInterviewPending({ id, postulant });
      return;
    }

    let prevPostulants;

    // 1. Actualización optimista local
    setPostulants((prev) => {
      prevPostulants = prev;
      return prev.map((p) => p.id === id ? { ...p, state: newState } : p);
    });

    // 2. Actualizar el modal si está abierto
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, state: newState } : prev);
    }

    try {
      // 3. Llamada a la API
      await actualizarEstadoPostulacion(id, newState);

      // 4. Sincronizar el contexto global
      updatePostulanteState(jobId, id, newState);

      toast.success(
        newState === "new"             ? "Marcado como Nuevo"    :
        newState === "in_verification" ? "En revisión"           :
        newState === "in_interview"    ? "Entrevista agendada ✓" :
        newState === "accepted"        ? "Postulante aceptado ✓" :
        newState === "refused"         ? "Postulante rechazado"  :
        "Estado actualizado"
      );
    } catch {
      // 5. Revertir si falla
      setPostulants(prevPostulants);
      if (selected?.id === id) {
        const prev = prevPostulants?.find((p) => p.id === id);
        setSelected((s) => s ? { ...s, state: prev?.state ?? s.state } : s);
      }
      toast.error("No se pudo actualizar el estado. Intenta de nuevo.");
    }
  };

  const handleInterviewConfirm = async (details) => {
    const { id } = interviewPending;
    setInterviewPending(null);
    try {
      await crearEntrevista(id, details);
      handleStateChange(id, "in_interview", true);
    } catch {
      toast.error("No se pudo agendar la entrevista. Intenta de nuevo.");
    }
  };

  const handleDragStart = (e, postulant) => {
    setDragItem(postulant);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, colKey) => {
    e.preventDefault();
    if (dragItem && dragItem.state !== colKey) {
      handleStateChange(dragItem.id, colKey);
    }
    setDragItem(null);
    setDragOverCol(null);
  };

  const counts = useMemo(() => {
    const map = {};
    COLUMNS.forEach((c) => { map[c.key] = postulants.filter((p) => p.state === c.key).length; });
    return map;
  }, [postulants]);

  if (loading) {
    return (
      <div className="pc-loading">
        <div className="pc-loading__spinner" />
        <p>Cargando postulantes...</p>
      </div>
    );
  }

  return (
    <div className="pc-wrap">
      <div className="pc-header">
        <div className="pc-header__top">
          <button className="pc-back-btn" onClick={onBack}>
            <ArrowLeft size={15} /> Volver
          </button>
          <div className="pc-header__title-block">
            <h1 className="pc-title">{jobTitle ?? "Convocatoria"}</h1>
            <p className="pc-subtitle">{postulants.length} postulante{postulants.length !== 1 ? "s" : ""} en total</p>
          </div>
        </div>

        <div className="pc-stats">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            return (
              <div key={col.key} className="pc-stat" style={{ "--s-color": col.color, "--s-bg": col.bg }}>
                <Icon size={13} style={{ color: col.color }} />
                <span className="pc-stat__count">{counts[col.key]}</span>
                <span className="pc-stat__label">{col.label}</span>
              </div>
            );
          })}
        </div>

        <div className="pc-toolbar">
          <div className="pc-search">
            <Search size={14} className="pc-search__icon" />
            <input type="text" className="pc-search__input"
              placeholder="Buscar por nombre, email, carrera..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="pc-search__clear" onClick={() => setSearch("")}>
                <X size={12} />
              </button>
            )}
          </div>
          <div className="pc-view-toggle">
            <button className={`pc-view-btn${view === "lista" ? " pc-view-btn--active" : ""}`}
              onClick={() => setView("lista")} title="Vista lista"><List size={15} /></button>
            <button className={`pc-view-btn${view === "kanban" ? " pc-view-btn--active" : ""}`}
              onClick={() => setView("kanban")} title="Vista kanban"><LayoutGrid size={15} /></button>
          </div>
        </div>
      </div>

      {view === "lista" && (
        <div className="pc-list">
          {filtered.length === 0 ? (
            <div className="pc-empty">
              <User size={28} />
              <p>{search ? "Sin resultados para esa búsqueda" : "No hay postulantes aún"}</p>
            </div>
          ) : (
            filtered.map((p) => <PostulantRow key={p.id} postulant={p} onClick={setSelected} />)
          )}
        </div>
      )}

      {view === "kanban" && (
        <div className="pc-kanban">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.key} column={col}
              postulants={grouped[col.key] ?? []}
              onDragStart={handleDragStart}
              onDragOver={setDragOverCol}
              onDrop={handleDrop}
              onCardClick={setSelected}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {interviewPending && (
          <InterviewModal
            postulant={interviewPending.postulant}
            onConfirm={handleInterviewConfirm}
            onCancel={() => setInterviewPending(null)}
          />
        )}
        {selected && !interviewPending && (
          <ProfileModal
            postulant={selected}
            onClose={() => setSelected(null)}
            onStateChange={handleStateChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}