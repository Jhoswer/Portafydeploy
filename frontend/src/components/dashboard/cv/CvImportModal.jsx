import { useRef, useState } from "react";
import {
  FileUp,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { importarCv } from "../../../services/cvImportService";
import { normalizarCvImportado } from "../../../features/cv-import/normalizers";
import CvImportReviewModal from "./CvImportReviewModal";
import { cargarDatosPortafolio, crearCv } from "../../../services/cvService";

const ACCEPTED = ".pdf,.doc,.docx,.txt";
const MAX_MB = 10;

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(14,30,60,.48)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 24px 64px rgba(14,30,60,.18)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 16px",
    borderBottom: "1px solid rgba(205,225,245,.72)",
  },
  title: {
    fontFamily: "var(--f-title)",
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "var(--text)",
  },
  subtitle: {
    fontFamily: "var(--f-body)",
    fontSize: "0.8rem",
    color: "var(--muted)",
    marginTop: 2,
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--muted)",
    padding: 4,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
  },
  body: { padding: "24px", display: "grid", gap: 16 },
  dropzone: (isDragging) => ({
    border: `2px dashed ${isDragging ? "#255dde" : "rgba(162,214,249,.6)"}`,
    borderRadius: 14,
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    background: isDragging ? "rgba(37,93,222,.04)" : "rgba(246,251,255,.8)",
    transition: "all .18s",
    textAlign: "center",
  }),
  dropIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #12369e 0%, #255dde 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  dropTitle: {
    fontFamily: "var(--f-title)",
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "var(--text)",
  },
  dropSub: {
    fontFamily: "var(--f-body)",
    fontSize: "0.78rem",
    color: "var(--muted)",
  },
  fileSelected: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(37,93,222,.06)",
    border: "1px solid rgba(37,93,222,.14)",
  },
  fileName: {
    fontFamily: "var(--f-ui)",
    fontSize: "0.83rem",
    fontWeight: 600,
    color: "#255dde",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(239,87,89,.06)",
    border: "1px solid rgba(239,87,89,.18)",
    color: "#c0392b",
    fontFamily: "var(--f-body)",
    fontSize: "0.82rem",
  },
  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(13,148,136,.06)",
    border: "1px solid rgba(13,148,136,.18)",
    color: "#0d9488",
    fontFamily: "var(--f-body)",
    fontSize: "0.82rem",
  },
  footer: {
    padding: "0 24px 24px",
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  btnSecondary: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "1px solid rgba(205,225,245,.9)",
    background: "#fff",
    color: "var(--body)",
    fontFamily: "var(--f-ui)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: (disabled) => ({
    padding: "9px 20px",
    borderRadius: 10,
    border: "none",
    background: disabled
      ? "rgba(37,93,222,.35)"
      : "linear-gradient(135deg, #12369e 0%, #255dde 100%)",
    color: "#fff",
    fontFamily: "var(--f-ui)",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  }),
};

function fileNameWithoutExt(name) {
  return name.replace(/\.[^/.]+$/, "");
}

