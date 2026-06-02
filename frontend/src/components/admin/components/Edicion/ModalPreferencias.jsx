// src/components/admin/components/Edicion/ModalPreferencias.jsx

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Save, Settings2, Loader2, Eye, EyeOff } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminPreference,
  updateAdminPreference,
} from "../../../../services/adminProfileTableService";

export default function ModalPreferencias({ idProfile, preference, onClose, onSave }) {
  const { t } = useTranslation();
  const e = "adminEdicion.preferencias";

  const TYPE_OPTIONS = [
    { value: "privacy",         label: t(`${e}.types.privacy`)         },
    { value: "personalization", label: t(`${e}.types.personalization`) },
  ];

  const COLOR_OPTIONS = [
    { value: "default",  label: t(`${e}.colors.default`),   hex: "#64748b" },
    { value: "blue",     label: t(`${e}.colors.blue`),      hex: "#3b82f6" },
    { value: "sky blue", label: t(`${e}.colors.sky blue`),  hex: "#38bdf8" },
    { value: "cyan",     label: t(`${e}.colors.cyan`),      hex: "#06b6d4" },
    { value: "green",    label: t(`${e}.colors.green`),     hex: "#22c55e" },
    { value: "yellow",   label: t(`${e}.colors.yellow`),    hex: "#eab308" },
    { value: "orange",   label: t(`${e}.colors.orange`),    hex: "#f97316" },
    { value: "red",      label: t(`${e}.colors.red`),       hex: "#ef4444" },
    { value: "pink",     label: t(`${e}.colors.pink`),      hex: "#ec4899" },
    { value: "purple",   label: t(`${e}.colors.purple`),    hex: "#a855f7" },
    { value: "coffee",   label: t(`${e}.colors.coffee`),    hex: "#92400e" },
    { value: "black",    label: t(`${e}.colors.black`),     hex: "#0f172a" },
  ];

  const FIELD_LABELS = {
    description: t(`${e}.fields.description`),
    type:        t(`${e}.fields.type`),
    visibility:  t(`${e}.fields.visibility`),
    color:       t(`${e}.fields.color`),
  };

  const [formData, setFormData] = useState({
    description: "", type: "privacy", visibility: true, color: "default",
  });
  const [originalData, setOriginalData] = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState(null);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const idPreference = preference?.id_preference;

  useEffect(() => {
    if (!idProfile || !idPreference) {
      setIsLoading(false); setError(t(`${e}.errorLoad`)); return;
    }
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const data = await getAdminPreference(idProfile, idPreference);
        const p    = data?.preference ?? preference;
        const editable = {
          description: p.description ?? "", type: p.type ?? "privacy",
          visibility: p.visibility ?? true, color: p.color ?? "default",
        };
        setFormData(editable); setOriginalData(editable);
      } catch (err) {
        setError(t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, idPreference]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const buildResumen = () => {
    if (!originalData) return [];
    return Object.entries(formData).reduce((acc, [field, current]) => {
      const toStr   = (v) => (v === null || v === undefined ? "" : String(v)).trim();
      const original = toStr(originalData[field]);
      const now      = toStr(current);
      if (original !== now) {
        let displayValue = now || "—";
        if (field === "type")       displayValue = TYPE_OPTIONS.find((o) => o.value === now)?.label  ?? now;
        if (field === "color")      displayValue = COLOR_OPTIONS.find((o) => o.value === now)?.label ?? now;
        if (field === "visibility") displayValue = current
          ? t("adminEdicion.common.visible")
          : t("adminEdicion.common.hidden");
        acc.push({ label: FIELD_LABELS[field] ?? field, value: displayValue });
      }
      return acc;
    }, []);
  };

  const handleSaveClick = () => { setConfirmError(""); setShowConfirm(true); };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const payload = {
        description: formData.description, type: formData.type,
        visibility: formData.visibility,   color: formData.color,
      };
      const updated = await updateAdminPreference(idProfile, idPreference, payload);
      onSave?.(updated); setShowConfirm(false); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally {
      setIsSaving(false);
    }
  };

  const activeColor = COLOR_OPTIONS.find((c) => c.value === formData.color);

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal edicion-modal--preferencias">

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Settings2 size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">
                    {preference?.description
                      ? preference.description.slice(0, 40) + (preference.description.length > 40 ? "…" : "")
                      : t(`${e}.subtitleFallback`)}
                  </p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t("adminEdicion.common.close")}>
                <X size={16} />
              </button>
            </div>

            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${e}.loadingMsg`)}</span>
                </div>
              )}
              {error && !isLoading && <div className="edicion-modal__error">{error}</div>}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{FIELD_LABELS.description}</label>
                    <textarea className="edicion-modal__textarea edicion-modal__textarea--readonly"
                      value={formData.description} readOnly
                      placeholder={t(`${e}.descriptionPh`)} rows={3} maxLength={255} />
                    <span className="edicion-modal__char-count">
                      {formData.description?.length ?? 0} / 255
                    </span>
                  </div>

                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        {FIELD_LABELS.type} <span className="edicion-modal__required">*</span>
                      </label>
                      <select className="edicion-modal__input" value={formData.type}
                        onChange={(ev) => handleChange("type", ev.target.value)}>
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{FIELD_LABELS.visibility}</label>
                      <label className="edicion-modal__check">
                        <input type="checkbox" checked={!!formData.visibility}
                          onChange={(ev) => handleChange("visibility", ev.target.checked)} />
                        {formData.visibility
                          ? <><Eye size={13} /> {t("adminEdicion.common.visible")}</>
                          : <><EyeOff size={13} /> {t("adminEdicion.common.hidden")}</>}
                      </label>
                      <span className="edicion-modal__char-count" style={{ marginTop: 2 }}>
                        {formData.visibility ? t(`${e}.visibleHint`) : t(`${e}.hiddenHint`)}
                      </span>
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {FIELD_LABELS.color} <span className="edicion-modal__required">*</span>
                    </label>
                    <div className="modal-color-grid">
                      {COLOR_OPTIONS.map((c) => {
                        const isActive = formData.color === c.value;
                        return (
                          <button key={c.value} type="button" title={c.label}
                            onClick={() => handleChange("color", c.value)}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center",
                              gap: "4px", padding: "6px 4px", borderRadius: "8px",
                              border: isActive ? `2px solid ${c.hex}` : "2px solid transparent",
                              background: isActive ? `${c.hex}18` : "transparent",
                              cursor: "pointer", transition: "all 0.15s", outline: "none",
                            }}>
                            <span style={{
                              display: "block", width: "24px", height: "24px", borderRadius: "50%",
                              background: c.hex,
                              boxShadow: isActive
                                ? `0 0 0 3px white, 0 0 0 5px ${c.hex}`
                                : "0 1px 3px rgba(0,0,0,0.18)",
                              transition: "box-shadow 0.15s",
                            }} />
                            <span style={{
                              fontSize: "9.5px", color: isActive ? c.hex : "#94a3b8",
                              fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
                              transition: "color 0.15s",
                            }}>
                              {c.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {activeColor && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "8px", marginTop: "6px",
                        fontSize: "12px", color: "#64748b", fontWeight: 500,
                      }}>
                        <span style={{
                          display: "inline-block", width: "14px", height: "14px",
                          borderRadius: "50%", background: activeColor.hex,
                          flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                        {t(`${e}.colorSelected`)}{" "}
                        <strong style={{ color: activeColor.hex }}>{activeColor.label}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t("adminEdicion.common.close")}
              </button>
              <button className="edicion-modal__btn-save" onClick={handleSaveClick}
                disabled={isSaving || isLoading || !!error}>
                <Save size={13} /> {t("adminEdicion.common.save")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm} isBusy={isSaving}
        entidad={t(`${e}.confirmEntity`)} accion="actualizar"
        resumen={buildResumen()} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}