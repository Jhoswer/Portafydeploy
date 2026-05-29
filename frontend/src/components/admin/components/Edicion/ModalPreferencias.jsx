// src/components/admin/components/Edicion/ModalPreferencias.jsx

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Settings2, Loader2, Eye, EyeOff } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminPreference,
  updateAdminPreference,
} from "../../../../services/adminProfileTableService";

/* ── Opciones de type (CHECK constraint) ── */
const TYPE_OPTIONS = [
  { value: "privacy", label: "Privacidad" },
  { value: "personalization", label: "Personalización" },
];

/* ── Opciones de color (CHECK constraint) con hex para el swatch ── */
const COLOR_OPTIONS = [
  { value: "default", label: "Por defecto", hex: "#64748b" },
  { value: "blue", label: "Azul", hex: "#3b82f6" },
  { value: "sky blue", label: "Azul cielo", hex: "#38bdf8" },
  { value: "cyan", label: "Cian", hex: "#06b6d4" },
  { value: "green", label: "Verde", hex: "#22c55e" },
  { value: "yellow", label: "Amarillo", hex: "#eab308" },
  { value: "orange", label: "Naranja", hex: "#f97316" },
  { value: "red", label: "Rojo", hex: "#ef4444" },
  { value: "pink", label: "Rosa", hex: "#ec4899" },
  { value: "purple", label: "Morado", hex: "#a855f7" },
  { value: "coffee", label: "Café", hex: "#92400e" },
  { value: "black", label: "Negro", hex: "#0f172a" },
];

const FIELD_LABELS = {
  description: "Descripción",
  type: "Tipo",
  visibility: "Visibilidad",
  color: "Color",
};

export default function ModalPreferencias({ idProfile, preference, onClose, onSave }) {
  const [formData, setFormData] = useState({
    description: "",
    type: "privacy",
    visibility: true,
    color: "default",
  });
  const [originalData, setOriginalData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const idPreference = preference?.id_preference;

  /* ── Cargar datos desde el backend ── */
  useEffect(() => {
    if (!idProfile || !idPreference) {
      setIsLoading(false);
      setError("No se encontró la preferencia seleccionada.");
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminPreference(idProfile, idPreference);
        const p = data?.preference ?? preference;

        const editable = {
          description: p.description ?? "",
          type: p.type ?? "privacy",
          visibility: p.visibility ?? true,
          color: p.color ?? "default",
        };
        setFormData(editable);
        setOriginalData(editable);
      } catch (err) {
        console.error("[ModalPreferencias] Error al cargar:", err);
        setError("No se pudieron cargar los datos de la preferencia.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, idPreference]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ── Resumen de cambios ── */
  const buildResumen = () => {
    if (!originalData) return [];

    return Object.entries(formData).reduce((acc, [field, current]) => {
      const toStr = (v) => (v === null || v === undefined ? "" : String(v)).trim();
      const original = toStr(originalData[field]);
      const now = toStr(current);

      if (original !== now) {
        let displayValue = now || "—";

        if (field === "type") {
          displayValue = TYPE_OPTIONS.find((o) => o.value === now)?.label ?? now;
        }
        if (field === "color") {
          displayValue = COLOR_OPTIONS.find((o) => o.value === now)?.label ?? now;
        }
        if (field === "visibility") {
          displayValue = current ? "Visible" : "Oculto";
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
        description: formData.description,
        type: formData.type,
        visibility: formData.visibility,
        color: formData.color,
      };

      const updated = await updateAdminPreference(idProfile, idPreference, payload);
      onSave?.(updated);
      setShowConfirm(false);
      onClose?.();
    } catch (err) {
      console.error("[ModalPreferencias] Error al guardar:", err);
      setConfirmError(err?.message || "No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  /* Color activo para el swatch preview */
  const activeColor = COLOR_OPTIONS.find((c) => c.value === formData.color);

  /* ══════════════════════════════════ RENDER ══════════════════════════════════ */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--preferencias">

            {/* ════ HEADER ════ */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Settings2 size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar Preferencia</h2>
                  <p className="edicion-modal__subtitle">
                    {preference?.description
                      ? preference.description.slice(0, 40) + (preference.description.length > 40 ? "…" : "")
                      : "Modificar preferencia del usuario"}
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
                  <span>Cargando preferencia…</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* ── Descripción ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {FIELD_LABELS.description}
                    </label>
                    <textarea
                      className="edicion-modal__textarea edicion-modal__textarea--readonly"
                      value={formData.description}
                      readOnly
                      placeholder="Descripción de la preferencia…"
                      rows={3}
                      maxLength={255}
                    />
                    <span className="edicion-modal__char-count">
                      {formData.description?.length ?? 0} / 255
                    </span>
                  </div>

                  {/* ── Tipo y Visibilidad en la misma fila ── */}
                  <div className="edicion-modal__row">

                    {/* Tipo */}
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        {FIELD_LABELS.type}{" "}
                        <span className="edicion-modal__required">*</span>
                      </label>
                      <select
                        className="edicion-modal__input"
                        value={formData.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                      >
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Visibilidad */}
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        {FIELD_LABELS.visibility}
                      </label>
                      {/* Toggle visual usando el estilo pill del CSS existente */}
                      <label className="edicion-modal__check">
                        <input
                          type="checkbox"
                          checked={!!formData.visibility}
                          onChange={(e) => handleChange("visibility", e.target.checked)}
                        />
                        {formData.visibility ? (
                          <>
                            <Eye size={13} />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} />
                            Oculto
                          </>
                        )}
                      </label>
                      <span className="edicion-modal__char-count" style={{ marginTop: 2 }}>
                        {formData.visibility
                          ? "Esta preferencia es visible para el usuario."
                          : "Esta preferencia está oculta."}
                      </span>
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* ── Color (selector visual) ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {FIELD_LABELS.color}{" "}
                      <span className="edicion-modal__required">*</span>
                    </label>

                    {/* Grid de swatches de color */}
                    <div className="modal-color-grid">
                      {COLOR_OPTIONS.map((c) => {
                        const isActive = formData.color === c.value;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            title={c.label}
                            onClick={() => handleChange("color", c.value)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 4px",
                              borderRadius: "8px",
                              border: isActive ? `2px solid ${c.hex}` : "2px solid transparent",
                              background: isActive ? `${c.hex}18` : "transparent",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              outline: "none",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background: c.hex,
                                boxShadow: isActive
                                  ? `0 0 0 3px white, 0 0 0 5px ${c.hex}`
                                  : "0 1px 3px rgba(0,0,0,0.18)",
                                transition: "box-shadow 0.15s",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "9.5px",
                                color: isActive ? c.hex : "#94a3b8",
                                fontWeight: isActive ? 700 : 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                                transition: "color 0.15s",
                              }}
                            >
                              {c.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Preview del color seleccionado */}
                    {activeColor && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: activeColor.hex,
                            flexShrink: 0,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        />
                        Color seleccionado:{" "}
                        <strong style={{ color: activeColor.hex }}>
                          {activeColor.label}
                        </strong>
                      </div>
                    )}
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
        entidad="Preferencia"
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}