export default function CvImportModal({ onClose, onImported }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [normalized, setNormalized] = useState(null);
  const [existingData, setExistingData] = useState(null);
  const [showReview, setShowReview] = useState(false);

  function validateFile(f) {
    if (!f) return "Selecciona un archivo.";
    if (f.size > MAX_MB * 1024 * 1024)
      return `El archivo supera los ${MAX_MB} MB permitidos.`;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx", "txt"].includes(ext))
      return "Formato no soportado. Sube PDF, Word (.docx) o TXT.";
    return null;
  }

  function handleFileChange(selected) {
    const err = validateFile(selected);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError("");
    setSuccess("");
    setFile(selected);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDrag(true);
  }
  function onDragLeave() {
    setDrag(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Parsear CV con Groq — FIX: normalizar raw.data no raw
      const raw = await importarCv(file);
      const normalizedData = normalizarCvImportado(raw?.data ?? raw);
      setNormalized(normalizedData);

      // 2. Cargar datos actuales del usuario para comparar
      const portfolio = await cargarDatosPortafolio();
      setExistingData(portfolio);

      // 3. Guardar CV en BD con el nombre del archivo (sin extensión)
      const cvName = fileNameWithoutExt(file.name);
      const expCount = normalizedData.experiencias?.length ?? 0;
      const skillCount = normalizedData.habilidades?.length ?? 0;

      const res = await crearCv({
        name_cv: cvName,
        template: "slate",
        description: `Importado · ${expCount} experiencias · ${skillCount} habilidades`,
        visible: false,
      });

      const newCvId = res?.data?.id_cv ?? res?.id_cv;
      if (newCvId) {
        sessionStorage.setItem(
          `cv_import_${newCvId}`,
          JSON.stringify(normalizedData),
        );
      }

      // 4. Verificar si hay entidades nuevas
      const newExp = (normalizedData.experiencias ?? []).filter(
        (exp) =>
          !portfolio.experience.some(
            (e) =>
              (e.company || e.empresa || "").toLowerCase() ===
                (exp.empresa ?? "").toLowerCase() &&
              (e.title || e.cargo || "").toLowerCase() ===
                (exp.cargo ?? "").toLowerCase(),
          ),
      );
      const newSkills = (normalizedData.habilidades ?? []).filter(
        (skill) =>
          !portfolio.skills.some(
            (s) =>
              (s.name || s.nombre || "").toLowerCase() ===
              (skill.nombre ?? "").toLowerCase(),
          ),
      );
      const newEdu = (normalizedData.formaciones ?? []).filter(
        (edu) =>
          !portfolio.education.some(
            (e) =>
              (e.nombre_programa || e.careerName || "").toLowerCase() ===
              (edu.nombre_programa ?? "").toLowerCase(),
          ),
      );
      const totalNew = newExp.length + newSkills.length + newEdu.length;

      if (totalNew === 0) {
        // Sin entidades nuevas — mensaje breve, sin modal
        setSuccess(
          "CV importado. No se encontraron elementos nuevos respecto a tu perfil.",
        );
        setTimeout(() => {
          onImported(normalizedData);
          /* onClose(); */
        }, 2000);
      } else {
        // Hay entidades nuevas — mostrar modal de revisión
        setSuccess(
          `CV importado. Se encontraron ${totalNew} elemento(s) nuevos.`,
        );
        setTimeout(() => setShowReview(true), 800);
      }
    } catch (err) {
      setError(err?.message ?? "No se pudo procesar el CV. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={s.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={s.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Importar CV"
      >
        <div style={s.header}>
          <div>
            <div style={s.title}>Importar CV</div>
            <div style={s.subtitle}>
              Tu CV se procesará con IA y pre-rellenará los formularios
              automáticamente.
            </div>
          </div>
          <button
            type="button"
            style={s.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div style={s.body}>
          <div
            style={s.dropzone(isDragging)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div style={s.dropIcon}>
              <FileUp size={22} />
            </div>
            <div style={s.dropTitle}>
              {file ? "Cambiar archivo" : "Arrastrá tu CV aquí"}
            </div>
            <div style={s.dropSub}>
              o hacé clic para seleccionar · PDF, Word, TXT · máx {MAX_MB} MB
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && !error && (
            <div style={s.fileSelected}>
              <FileText size={16} color="#255dde" />
              <span style={s.fileName}>{file.name}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}

          {error && (
            <div style={s.errorBox}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}
          {success && (
            <div style={s.successBox}>
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {success}
            </div>
          )}
        </div>

        <div style={s.footer}>
          <button type="button" style={s.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            style={s.btnPrimary(!file || loading)}
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Procesando...
              </>
            ) : (
              <>
                <FileUp size={15} /> Importar CV
              </>
            )}
          </button>
        </div>
      </div>

      {showReview && normalized && existingData && (
        <CvImportReviewModal
          normalized={normalized}
          existing={existingData}
          onClose={() => {
            setShowReview(false);
            onClose();
          }}
          onSaved={() => {
            onImported(normalized);
            setShowReview(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}
