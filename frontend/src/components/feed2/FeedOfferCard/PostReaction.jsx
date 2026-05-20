import { useState, useRef, useEffect } from "react";
import { ThumbsUp, MessageCircle, Bookmark, Briefcase, CheckCircle, Share2, X, Copy, Check } from "lucide-react";

// ─── Modal de compartir ───────────────────────────────────────────────────────

const SHARE_OPTIONS = [
  {
    label: "WhatsApp",
    bg: "#25D366",
    getUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882l6.196-1.424A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.79 9.79 0 01-5.046-1.399l-.361-.214-3.742.86.93-3.646-.235-.374A9.757 9.757 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    bg: "#1877F2",
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    bg: "#000",
    getUrl: (url, text) => `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    icon: () => <X size={18} />,
  },
  {
    label: "LinkedIn",
    bg: "#0A66C2",
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: "Telegram",
    bg: "#2AABEE",
    getUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.15 14.226l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.666.36z"/>
      </svg>
    ),
  },
  {
    label: "Correo",
    bg: "#6b7280",
    getUrl: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
    icon: () => <span style={{ fontSize: 18 }}>✉</span>,
  },
];

function ShareModal({ isOpen, onClose, url, shareText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12,
          width: "100%", maxWidth: 460,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Cabecera */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Compartir publicación</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Íconos de plataformas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, padding: "16px 12px 8px" }}>
          {SHARE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { const u = opt.getUrl(url, shareText); if (u) window.open(u, "_blank", "noopener"); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 4px", borderRadius: 8, border: "none", background: "none", cursor: "pointer" }}
            >
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: opt.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <opt.icon />
              </div>
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, textAlign: "center" }}>{opt.label}</span>
            </button>
          ))}
        </div>

        <div style={{ height: 1, background: "#e5e7eb", margin: "4px 16px" }} />

        {/* Copiar enlace */}
        <div style={{ display: "flex", gap: 8, padding: "10px 16px 16px" }}>
          <div style={{ flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {url}
          </div>
          <button
            onClick={handleCopy}
            style={{ padding: "8px 14px", borderRadius: 8, background: copied ? "#16a34a" : "#1877F2", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
          >
            {copied ? <><Check size={13} /> ¡Copiado!</> : <><Copy size={13} /> Copiar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PostReactions({
  liked, likes, saved, saves,
  showComments, commentsCount,
  busy,
  onLike, onSave, onToggleComment,
  alreadyApplied, onApply,
  // 👇 Agrega estas dos props al post que le pases
  shareUrl,   // ej: "https://miapp.com/oferta/123"
  shareText,  // ej: "Mira esta oferta de trabajo"
}) {
  const [shareOpen, setShareOpen] = useState(false);

  const pill = (active) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 999,
    border: `0.5px solid ${active ? "#bfdbfe" : "var(--color-border-tertiary)"}`,
    background: active ? "#eff6ff" : "var(--color-background-primary)",
    color: active ? "#1d4ed8" : "var(--color-text-secondary)",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", flexWrap: "wrap" }}>

        <button type="button" onClick={onLike} disabled={busy === "like"} style={pill(liked)}>
          <ThumbsUp size={15} fill={liked ? "currentColor" : "none"}
            style={{ transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)", transform: liked ? "scale(1.2)" : "scale(1)" }}
          />
          Me gusta
        </button>

        <button type="button" onClick={onToggleComment} style={pill(showComments)}>
          <MessageCircle size={15} /> Comentar
        </button>

        <button type="button" onClick={onSave} disabled={busy === "save"}
          style={{ ...pill(saved), color: saved ? "#1d4ed8" : "var(--color-text-secondary)" }}>
          <Bookmark size={15} fill={saved ? "currentColor" : "none"}
            style={{ transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)", transform: saved ? "scale(1.2)" : "scale(1)" }}
          />
          {saved ? "Guardado" : "Guardar"}
        </button>

        {/* 👇 Botón nuevo */}
        <button type="button" onClick={() => setShareOpen(true)} style={pill(false)}>
          <Share2 size={15} /> Compartir
        </button>

        <div style={{ flex: 1 }} />

        {alreadyApplied ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ecfdf5", color: "#047857", borderRadius: 999, padding: "7px 16px", fontWeight: 500, fontSize: 13, border: "0.5px solid #a7f3d0" }}>
            <CheckCircle size={14} /> Ya postulado
          </span>
        ) : (
          <button type="button" onClick={onApply}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", borderRadius: 999, padding: "7px 16px", fontWeight: 500, fontSize: 13, border: "none", cursor: "pointer" }}>
            <Briefcase size={14} /> Postularme
          </button>
        )}

      </div>

      {/* 👇 Modal — se renderiza fuera del div de botones */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl ?? window.location.href}
        shareText={shareText ?? "Mirá esta publicación"}
      />
    </>
  );
}