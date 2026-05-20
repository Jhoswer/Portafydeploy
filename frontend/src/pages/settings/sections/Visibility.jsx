import { useEffect } from "react";
import { LayoutList } from "lucide-react";
import { dashboardShell } from "../../../styles/components/dashboardShell";
import { fetchVisibility } from "../../../services/visibilityService";
import SettingsCard from "../../../components/settings/SettingsCard";

const ITEMS = [
  { key: "projects",   label: "Proyectos",      text: "Incluye portada y evidencias"  },
  { key: "experience", label: "Experiencia",     text: "Timeline laboral y academica"  },
  { key: "education",  label: "Formacion",       text: "Institucion, area y modalidad" },
  { key: "skills",     label: "Habilidades",     text: "Skills clave y tecnologias"    },
  { key: "links",      label: "Enlaces y redes", text: "GitHub, LinkedIn y CV"         },
];

const DEFAULT = { projects: true, experience: true, education: true, skills: true, links: true };

export default function VisibilitySection({ draft, setDraft }) {
  useEffect(() => {
    if (draft.visibility !== null) return; // ya cargado
    let cancelled = false;
    fetchVisibility()
      .then((vis) => { if (!cancelled) setDraft((p) => ({ ...p, visibility: vis })); })
      .catch(()   => { if (!cancelled) setDraft((p) => ({ ...p, visibility: DEFAULT })); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibility = draft.visibility ?? DEFAULT;

  return (
    <SettingsCard icon={<LayoutList size={16} />} title="Visibilidad del perfil" text="Elige que secciones se muestran en tu perfil publico.">
      {draft.visibility === null ? (
        <p style={dashboardShell.body}>Cargando visibilidad...</p>
      ) : (
        <div style={{ display: "grid", gap: 10, maxWidth: 620 }}>
          {ITEMS.map((item) => {
            const isOn = visibility[item.key];
            return (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 14, border: "1px solid rgba(205,225,245,.78)", background: "#fff", padding: "12px 14px" }}>
                <span>
                  <span style={{ display: "block", fontFamily: "var(--f-ui)", fontWeight: 850 }}>{item.label}</span>
                  <span style={{ display: "block", ...dashboardShell.body, fontSize: ".78rem" }}>{item.text}</span>
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