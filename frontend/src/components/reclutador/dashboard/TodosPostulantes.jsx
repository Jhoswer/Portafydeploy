import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Briefcase, Users } from "lucide-react";
import { obtenerMisOfertas } from "../../../services/offerService";
import { obtenerPostulantes, actualizarEstadoPostulacion } from "../../../services/postulationService";
import PostulantesKanban from "../postulantes/PostulantesKanban";

/* ─── Cache helpers ─── */
const CACHE_KEYS = {
  offers:      "pf_recruiter_offers",
  postulants:  (id) => `pf_recruiter_postulants_${id}`,
};

function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    // TTL: 5 minutos
    if (Date.now() - ts > 5 * 60 * 1000) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch { return null; }
}

function cacheSet(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); }
  catch { /* sessionStorage lleno, ignorar */ }
}

function cacheUpdate(key, updater) {
  const current = cacheGet(key);
  if (current) cacheSet(key, updater(current));
}

/* ─── Helpers de formato ─── */
const ESTADOS = {
  in_verification: { label: "En revisión", color: "#854F0B", bg: "rgba(186,117,23,0.12)", border: "rgba(186,117,23,0.25)" },
  accepted:        { label: "Aceptado",    color: "#1a6e3c", bg: "rgba(39,174,96,0.10)",  border: "rgba(39,174,96,0.25)"  },
  refused:         { label: "Rechazado",   color: "#c0392b", bg: "rgba(232,72,74,0.10)",  border: "rgba(232,72,74,0.25)"  },
};

const FILTROS = [
  { key: "all",             label: "Todos"       },
  { key: "in_verification", label: "En revisión" },
  { key: "accepted",        label: "Aceptados"   },
  { key: "refused",         label: "Rechazados"  },
];

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#dcfce7", color: "#166534" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ede9fe", color: "#5b21b6" },
  { bg: "#fce7f3", color: "#9d174d" },
];

function getAvatarColor(i) { return AVATAR_COLORS[i % AVATAR_COLORS.length]; }
function initials(name = "", lastName = "") {
  return `${name[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${M[d.getMonth()]}. ${d.getFullYear()}`;
}
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 3600)   return "Hace " + Math.floor(diff / 60) + " min";
  if (diff < 86400)  return "Hoy";
  if (diff < 172800) return "Ayer";
  return `Hace ${Math.floor(diff / 86400)}d`;
}

/* ─── Skeleton ─── */
function Skeleton({ w = "100%", h = 14, radius = 8, mb = 0 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, #e8f4fc 25%, #d4eaf7 50%, #e8f4fc 75%)",
      backgroundSize: "200% 100%",
      animation: "pf-shimmer 1.4s infinite",
      marginBottom: mb,
      flexShrink: 0,
    }} />
  );
}

function OfferSkeleton() {
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(162,214,249,0.5)",
      borderRadius: 16, padding: "16px 20px",
      boxShadow: "0 2px 10px rgba(14,30,60,0.04)",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <Skeleton w={44} h={44} radius={12} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton w="55%" h={14} />
        <Skeleton w="35%" h={11} />
      </div>
      <Skeleton w={16} h={16} radius={4} />
    </div>
  );
}

function PostulantSkeleton() {
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(162,214,249,0.5)",
      borderRadius: 16, padding: "16px 20px",
      boxShadow: "0 2px 12px rgba(14,30,60,0.05)",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Skeleton w={44} h={44} radius={999} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton w="40%" h={14} />
          <Skeleton w="60%" h={11} />
        </div>
        <Skeleton w={40} h={11} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Skeleton w="100%" h={54} radius={10} />
      </div>
      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Skeleton w={80} h={32} radius={10} />
        <Skeleton w={80} h={32} radius={10} />
      </div>
    </div>
  );
}

/* ─── Badge ─── */
function StateBadge({ state }) {
  const e = ESTADOS[state] ?? { label: state, color: "#5F5E5A", bg: "rgba(0,0,0,0.06)", border: "rgba(0,0,0,0.10)" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
      background: e.bg, color: e.color, border: `1px solid ${e.border}`,
    }}>
      {e.label}
    </span>
  );
}

