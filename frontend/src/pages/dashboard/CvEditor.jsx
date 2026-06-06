import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  ArrowLeft,
  Download,
  Eye,
  Save,
  ChevronDown,
  ChevronUp,
  Check,
  Palette,
  Type,
  Layout,
  ToggleLeft,
  ToggleRight,
  FileUp,
  EyeOff,
} from "lucide-react";
/* import AuthTopbar from "../../components/landing/AuthTopbar"; */
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import CvPdfDocument from "../../components/dashboard/cv/CvPdfDocument";
import { apiClient } from "../../services/http/httpClient";
import {
  crearCv,
  actualizarCv,
  obtenerCv,
  cargarDatosPortafolio,
  obtenerCustomEntries,
  /* subirPdfCv, */
} from "../../services/cvService";
import {
  CvPaperClassic,
  CvPaperBicolor,
  CvPaperTech,
  CvPaperMinimal,
} from "../../components/cv-templates";

// ─── Plantillas predefinidas (admin las cargará desde BD en el futuro) ────────

const TEMPLATES = [
  {
    id: "navy",
    name: "Clásico Navy",
    description: "Profesional y elegante",
    layout: "classic",
    headerBg: "#0E2A5C",
    accentColor: "#185FA5",
    fontFamily: "Georgia, serif",
  },
  {
    id: "slate",
    name: "Slate Moderno",
    description: "Limpio y contemporáneo",
    layout: "classic",
    headerBg: "#1e293b",
    accentColor: "#0d9488",
    fontFamily: "Georgia, serif",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural y sobrio",
    layout: "classic",
    headerBg: "#14532d",
    accentColor: "#16a34a",
    fontFamily: "Georgia, serif",
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Audaz y memorable",
    layout: "classic",
    headerBg: "#7f1d1d",
    accentColor: "#dc2626",
    fontFamily: "Georgia, serif",
  },
  {
    id: "bicolor",
    name: "Bicolor",
    description: "Sidebar oscuro + contenido",
    layout: "bicolor",
    headerBg: "#1e293b",
    accentColor: "#38bdf8",
    fontFamily: "system-ui, sans-serif",
  },
  {
    id: "tech",
    name: "Tech / Dev",
    description: "Dark mode, estilo terminal",
    layout: "tech",
    headerBg: "#0d1117",
    accentColor: "#58a6ff",
    fontFamily: "'Courier New', monospace",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Elegante y limpio",
    layout: "minimal",
    headerBg: "#ffffff",
    accentColor: "#1e293b",
    fontFamily: "system-ui, sans-serif",
  },
];

