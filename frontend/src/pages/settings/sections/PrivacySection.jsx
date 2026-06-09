import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Shield } from "lucide-react";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import SettingsCard from "../../../components/settings/SettingsCard";

const OPTIONS = [
  { key: "public",  labelKey: "settings.sections.privacy.options.public.label",  textKey: "settings.sections.privacy.options.public.text",  icon: Eye    },
  { key: "private", labelKey: "settings.sections.privacy.options.private.label", textKey: "settings.sections.privacy.options.private.text", icon: EyeOff },
];

export default function PrivacySection({ draft, setDraft }) {
  const { t } = useTranslation();

  return (
    <SettingsCard
      icon={<Shield size={16} />}
      title={t("settings.sections.privacy.title")}
      text={t("settings.sections.privacy.cardText")}
    >
      <div style={{ display: "grid", gap: 10, maxWidth: 620 }}>
        {OPTIONS.map((opt) => {
          const Icon   = opt.icon;
          const active = draft.contactVisibility === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setDraft((p) => ({ ...p, contactVisibility: opt.key }))}
              // CAMBIO: layout inline, colores desde CSS
              className={`pf-settings-privacy-btn${active ? " pf-settings-privacy-btn--active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                textAlign: "left", borderRadius: 14, padding: 12,
                cursor: "pointer", color: "var(--text)", width: "100%",
              }}
            >
              <span style={{ ...dashboardShell.iconBadge, color: active ? "#ef5759" : "#2048a8" }}>
                <Icon size={15} />
              </span>
              <span>
                <span style={{ display: "block", fontFamily: "var(--f-ui)", fontWeight: 850 }}>{t(opt.labelKey)}</span>
                <span style={{ display: "block", ...dashboardShell.body, fontSize: ".78rem" }}>{t(opt.textKey)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}