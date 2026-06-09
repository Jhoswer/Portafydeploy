import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LayoutList } from "lucide-react";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import { fetchVisibility } from "../../../services/visibilityService";
import SettingsCard from "../../../components/settings/SettingsCard";


const ITEMS = [
  { key: "projects",   labelKey: "settings.sections.visibility.items.projects.label",   textKey: "settings.sections.visibility.items.projects.text"   },
  { key: "experience", labelKey: "settings.sections.visibility.items.experience.label", textKey: "settings.sections.visibility.items.experience.text" },
  { key: "education",  labelKey: "settings.sections.visibility.items.education.label",  textKey: "settings.sections.visibility.items.education.text"  },
  { key: "skills",     labelKey: "settings.sections.visibility.items.skills.label",     textKey: "settings.sections.visibility.items.skills.text"     },
  { key: "links",      labelKey: "settings.sections.visibility.items.links.label",      textKey: "settings.sections.visibility.items.links.text"      },
];

const DEFAULT = { projects: true, experience: true, education: true, skills: true, links: true };

export default function VisibilitySection({ draft, setDraft }) {

  const { t } = useTranslation();

  useEffect(() => {
    if (draft.visibility !== null) return;
    let cancelled = false;
    fetchVisibility()
      .then((vis) => { if (!cancelled) setDraft((p) => ({ ...p, visibility: vis })); })
      .catch(()   => { if (!cancelled) setDraft((p) => ({ ...p, visibility: DEFAULT })); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibility = draft.visibility ?? DEFAULT;

  return (
    <SettingsCard
      icon={<LayoutList size={16} />}
      // CAMBIO: título y texto traducidos
      title={t("settings.sections.visibility.title")}
      text={t("settings.sections.visibility.cardText")}
    >
      {draft.visibility === null ? (
        // CAMBIO: loading traducido
        <p style={dashboardShell.body}>{t("settings.sections.visibility.loading")}</p>
      ) : (
        <div style={{ display: "grid", gap: 10, maxWidth: 620 }}>
          {ITEMS.map((item) => {
            const isOn = visibility[item.key];
            return (
              <div key={item.key} className="pf-settings-vis-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 14, padding: "12px 14px" }}>
                <span>
                  {/* CAMBIO: label y texto de cada item traducidos */}
                  <span style={{ display: "block", fontFamily: "var(--f-ui)", fontWeight: 850 }}>{t(item.labelKey)}</span>
                  <span style={{ display: "block", ...dashboardShell.body, fontSize: ".78rem" }}>{t(item.textKey)}</span>
                </span>
                <button type="button"
                  onClick={() => setDraft((p) => ({ ...p, visibility: { ...p.visibility, [item.key]: !p.visibility[item.key] } }))}
                  style={{ width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s",
                    background: isOn ? "#ef5759" : "rgba(205,225,245,.9)" }}>
                  <span style={{ position: "absolute", top: 3, left: isOn ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.18)" }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </SettingsCard>
  );
}