const FONTS = [
  { id: "serif", label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { id: "sans", label: "Sans", value: "system-ui, -apple-system, sans-serif" },
  { id: "mono", label: "Mono", value: "'Courier New', Courier, monospace" },
];

const DEFAULT_SECTIONS = [
  { key: "bio", label: "Sobre mí", enabled: true },
  { key: "experience", label: "Experiencia", enabled: true },
  { key: "education", label: "Educación", enabled: true },
  { key: "skills", label: "Habilidades", enabled: true },
  { key: "projects", label: "Proyectos", enabled: false },
  { key: "social", label: "Redes sociales", enabled: true },
];

// ─── Estilos del editor ───────────────────────────────────────────────────────

const ui = {
  page: {
    minHeight: "100vh",
    background: "#f0f4f8",
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--f-body, system-ui, sans-serif)",
  },
  topbar: {
    background: "#fff",
    borderBottom: "1px solid rgba(205,225,245,.8)",
    padding: "0 20px",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: 12 },
  topbarRight: { display: "flex", alignItems: "center", gap: 8 },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid rgba(205,225,245,.9)",
    background: "#fff",
    color: "#374151",
    fontFamily: "var(--f-ui, system-ui)",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  cvName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1e293b",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--f-ui, system-ui)",
  },
  divider: {
    width: 1,
    height: 20,
    background: "rgba(205,225,245,.9)",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid rgba(205,225,245,.9)",
    background: "#fff",
    color: "#374151",
    fontFamily: "var(--f-ui, system-ui)",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 16px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #12369e 0%, #255dde 100%)",
    color: "#fff",
    fontFamily: "var(--f-ui, system-ui)",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  savedBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "11px",
    color: "#10b981",
    fontFamily: "var(--f-ui, system-ui)",
  },
  shell: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "220px 1fr 256px",
    overflow: "hidden",
    height: "calc(100vh - 52px)",
  },
  // Panel izquierdo
  leftPanel: {
    background: "#fff",
    borderRight: "1px solid rgba(205,225,245,.8)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panelTitle: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: ".07em",
    padding: "14px 14px 8px",
    borderBottom: "1px solid rgba(205,225,245,.5)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  panelBody: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  templateCard: (active) => ({
    border: active ? "2px solid #185FA5" : "1.5px solid rgba(205,225,245,.8)",
    borderRadius: 10,
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    background: active ? "rgba(24,95,165,.03)" : "#fff",
    transition: "border-color .15s",
  }),
  templateThumb: (bg) => ({
    height: 64,
    borderRadius: 6,
    background: bg,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "8px 10px",
    gap: 3,
    overflow: "hidden",
  }),
  thumbLine: (w, op = 0.3) => ({
    height: 4,
    borderRadius: 2,
    background: `rgba(255,255,255,${op})`,
    width: w,
  }),
  templateLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#1e293b",
  },
  templateSub: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  activeBadge: {
    fontSize: "9px",
    fontWeight: 700,
    color: "#185FA5",
    background: "#dbeafe",
    padding: "2px 6px",
    borderRadius: 4,
    width: "fit-content",
  },
  // Canvas central
  canvas: {
    background: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  canvasToolbar: {
    background: "#fff",
    borderBottom: "1px solid rgba(205,225,245,.8)",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  zoomControl: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#f8fafc",
    border: "1px solid rgba(205,225,245,.9)",
    borderRadius: 6,
    padding: "2px 4px",
  },
  zoomBtn: {
    width: 22,
    height: 22,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#64748b",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  zoomVal: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#374151",
    minWidth: 32,
    textAlign: "center",
  },
  canvasScroll: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "28px 20px",
  },
  // Panel derecho
  rightPanel: {
    background: "#fff",
    borderLeft: "1px solid rgba(205,225,245,.8)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  propSection: {
    borderBottom: "1px solid rgba(205,225,245,.5)",
  },
  // eslint-disable-next-line no-unused-vars
  propTitle: (open) => ({
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: ".06em",
    padding: "11px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    userSelect: "none",
  }),
  propBody: {
    padding: "0 14px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  colorDots: { display: "flex", gap: 7, flexWrap: "wrap" },
  colorDot: (active, color) => ({
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: color,
    cursor: "pointer",
    border: "2px solid transparent",
    boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : "none",
    transition: "transform .15s",
  }),
  fontOptions: { display: "flex", gap: 5 },
  fontOpt: (active) => ({
    fontSize: "11px",
    padding: "4px 10px",
    border: `1px solid ${active ? "#185FA5" : "rgba(205,225,245,.9)"}`,
    borderRadius: 6,
    cursor: "pointer",
    color: active ? "#185FA5" : "#374151",
    background: active ? "#eff6ff" : "#fff",
    fontWeight: active ? 700 : 400,
    transition: "all .15s",
  }),
  toggle: (on) => ({
    width: 32,
    height: 18,
    borderRadius: 9,
    background: on ? "#185FA5" : "#cbd5e1",
    position: "relative",
    cursor: "pointer",
    transition: "background .2s",
    flexShrink: 0,
  }),
  toggleDot: (on) => ({
    width: 13,
    height: 13,
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: 2.5,
    left: on ? 16 : 2.5,
    transition: "left .2s",
    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
  }),
  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "4px 0",
  },
  sectionLabel: {
    fontSize: "12px",
    color: "#374151",
  },
};

