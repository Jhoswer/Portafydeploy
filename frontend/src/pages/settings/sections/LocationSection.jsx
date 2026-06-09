import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, UserRound } from "lucide-react";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import { LATIN_AMERICA_LOCATIONS, getCitiesForCountry } from "../../../data/locations/latinAmericaLocations";
import SettingsCard from "../../../components/settings/SettingsCard";

export default function LocationSection({ draft, setDraft }) {
  const { t } = useTranslation();

  const locationPreview = useMemo(
    () => [draft.city, draft.country].map((s) => s.trim()).filter(Boolean).join(", "),
    [draft.city, draft.country],
  );

  const countryOptions = useMemo(() => {
    const countries = LATIN_AMERICA_LOCATIONS.map((i) => i.country);
    return draft.country && !countries.includes(draft.country) ? [draft.country, ...countries] : countries;
  }, [draft.country]);

  const cityOptions = useMemo(() => {
    const cities = getCitiesForCountry(draft.country);
    return draft.city && !cities.includes(draft.city) ? [draft.city, ...cities] : cities;
  }, [draft.city, draft.country]);

  return (
    <SettingsCard
      icon={<MapPin size={16} />}
      title={t("settings.sections.location.title")}
      text={t("settings.sections.location.cardText")}
    >
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={dashboardShell.sectionLabel}>{t("settings.sections.location.country")}</span>
          {/* CAMBIO: clase CSS en lugar de inputStyle inline */}
          <select
            value={draft.country}
            onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value, city: "" }))}
            className="pf-settings-select"
          >
            <option value="">{t("settings.sections.location.noCountry")}</option>
            {countryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={dashboardShell.sectionLabel}>{t("settings.sections.location.city")}</span>
          {/* CAMBIO: clase CSS + disabled como modifier */}
          <select
            value={draft.city}
            onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))}
            disabled={!draft.country}
            className={`pf-settings-select${!draft.country ? " pf-settings-select--disabled" : ""}`}
          >
            <option value="">{draft.country ? t("settings.sections.location.noCity") : t("settings.sections.location.selectCountryFirst")}</option>
            {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        {/* CAMBIO: clase CSS para el badge de preview */}
        <div className="pf-settings-location-preview">
          <span>{locationPreview || t("settings.sections.location.noLocation")}</span>
          <UserRound size={14} />
        </div>
      </div>
    </SettingsCard>
  );
}