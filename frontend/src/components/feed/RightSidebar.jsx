import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, Sparkles, ExternalLink } from "lucide-react";

const SUGGESTED_PEOPLE = [
  { id: 1, name: "Ana Torres", role: "Product Designer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana", tags: ["UX", "Figma"], mutual: 3, type: "person" },
  { id: 2, name: "Carlos Vega", role: "Backend Engineer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", tags: ["Node.js", "AWS"], mutual: 5, type: "person" },
  { id: 3, name: "Lara Kim", role: "UI Developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lara", tags: ["React", "CSS"], mutual: 2, type: "person" },
];

const SUGGESTED_COMPANIES = [
  { id: 4, name: "Platzi", role: "Empresa · EdTech", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Platzi", tags: ["Remoto", "LATAM"], openRoles: 4, type: "company" },
  { id: 5, name: "Nuvemshop", role: "Empresa · eCommerce", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Nuvem", tags: ["React", "Python"], openRoles: 7, type: "company" },
];

function SuggestCard({ item }) {
  const { t } = useTranslation();
  const [followed, setFollowed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 12,
        background: hovered ? "rgba(162,214,249,.12)" : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: item.type === "company" ? 10 : "50%",
          border: "2px solid rgba(162,214,249,.40)",
          background: "rgba(162,214,249,.15)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img src={item.avatar} alt={item.name} style={{ width: "100%", height: "100%" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.79rem", fontWeight: 700 }}>
          {item.name}
        </div>

        <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
          {item.role}
        </div>

        {item.type === "person" && item.mutual > 0 && (
          <div style={{ fontSize: "0.64rem", color: "var(--muted)", marginTop: 3 }}>
            {t("rightSidebar.mutual", { count: item.mutual })}
          </div>
        )}

        {item.type === "company" && (
          <div style={{ fontSize: "0.64rem", color: "#34d399", marginTop: 3, fontWeight: 700 }}>
            {t("rightSidebar.openRoles", { count: item.openRoles })}
          </div>
        )}
      </div>

      <button
        onClick={() => setFollowed(!followed)}
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: 8,
          border: followed ? "none" : "1.5px solid rgba(162,214,249,.55)",
          background: followed
            ? "linear-gradient(135deg, #7fc6f3, #a2d6f9)"
            : "rgba(255,255,255,.80)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: followed ? "white" : "var(--blue-mid)",
          transition: "all 0.2s",
          boxShadow: followed ? "0 4px 12px rgba(127,198,243,.35)" : "none",
        }}
      >
        <UserPlus size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default function RightSidebar() {
  const { t } = useTranslation();

  return (
    <div style={{ width: 240, flexShrink: 0 }}>
      <aside
        style={{
          position: "sticky",
          top: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >

        {/* TALENTOS */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={12} color="var(--blue-mid)" />
              <p style={{ ...sectionLabel, margin: 0 }}>
                {t("rightSidebar.suggestedTalent")}
              </p>
            </div>
            <button style={linkBtn}>{t("commonx.viewMore")}</button>
          </div>

          {SUGGESTED_PEOPLE.map((p) => (
            <SuggestCard key={p.id} item={p} />
          ))}
        </div>

        {/* EMPRESAS */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={12} color="#34d399" />
              <p style={{ ...sectionLabel, margin: 0 }}>
                {t("rightSidebar.suggestedCompanies")}
              </p>
            </div>
            <button style={linkBtn}>{t("commonx.viewMore")}</button>
          </div>

          {SUGGESTED_COMPANIES.map((c) => (
            <SuggestCard key={c.id} item={c} />
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            ...card,
            background:
              "linear-gradient(135deg, rgba(127,198,243,.22) 0%, rgba(162,214,249,.12) 100%)",
            border: "1.5px solid rgba(127,198,243,.35)",
            textAlign: "center",
            padding: "18px 16px",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #7fc6f3, #a2d6f9)",
              borderRadius: 12,
              margin: "0 auto 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(127,198,243,.35)",
            }}
          >
            <ExternalLink size={18} color="white" strokeWidth={2.5} />
          </div>

          <div style={{ fontWeight: 800, fontSize: "0.84rem", marginBottom: 5 }}>
            {t("rightSidebar.ctaTitle")}
          </div>

          <div style={{ fontSize: "0.73rem", marginBottom: 12 }}>
            {t("rightSidebar.ctaDesc")}
          </div>

          <button
            style={{
              width: "100%",
              padding: "0.48rem 0",
              background:
                "linear-gradient(135deg, #ef5759 0%, #E8484A 50%, #d53638 100%)",
              color: "white",
              border: "none",
              borderRadius: 999,
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(232,72,74,.28)",
            }}
          >
            {t("rightSidebar.ctaButton")}
          </button>
        </div>
      </aside>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,.88)",
  border: "1.5px solid rgba(162,214,249,.35)",
  borderRadius: 18,
  padding: "14px 12px",
  boxShadow: "0 4px 24px rgba(127,198,243,.10)",
  backdropFilter: "blur(10px)",
};

const sectionLabel = {
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted)",
};

const linkBtn = {
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "var(--blue-mid)",
  background: "none",
  border: "none",
  cursor: "pointer",
};