import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, FileUp, Loader2, Plus, Sparkles } from "lucide-react";

import CvImportModal from "./CvImportModal";
import CvCard from "./CvCard";
import { cvUi as s } from "../../../styles/components/dashboard/cvStyles";
import {
  listarCvs,
  eliminarCv,
  toggleVisibleCv,
} from "../../../services/cvService";

import "../../../styles/components/dashboard/cv-module.css";

export default function DashboardCv() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCvs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listarCvs();
      setCvs(res.data ?? []);
    } catch {
      setError(t("cv.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCvs();
  }, [fetchCvs]);

  const handleToggleVisible = useCallback(
    async (id) => {
      try {
        const res = await toggleVisibleCv(id);
        setCvs((prev) => prev.map((cv) => (cv.id_cv === id ? res.data : cv)));
      } catch {
        setError(t("cv.errorVisibility"));
      }
    },
    [t],
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await eliminarCv(id);
        setCvs((prev) => prev.filter((cv) => cv.id_cv !== id));
        setConfirmDelete(null);
      } catch {
        setError(t("cv.errorDelete"));
      }
    },
    [t],
  );

  // eslint-disable-next-line no-unused-vars
  const handleImported = useCallback(async (_normalized) => {
    setShowImport(false);
  }, []);

  useEffect(() => {
    if (!showImport) fetchCvs();
  }, [showImport, fetchCvs]);

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.title}>{t("cv.title")}</div>
          <div style={s.subtitle}>{t("cv.subtitle")}</div>
        </div>
        <div style={s.actions}>
          <button
            type="button"
            style={s.btnSecondary}
            onClick={() => setShowImport(true)}
          >
            <FileUp size={14} /> {t("cv.importBtn")}
          </button>
          <button
            type="button"
            style={s.btnPrimary}
            onClick={() => navigate("/dashboard/cv/editor")}
          >
            <Plus size={14} /> {t("cv.generateBtn")}
          </button>
        </div>
      </div>

      {/* Strip informativo */}
      <div
        style={{
          ...s.strip,
          background: "var(--cv-strip-bg)",
          border: "1px solid var(--cv-strip-border)",
          color: "var(--cv-strip-text)",
        }}
      >
        <Sparkles size={14} style={{ flexShrink: 0 }} />
        {t("cv.strip")}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            ...s.errorBox,
            background: "var(--cv-error-bg)",
            border: "1px solid var(--cv-error-border)",
            color: "var(--cv-error-text)",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading / Empty / Grid */}
      {loading ? (
        <div style={{ ...s.loadingBox, color: "var(--cv-loading-color)" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
          {t("cv.loading")}
        </div>
      ) : cvs.length === 0 ? (
        <div
          style={{
            ...s.empty,
            background: "var(--cv-empty-bg)",
            border: "1.5px dashed var(--cv-empty-border)",
          }}
        >
          <div style={s.emptyIcon}>
            <FileText size={26} />
          </div>
          <div style={s.emptyTitle}>{t("cv.empty.title")}</div>
          <div style={s.emptyText}>{t("cv.empty.text")}</div>
          <div style={s.actions}>
            <button
              type="button"
              style={s.btnSecondary}
              onClick={() => setShowImport(true)}
            >
              <FileUp size={14} /> {t("cv.importBtn")}
            </button>
            <button
              type="button"
              style={s.btnPrimary}
              onClick={() => navigate("/dashboard/cv/editor")}
            >
              <Sparkles size={14} /> {t("cv.generateBtnShort")}
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

      {/* Modal importar */}
      {showImport && (
        <CvImportModal
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}

      {/* Modal confirmar eliminación */}
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
              background: "var(--cv-surface-modal)",
              borderRadius: 16,
              padding: "28px 28px 24px",
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 24px 64px rgba(14,30,60,.18)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              border: "1px solid var(--cv-border)",
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
              {t("cv.delete.title")}
            </div>
            <div
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "0.85rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              {t("cv.delete.body")}
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--cv-cancel-btn-border)",
                  background: "var(--cv-cancel-btn-bg)",
                  color: "var(--text)",
                  fontFamily: "var(--f-ui)",
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setConfirmDelete(null)}
              >
                {t("cv.delete.cancel")}
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
                {t("cv.delete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
