import { ArrowUpRight, Instagram, Linkedin } from "lucide-react";

const footerLinks = [
  { title: "Producto", items: ["Panel principal", "Portafolio"] },
  { title: "Soporte", items: ["Privacidad", "Terminos"] },
];

export default function DashboardFooter() {
  return (
    <footer
      style={{
        width: "100%",
        marginTop: 18,
        background: "rgba(255,255,255,.34)",
        borderTop: "1px solid rgba(205,225,245,.7)",
        color: "var(--body)",
      }}
    >
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "24px 28px 14px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 18,
          alignItems: "start",
        }}
      >
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ff4f63 100%)",
                  boxShadow: "0 12px 30px rgba(255,107,107,.20)",
                }}
              >
                <img
                  src="/logos/portafy.png"
                  alt="PortaFy"
                  style={{ width: 18, height: 18, objectFit: "contain" }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "var(--f-title)",
                    fontSize: "1.32rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "var(--text)",
                  }}
                >
                  PortaFy
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--f-ui)",
                    fontSize: "0.64rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  Dashboard profesional
                </div>
              </div>
            </div>

            <p
              style={{
                maxWidth: 300,
                margin: 0,
                fontFamily: "var(--f-body)",
                fontSize: "0.82rem",
                lineHeight: 1.55,
                color: "var(--body)",
              }}
            >
              Organiza tu perfil, tu portafolio y tus enlaces en un solo lugar.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <SocialButton icon={<Instagram size={14} />} label="Instagram" />
              <SocialButton icon={<Linkedin size={14} />} label="LinkedIn" />
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} style={{ display: "grid", gap: 8 }}>
              <div
                style={{
                  fontFamily: "var(--f-ui)",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text)",
                }}
              >
                {group.title}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                {group.items.map((item) => (
                  <button key={item} type="button" style={footerLink}>
                    <span>{item}</span>
                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div
            style={{
              gridColumn: "1 / -1",
              marginTop: 4,
              paddingTop: 12,
              borderTop: "1px solid rgba(205,225,245,.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "0.74rem",
                color: "var(--muted)",
              }}
            >
              Copyright {new Date().getFullYear()} PortaFy. Todos los derechos reservados.
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {["Privacidad", "Terminos"].map((item) => (
                <button key={item} type="button" style={bottomLink}>
                  {item}
                </button>
              ))}
            </div>
          </div>
      </div>
    </footer>
  );
}

function SocialButton({ icon, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "1px solid rgba(205,225,245,.76)",
        background: "linear-gradient(180deg, #fbfdff 0%, #f7fbff 100%)",
        color: "#2048a8",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {icon}
    </button>
  );
}

const footerLink = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: "var(--f-body)",
  fontSize: "0.84rem",
  color: "var(--body)",
  textAlign: "left",
};

const bottomLink = {
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: "var(--f-body)",
  fontSize: "0.74rem",
  color: "var(--muted)",
};
