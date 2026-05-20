import { useState, useRef } from "react";
import { X, MapPin, Briefcase, GraduationCap, Code, Github, Linkedin, ExternalLink, ChevronLeft, FileText, Mail, Globe } from "lucide-react";
import { actualizarEstadoPostulacion } from "../../../services/postulationService";
import { obtenerCv } from "../../../services/cvService";
import { apiClient } from "../../../services/http/httpClient";

/* ─── Servicio perfil ─── */
async function obtenerPerfilPublico(id) {
  return apiClient.get(`/perfil/public/${id}/overview`);
}

/* ─── Constantes ─── */
const COLUMNAS = [
  { key: "in_verification", label: "En revisión",  color: "#854F0B", bg: "rgba(186,117,23,0.08)",  border: "rgba(186,117,23,0.25)", dot: "#BA7517" },
  { key: "accepted",        label: "Aceptados",    color: "#1a6e3c", bg: "rgba(39,174,96,0.08)",   border: "rgba(39,174,96,0.25)",  dot: "#27AE60" },
  { key: "refused",         label: "Rechazados",   color: "#c0392b", bg: "rgba(232,72,74,0.08)",   border: "rgba(232,72,74,0.25)",  dot: "#E8484A" },
];

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#dcfce7", color: "#166534" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ede9fe", color: "#5b21b6" },
  { bg: "#fce7f3", color: "#9d174d" },
];

