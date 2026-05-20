import { dashboardShell } from "../../styles/components/dashboardShell";

export default function SettingsCard({ icon, title, text, children }) {
  return (
    <section style={{ ...dashboardShell.surfaceCard, padding: 22, display: "grid", gap: 18, borderRadius: 22 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ ...dashboardShell.iconBadge, color: "#2048a8" }}>{icon}</span>
        <div>
          <h2 style={{ margin: 0, fontFamily: "var(--f-title)", fontSize: "1.05rem", fontWeight: 850, color: "var(--text)" }}>{title}</h2>
          <p style={{ ...dashboardShell.body, fontSize: ".84rem", marginTop: 3 }}>{text}</p>
        </div>
      </div>
      {children}
    </section>
  );
}