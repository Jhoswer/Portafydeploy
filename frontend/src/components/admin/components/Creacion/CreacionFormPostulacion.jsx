// src/components/admin/components/Creacion/CreacionFormPostulacion.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Plus, SendHorizonal, X } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearPostulacion, getCatalogosPostulacion } from "../../../../services/adminCreacionService";

const EMPTY_FORM = {
  id_offer: "",
  id_cv:    "",
  state:    "in_verification",
  reason:   "",
};

export default function CreacionFormPostulacion({ idProfile, onClose, onSaved }) {
  const { t } = useTranslation();
  const p = "adminCreacion.postulacion";

  const STATE_OPTIONS = [
    { value: "in_verification", label: t(`${p}.states.in_verification`) },
    { value: "accepted",        label: t(`${p}.states.accepted`)        },
    { value: "refused",         label: t(`${p}.states.refused`)         },
  ];

  function buildResumen(form, catalogs) {
    const entries = [];
    if (form.id_offer) {
      const offer = catalogs?.offers?.find((o) => String(o.value) === String(form.id_offer));
      entries.push({ label: t(`${p}.resumen.offer`), value: offer?.label ?? `ID ${form.id_offer}` });
    }
    if (form.id_cv) {
      const cv = catalogs?.cvs?.find((c) => String(c.value) === String(form.id_cv));
      entries.push({ label: t(`${p}.resumen.cv`), value: cv?.label ?? `ID ${form.id_cv}` });
    }
    const stateLabel = STATE_OPTIONS.find((s) => s.value === form.state)?.label ?? form.state;
    entries.push({ label: t(`${p}.resumen.state`), value: stateLabel });
    if (form.reason) entries.push({ label: t(`${p}.resumen.reason`), value: form.reason });
    return entries;
  }

  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [catalogs,     setCatalogs]     = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getCatalogosPostulacion(idProfile);
        setCatalogs(data);
      } catch {
        setError(t(`${p}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleConfirmedSave = async () => {
    if (!formData.id_offer) { setConfirmError(t(`${p}.errorRequired`)); return; }
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        id_offer: Number(formData.id_offer),
        id_cv:    formData.id_cv ? Number(formData.id_cv) : null,
        state:    formData.state,
        reason:   formData.reason || null,
      };
      const data = await crearPostulacion(idProfile, payload);
      setShowConfirm(false);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("[CreacionFormPostulacion] Error al crear:", err);
      setConfirmError(err?.message || t(`${p}.errorCreate`));
    } finally {
      setIsSaving(false);
    }
  };

  const offerOptions = catalogs?.offers ?? [];
  const cvOptions    = catalogs?.cvs    ?? [];

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal edicion-modal--postulacion">

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <SendHorizonal size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${p}.headerTitle`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${p}.headerSubtitle`)}{idProfile}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t(`${p}.closeLabel`)}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              {isLoading ? (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${p}.loading`)}</span>
                </div>
              ) : (
                <div className="edicion-modal__fields">
                  {error && <div className="edicion-modal__error">{error}</div>}

                  <hr className="edicion-modal__divider" />

                  {/* Oferta */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {t(`${p}.fieldOffer`)} <span className="edicion-modal__required">*</span>
                    </label>
                    <select className="edicion-modal__input" value={formData.id_offer}
                      onChange={(e) => handleChange("id_offer", e.target.value)}>
                      <option value="">{t(`${p}.offerPh`)}</option>
                      {offerOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {offerOptions.length === 0 && (
                      <span className="edicion-modal__char-count" style={{ color: "#f59e0b" }}>
                        {t(`${p}.offerEmpty`)}
                      </span>
                    )}
                  </div>

                  {/* CV */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <FileText size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${p}.fieldCv`)}
                    </label>
                    <select className="edicion-modal__input" value={formData.id_cv}
                      onChange={(e) => handleChange("id_cv", e.target.value)}>
                      <option value="">{t(`${p}.cvPh`)}</option>
                      {cvOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    {cvOptions.length === 0 && (
                      <span className="edicion-modal__char-count" style={{ color: "#f59e0b" }}>
                        {t(`${p}.cvEmpty`)}
                      </span>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      {t(`${p}.fieldState`)} <span className="edicion-modal__required">*</span>
                    </label>
                    <select className="edicion-modal__input" value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}>
                      {STATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Motivo */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${p}.fieldReason`)}</label>
                    <textarea className="edicion-modal__textarea" value={formData.reason}
                      onChange={(e) => handleChange("reason", e.target.value)}
                      placeholder={t(`${p}.reasonPh`)} rows={5} maxLength={255} />
                    <span className="edicion-modal__char-count">
                      {formData.reason?.length ?? 0} / 255
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t(`${p}.btnClose`)}
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || !formData.id_offer}>
                <Plus size={13} /> {t(`${p}.btnCreate`)}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm} isBusy={isSaving} entidad="Postulación"
        resumen={buildResumen(formData, catalogs)} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave} />
    </>
  );
}