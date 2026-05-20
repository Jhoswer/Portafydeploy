import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Globe2, LayoutList, MapPin, Save, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/landing/Navbar";
import { useAuth } from "../../context/useAuth";
import { fetchAccountSettings, saveAccountSettings } from "../../services/settingsService";
import { dashboardMessageTone, dashboardShell } from "../../styles/components/dashboardShell";
import { backButton } from "../../features/dashboard-portfolio/portfolioStyles";
import { Bell } from "lucide-react";
import { saveVisibility } from "../../services/visibilityService";
import { useNotificationPrefs } from "../../hooks/useNotificationPrefs";


const LanguageSection   = lazy(() => import("./sections/LanguageSection"));
const LocationSection   = lazy(() => import("./sections/LocationSection"));
const PrivacySection    = lazy(() => import("./sections/PrivacySection"));
const VisibilitySection = lazy(() => import("./sections/Visibility"));
const NotificationsSection = lazy(() => import("./sections/NotificationsSection"));


const SECTION_COMPONENTS = {
  language:   LanguageSection,
  location:   LocationSection,
  privacy:    PrivacySection,
  visibility: VisibilitySection,
  notifications: NotificationsSection,
};

const SETTING_SECTIONS = [
  { key: "language",   title: "Idioma",                text: "Selector global de interfaz.",      icon: Globe2    },
  { key: "location",   title: "Region y ubicacion",    text: "Lo que se muestra en tu perfil.",   icon: MapPin    },
  { key: "privacy",    title: "Privacidad de contacto",text: "Control del correo visible.",        icon: Shield    },
  { key: "visibility", title: "Visibilidad",           text: "Secciones visibles en tu perfil.",  icon: LayoutList },
  { key: "notifications", title: "Notificaciones",         text: "Alertas y preferencias de avisos.", icon: Bell      },
];

function Message({ color = "blue", children }) {
  return (
    <div style={{ ...dashboardMessageTone(color), borderRadius: 14, padding: "10px 12px", fontFamily: "var(--f-ui)", fontSize: ".82rem", fontWeight: 800 }}>
      {children}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section style={{ ...dashboardShell.surfaceCard, padding: 24, borderRadius: 22, minHeight: 180, display: "flex", alignItems: "center" }}>
      <p style={dashboardShell.body}>Cargando seccion...</p>
    </section>
  );
}

function SettingsSelector({ activeSection, onSelect }) {
  return (
    <aside style={{ ...dashboardShell.surfaceCard, padding: 14, display: "grid", gap: 8, borderRadius: 20 }}>
      {SETTING_SECTIONS.map((section) => {
        const Icon   = section.icon;
        const active = activeSection === section.key;
        return (
          <button
            key={section.key}
            type="button"
            onClick={() => onSelect(section.key)}
            style={{
              display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 11, alignItems: "center",
              border: active ? "1px solid rgba(232,72,74,.20)" : "1px solid transparent",
              background: active ? "rgba(232,72,74,.07)" : "transparent",
              color: "var(--text)", borderRadius: 15, padding: "11px 12px", textAlign: "left", cursor: "pointer",
            }}
          >
            <span style={{ ...dashboardShell.iconBadge, color: active ? "#ef5759" : "#2048a8" }}>
              <Icon size={15} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: "var(--f-ui)", fontWeight: 850, fontSize: ".84rem" }}>{section.title}</span>
              <span style={{ display: "block", fontFamily: "var(--f-body)", color: "var(--muted)", fontSize: ".76rem", marginTop: 2 }}>{section.text}</span>
            </span>
          </button>
        );
      })}
    </aside>
  );
}

export default function Settings() {
  const navigate       = useNavigate();
  const { updateUser } = useAuth();
  const { save: saveNotifPrefs, dirty: notifDirty } = useNotificationPrefs();

  const [profile,       setProfile]       = useState(null);
  const [draft,         setDraft]         = useState({ language: "", city: "", country: "", contactVisibility: "public", visibility: null });
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [message,       setMessage]       = useState("");
  const [error,         setError]         = useState("");
  const [activeSection, setActiveSection] = useState("language");
  

  useEffect(() => {
    let cancelled = false;
    fetchAccountSettings()
      .then(({ profile: p, settings }) => {
        if (cancelled) return;
        setProfile(p);
        setDraft((prev) => ({ ...prev, ...settings }));
      })
      .catch((err) => { if (!cancelled) setError(err.message || "No se pudo cargar la configuracion."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const saveSettings = async () => {
    if (!profile || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const visPromise = draft.visibility !== null
        ? saveVisibility(draft.visibility)
        : Promise.resolve(null);

      const [{ profile: refreshed, settings }, savedVis] = await Promise.all([
        saveAccountSettings(profile, draft),
        visPromise,
      ]);

      setProfile(refreshed);
      setDraft((prev) => ({ ...prev, ...settings, ...(savedVis !== null ? { visibility: savedVis } : {}) }));
      updateUser((cur) => ({ ...cur, ubicacion: settings.locationText }));
      if (notifDirty) await saveNotifPrefs();
      setMessage("Configuracion actualizada correctamente.");
      setTimeout(() => setMessage(""), 2200);
    } catch (err) {
      setError(err.message || "No se pudo guardar la configuracion.");
    } finally {
      setSaving(false);
    }
  };

  const ActiveSection = SECTION_COMPONENTS[activeSection];

  return (
    <div style={dashboardShell.page}>
      <Navbar />
      <main style={{ ...dashboardShell.container, padding: "24px 20px 34px", display: "grid", gap: 18 }}>

        <div>
          <button type="button" onClick={() => navigate(-1)} style={{ ...backButton, cursor: "pointer" }} className="settings-back-btn">
            <ArrowLeft size={14} /> Volver
          </button>
          <style>{`.settings-back-btn:hover { transform: translateX(-2px); background: rgba(49,87,213,.12) !important; border-color: rgba(49,87,213,.24) !important; }`}</style>
        </div>

        <section style={{ ...dashboardShell.heroCard, padding: 20, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", borderRadius: 22 }}>
          <div>
            <div style={dashboardShell.eyebrow}>Cuenta</div>
            <h1 style={{ ...dashboardShell.title, fontSize: "1.42rem", marginTop: 4 }}>Configuracion</h1>
            <p style={{ ...dashboardShell.body, maxWidth: 640, marginTop: 6, fontSize: ".88rem" }}>Elige una categoria y ajusta solo lo necesario.</p>
          </div>
          <button type="button" onClick={saveSettings} disabled={loading || saving} style={{ ...dashboardShell.primaryButton, opacity: loading || saving ? 0.72 : 1 }}>
            <Save size={15} /> {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </section>

        {error   && <Message color="red">{error}</Message>}
        {message && <Message color="green">{message}</Message>}

        {loading ? (
          <section style={{ ...dashboardShell.surfaceCard, padding: 24 }}>
            <p style={dashboardShell.body}>Cargando configuracion...</p>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16, alignItems: "start" }}>
            <SettingsSelector activeSection={activeSection} onSelect={setActiveSection} />
            <Suspense fallback={<SectionSkeleton />}>
              <ActiveSection draft={draft} setDraft={setDraft} />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}