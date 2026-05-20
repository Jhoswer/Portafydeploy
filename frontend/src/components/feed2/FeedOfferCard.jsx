import { useState } from "react";
import {
  MapPin, Briefcase, Monitor, Award, Clock,
  MoreHorizontal, Bookmark, X, CheckCircle,
  ThumbsUp, MessageCircle, Share2, FileText, Upload, Trash2
} from "lucide-react";
import { postularseAOferta } from "../../services/postulationService";

/* ─── Helpers ─── */
function truncate(text, max = 180) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatSalary(min, max, currency = "USD") {
  if (min && max) return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
  if (min) return `Desde ${currency} ${formatNumber(min)}`;
  if (max) return `Hasta ${currency} ${formatNumber(max)}`;
  return "";
}

const SPANISH_MONTHS = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];

function formatClosingDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${SPANISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function InfoBadge({ icon: Icon, label }) {
  if (!label) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#f9fafb", color: "#374151",
      fontSize: 12, fontWeight: 500,
      padding: "5px 10px", borderRadius: 999,
      border: "1px solid #e5e7eb",
    }}>
      <Icon size={12} style={{ color: "#6b7280" }} /> {label}
    </span>
  );
}

/* ─── CV Item en el modal ─── */
function CvOption({ cv, selected, onSelect }) {
  const isSelected = selected?.id === cv.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(isSelected ? null : cv)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", textAlign: "left",
        background: isSelected ? "#eff6ff" : "#f9fafb",
        border: `1.5px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
        borderRadius: 10, padding: "10px 14px",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: isSelected ? "#dbeafe" : "#e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <FileText size={16} color={isSelected ? "#2563eb" : "#6b7280"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {cv.name}
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          {cv.updatedAt ? `Actualizado el ${cv.updatedAt}` : "CV guardado"}
        </div>
      </div>
      {isSelected && (
        <CheckCircle size={16} color="#2563eb" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}

/* ─── Modal de postulación ─── */
function PostulationModal({ offer, userCvs = [], onClose, onSuccess }) {
  const [reason, setReason]         = useState("");
  const [selectedCv, setSelectedCv] = useState(userCvs[0] ?? null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [submitted, setSubmitted]   = useState(false);

  async function handleSubmit() {
    if (!reason.trim()) { setError("Por favor escribí una carta de presentación."); return; }
    setLoading(true);
    setError("");
    try {
      await postularseAOferta(offer.id_offer, reason.trim(), selectedCv?.id ?? null);
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      if (err?.status === 409 || err?.data?.message?.includes("already")) {
        setError("Ya te postulaste a esta oferta.");
      } else {
        setError(err?.message || "Ocurrió un error. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 999,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px",
  };

  const modalStyle = {
    background: "#fff", borderRadius: 16,
    width: "100%", maxWidth: 480,
    maxHeight: "90vh", overflowY: "auto",
    padding: "26px 24px", position: "relative",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
  };

  if (submitted) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle size={48} color="#047857" style={{ marginBottom: 14 }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#111" }}>¡Postulación enviada!</h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
              Tu postulación fue registrada. El equipo revisará tu perfil pronto.
            </p>
            <button onClick={onClose} style={{
              background: "#2563eb", color: "#fff", border: "none",
              borderRadius: 10, padding: "10px 28px", fontSize: 14,
              fontWeight: 600, cursor: "pointer",
            }}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "none", border: "none", cursor: "pointer",
          color: "#9ca3af", display: "flex", padding: 4, borderRadius: 6,
        }}>
          <X size={18} />
        </button>

        {/* Title */}
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px", color: "#111", paddingRight: 24 }}>
          Postularme a esta oferta
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
          {offer.company ? `${offer.title} · ${offer.company}` : offer.title}
        </p>

        {/* ── Sección CV ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              CV adjunto
            </label>
            {selectedCv && (
              <button
                type="button"
                onClick={() => setSelectedCv(null)}
                style={{
                  fontSize: 11, color: "#6b7280", background: "none",
                  border: "none", cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 4, padding: 0,
                }}
              >
                <Trash2 size={11} /> Quitar
              </button>
            )}
          </div>

          {userCvs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {userCvs.map(cv => (
                <CvOption
                  key={cv.id}
                  cv={cv}
                  selected={selectedCv}
                  onSelect={setSelectedCv}
                />
              ))}
            </div>
          ) : (
            /* Sin CVs guardados */
            <div style={{
              border: "1.5px dashed #e5e7eb", borderRadius: 10,
              padding: "16px", textAlign: "center",
              color: "#9ca3af", fontSize: 13,
            }}>
              <Upload size={20} style={{ marginBottom: 6, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No tenés ningún CV guardado en tu perfil.</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                Podés agregarlo desde tu <strong style={{ color: "#2563eb" }}>perfil profesional</strong>.
              </p>
            </div>
          )}

          {!selectedCv && userCvs.length > 0 && (
            <p style={{ fontSize: 12, color: "#f59e0b", margin: "8px 0 0" }}>
              Sin CV seleccionado — tu postulación se enviará sin adjunto.
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 18px" }} />

        {/* ── Carta de presentación ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "block", fontSize: 11, fontWeight: 700,
            color: "#6b7280", letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: 8,
          }}>
            Carta de presentación <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Contá por qué sos el candidato ideal para este puesto..."
            rows={5}
            maxLength={255}
            style={{
              width: "100%", boxSizing: "border-box",
              fontSize: 14, padding: "10px 12px",
              borderRadius: 10, border: "1px solid #e5e7eb",
              resize: "vertical", fontFamily: "inherit",
              outline: "none", color: "#111",
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "#93c5fd"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
          <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 4 }}>
            {reason.length}/255
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            background: "#f3f4f6", color: "#374151", border: "none",
            borderRadius: 10, padding: "10px 18px", fontSize: 14,
            fontWeight: 500, cursor: "pointer",
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: loading ? "#93c5fd" : "#2563eb",
            color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 22px", fontSize: 14,
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {loading ? "Enviando..." : (
              <><CheckCircle size={14} /> Enviar postulación</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export function FeedOfferCard({ post, token, onRequireAuth, userCvs = [], canReact = true, canComment = true }) {
  const [modalOpen, setModalOpen]           = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(post.appliedByMe ?? false);
  const [saved, setSaved]                   = useState(post.savedByMe ?? false);
  const [liked, setLiked]                   = useState(post.likedByMe ?? false);
  const [likes, setLikes]                   = useState(post.likes ?? 0);
  const [showComments, setShowComments]     = useState(false);
  const [commentText, setCommentText]       = useState("");
  const salaryText = formatSalary(post.salaryMin, post.salaryMax, post.currency);
  const closingText = post.closedAt ? `Cierra ${formatClosingDate(post.closedAt)}` : "";

  const handleLike = () => {
    if (onRequireAuth && !onRequireAuth("like")) return;
    if (!canReact) return;
    setLiked(l => !l);
    setLikes(n => liked ? Math.max(0, n - 1) : n + 1);
  };

  const openPostulation = () => {
    if (onRequireAuth && !onRequireAuth("postular")) return;
    setModalOpen(true);
  };

  const toggleOfferComments = () => {
    if (onRequireAuth && !onRequireAuth("comentar")) return;
    if (!canComment) return;
    setShowComments(s => !s);
  };

  const toggleOfferSave = () => {
    if (onRequireAuth && !onRequireAuth("guardar")) return;
    setSaved(s => !s);
  };

  const handleShare = () => {
    if (onRequireAuth && !onRequireAuth("compartir")) return;
  };

  /* ── estilos reutilizables ── */
  const iconBtnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 34, height: 34, borderRadius: 8,
    background: "none", border: "1px solid #e5e7eb",
    cursor: "pointer", transition: "all 0.15s", color: "#6b7280",
    flexShrink: 0,
  };

  return (
    <>
      <article className="card">

        {/* ── Header ── */}
        <div className="post-header">
          {post.avatar
            ? <img className="post-avatar" src={post.avatar} alt={post.author} />
            : (
              <div className="post-avatar" style={{
                background: "#185FA5", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 16,
              }}>
                {post.author?.[0] || "E"}
              </div>
            )
          }
          <div className="post-meta">
            <div className="post-author">{post.author}</div>
            <div className="post-subtitle">{post.subtitle}</div>
          </div>
          <button className="post-more" type="button" aria-label="Más opciones">
            <MoreHorizontal size={17} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="post-body">
          <div className="post-kind-pill project" style={{
            background: "#eff6ff", color: "#1d4ed8",
            border: "1px solid #bfdbfe", marginBottom: 12,
          }}>
            <Briefcase size={12} />
            <span>Convocatoria</span>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.35 }}>
            {post.title}
          </h3>

          {post.description && (
            <p className="post-description" style={{ marginBottom: 14 }}>
              {truncate(post.description)}
            </p>
          )}

          {post.bannerUrl && (
            <img src={post.bannerUrl} alt={post.title} style={{
              width: "100%", maxHeight: 220, objectFit: "cover",
              borderRadius: 12, display: "block", marginBottom: 14,
            }} />
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            <InfoBadge icon={Briefcase} label={post.tipo_contrato} />
            <InfoBadge icon={Monitor} label={post.modalidad} />
            <InfoBadge icon={Award} label={post.nivel} />
            <InfoBadge icon={MapPin} label={post.ubicacion} />
            <InfoBadge icon={Briefcase} label={salaryText} />
            <InfoBadge icon={Clock} label={closingText} />
          </div>
        </div>

        {/* ── Stats ── */}
        {(likes > 0 || post.comments > 0) && (
          <div className="post-stats">
            {likes > 0 && <span>{likes} me gusta</span>}
            {likes > 0 && post.comments > 0 && <span>&nbsp;·&nbsp;</span>}
            {post.comments > 0 && <span>{post.comments} comentarios</span>}
          </div>
        )}

        {/* ── Separador ── */}
        <div style={{ height: 1, background: "#f3f4f6", margin: "0 18px" }} />

        {/* ── FILA ÚNICA: iconos sociales + Postularme ── */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: 6, padding: "10px 14px",
        }}>

          {/* Botones sociales: solo iconos */}
          <button
            type="button"
            title={liked ? "Quitar me gusta" : "Me gusta"}
            onClick={handleLike}
            disabled={!canReact}
            style={{
              ...iconBtnBase,
              color: liked ? "#2563eb" : "#6b7280",
              background: liked ? "#eff6ff" : "none",
              borderColor: liked ? "#bfdbfe" : "#e5e7eb",
              opacity: canReact ? 1 : 0.55,
              cursor: canReact ? "pointer" : "not-allowed",
            }}
          >
            <ThumbsUp size={15} fill={liked ? "currentColor" : "none"} />
          </button>

          <button
            type="button"
            title="Comentar"
            onClick={toggleOfferComments}
            disabled={!canComment}
            style={{
              ...iconBtnBase,
              color: showComments ? "#2563eb" : "#6b7280",
              background: showComments ? "#eff6ff" : "none",
              borderColor: showComments ? "#bfdbfe" : "#e5e7eb",
              opacity: canComment ? 1 : 0.55,
              cursor: canComment ? "pointer" : "not-allowed",
            }}
          >
            <MessageCircle size={15} />
          </button>

          <button
            type="button"
            title="Compartir"
            onClick={handleShare}
            style={iconBtnBase}
          >
            <Share2 size={15} />
          </button>

          <button
            type="button"
            title={saved ? "Guardado" : "Guardar"}
            onClick={toggleOfferSave}
            style={{
              ...iconBtnBase,
              color: saved ? "#2563eb" : "#6b7280",
              background: saved ? "#eff6ff" : "none",
              borderColor: saved ? "#bfdbfe" : "#e5e7eb",
            }}
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Botón Postularme */}
          {alreadyApplied ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#ecfdf5", color: "#047857",
              borderRadius: 10, padding: "8px 16px",
              fontWeight: 600, fontSize: 13,
              border: "1px solid #a7f3d0", whiteSpace: "nowrap",
            }}>
              <CheckCircle size={14} /> Ya postulado
            </span>
          ) : (
            <button
              type="button"
              onClick={openPostulation}
              style={{
                background: "#2563eb", color: "#fff",
                borderRadius: 10, padding: "8px 18px",
                fontWeight: 600, fontSize: 14,
                border: "none", cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Briefcase size={13} /> Postularme
            </button>
          )}
        </div>

        {/* ── Sección comentarios ── */}
        {showComments && (
          <div style={{ padding: "0 18px 14px", borderTop: "1px solid #f3f4f6" }}>
            {post.commentsList?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {post.commentsList.slice(0, 3).map((c, i) => (
                  <div key={i} className="post-comment">
                    <strong>{c.author}</strong>
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            )}
            <form
              onSubmit={e => {
                e.preventDefault();
                if (onRequireAuth && !onRequireAuth("comentar")) return;
                if (!canComment) return;
                setCommentText("");
              }}
              style={{ display: "flex", gap: 8 }}
            >
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                style={{
                  flex: 1, border: "1px solid #dbeafe",
                  borderRadius: 999, padding: "8px 14px",
                  fontSize: 13, outline: "none", fontFamily: "inherit",
                }}
                disabled={!canComment}
              />
              <button className="action-btn" type="submit" disabled={!canComment}>Publicar</button>
            </form>
          </div>
        )}

      </article>

      {/* Modal */}
      {modalOpen && (
        <PostulationModal
          offer={{ id_offer: post.offerId, title: post.title, company: post.author }}
          userCvs={userCvs}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setAlreadyApplied(true);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}
