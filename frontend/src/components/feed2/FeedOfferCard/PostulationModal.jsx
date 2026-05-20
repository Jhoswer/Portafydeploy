import { useState, useEffect } from "react";
import { X, CheckCircle, Upload, Trash2, Loader } from "lucide-react";
import { CvOption } from "./CvOption";
import { postularseAOferta } from "../../../services/postulationService";
import { listarCvs } from "../../../services/cvService";

export function PostulationModal({ offer, onClose, onSuccess }) {
  const [cvs, setCvs] = useState([]);
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [errorCvs, setErrorCvs] = useState("");

  const [reason, setReason] = useState("");
  const [selectedCv, setSelectedCv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchCvs() {
      try {
        const cached = sessionStorage.getItem("user_cvs");

        if (cached) {
          const lista = JSON.parse(cached);

          if (Array.isArray(lista)) {
            setCvs(lista);
            if (lista.length > 0) setSelectedCv(lista[0]);
            setLoadingCvs(false);
            return;
          }
        }

        const res = await listarCvs();

        const lista = Array.isArray(res?.data)
          ? res.data
          : [];

        sessionStorage.setItem("user_cvs", JSON.stringify(lista));
        setCvs(lista);

        if (lista.length > 0) {
          setSelectedCv(lista[0]);
        }
      } catch (error) {
        console.error("Error cargando CVs:", error);
        setErrorCvs("No se pudieron cargar tus CVs.");
      } finally {
        setLoadingCvs(false);
      }
    }

    fetchCvs();
  }, []);

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("Por favor escribí una carta de presentación.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await postularseAOferta(
        offer.id_offer,
        reason.trim(),
        selectedCv?.id_cv ?? null
      );

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      if (err?.status === 409 || err?.data?.message?.includes("already")) {
        setError("Ya te postulaste a esta oferta.");
      } else {
        setError(err?.message || "Ocurrió un error. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  };

  const modalStyle = {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 480,
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "26px 24px",
    position: "relative",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
  };

  if (submitted) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle size={48} color="#047857" style={{ marginBottom: 14 }} />

            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#111" }}>
              ¡Postulación enviada!
            </h2>

            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
              Tu postulación fue registrada. El equipo revisará tu perfil pronto.
            </p>

            <button
              onClick={onClose}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 28px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            display: "flex",
            padding: 4,
            borderRadius: 6,
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px", color: "#111", paddingRight: 24 }}>
          Postularme a esta oferta
        </h2>

        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
          {offer.company ? `${offer.title} · ${offer.company}` : offer.title}
        </p>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              CV adjunto
            </label>

            {selectedCv && (
              <button
                type="button"
                onClick={() => setSelectedCv(null)}
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 0,
                }}
              >
                <Trash2 size={11} /> Quitar
              </button>
            )}
          </div>

          {loadingCvs && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px 0", color: "#6b7280", fontSize: 13 }}>
              <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
              Cargando tus CVs...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loadingCvs && errorCvs && (
            <div style={{ border: "1.5px dashed #fecaca", borderRadius: 10, padding: "14px", textAlign: "center", color: "#dc2626", fontSize: 13 }}>
              {errorCvs}
            </div>
          )}

          {!loadingCvs && !errorCvs && cvs.length === 0 && (
            <div style={{ border: "1.5px dashed #e5e7eb", borderRadius: 10, padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              <Upload size={20} style={{ marginBottom: 6, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No tenés ningún CV creado todavía.</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                Podés crear uno desde tu{" "}
                <strong style={{ color: "#2563eb", cursor: "pointer" }}>
                  perfil profesional
                </strong>.
              </p>
            </div>
          )}

          {!loadingCvs && !errorCvs && cvs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cvs.map((cv) => (
                <CvOption
                  key={cv.id_cv}
                  cv={cv}
                  selected={selectedCv}
                  onSelect={setSelectedCv}
                />
              ))}
            </div>
          )}

          {!selectedCv && cvs.length > 0 && (
            <p style={{ fontSize: 12, color: "#f59e0b", margin: "8px 0 0" }}>
              Sin CV seleccionado — tu postulación se enviará sin adjunto.
            </p>
          )}
        </div>

        <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 18px" }} />

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Carta de presentación <span style={{ color: "#ef4444" }}>*</span>
          </label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contá por qué sos el candidato ideal para este puesto..."
            rows={5}
            maxLength={255}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 14,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
              color: "#111",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />

          <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 4 }}>
            {reason.length}/255
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || loadingCvs}
            style={{
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {loading ? (
              "Enviando..."
            ) : (
              <>
                <CheckCircle size={14} /> Enviar postulación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}