/* ─── Helpers ─── */
function avatarColor(i) { return AVATAR_COLORS[i % AVATAR_COLORS.length]; }
function initials(name = "", last = "") { return `${name[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?"; }
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 3600)   return "Hace " + Math.floor(diff / 60) + " min";
  if (diff < 86400)  return "Hoy";
  if (diff < 172800) return "Ayer";
  return `Hace ${Math.floor(diff / 86400)}d`;
}
function formatPeriod(start, end, current) {
  if (!start) return "";
  const y1 = new Date(start).getFullYear();
  const y2 = current ? "Actualidad" : end ? new Date(end).getFullYear() : "";
  return y2 ? `${y1} – ${y2}` : `${y1}`;
}

/* ─── Skeleton ─── */
function Sk({ w = "100%", h = 12, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: "linear-gradient(90deg,#e8f4fc 25%,#d4eaf7 50%,#e8f4fc 75%)",
      backgroundSize: "200% 100%", animation: "kanban-shimmer 1.4s infinite",
    }} />
  );
}

/* ─── Avatar ─── */
function Avatar({ src, name, lastName, size = 40, index = 0 }) {
  const av = avatarColor(index);
  if (src) return (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e5e7eb" }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: av.bg, color: av.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, border: `1.5px solid ${av.color}33`,
    }}>
      {initials(name, lastName)}
    </div>
  );
}

/* ─── Tarjeta kanban ─── */
function KanbanCard({ postulant, index, onDragStart, onOpenProfile, busy, onChangeState }) {
  const col = COLUMNAS.find(c => c.key === postulant.state);
  return (
    <div
      draggable
      onDragStart={() => onDragStart(postulant)}
      onClick={() => onOpenProfile(postulant)}
      style={{
        background: "#fff",
        border: "1px solid rgba(162,214,249,0.5)",
        borderRadius: 12, padding: "12px 14px",
        cursor: "grab", userSelect: "none",
        boxShadow: "0 1px 6px rgba(14,30,60,0.06)",
        transition: "box-shadow 0.15s, transform 0.15s",
        opacity: busy ? 0.5 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,30,60,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(14,30,60,0.06)"; e.currentTarget.style.transform = ""; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Avatar src={postulant.foto_perfil} name={postulant.name} lastName={postulant.last_name} size={36} index={index} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0c1426", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {postulant.name} {postulant.last_name}
          </div>
          {postulant.job_title && (
            <div style={{ fontSize: 11, color: "#6b7fa0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {postulant.job_title}
            </div>
          )}
        </div>
      </div>

      {postulant.reason && (
        <p style={{
          fontSize: 11, color: "#4b5a6e", lineHeight: 1.55,
          margin: "0 0 8px", fontStyle: "italic",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          "{postulant.reason}"
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{timeAgo(postulant.created_at)}</span>
        {col && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
            background: col.bg, color: col.color, border: `1px solid ${col.border}`,
          }}>
            {col.label}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Columna kanban ─── */
function KanbanColumn({ col, postulants, dragging, onDragStart, onDrop, onOpenProfile, busyId }) {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(col.key); }}
      style={{
        flex: 1, minWidth: 260, maxWidth: 340,
        background: over ? col.bg : "rgba(248,250,252,0.8)",
        border: `1.5px dashed ${over ? col.border : "rgba(162,214,249,0.4)"}`,
        borderRadius: 16, padding: "14px 12px",
        transition: "background 0.15s, border-color 0.15s",
        display: "flex", flexDirection: "column", gap: 0,
      }}
    >
      {/* Header columna */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</span>
        <span style={{
          marginLeft: "auto", fontSize: 11, fontWeight: 700,
          background: col.bg, color: col.color,
          border: `1px solid ${col.border}`,
          borderRadius: 999, padding: "1px 8px",
        }}>
          {postulants.length}
        </span>
      </div>

      {/* Tarjetas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 80 }}>
        {postulants.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "24px 12px",
            fontSize: 12, color: "#9ca3af",
            border: "1.5px dashed rgba(162,214,249,0.5)",
            borderRadius: 10,
          }}>
            {over ? "Soltar aquí" : "Sin postulantes"}
          </div>
        ) : (
          postulants.map((p, i) => (
            <KanbanCard
              key={p.id_postulation}
              postulant={p}
              index={i}
              busy={busyId === p.id_postulation}
              onDragStart={onDragStart}
              onOpenProfile={onOpenProfile}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Tab bar ─── */
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #f0f4f8", marginBottom: 20 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: "10px 18px", fontSize: 13, fontWeight: active === t.key ? 700 : 500,
          color: active === t.key ? "#1a6fbd" : "#6b7fa0",
          background: "none", border: "none", cursor: "pointer",
          borderBottom: active === t.key ? "2px solid #1a6fbd" : "2px solid transparent",
          marginBottom: -1, transition: "all 0.15s",
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Skill pill ─── */
function SkillPill({ nombre, tipo, nivel_label }) {
  const isHard = tipo === "tecnica" || tipo === "hard";
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
      background: isHard ? "rgba(26,111,189,0.10)" : "rgba(93,202,165,0.12)",
      color: isHard ? "#1a6fbd" : "#0F6E56",
      border: `1px solid ${isHard ? "rgba(26,111,189,0.25)" : "rgba(15,110,86,0.2)"}`,
    }}>
      {nombre} {nivel_label ? `· ${nivel_label}` : ""}
    </span>
  );
}

/* ─── Modal perfil ─── */
function PostulantProfileModal({ postulant, onClose }) {
  const [tab, setTab]       = useState("perfil");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [cv, setCv]         = useState(null);
  const [loadingCv, setLoadingCv] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Carga perfil al abrir
  useState(() => {
    if (!postulant.id_postulant) return;
    setLoadingProfile(true);
    obtenerPerfilPublico(postulant.id_postulant)
      .then(res => {
        setProfile(res);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true))
      .finally(() => setLoadingProfile(false));
  }, [postulant.id_postulant]);

  // Carga CV solo cuando se abre esa tab
  function handleTabChange(key) {
    setTab(key);
    if (key === "cv" && !cv && !loadingCv && postulant.id_cv) {
      setLoadingCv(true);
      obtenerCv(postulant.id_cv)
        .then(res => setCv(res))
        .catch(() => setCv(null))
        .finally(() => setLoadingCv(false));
    }
  }

  const p = profile?.profile ?? {};
  const skills     = profile?.skills ?? [];
  const experience = profile?.experience ?? [];
  const formacion  = profile?.formacion ?? [];
  const projects   = profile?.projects ?? [];
  const socials    = profile?.socials?.links ?? [];

  const TABS = [
    { key: "perfil", label: "Perfil"     },
    { key: "carta",  label: "Carta"      },
    { key: "cv",     label: "CV"         },
  ];

  const skillsTecnicas = skills.filter(s => s.tipo === "tecnica" || s.tipo === "hard");
  const skillsBlandas  = skills.filter(s => s.tipo === "blanda"  || s.tipo === "soft");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20,
          width: "100%", maxWidth: 620,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        {/* Header del modal */}
        <div style={{
          padding: "24px 24px 0",
          borderBottom: "1px solid #f0f4f8",
          marginBottom: 0,
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "#f3f4f6", border: "none", borderRadius: 8,
            width: 32, height: 32, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "#6b7280",
          }}>
            <X size={16} />
          </button>

          {/* Info básica */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
            {loadingProfile ? (
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8f4fc", flexShrink: 0 }} />
            ) : (
              <Avatar
                src={p.foto_perfil || p.profile_photo}
                name={postulant.name}
                lastName={postulant.last_name}
                size={56}
                index={0}
              />
            )}
            <div style={{ flex: 1 }}>
              {loadingProfile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Sk w="50%" h={16} />
                  <Sk w="35%" h={12} />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0c1426", marginBottom: 3 }}>
                    {postulant.name} {postulant.last_name}
                  </div>
                  {postulant.job_title && (
                    <div style={{ fontSize: 13, color: "#6b7fa0", marginBottom: 4 }}>{postulant.job_title}</div>
                  )}
                  {p.ubicacion && (
                    <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} /> {p.ubicacion}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Redes sociales */}
            {!loadingProfile && socials.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {socials.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer" title={s.platform_name}
                    onClick={e => e.stopPropagation()}
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#6b7280", textDecoration: "none", fontSize: 13,
                      transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "#1a6fbd"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
                  >
                    {s.platform_key === "github"   && <Github size={14} />}
                    {s.platform_key === "linkedin" && <Linkedin size={14} />}
                    {s.platform_key === "x"        && <span style={{ fontSize: 12, fontWeight: 700 }}>𝕏</span>}
                    {!["github","linkedin","x"].includes(s.platform_key) && <Globe size={14} />}
                  </a>
                ))}
              </div>
            )}
          </div>

          <TabBar tabs={TABS} active={tab} onChange={handleTabChange} />
        </div>

        {/* Contenido de tabs */}
        <div style={{ padding: "20px 24px 24px" }}>

          {/* ── Tab: Perfil ── */}
          {tab === "perfil" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Biografía */}
              {loadingProfile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Sk w="100%" h={12} /><Sk w="80%" h={12} /><Sk w="60%" h={12} />
                </div>
              ) : p.biografia && (
                <p style={{ fontSize: 13, color: "#2e3d55", lineHeight: 1.7, margin: 0 }}>
                  {p.biografia}
                </p>
              )}

              {/* Skills técnicas */}
              {!loadingProfile && skillsTecnicas.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Code size={12} /> Habilidades técnicas
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skillsTecnicas.map(s => <SkillPill key={s.id} {...s} />)}
                  </div>
                </div>
              )}

              {/* Skills blandas */}
              {!loadingProfile && skillsBlandas.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Habilidades blandas
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skillsBlandas.map(s => <SkillPill key={s.id} {...s} />)}
                  </div>
                </div>
              )}

              {/* Experiencia */}
              {!loadingProfile && experience.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Briefcase size={12} /> Experiencia
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {experience.map(e => (
                      <div key={e.id} style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "#f8fafc", border: "1px solid #e5e7eb",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0c1426" }}>{e.cargo}</div>
                        <div style={{ fontSize: 12, color: "#1a6fbd", marginBottom: 4 }}>{e.empresa}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {formatPeriod(e.fecha_inicio, e.fecha_fin, e.actualmente)}
                        </div>
                        {e.descripcion && (
                          <p style={{ fontSize: 12, color: "#4b5a6e", margin: "6px 0 0", lineHeight: 1.6 }}>{e.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formación */}
              {!loadingProfile && formacion.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <GraduationCap size={12} /> Formación
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {formacion.map(f => (
                      <div key={f.id} style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "#f8fafc", border: "1px solid #e5e7eb",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0c1426" }}>{f.nombre_carrera}</div>
                        <div style={{ fontSize: 12, color: "#1a6fbd", marginBottom: 4 }}>{f.institucion}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {formatPeriod(f.fecha_inicio, f.fecha_fin, f.actualmente)} · {f.nivel_formacion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proyectos */}
              {!loadingProfile && projects.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                    Proyectos
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {projects.map(pr => (
                      <div key={pr.id} style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "#f8fafc", border: "1px solid #e5e7eb",
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0c1426", marginBottom: 3 }}>{pr.titulo}</div>
                          <div style={{ fontSize: 11, color: "#6b7fa0" }}>{pr.tecnologias}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          {pr.url_repositorio && (
                            <a href={pr.url_repositorio} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                              style={{ color: "#6b7280", display: "flex" }} title="Repositorio">
                              <Github size={15} />
                            </a>
                          )}
                          {pr.url_demo && (
                            <a href={pr.url_demo} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                              style={{ color: "#6b7280", display: "flex" }} title="Demo">
                              <ExternalLink size={15} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback si no cargó nada */}
              {profileLoaded && !loadingProfile && !p.biografia && skills.length === 0 && experience.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>
                  Este perfil no tiene información pública disponible.
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Carta ── */}
          {tab === "carta" && (
            <div>
              {postulant.reason ? (
                <div style={{
                  fontSize: 14, color: "#2e3d55", lineHeight: 1.75,
                  background: "rgba(162,214,249,0.08)",
                  border: "1px solid rgba(162,214,249,0.35)",
                  borderRadius: 12, padding: "18px 20px",
                  fontStyle: "italic",
                }}>
                  "{postulant.reason}"
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>
                  Este postulante no adjuntó carta de presentación.
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af", textAlign: "right" }}>
                Postulado {timeAgo(postulant.created_at)}
              </div>
            </div>
          )}

          {/* ── Tab: CV ── */}
          {tab === "cv" && (
            <div>
              {!postulant.id_cv ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>
                  Este postulante no adjuntó un CV.
                </div>
              ) : loadingCv ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Sk w="100%" h={14} /><Sk w="70%" h={12} /><Sk w="85%" h={12} />
                </div>
              ) : !cv ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#c0392b", fontSize: 13 }}>
                  No se pudo cargar el CV.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", background: "#f8fafc",
                    border: "1px solid #e5e7eb", borderRadius: 12,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "#dbeafe", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <FileText size={18} color="#1a6fbd" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0c1426" }}>{cv.name_cv ?? "CV"}</div>
                      {cv.description && (
                        <div style={{ fontSize: 12, color: "#6b7fa0", marginTop: 2 }}>{cv.description}</div>
                      )}
                    </div>
                  </div>

                  {/* Secciones del CV */}
                  {cv.details && cv.details.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {cv.details.map((d, i) => (
                        <div key={i} style={{
                          padding: "10px 14px", borderRadius: 10,
                          background: "#f8fafc", border: "1px solid #e5e7eb",
                          fontSize: 13, color: "#2e3d55",
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 2, color: "#0c1426" }}>{d.title ?? d.section}</div>
                          <div style={{ fontSize: 12, color: "#6b7fa0" }}>{d.content ?? d.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export default function PostulantesKanban({ postulants: initialPostulants = [] }) {
  const [postulants, setPostulants] = useState(initialPostulants);
  const [dragging, setDragging]     = useState(null);
  const [busyId, setBusyId]         = useState(null);
  const [selected, setSelected]     = useState(null);

  const byCol = (key) => postulants.filter(p => p.state === key);

  async function handleDrop(targetColKey) {
    if (!dragging || dragging.state === targetColKey) return;
    const id = dragging.id_postulation;
    setBusyId(id);

    // Optimistic update
    setPostulants(prev =>
      prev.map(p => p.id_postulation === id ? { ...p, state: targetColKey } : p)
    );
    setDragging(null);

    try {
      await actualizarEstadoPostulacion(id, targetColKey);
    } catch {
      // Revertir si falla
      setPostulants(prev =>
        prev.map(p => p.id_postulation === id ? { ...p, state: dragging.state } : p)
      );
      alert("No se pudo actualizar el estado.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <style>{`
        @keyframes kanban-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
        {COLUMNAS.map(col => (
          <KanbanColumn
            key={col.key}
            col={col}
            postulants={byCol(col.key)}
            dragging={dragging}
            busyId={busyId}
            onDragStart={setDragging}
            onDrop={handleDrop}
            onOpenProfile={setSelected}
          />
        ))}
      </div>

      {selected && (
        <PostulantProfileModal
          postulant={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}