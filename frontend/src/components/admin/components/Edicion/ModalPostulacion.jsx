// src/components/admin/components/Edicion/ModalPostulacion.jsx

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Save, SendHorizonal, Loader2, FileText, Calendar, RefreshCw } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminPostulation,
  updateAdminPostulation,
} from "../../../../services/adminProfileTableService";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-BO", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ModalPostulacion({ idProfile, postulation, onClose, onSave }) {
  const { t } = useTranslation();
  const e = "adminEdicion.postulacion";

  const STATE_OPTIONS = [
    { value: "in_verification", label: t(`${e}.states.in_verification`) },
    { value: "accepted",        label: t(`${e}.states.accepted`)        },
    { value: "refused",         label: t(`${e}.states.refused`)         },
  ];

  const FIELD_LABELS = {
    id_cv:  t(`${e}.fields.id_cv`),
    reason: t(`${e}.fields.reason`),
    state:  t(`${e}.fields.state`),
  };

  const [formData, setFormData] = useState({
    id_cv: null, reason: "", state: "in_verification",
  });
  const [originalData, setOriginalData] = useState(null);
  const [createdAt,    setCreatedAt]    = useState(null);
  const [updatedAt,    setUpdatedAt]    = useState(null);
  const [cvOptions,    setCvOptions]    = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState(null);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const idPostulation = postulation?.id_postulation;

  useEffect(() => {
    if (!idProfile || !idPostulation) {
      setIsLoading(false);
      setError(t(`${e}.errorLoad`));
      return;
    }
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const data = await getAdminPostulation(idProfile, idPostulation);
        const p    = data?.postulation ?? postulation;
        const editable = {
          id_cv: p.id_cv ?? null, reason: p.reason ?? "", state: p.state ?? "in_verification",
        };
        setFormData(editable); setOriginalData(editable);
        setCreatedAt(p.created_at); setUpdatedAt(p.updated_at);
        setCvOptions(data?.catalogs?.cvs ?? []);
      } catch (err) {
        setError(t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, idPostulation]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const buildResumen = () => {
    if (!originalData) return [];
    return Object.entries(formData).reduce((acc, [field, current]) => {
      const original = (originalData[field] ?? "").toString().trim();
      const now      = (current ?? "").toString().trim();
      if (original !== now) {
        let displayValue = now || "—";
        if (field === "state")
          displayValue = STATE_OPTIONS.find((o) => o.value === now)?.label ?? now;
        if (field === "id_cv") {
          const cv = cvOptions.find((c) => String(c.value) === String(now));
          displayValue = cv ? cv.label : (now || t(`${e}.cvPh`));
        }
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
        id_cv:  formData.id_cv ? Number(formData.id_cv) : null,
        reason: formData.reason,
        state:  formData.state,
      };
      const updated = await updateAdminPostulation(idProfile, idPostulation, payload);
      onSave?.(updated); setShowConfirm(false); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal edicion-modal--postulacion">

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <SendHorizonal size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${e}.subtitle`)}</p>
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
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Calendar size={11}
                          style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                        {t(`${e}.dateLabel`)}
                      </label>
                      <div className="edicion-modal__input edicion-modal__input--readonly">
                        {formatDate(createdAt)}
                      </div>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <RefreshCw size={11}
                          style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                        {t(`${e}.updatedLabel`)}
                      </label>
                      <div className="edicion-modal__input edicion-modal__input--readonly">
                        {formatDate(updatedAt)}
                      </div>
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <FileText size={11}
                        style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                      {FIELD_LABELS.id_cv}
                    </label>
                    <select className="edicion-modal__input"
                      value={formData.id_cv ?? ""}
                      onChange={(ev) =>
                        handleChange("id_cv", ev.target.value ? Number(ev.target.value) : null)
                      }>
                      <option value="">{t(`${e}.cvPh`)}</option>
                      {cvOptions.map((cv) => (
                        <option key={cv.value} value={cv.value}>{cv.label}</option>
                      ))}
                    </select>
                    {cvOptions.length === 0 && (
                      <span className="edicion-modal__char-count" style={{ color: "#f59e0b" }}>
                        {t(`${e}.cvEmpty`)}
                      </span>
                    )}
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {FIELD_LABELS.state}{" "}
                      <span className="edicion-modal__required">*</span>
                    </label>
                    <select className="edicion-modal__input" value={formData.state}
                      onChange={(ev) => handleChange("state", ev.target.value)}>
                      {STATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{FIELD_LABELS.reason}</label>
                    <textarea className="edicion-modal__textarea" value={formData.reason}
                      onChange={(ev) => handleChange("reason", ev.target.value)}
                      placeholder={t(`${e}.reasonPh`)} rows={5} maxLength={255} />
                    <span className="edicion-modal__char-count">
                      {formData.reason?.length ?? 0} / 255
                    </span>
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