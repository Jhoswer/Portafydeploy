import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import Navbar from "../../components/landing/Navbar";
import PostCard from "../../components/feed/PostCard";
import LeftSidebar from "../../components/feed/LeftSidebar";
import RightSidebar from "../../components/feed/RightSidebar";
import { FEED_DATA } from "../../data/posts";

export default function Feed() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const [showModal, setShowModal]       = useState(false);

  const filtered = FEED_DATA.filter((p) => {
    const matchType = activeFilter === "all" || p.type === activeFilter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      p.author.name.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  return (
    /*
      El truco del layout:
      - El div raíz tiene height: 100vh y overflow: hidden → bloquea el scroll global
      - El Navbar queda fijo arriba (ya tiene position fixed o es el primero en el flujo)
      - El "body" debajo del navbar es un flex row de 3 columnas
      - Las columnas laterales NO hacen scroll (overflow: hidden o simplemente son más cortas)
      - SOLO la columna central tiene overflow-y: auto → ella scrollea
    */
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "transparent" }}>

      {/* Navbar — ocupa su altura natural arriba */}
      <Navbar />

      {/* ── Cuerpo: 3 columnas ── */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: 24,
        padding: "24px 24px 0",
        maxWidth: 1280,
        width: "100%",
        margin: "0 auto",
        minHeight: 0, /* necesario para que flex children respeten overflow */
        boxSizing: "border-box",
      }}>

        {/* LEFT — sticky dentro de su columna, no scrollea */}
        <div style={{
          width: 220,
          flexShrink: 0,
          overflowY: "hidden",
          /* padding bottom para que el ultimo card no quede pegado al borde */
          paddingBottom: 24,
        }}>
          <LeftSidebar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onOpenDashboard={() => navigate("/dashboard")}
          />
        </div>

        {/* CENTER — único que scrollea */}
        <main style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          paddingBottom: 40,
          /* Ocultar scrollbar visualmente pero mantener funcionalidad */
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(162,214,249,.40) transparent",
        }}>

          {/* Header: buscador + publicar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)", pointerEvents: "none",
              }} />
              <input
                type="text"
                placeholder="Buscar publicaciones…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 38, paddingRight: 16,
                  paddingTop: "0.55rem", paddingBottom: "0.55rem",
                  fontSize: "0.875rem",
                  background: "rgba(255,255,255,.90)",
                  border: "1.5px solid rgba(162,214,249,.45)",
                  borderRadius: 999,
                  color: "var(--text)",
                  outline: "none",
                  fontFamily: "var(--f-body)",
                  boxShadow: "var(--s-xs)",
                  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(26,111,189,.40)";
                  e.target.style.background = "#fff";
                  e.target.style.boxShadow = "0 0 0 3px rgba(26,111,189,.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(162,214,249,.45)";
                  e.target.style.background = "rgba(255,255,255,.90)";
                  e.target.style.boxShadow = "var(--s-xs)";
                }}
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              style={{
                flexShrink: 0,
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "0.50rem 1.1rem",
                background: "linear-gradient(135deg, #ef5759 0%, #E8484A 50%, #d53638 100%)",
                color: "white", border: "none", borderRadius: 999,
                fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 28px rgba(232,72,74,.28)",
                fontFamily: "var(--f-ui)",
                transition: "transform 0.2s, box-shadow 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(232,72,74,.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(232,72,74,.28)";
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Publicar
            </button>
          </div>

          {/* Feed list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{
                width: 56, height: 56,
                background: "rgba(255,255,255,.82)", borderRadius: 16,
                border: "1px solid rgba(162,214,249,.40)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px", boxShadow: "var(--s-sm)",
              }}>
                <Search size={24} color="var(--muted)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.97rem", color: "var(--text)", marginBottom: 6, fontFamily: "var(--f-title)" }}>
                Sin resultados
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--body)", fontFamily: "var(--f-body)" }}>
                Prueba con otro término o cambia el filtro
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>

        {/* RIGHT — sticky dentro de su columna, no scrollea */}
        <div style={{
          width: 240,
          flexShrink: 0,
          overflowY: "hidden",
          paddingBottom: 24,
        }}>
          <RightSidebar />
        </div>

      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(10,20,50,0.45)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,.98)",
              borderRadius: 24, width: "100%", maxWidth: 500, padding: 28,
              boxShadow: "0 32px 80px rgba(14,30,60,.16), 0 0 0 1px rgba(162,214,249,.30)",
              animation: "popIn 0.25s cubic-bezier(0.34,1.4,0.64,1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", fontFamily: "var(--f-title)" }}>
                Nueva publicación
              </span>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: "1.5px solid rgba(162,214,249,.40)",
                  background: "rgba(162,214,249,.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--muted)",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me"
                alt="Tú"
                style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(162,214,249,.40)", background: "rgba(162,214,249,.15)" }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--f-ui)" }}>Mi Perfil</div>
                <div style={{ fontSize: "0.73rem", color: "var(--muted)", fontFamily: "var(--f-body)" }}>Publicación pública</div>
              </div>
            </div>

            <textarea
              placeholder="¿Qué quieres compartir con tu red?"
              rows={4}
              style={{
                width: "100%", fontSize: "0.875rem", color: "var(--text)",
                border: "1.5px solid rgba(162,214,249,.40)", borderRadius: 14,
                padding: "12px 14px", resize: "none", outline: "none",
                lineHeight: 1.65, fontFamily: "var(--f-body)",
                background: "#f8fafc",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(26,111,189,.40)";
                e.target.style.boxShadow = "0 0 0 3px rgba(26,111,189,.10)";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(162,214,249,.40)";
                e.target.style.boxShadow = "none";
                e.target.style.background = "#f8fafc";
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  fontSize: "0.82rem", fontWeight: 600, padding: "0.48rem 1rem", borderRadius: 999,
                  border: "1.5px solid rgba(162,214,249,.50)", background: "rgba(255,255,255,.80)",
                  color: "var(--body)", cursor: "pointer", fontFamily: "var(--f-ui)",
                }}
              >Cancelar</button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  fontSize: "0.82rem", fontWeight: 700, padding: "0.48rem 1.2rem", borderRadius: 999, border: "none",
                  background: "linear-gradient(135deg, #ef5759 0%, #E8484A 50%, #d53638 100%)",
                  color: "white", cursor: "pointer",
                  boxShadow: "0 8px 28px rgba(232,72,74,.28)", fontFamily: "var(--f-ui)",
                }}
              >Publicar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        main::-webkit-scrollbar { width: 4px; }
        main::-webkit-scrollbar-track { background: transparent; }
        main::-webkit-scrollbar-thumb { background: rgba(162,214,249,.40); border-radius: 4px; }
      `}</style>
    </div>
  );
}
