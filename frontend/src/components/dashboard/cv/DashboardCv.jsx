import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FileUp, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

import CvImportModal from "./CvImportModal";
import CvCard from "./CvCard";
import { cvUi as s } from "../../../styles/components/dashboard/cvStyles";
import {
  listarCvs,
  eliminarCv,
  toggleVisibleCv,
} from "../../../services/cvService";

export default function DashboardCv() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // guarda el id a eliminar

  const fetchCvs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listarCvs();
      setCvs(res.data ?? []);
    } catch {
      setError("No se pudieron cargar los CVs. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCvs();
  }, [fetchCvs]);

  const handleToggleVisible = useCallback(async (id) => {
    try {
      const res = await toggleVisibleCv(id);
      setCvs((prev) => prev.map((cv) => (cv.id_cv === id ? res.data : cv)));
    } catch {
      setError("No se pudo actualizar la visibilidad.");
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await eliminarCv(id);
      setCvs((prev) => prev.filter((cv) => cv.id_cv !== id));
      setConfirmDelete(null);
    } catch {
      setError("No se pudo eliminar el CV.");
    }
  }, []);

  // eslint-disable-next-line no-unused-vars
  const handleImported = useCallback(async (normalized) => {
    /* try {
    const res = await listarCvs();
    setCvs(res.data ?? []);
  } catch {
    setError("No se pudo actualizar la lista de CVs.");
  } finally {
    setShowImport(false);
  } */
    setShowImport(false);
  }, []);

  useEffect(() => {
    if (!showImport) {
      fetchCvs();
    }
  }, [showImport, fetchCvs]);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.title}>Mis CVs</div>
          <div style={s.subtitle}>
            Gestiona, edita y exporta tus currículums vitae
          </div>
        </div>
        <div style={s.actions}>
          <button
            type="button"
            style={s.btnSecondary}
            onClick={() => setShowImport(true)}
          >
            <FileUp size={14} /> Importar CV
          </button>
          <button
            type="button"
            style={s.btnPrimary}
            onClick={() => navigate("/dashboard/cv/editor")}
          >
            <Plus size={14} /> Generar desde perfil
          </button>
        </div>
      </div>

      <div style={s.strip}>
        <Sparkles size={14} style={{ flexShrink: 0 }} />
        Puedes generar un CV desde los datos de tu perfil, o importar uno
        existente en PDF o Word.
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <div style={s.loadingBox}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
          Cargando CVs...
        </div>
      ) : cvs.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>
            <FileText size={26} />
          </div>
          <div style={s.emptyTitle}>Todavía no tenés CVs</div>
          <div style={s.emptyText}>
            Importá un CV existente o generá uno nuevo desde tu perfil.
          </div>
          <div style={s.actions}>
            <button
              type="button"
              style={s.btnSecondary}
              onClick={() => setShowImport(true)}
            >
              <FileUp size={14} /> Importar CV
            </button>
            <button
              type="button"
              style={s.btnPrimary}
              onClick={() => navigate("/dashboard/cv/editor")}
            >
              <Sparkles size={14} /> Generar CV
            </button>
          </div>
        </div>
      ) : (
        <div style={s.grid}>
          {cvs.map((cv) => (
            <CvCard
              key={cv.id_cv}
              cv={cv}
              onToggleVisible={handleToggleVisible}
              onDelete={handleDelete}
              navigate={navigate}
              onConfirmDelete={(id) => setConfirmDelete(id)}
            />
          ))}
        </div>
      )}

      {showImport && (
        <CvImportModal
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(14,30,60,.48)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "28px 28px 24px",
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 24px 64px rgba(14,30,60,.18)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--f-title)",
                fontWeight: 800,
                fontSize: "1rem",
                color: "var(--text)",
              }}
            >
              ¿Eliminar CV?
            </div>
            <div
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "0.85rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              Esta acción no se puede deshacer. El CV será eliminado de tu
              lista.
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(205,225,245,.9)",
                  background: "#fff",
                  fontFamily: "var(--f-ui)",
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef5759",
                  color: "#fff",
                  fontFamily: "var(--f-ui)",
                  fontSize: "0.83rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={() => handleDelete(confirmDelete)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
