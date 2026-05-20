import { Bell } from "lucide-react";
import SettingsCard from "../../../components/settings/SettingsCard";
import { useNotificationPrefs, PREF_CATEGORIES } from "../../../hooks/useNotificationPrefs";
import { dashboardShell } from "../../../styles/components/dashboardShell";

export default function NotificationsSection() {
  const { prefs, loading, toggle } = useNotificationPrefs();

  return (
    <SettingsCard
      icon={<Bell size={16} />}
      title="Notificaciones"
      text="Elige que tipo de alertas quieres recibir."
    >
      {loading ? (
        <p style={dashboardShell.body}>Cargando preferencias...</p>
      ) : (
        <div style={{ display: "grid", gap: 10, maxWidth: 620 }}>
          {PREF_CATEGORIES.map((cat) => {
            const isOn = prefs?.[cat.key] ?? true;
            return (
              <div
                key={cat.key}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  borderRadius:   14,
                  border:         cat.locked
                    ? "1px solid rgba(232,72,74,.20)"
                    : "1px solid rgba(205,225,245,.78)",
                  background: cat.locked ? "rgba(232,72,74,.04)" : "#fff",
                  padding:    "12px 14px",
                  opacity:    cat.locked ? 0.72 : 1,
                }}
              >
                <span>
                  <span style={{ display: "block", fontFamily: "var(--f-ui)", fontWeight: 850 }}>
                    {cat.label}
                  </span>
                  <span style={{ display: "block", ...dashboardShell.body, fontSize: ".78rem" }}>
                    {cat.description}
                  </span>
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  disabled={cat.locked}
                  onClick={() => toggle(cat.key)}
                  style={{
                    width:      44,
                    height:     24,
                    borderRadius: 99,
                    border:     "none",
                    cursor:     cat.locked ? "not-allowed" : "pointer",
                    position:   "relative",
                    flexShrink: 0,
                    transition: "background .2s",
                    background: isOn ? "#ef5759" : "rgba(205,225,245,.9)",
                  }}
                >
                  <span
                    style={{
                      position:     "absolute",
                      top:          3,
                      left:         isOn ? 22 : 3,
                      width:        18,
                      height:       18,
                      borderRadius: "50%",
                      background:   "#fff",
                      transition:   "left .2s",
                      boxShadow:    "0 1px 4px rgba(0,0,0,.18)",
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </SettingsCard>
  );
}