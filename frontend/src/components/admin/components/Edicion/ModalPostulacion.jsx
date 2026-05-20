// src/components/admin/components/Edicion/ModalPostulacion.jsx

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, SendHorizonal, Loader2, FileText, Calendar, RefreshCw } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminPostulation,
  updateAdminPostulation,
} from "../../../../services/adminProfileTableService";

/* ── Opciones válidas para state (CHECK constraint de la tabla) ── */
const STATE_OPTIONS = [
  { value: "in_verification", label: "En verificación" },
  { value: "accepted",        label: "Aceptado"         },
  { value: "refused",         label: "Rechazado"        },
];

/* Clases CSS del badge según estado — reutiliza las del CSS existente */
const STATE_BADGE_CLASS = {
  in_verification: "edicion-tabla__badge--junior",       // amarillo
  accepted:        "edicion-tabla__badge--state-public", // verde
  refused:         "edicion-tabla__badge--no",           // rojo
};

const FIELD_LABELS = {
  id_cv:   "CV del postulante",
  reason:  "Motivo / Carta de presentación",
  state:   "Estado de la postulación",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-BO", {
    day:    "2-digit",
    month:  "long",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

/* Estilo compartido para campos de solo lectura */
const READONLY_STYLE = {
  background:  "#f1f5f9",
  color:       "#64748b",
  cursor:      "default",
  userSelect:  "none",
  fontSize:    "12.5px",
  minHeight:   "38px",
  display:     "flex",
  alignItems:  "center",
};

export default function ModalPostulacion({ idProfile, postulation, onClose, onSave }) {
  /* ── Campos editables ── */
  const [formData, setFormData] = useState({
    id_cv:  null,
    reason: "",
    state:  "in_verification",
  });
  const [originalData, setOriginalData] = useState(null);

  /* ── Solo lectura ── */
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  /* ── Catálogo de CVs del perfil ── */
  const [cvOptions, setCvOptions] = useState([]);

  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState(null);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const idPostulation = postulation?.id_postulation;

  /* ── Cargar datos desde el backend ── */
  useEffect(() => {
    if (!idProfile || !idPostulation) {
      setIsLoading(false);
      setError("No se encontró la postulación seleccionada.");
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminPostulation(idProfile, idPostulation);
        const p    = data?.postulation ?? postulation;

        const editable = {
          id_cv:  p.id_cv  ?? null,
          reason: p.reason ?? "",
          state:  p.state  ?? "in_verification",
        };

        setFormData(editable);
        setOriginalData(editable);
        setCreatedAt(p.created_at);
        setUpdatedAt(p.updated_at);
        // CVs del perfil que devuelve el backend en catalogs.cvs
        setCvOptions(data?.catalogs?.cvs ?? []);
      } catch (err) {
        console.error("[ModalPostulacion] Error al cargar:", err);
        setError("No se pudieron cargar los datos de la postulación.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, idPostulation]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handler genérico de campos ── */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ── Resumen de cambios para EdicionConfirmModal ── */
  const buildResumen = () => {
    if (!originalData) return [];

    return Object.entries(formData).reduce((acc, [field, current]) => {
      const original = (originalData[field] ?? "").toString().trim();
      const now      = (current            ?? "").toString().trim();
      if (original !== now) {
        let displayValue = now || "—";

        if (field === "state") {
          displayValue = STATE_OPTIONS.find((o) => o.value === now)?.label ?? now;
        }
        if (field === "id_cv") {
          const cv = cvOptions.find((c) => String(c.value) === String(now));
          displayValue = cv ? cv.label : (now || "Sin CV");
        }

        acc.push({ label: FIELD_LABELS[field] ?? field, value: displayValue });
      }
      return acc;
    }, []);
  };

  const handleSaveClick = () => {
    setConfirmError("");
    setShowConfirm(true);
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        id_cv:  formData.id_cv ? Number(formData.id_cv) : null,
        reason: formData.reason,
        state:  formData.state,
      };

      const updated = await updateAdminPostulation(idProfile, idPostulation, payload);
      onSave?.(updated);
      setShowConfirm(false);
      onClose?.();
    } catch (err) {
      console.error("[ModalPostulacion] Error al guardar:", err);
      setConfirmError(err?.message || "No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentStateLabel =
    STATE_OPTIONS.find((o) => o.value === formData.state)?.label ?? formData.state;

  /* ══════════════════════════════════ RENDER ══════════════════════════════════ */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--postulacion">

            {/* ════ HEADER ════ */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <SendHorizonal size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar Postulación</h2>
                  <p className="edicion-modal__subtitle">
                    Modificar datos de la postulación
                  </p>
                </div>
              </div>
              <button
                className="edicion-modal__close"
                onClick={onClose}
                disabled={isSaving}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {/* ════ BODY ════ */}
            <div className="edicion-modal__body">

              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>Cargando datos de la postulación…</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* ── Fechas de solo lectura ── */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Calendar
                          size={11}
                          style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                        />
                        Fecha de postulación
                      </label>
                      <div className="edicion-modal__input" style={READONLY_STYLE}>
                        {formatDate(createdAt)}
                      </div>
                    </div>

                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <RefreshCw
                          size={11}
                          style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                        />
                        Última actualización
                      </label>
                      <div className="edicion-modal__input" style={READONLY_STYLE}>
                        {formatDate(updatedAt)}
                      </div>
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* ── CV del postulante (combobox) ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <FileText
                        size={11}
                        style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                      />
                      {FIELD_LABELS.id_cv}
                    </label>
                    <select
                      className="edicion-modal__input"
                      value={formData.id_cv ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "id_cv",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    >
                      <option value="">— Sin CV seleccionado —</option>
                      {cvOptions.map((cv) => (
                        <option key={cv.value} value={cv.value}>
                          {cv.label}
                        </option>
                      ))}
                    </select>
                    {cvOptions.length === 0 && (
                      <span className="edicion-modal__char-count" style={{ color: "#f59e0b" }}>
                        Este perfil no tiene CVs registrados.
                      </span>
                    )}
                  </div>

                  {/* ── Estado ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {FIELD_LABELS.state}{" "}
                      <span className="edicion-modal__required">*</span>
                    </label>
                    <select
                      className="edicion-modal__input"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                    >
                      {STATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ── Motivo / Carta de presentación ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {FIELD_LABELS.reason}
                    </label>
                    <textarea
                      className="edicion-modal__textarea"
                      value={formData.reason}
                      onChange={(e) => handleChange("reason", e.target.value)}
                      placeholder="Motivo o carta de presentación del postulante…"
                      rows={5}
                      maxLength={255}
                    />
                    <span className="edicion-modal__char-count">
                      {formData.reason?.length ?? 0} / 255
                    </span>
                  </div>

                </div>
              )}
            </div>

            {/* ════ FOOTER ════ */}
            <div className="edicion-modal__footer">
              <button
                className="edicion-modal__btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                <X size={13} />
                Cerrar
              </button>
              <button
                className="edicion-modal__btn-save"
                onClick={handleSaveClick}
                disabled={isSaving || isLoading || !!error}
              >
                <Save size={13} />
                Guardar
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ════ MODAL DE CONFIRMACIÓN ════ */}
      <EdicionConfirmModal
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Postulación"
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}