// ─── CV Paper component ───────────────────────────────────────────────────────

function CvPaper(props) {
  const layout = props.template.layout ?? "classic";
  const layouts = {
    classic: CvPaperClassic,
    bicolor: CvPaperBicolor,
    tech: CvPaperTech,
    minimal: CvPaperMinimal,
  };
  const Layout = layouts[layout] ?? CvPaperClassic;
  return <Layout {...props} />;
}

// ─── Panel de entidades importadas ───────────────────────────────────────────

function ImportedEntitiesPanel({
  importedData,
  cvId,
  onClear,
  onCustomEntryAdded,
  onRemoveCustomEntry,
  onSkillAdded,
  customEntries = [],
  skills = [],
  experience = [],
  education = [],
}) {
  const [saving, setSaving] = useState({});
  const [done, setDone] = useState(new Set());

  const allEntities = [
    ...(importedData.experiencias ?? []).map((e, i) => ({
      key: `exp-${i}`,
      type: "exp",
      label: e.cargo,
      sub: e.empresa,
      data: e,
    })),
    ...(importedData.habilidades ?? []).map((s, i) => ({
      key: `skill-${i}`,
      type: "skill",
      label: s.nombre,
      sub: s.tipo,
      data: s,
    })),
    ...(importedData.formaciones ?? []).map((f, i) => ({
      key: `edu-${i}`,
      type: "edu",
      label: f.nombre_programa,
      sub: f.institucion,
      data: f,
    })),
  ];

  async function handleAction(entity, action) {
    if (done.has(entity.key)) return;
    setSaving((p) => ({ ...p, [entity.key]: action }));
    try {
      if (action === "profile") {
        // Guardar en el perfil del usuario
        const endpoint =
          entity.type === "exp"
            ? "/experience"
            : entity.type === "skill"
              ? "/skills"
              : "/formacion";
        const payload =
          entity.type === "exp"
            ? {
                empresa: entity.data.empresa,
                cargo: entity.data.cargo,
                descripcion: entity.data.descripcion ?? "",
                fecha_inicio: entity.data.fecha_inicio,
                fecha_fin: entity.data.fecha_fin,
              }
            : entity.type === "skill"
              ? {
                  nombre: entity.data.nombre,
                  tipo: entity.data.tipo ?? "tecnica",
                  nivel_texto: entity.data.nivel_texto ?? null,
                }
              : {
                  institucion: entity.data.institucion,
                  nombre_programa: entity.data.nombre_programa,
                  nivel_formacion: entity.data.nivel_formacion ?? "otro",
                  fecha_inicio: entity.data.fecha_inicio,
                  fecha_fin: entity.data.fecha_fin,
                };
        const res = await apiClient.post(endpoint, payload);
        if (onRemoveCustomEntry) onRemoveCustomEntry(entity.data);
        // Buscar si existe una customEntry con ese título y eliminarla de BD
        const existingCustom = customEntries?.find(
          (c) =>
            c.title ===
            (entity.data.cargo ||
              entity.data.nombre ||
              entity.data.nombre_programa),
        );
        if (existingCustom) {
          await apiClient.delete(
            `/cv/${cvId}/custom-entry/${existingCustom.id_cv_custom_entry}`,
          );
        }
        if (entity.type === "skill" && onSkillAdded) {
          onSkillAdded({
            id: res?.data?.id,
            nombre: entity.data.nombre,
            ...entity.data,
          });
        }
      } else if (action === "cv") {
        // Verificar que no exista ya en el perfil
        const yaEnPerfil =
          entity.type === "skill"
            ? skills.some(
                (s) =>
                  (s.nombre || s.name || "").toLowerCase() ===
                  (entity.data.nombre ?? "").toLowerCase(),
              )
            : entity.type === "exp"
              ? experience.some(
                  (e) =>
                    (e.cargo || e.title || "").toLowerCase() ===
                    (entity.data.cargo ?? "").toLowerCase(),
                )
              : education.some(
                  (e) =>
                    (e.nombre_programa || e.careerName || "").toLowerCase() ===
                    (entity.data.nombre_programa ?? "").toLowerCase(),
                );

        if (yaEnPerfil) {
          setDone((p) => new Set([...p, entity.key]));
          setSaving((p) => ({ ...p, [entity.key]: null }));
          return; // Ya está en el perfil, no añadir como customEntry
        }
        // ← AGREGAR: verificar si ya existe como customEntry
        const yaEnCustom = customEntries.some(
          (c) =>
            c.title ===
            (entity.data.cargo ||
              entity.data.nombre ||
              entity.data.nombre_programa),
        );

        if (yaEnCustom) {
          setDone((p) => new Set([...p, entity.key]));
          setSaving((p) => ({ ...p, [entity.key]: null }));
          return;
        }
        // Guardar solo en este CV — NO toca el perfil
        const entryTypeMap = {
          exp: "experience",
          skill: "skill",
          edu: "education",
        };
        const res = await apiClient.post(`/cv/${cvId}/custom-entry`, {
          entry_type: entryTypeMap[entity.type],
          title:
            entity.data.cargo ||
            entity.data.nombre ||
            entity.data.nombre_programa,
          subtitle:
            entity.data.empresa || entity.data.tipo || entity.data.institucion,
          description: entity.data.descripcion ?? null,
          date_start: entity.data.fecha_inicio ?? null,
          date_end: entity.data.fecha_fin ?? null,
          is_current: entity.data.actualmente ?? false,
        });

        // ← AGREGAR: actualizar customEntries en el padre sin recargar
        if (res?.data && onCustomEntryAdded) {
          onCustomEntryAdded(res.data);
        }
      }
      // action === "hide" → no hace nada, solo marca como hecho
      setDone((p) => new Set([...p, entity.key]));
    } catch (e) {
      console.error("Error al guardar entidad:", e);
    } finally {
      setSaving((p) => ({ ...p, [entity.key]: null }));
    }
  }

  const pendientes = allEntities.filter((e) => !done.has(e.key));

  if (pendientes.length === 0) {
    return (
      <div
        style={{
          fontSize: "11px",
          color: "#10b981",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Check size={13} /> Todo procesado
        <button
          type="button"
          onClick={onClear}
          style={{
            marginLeft: "auto",
            fontSize: "10px",
            color: "#94a3b8",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Limpiar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: "10px", color: "#94a3b8" }}>
        {pendientes.length} elemento(s) por procesar
      </div>
      {pendientes.map((entity) => (
        <div
          key={entity.key}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(205,225,245,.8)",
            background: "#fafcff",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: 2,
            }}
          >
            {entity.label}
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: 6 }}>
            {entity.sub}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { action: "profile", label: "Al perfil", color: "#185FA5" },
              { action: "cv", label: "Solo CV", color: "#0d9488" },
              { action: "hide", label: "Ocultar", color: "#94a3b8" },
            ].map(({ action, label, color }) => (
              <button
                key={action}
                type="button"
                onClick={() => handleAction(entity, action)}
                disabled={!!saving[entity.key]}
                style={{
                  flex: 1,
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "3px 0",
                  borderRadius: 5,
                  border: `1px solid ${color}20`,
                  background: `${color}10`,
                  color,
                  cursor: saving[entity.key] ? "wait" : "pointer",
                }}
              >
                {saving[entity.key] === action ? "..." : label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionWithItems({
  sec,
  enabled,
  onToggle,
  items,
  hiddenItems,
  onToggleItem,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 0",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "#374151",
            cursor: items.length > 0 ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onClick={() => items.length > 0 && setOpen((o) => !o)}
        >
          {items.length > 0 && (
            <span style={{ fontSize: "9px", color: "#94a3b8" }}>
              {open ? "▾" : "▸"}
            </span>
          )}
          {sec.label}
          {items.length > 0 && (
            <span style={{ fontSize: "9px", color: "#94a3b8", marginLeft: 2 }}>
              ({items.length})
            </span>
          )}
        </span>
        <div
          style={{
            width: 32,
            height: 18,
            borderRadius: 9,
            background: enabled ? "#185FA5" : "#cbd5e1",
            position: "relative",
            cursor: "pointer",
            transition: "background .2s",
            flexShrink: 0,
          }}
          onClick={onToggle}
        >
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#fff",
              position: "absolute",
              top: 2.5,
              left: enabled ? 16 : 2.5,
              transition: "left .2s",
              boxShadow: "0 1px 3px rgba(0,0,0,.2)",
            }}
          />
        </div>
      </div>

      {open && items.length > 0 && (
        <div
          style={{
            paddingLeft: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 4,
          }}
        >
          {items.map((item) => {
            const isHidden = hiddenItems.has(item.key);
            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "3px 6px",
                  borderRadius: 6,
                  background: isHidden
                    ? "rgba(107,114,128,.06)"
                    : "rgba(37,93,222,.04)",
                  border: `1px solid ${isHidden ? "rgba(107,114,128,.12)" : "rgba(37,93,222,.10)"}`,
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: isHidden ? "#9ca3af" : "#374151",
                    textDecoration: isHidden ? "line-through" : "none",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleItem(item.key)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 2px",
                    color: isHidden ? "#9ca3af" : "#185FA5",
                    flexShrink: 0,
                  }}
                >
                  {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Panel colapsable ─────────────────────────────────────────────────────────

function PropPanel({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={ui.propSection}>
      <div style={ui.propTitle(open)} onClick={() => setOpen((o) => !o)}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={12} />
          {title}
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </div>
      {open && <div style={ui.propBody}>{children}</div>}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CvEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [cvName, setCvName] = useState("Mi CV");
  const [zoom, setZoom] = useState(80);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFont, setSelectedFont] = useState("serif");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [saved, setSaved] = useState(false);

  const [cvId, setCvId] = useState(() => searchParams.get("id") ?? null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [importedData, setImportedData] = useState(null);
  const [customEntries, setCustomEntries] = useState([]);
  const [hiddenItems, setHiddenItems] = useState(new Set());

  const [profileData, setProfileData] = useState(null);

  function toggleItem(itemKey) {
    setHiddenItems((prev) => {
      const next = new Set(prev);
      next.has(itemKey) ? next.delete(itemKey) : next.add(itemKey);
      return next;
    });
  }

  const handleZoom = useCallback((delta) => {
    setZoom((z) => Math.min(130, Math.max(50, z + delta)));
  }, []);

  const handleToggleSection = useCallback((key) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)),
    );
  }, []);

  const profile = useMemo(() => {
    if (!profileData && !user) return null;
    return {
      nombre: profileData?.nombre || user?.nombre || user?.name || "",
      apellido: profileData?.apellido || user?.apellido || user?.lastName || "",
      profesion: profileData?.profesion || user?.profesion || "",
      biografia: profileData?.biografia || user?.biografia || "",
      ubicacion: profileData?.ubicacion || user?.ubicacion || "",
      email: profileData?.email || user?.email || "",
      github: profileData?.github || user?.github || "",
      linkedin: profileData?.linkedin || user?.linkedin || "",
    };
  }, [profileData, user]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        name_cv: cvName,
        template: selectedTemplate.id,
        font: selectedFont,
        description: "Generado desde mi perfil",
        visible: false,
      };

      let savedCvId = cvId;

      if (cvId) {
        await actualizarCv(Number(cvId), payload);
      } else {
        const res = await crearCv(payload);
        savedCvId = res.data?.id_cv ?? null;
        setCvId(savedCvId);
      }

      // Generar PDF como blob y subir a Cloudinary
     /*  if (savedCvId) {
        try {
          const { pdf } = await import("@react-pdf/renderer");
          const blob = await pdf(
            <CvPdfDocument
              profile={profile}
              templateId={selectedTemplate.id}
              fontId={selectedFont}
              sections={sections}
              experience={experience}
              education={education}
              skills={skills}
              projects={projects}
              customEntries={customEntries}
              hiddenItems={hiddenItems}
            />,
          ).toBlob();
          await subirPdfCv(savedCvId, blob, cvName);
        } catch (pdfErr) {
          console.warn("PDF upload failed:", pdfErr);
          // No bloquear el guardado si falla el PDF
        }
      } */

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error al guardar CV:", err);
    } finally {
      setSaving(false);
    }
  }, [
    cvName,
    selectedTemplate,
    selectedFont,
    cvId,
    profile,
    sections,
    experience,
    education,
    skills,
    projects,
    customEntries,
    hiddenItems,
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        // Cargar datos del portafolio siempre
        const portfolio = await cargarDatosPortafolio();
        const perfilRes = await apiClient.get("/perfil/me");
        if (perfilRes?.nombre) {
          setProfileData(perfilRes);
        }
        setExperience(portfolio.experience);
        setEducation(portfolio.education);
        setSkills(portfolio.skills);
        setProjects(portfolio.projects);

        // Si viene con ?id= cargar datos del CV
        if (cvId) {
          const res = await obtenerCv(Number(cvId));
          const cv = res.data;

          // Cargar entidades "Solo CV" desde BD
          const entriesRes = await obtenerCustomEntries(Number(cvId));
          setCustomEntries(entriesRes?.data ?? []);

          // Si no hay sessionStorage, mostrar panel con custom entries existentes
          const stored = sessionStorage.getItem(`cv_import_${cvId}`);
          if (stored) {
            try {
              setImportedData(JSON.parse(stored));
            } catch {
              /* ignorar */
            }
          }

          if (cv) {
            setCvName(cv.name_cv ?? "Mi CV");
            const tpl = TEMPLATES.find((t) => t.id === cv.template);
            if (tpl) setSelectedTemplate(tpl);
            const fnt = FONTS.find((f) => f.id === cv.font);
            if (fnt) setSelectedFont(fnt.id);

            // DEBUG
            console.log("Buscando clave:", `cv_import_${cvId}`);
            console.log("Todas las claves:", Object.keys(sessionStorage));

            // Verificar si hay datos importados en sessionStorage
            const stored = sessionStorage.getItem(`cv_import_${cvId}`);
            if (stored) {
              try {
                setImportedData(JSON.parse(stored));
              } catch {
                /* ignorar */
              }
            }
          }
        }
      } catch (err) {
        console.error("Error cargando datos del editor:", err);
      }
    }
    loadData();
  }, [cvId]);

  return (
    <div style={ui.page}>
      {/* Topbar */}
      {/* <AuthTopbar /> */}
      <div style={ui.topbar}>
        <div style={ui.topbarLeft}>
          <button type="button" style={ui.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
            Volver
          </button>
          <div style={ui.divider} />
          <input
            style={ui.cvName}
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
          />
        </div>
        <div style={ui.topbarRight}>
          {saved && (
            <div style={ui.savedBadge}>
              <Check size={12} />
              Guardado
            </div>
          )}
          <button
            type="button"
            style={ui.btnSecondary}
            onClick={() => setShowPreview(true)}
          >
            <Eye size={14} />
            Vista previa
          </button>
          <button
            type="button"
            style={ui.btnSecondary}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={14} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <PDFDownloadLink
            document={
              <CvPdfDocument
                profile={profile}
                templateId={selectedTemplate.id}
                fontId={selectedFont}
                sections={sections}
                experience={experience}
                education={education}
                skills={skills}
                projects={projects}
                customEntries={customEntries}
                hiddenItems={hiddenItems}
              />
            }
            fileName={`${cvName}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <button type="button" style={ui.btnPrimary} disabled={loading}>
                <Download size={14} />
                {loading ? "Generando..." : "Exportar PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Shell */}
      <div style={ui.shell}>
        {/* Panel izquierdo — plantillas */}
        <div style={ui.leftPanel}>
          <div style={ui.panelTitle}>
            <Layout size={11} />
            Plantillas
          </div>
          <div style={ui.panelBody}>
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                style={ui.templateCard(selectedTemplate.id === tpl.id)}
                onClick={() => setSelectedTemplate(tpl)}
              >
                <div style={ui.templateThumb(tpl.headerBg)}>
                  <div style={ui.thumbLine("65%", 0.9)} />
                  <div style={ui.thumbLine("42%", 0.5)} />
                  <div
                    style={{
                      marginTop: 5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <div style={ui.thumbLine("90%", 0.22)} />
                    <div style={ui.thumbLine("75%", 0.22)} />
                    <div style={ui.thumbLine("82%", 0.22)} />
                  </div>
                </div>
                <div style={ui.templateLabel}>{tpl.name}</div>
                {selectedTemplate.id === tpl.id ? (
                  <div style={ui.activeBadge}>Activo</div>
                ) : (
                  <div style={ui.templateSub}>{tpl.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas central */}
        <div style={ui.canvas}>
          <div style={ui.canvasToolbar}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontFamily: "var(--f-ui, system-ui)",
                }}
              >
                Editor de CV
              </span>
              <div style={ui.zoomControl}>
                <button
                  type="button"
                  style={ui.zoomBtn}
                  onClick={() => handleZoom(-10)}
                >
                  −
                </button>
                <span style={ui.zoomVal}>{zoom}%</span>
                <button
                  type="button"
                  style={ui.zoomBtn}
                  onClick={() => handleZoom(+10)}
                >
                  +
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" style={ui.btnSecondary}>
                Deshacer
              </button>
              <button type="button" style={ui.btnSecondary}>
                Rehacer
              </button>
            </div>
          </div>

          <div style={ui.canvasScroll}>
            <CvPaper
              template={selectedTemplate}
              fontId={selectedFont}
              sections={sections}
              profile={profile}
              zoom={zoom}
              experience={experience}
              education={education}
              skills={skills}
              projects={projects}
              customEntries={customEntries}
              hiddenItems={hiddenItems}
            />
          </div>
        </div>

        {/* Panel derecho — propiedades */}
        <div style={ui.rightPanel}>
          {/* Panel entidades importadas */}
          {importedData && (
            <PropPanel title="Contenido importado" icon={FileUp}>
              <ImportedEntitiesPanel
                importedData={importedData}
                cvId={cvId}
                onClear={() => {
                  sessionStorage.removeItem(`cv_import_${cvId}`);
                  setImportedData(null);
                  // Recargar datos del portafolio
                  cargarDatosPortafolio().then((p) => {
                    setExperience(p.experience);
                    setEducation(p.education);
                    setSkills(p.skills);
                    setProjects(p.projects);
                  });
                }}
                onCustomEntryAdded={(newEntry) => {
                  setCustomEntries((prev) => [...prev, newEntry]);
                }}
                onRemoveCustomEntry={(data) => {
                  setCustomEntries((prev) =>
                    prev.filter(
                      (c) =>
                        c.title !==
                        (data.cargo || data.nombre || data.nombre_programa),
                    ),
                  );
                }}
                onSkillAdded={(skill) => setSkills((prev) => [...prev, skill])}
                customEntries={customEntries}
                skills={skills}
                experience={experience}
                education={education}
              />
            </PropPanel>
          )}
          {/* Color de acento */}
          <PropPanel title="Color principal" icon={Palette}>
            <div style={ui.colorDots}>
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  style={ui.colorDot(
                    selectedTemplate.id === tpl.id,
                    tpl.headerBg,
                  )}
                  onClick={() => setSelectedTemplate(tpl)}
                  title={tpl.name}
                />
              ))}
            </div>
          </PropPanel>

          {/* Tipografía */}
          <PropPanel title="Tipografía" icon={Type}>
            <div style={ui.fontOptions}>
              {FONTS.map((f) => (
                <div
                  key={f.id}
                  style={{
                    ...ui.fontOpt(selectedFont === f.id),
                    fontFamily: f.value,
                  }}
                  onClick={() => setSelectedFont(f.id)}
                >
                  {f.label}
                </div>
              ))}
            </div>
          </PropPanel>

          {/* Secciones */}
          <PropPanel title="Secciones" icon={ToggleLeft}>
            {sections.map((sec) => {
              // Construir items según la sección
              const items =
                sec.key === "experience"
                  ? [
                      ...experience.map((e, i) => ({
                        key: `exp-${e.id ?? i}`,
                        label: `${e.title || e.cargo} — ${e.company || e.empresa}`,
                      })),
                      ...customEntries
                        .filter((c) => c.entry_type === "experience")
                        .map((c) => ({
                          key: `cexp-${c.id_cv_custom_entry}`,
                          label: `${c.title} — ${c.subtitle}`,
                        })),
                    ]
                  : sec.key === "education"
                    ? [
                        ...education.map((e, i) => ({
                          key: `edu-${e.id ?? i}`,
                          label: `${e.nombre_programa || e.careerName} · ${e.institucion || e.university?.name}`,
                        })),
                        ...customEntries
                          .filter((c) => c.entry_type === "education")
                          .map((c) => ({
                            key: `cedu-${c.id_cv_custom_entry}`,
                            label: `${c.title} · ${c.subtitle}`,
                          })),
                      ]
                    : sec.key === "skills"
                      ? [
                          ...skills.map((s, i) => ({
                            key: `skill-${s.id ?? i}`,
                            label: s.nombre || s.name,
                          })),
                          ...customEntries
                            .filter((c) => c.entry_type === "skill")
                            .map((c) => ({
                              key: `cskill-${c.id_cv_custom_entry}`,
                              label: c.title,
                            })),
                        ]
                      : sec.key === "projects"
                        ? projects.map((p, i) => ({
                            key: `proj-${p.id ?? i}`,
                            label: p.titulo || p.title,
                          }))
                        : sec.key === "social"
                          ? [
                              profile?.github
                                ? {
                                    key: "social-github",
                                    label: `GitHub: ${profile.github}`,
                                  }
                                : null,
                              profile?.linkedin
                                ? {
                                    key: "social-linkedin",
                                    label: `LinkedIn: ${profile.linkedin}`,
                                  }
                                : null,
                            ].filter(Boolean)
                          : [];

              return (
                <SectionWithItems
                  key={sec.key}
                  sec={sec}
                  enabled={sec.enabled}
                  onToggle={() => handleToggleSection(sec.key)}
                  items={items}
                  hiddenItems={hiddenItems}
                  onToggleItem={toggleItem}
                />
              );
            })}
          </PropPanel>

          {/* Visibilidad */}
          <PropPanel title="Visibilidad" icon={Eye}>
            <div style={ui.sectionRow}>
              <span style={ui.sectionLabel}>Público en mi perfil</span>
              <div style={ui.toggle(true)}>
                <div style={ui.toggleDot(true)} />
              </div>
            </div>
          </PropPanel>

          {/* Info */}
          <div
            style={{
              padding: "14px",
              borderBottom: "1px solid rgba(205,225,245,.5)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                fontFamily: "var(--f-ui, system-ui)",
                marginBottom: 4,
              }}
            >
              Datos del CV
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#374151",
                fontFamily: "var(--f-ui, system-ui)",
              }}
            >
              Generado desde tu perfil
            </div>
          </div>
        </div>
      </div>
      {showPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "14px" }}>
              Vista previa — {cvName}
            </span>
            <button
              type="button"
              style={ui.btnSecondary}
              onClick={() => setShowPreview(false)}
            >
              Cerrar
            </button>
          </div>
          <PDFViewer style={{ flex: 1, border: "none" }}>
            <CvPdfDocument
              profile={profile}
              templateId={selectedTemplate.id}
              fontId={selectedFont}
              sections={sections}
              experience={experience}
              education={education}
              skills={skills}
              projects={projects}
              customEntries={customEntries}
              hiddenItems={hiddenItems}
            />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}
