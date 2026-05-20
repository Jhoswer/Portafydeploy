import { Globe2 } from "lucide-react";
import LanguageSwitcher from "../../../components/ui/LanguageSwitcher";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import SettingsCard from "../../../components/settings/SettingsCard";

export default function LanguageSection() {
  return (
    <SettingsCard icon={<Globe2 size={16} />} title="Idioma" text="Usa el mismo selector global del navbar para mantener una sola preferencia de idioma.">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <LanguageSwitcher />
        <span style={{ ...dashboardShell.badge, borderRadius: 12 }}>Se aplica a toda la interfaz</span>
      </div>
    </SettingsCard>
  );
}