/* ─── Tarjeta postulante ─── */
function PostulantCard({ postulant, index, onChangeState, busy }) {
  const av = getAvatarColor(index);
  const isAccepted = postulant.state === "accepted";
  const isRefused  = postulant.state === "refused";

  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(162,214,249,0.5)",
      borderRadius: 16, padding: "16px 20px",
      boxShadow: "0 2px 12px rgba(14,30,60,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: av.bg, color: av.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, border: `1.5px solid ${av.color}33`,
        }}>
          {initials(postulant.name, postulant.last_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0c1426", fontFamily: "var(--font-ui)" }}>
              {postulant.name} {postulant.last_name}
            </span>
            <StateBadge state={postulant.state} />
          </div>
          <div style={{ fontSize: 12, color: "#6b7fa0", display: "flex", flexWrap: "wrap", gap: "3px 12px" }}>
            {postulant.job_title && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Briefcase size={11} /> {postulant.job_title}
              </span>
            )}
            {postulant.email && <span>{postulant.email}</span>}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#6b7fa0", whiteSpace: "nowrap", paddingTop: 3, flexShrink: 0 }}>
          {timeAgo(postulant.created_at)}
        </div>
      </div>

      {postulant.reason && (
        <div style={{
          marginTop: 12, fontSize: 13, color: "#2e3d55", lineHeight: 1.65,
          background: "rgba(162,214,249,0.10)", border: "1px solid rgba(162,214,249,0.35)",
          borderRadius: 10, padding: "10px 14px", fontStyle: "italic",
        }}>
          "{postulant.reason}"
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
        {!isAccepted && (
          <button disabled={busy} onClick={() => onChangeState(postulant.id_postulation, "accepted")}
            style={{
              fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 10,
              border: "1px solid rgba(39,174,96,0.35)", background: "rgba(39,174,96,0.08)",
              color: "#1a6e3c", cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1, fontFamily: "var(--font-ui)",
            }}>
            {isRefused ? "Reconsiderar" : "Aceptar"}
          </button>
        )}
        {!isRefused && (
          <button disabled={busy} onClick={() => onChangeState(postulant.id_postulation, "refused")}
            style={{
              fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 10,
              border: "1px solid rgba(232,72,74,0.30)", background: "rgba(232,72,74,0.07)",
              color: "#c0392b", cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1, fontFamily: "var(--font-ui)",
            }}>
            Rechazar
          </button>
        )}
        {(isAccepted || isRefused) && (
          <button disabled={busy} onClick={() => onChangeState(postulant.id_postulation, "in_verification")}
            style={{
              fontSize: 12, fontWeight: 500, padding: "7px 16px", borderRadius: 10,
              border: "1px solid rgba(14,30,60,0.12)", background: "rgba(14,30,60,0.04)",
              color: "#6b7fa0", cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1, fontFamily: "var(--font-ui)",
            }}>
            Mover a revisión
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Vista detalle de convocatoria ─── */
function OfferDetail({ offer, onBack }) {
  const cacheKey = CACHE_KEYS.postulants(offer.id_offer);

  const [postulants, setPostulants] = useState(() => cacheGet(cacheKey) ?? []);
  const [loading, setLoading]       = useState(!cacheGet(cacheKey));
  const [error, setError]           = useState("");
  const [filtro, setFiltro]         = useState("all");
  const [search, setSearch]         = useState("");
  const [busyId, setBusyId]         = useState(null);

  useEffect(() => {
    const cached = cacheGet(cacheKey);
    if (cached) {
      setPostulants(cached);
      setLoading(false);
      return;
    }
    fetchPostulants();
  }, [offer.id_offer]);

  async function fetchPostulants() {
    setLoading(true); setError("");
    try {
      const res = await obtenerPostulantes(offer.id_offer);
      const data = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(data) ? data : [];
      setPostulants(list);
      cacheSet(cacheKey, list);
    } catch { setError("No se pudieron cargar los postulantes."); }
    finally { setLoading(false); }
  }

  async function handleChangeState(idPostulation, newState) {
    setBusyId(idPostulation);
    try {
      await actualizarEstadoPostulacion(idPostulation, newState);
      setPostulants(prev => {
        const updated = prev.map(p =>
          p.id_postulation === idPostulation ? { ...p, state: newState } : p
        );
        cacheSet(cacheKey, updated);
        return updated;
      });
    } catch { alert("No se pudo actualizar el estado."); }
    finally { setBusyId(null); }
  }

  const filtered = postulants
    .filter(p => filtro === "all" || p.state === filtro)
    .filter(p => {
      const q = search.toLowerCase();
      return !q || [p.name, p.last_name, p.email, p.job_title].some(v => v?.toLowerCase().includes(q));
    });

  const counts = {
    total:           postulants.length,
    in_verification: postulants.filter(p => p.state === "in_verification").length,
    accepted:        postulants.filter(p => p.state === "accepted").length,
    refused:         postulants.filter(p => p.state === "refused").length,
  };

  const STATS = [
    { n: counts.total,           l: "Total",       color: "#1a6fbd" },
    { n: counts.in_verification, l: "En revisión", color: "#854F0B" },
    { n: counts.accepted,        l: "Aceptados",   color: "#1a6e3c" },
    { n: counts.refused,         l: "Rechazados",  color: "#c0392b" },
  ];

  return (
    <div>
      <style>{`
        @keyframes pf-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onBack} style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 12, fontWeight: 500, color: "#6b7fa0",
          background: "none", border: "none", cursor: "pointer",
          marginBottom: 12, padding: 0, fontFamily: "var(--font-ui)",
        }}>
          <ChevronLeft size={14} /> Volver a convocatorias
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0c1426", fontFamily: "var(--font-title)", marginBottom: 6 }}>
          {offer.title}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
            background: "rgba(39,174,96,0.10)", color: "#1a6e3c",
            border: "1px solid rgba(39,174,96,0.25)",
          }}>
            {offer.state === "open" ? "Activa" : offer.state}
          </span>
          {offer.closed_at && (
            <span style={{ fontSize: 12, color: "#6b7fa0" }}>Cierra el {formatDate(offer.closed_at)}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {STATS.map(({ n, l, color }) => (
          <div key={l} style={{
            background: "#fff", borderRadius: 14,
            border: "1px solid rgba(162,214,249,0.5)",
            padding: "14px 16px", boxShadow: "0 2px 8px rgba(14,30,60,0.04)",
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "var(--font-title)", lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 11, color: "#6b7fa0", marginTop: 5, fontWeight: 500 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", color: "#6b7fa0", pointerEvents: "none",
          }} />
          <input
            type="text" placeholder="Buscar candidato..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 34px", fontSize: 13, borderRadius: 12,
              border: "1px solid rgba(162,214,249,0.6)", background: "#fff", color: "#0c1426",
              outline: "none", fontFamily: "var(--font-ui)", boxShadow: "0 1px 4px rgba(14,30,60,0.05)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTROS.map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)} style={{
              fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              border: filtro === f.key ? "1px solid rgba(26,111,189,0.4)" : "1px solid rgba(162,214,249,0.5)",
              background: filtro === f.key ? "rgba(162,214,249,0.25)" : "#fff",
              color: filtro === f.key ? "#1a6fbd" : "#6b7fa0",
              fontFamily: "var(--font-ui)",
            }}>
              {f.label}
              {f.key !== "all" && counts[f.key] > 0 && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: filtro === f.key ? "rgba(26,111,189,0.15)" : "rgba(0,0,0,0.07)",
                  padding: "1px 6px", borderRadius: 999,
                }}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista o skeletons */}
      {loading ? (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {[1,2,3].map(i => <PostulantSkeleton key={i} />)}
  </div>
) : error ? (
  <div style={{ textAlign: "center", padding: 48, color: "#c0392b", fontSize: 13 }}>{error}</div>
) : (
  <PostulantesKanban postulants={postulants} />
)}
</div>
);
}

/* ─── Vista lista de convocatorias ─── */
function OfferList({ onSelect }) {
  const [offers, setOffers]   = useState(() => cacheGet(CACHE_KEYS.offers) ?? []);
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEYS.offers));
  const [error, setError]     = useState("");

  useEffect(() => {
    const cached = cacheGet(CACHE_KEYS.offers);
    if (cached) { setOffers(cached); setLoading(false); return; }
    obtenerMisOfertas()
      .then(res => {
        const data = res?.data?.offers ?? res?.offers ?? [];
        const list = Array.isArray(data) ? data : [];
        setOffers(list);
        cacheSet(CACHE_KEYS.offers, list);
      })
      .catch(() => setError("No se pudieron cargar las convocatorias."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <style>{`
        @keyframes pf-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0c1426", fontFamily: "var(--font-title)", marginBottom: 4 }}>
        Gestión de postulantes
      </h2>
      <p style={{ fontSize: 13, color: "#6b7fa0", marginBottom: 20 }}>
        Seleccioná una convocatoria para ver y gestionar sus postulantes.
      </p>

      {error && (
        <div style={{ textAlign: "center", padding: 48, color: "#c0392b", fontSize: 13 }}>{error}</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading
          ? [1,2,3].map(i => <OfferSkeleton key={i} />)
          : offers.length === 0
          ? (
            <div style={{
              textAlign: "center", padding: 48, color: "#6b7fa0", fontSize: 13,
              background: "#fff", borderRadius: 16, border: "1px dashed rgba(162,214,249,0.8)",
            }}>
              No tenés convocatorias publicadas aún.
            </div>
          )
          : offers.map((offer, i) => {
              const av = getAvatarColor(i);
              const isOpen   = offer.state === "open";
              const isClosed = offer.state === "closed";
              const stateStyle = isOpen
                ? { c: "#1a6e3c", bg: "rgba(39,174,96,0.10)",  b: "rgba(39,174,96,0.25)",  label: "Activa"  }
                : isClosed
                ? { c: "#c0392b", bg: "rgba(232,72,74,0.08)",  b: "rgba(232,72,74,0.20)",  label: "Cerrada" }
                : { c: "#854F0B", bg: "rgba(186,117,23,0.10)", b: "rgba(186,117,23,0.25)", label: offer.state };

              return (
                <div
                  key={offer.id_offer}
                  onClick={() => onSelect(offer)}
                  style={{
                    background: "#fff", border: "1px solid rgba(162,214,249,0.5)",
                    borderRadius: 16, padding: "16px 20px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: "0 2px 10px rgba(14,30,60,0.04)",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(14,30,60,0.09)";
                    e.currentTarget.style.borderColor = "rgba(26,111,189,0.35)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(14,30,60,0.04)";
                    e.currentTarget.style.borderColor = "rgba(162,214,249,0.5)";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: av.bg, color: av.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Briefcase size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0c1426", fontFamily: "var(--font-ui)", marginBottom: 5 }}>
                      {offer.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
                        background: stateStyle.bg, color: stateStyle.c, border: `1px solid ${stateStyle.b}`,
                      }}>
                        {stateStyle.label}
                      </span>
                      {offer.closed_at && (
                        <span style={{ fontSize: 11, color: "#6b7fa0" }}>Cierra {formatDate(offer.closed_at)}</span>
                      )}
                      {offer.quota_quantity && (
                        <span style={{ fontSize: 11, color: "#6b7fa0", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <Users size={11} /> {offer.quota_quantity} cupos
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: "#a2d6f9", flexShrink: 0 }} />
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export default function TodosPostulantes() {
  const [selectedOffer, setSelectedOffer] = useState(null);

  return (
    <div style={{ padding: 24 }}>
      {selectedOffer
        ? <OfferDetail offer={selectedOffer} onBack={() => setSelectedOffer(null)} />
        : <OfferList onSelect={setSelectedOffer} />
      }
    </div>
  );
}