import { Eye, EyeOff, Shield } from "lucide-react";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import SettingsCard from "../../../components/settings/SettingsCard";

const OPTIONS = [
  { key: "public",  label: "Publico",  text: "El contacto puede mostrarse en tu perfil.", icon: Eye    },
  { key: "private", label: "Privado",  text: "Oculta el contacto en vistas publicas.",    icon: EyeOff },
];

export default function PrivacySection({ draft, setDraft }) {
  return (
    <SettingsCard icon={<Shield size={16} />} title="Privacidad de contacto" text="Controla si el correo de contacto aparece en vistas publicas del perfil.">
      <div style={{ display: "grid", gap: 10, maxWidth: 620 }}>
        {OPTIONS.map((opt) => {
          const Icon   = opt.icon;
          const active = draft.contactVisibility === opt.key;
          return (
            <button key={opt.key} type="button" onClick={() => setDraft((p) => ({ ...p, contactVisibility: opt.key }))}
              style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", borderRadius: 14, padding: 12, cursor: "pointer", color: "var(--text)",
                border: active ? "1px solid rgba(232,72,74,.22)" : "1px solid rgba(205,225,245,.78)",
                background: active ? "rgba(232,72,74,.07)" : "#fff" }}>
              <span style={{ ...dashboardShell.iconBadge, color: active ? "#ef5759" : "#2048a8" }}><Icon size={15} /></span>
              <span>
                <span style={{ display: "block", fontFamily: "var(--f-ui)", fontWeight: 850 }}>{opt.label}</span>
                <span style={{ display: "block", ...dashboardShell.body, fontSize: ".78rem" }}>{opt.text}</span>
              </span>
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}