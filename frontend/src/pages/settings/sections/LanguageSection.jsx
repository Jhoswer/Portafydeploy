import { useTranslation } from "react-i18next";
import { Globe2 } from "lucide-react";
import LanguageSwitcher from "../../../components/ui/LanguageSwitcher";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import SettingsCard from "../../../components/settings/SettingsCard";

export default function LanguageSection() {

  const { t } = useTranslation();

  return (
    <SettingsCard
      icon={<Globe2 size={16} />}
      // CAMBIO: título y texto traducidos
      title={t("settings.sections.language.title")}
      text={t("settings.sections.language.cardText")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <LanguageSwitcher />
      
      </div>
    </SettingsCard>
  );
}