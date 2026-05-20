import { useMemo } from "react";
import { MapPin, UserRound } from "lucide-react";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import { LATIN_AMERICA_LOCATIONS, getCitiesForCountry } from "../../../data/locations/latinAmericaLocations";
import SettingsCard from "../../../components/settings/SettingsCard";

const inputStyle = {
  width: "100%", minHeight: 42, borderRadius: 12, border: "1px solid rgba(205,225,245,.86)",
  background: "#fff", color: "var(--text)", fontFamily: "var(--f-body)", fontSize: ".9rem",
  padding: "10px 12px", outline: "none", boxSizing: "border-box",
};

export default function LocationSection({ draft, setDraft }) {
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
    <SettingsCard icon={<MapPin size={16} />} title="Region y ubicacion" text="Esta ubicacion alimenta el perfil profesional y puede dejarse vacia si no quieres mostrarla.">
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={dashboardShell.sectionLabel}>Pais</span>
          <select value={draft.country} onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value, city: "" }))} style={inputStyle}>
            <option value="">No mostrar pais</option>
            {countryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={dashboardShell.sectionLabel}>Ciudad</span>
          <select value={draft.city} onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))} disabled={!draft.country}
            style={{ ...inputStyle, opacity: draft.country ? 1 : 0.68, cursor: draft.country ? "pointer" : "not-allowed" }}>
            <option value="">{draft.country ? "No mostrar ciudad" : "Selecciona primero un pais"}</option>
            {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div style={{ ...dashboardShell.badge, borderRadius: 12, justifyContent: "space-between" }}>
          <span>{locationPreview || "Sin ubicacion visible"}</span>
          <UserRound size={14} />
        </div>
      </div>
    </SettingsCard>
  );
}