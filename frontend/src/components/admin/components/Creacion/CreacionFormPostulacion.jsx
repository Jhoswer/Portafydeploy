// src/components/admin/components/Creacion/CreacionFormPostulacion.jsx
// Formulario de creación de postulación — POST /admin/profile/{profile}/postulations

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Loader2, Plus, SendHorizonal, X } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import {
  crearPostulacion,
  getCatalogosPostulacion,
} from "../../../../services/adminCreacionService";

const STATE_OPTIONS = [
  { value: "in_verification", label: "En verificación" },
  { value: "accepted",        label: "Aceptado"         },
  { value: "refused",         label: "Rechazado"        },
];

const EMPTY_FORM = {
  id_offer: "",
  id_cv:    "",
  state:    "in_verification",
  reason:   "",
};

function buildResumen(form, catalogs) {
  const entries = [];

  if (form.id_offer) {
    const o = catalogs?.offers?.find((o) => String(o.value) === String(form.id_offer));
    entries.push({ label: "Oferta", value: o?.label ?? `ID ${form.id_offer}` });
  }
  if (form.id_cv) {
    const c = catalogs?.cvs?.find((c) => String(c.value) === String(form.id_cv));
    entries.push({ label: "CV", value: c?.label ?? `ID ${form.id_cv}` });
  }
  const stateLabel = STATE_OPTIONS.find((s) => s.value === form.state)?.label ?? form.state;
  entries.push({ label: "Estado", value: stateLabel });
  if (form.reason) entries.push({ label: "Motivo", value: form.reason });
  return entries;
}

export default function CreacionFormPostulacion({ idProfile, onClose, onSaved }) {
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
        setError("No se pudieron cargar los catálogos de la postulación.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleConfirmedSave = async () => {
    if (!formData.id_offer) {
      setConfirmError("Debes seleccionar una oferta.");
      return;
    }
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
      setConfirmError(err?.message || "No se pudo crear la postulación.");
    } finally {
      setIsSaving(false);
    }
  };

  const offerOptions = catalogs?.offers ?? [];
  const cvOptions    = catalogs?.cvs    ?? [];

  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--postulacion">

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <SendHorizonal size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Nueva Postulación</h2>
                  <p className="edicion-modal__subtitle">Perfil #{idProfile}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose} disabled={isSaving} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              {isLoading ? (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>Cargando catálogos…</span>
                </div>
              ) : (
                <div className="edicion-modal__fields">
                  {error && <div className="edicion-modal__error">{error}</div>}

                  <hr className="edicion-modal__divider" />

                  {/* Oferta */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      Oferta <span className="edicion-modal__required">*</span>
                    </label>
                    <select
                      className="edicion-modal__input"
                      value={formData.id_offer}
                      onChange={(e) => handleChange("id_offer", e.target.value)}
                    >
                      <option value="">— Seleccionar oferta —</option>
                      {offerOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {offerOptions.length === 0 && (
                      <span className="edicion-modal__char-count" style={{ color: "#f59e0b" }}>
                        No hay ofertas disponibles.
                      </span>
                    )}
                  </div>

                  {/* CV */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <FileText size={11} style={{ display: "inline", marginRight: 4 }} />
                      CV del postulante
                    </label>
                    <select
                      className="edicion-modal__input"
                      value={formData.id_cv}
                      onChange={(e) => handleChange("id_cv", e.target.value)}
                    >
                      <option value="">— Sin CV seleccionado —</option>
                      {cvOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    {cvOptions.length === 0 && (
                      <span className="edicion-modal__char-count" style={{ color: "#f59e0b" }}>
                        Este perfil no tiene CVs registrados.
                      </span>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      Estado <span className="edicion-modal__required">*</span>
                    </label>
                    <select
                      className="edicion-modal__input"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                    >
                      {STATE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Motivo */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Motivo / Carta de presentación</label>
                    <textarea
                      className="edicion-modal__textarea"
                      value={formData.reason}
                      onChange={(e) => handleChange("reason", e.target.value)}
                      placeholder="Motivo o carta de presentación…"
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

            {/* Footer */}
            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> Cerrar
              </button>
              <button
                className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || !formData.id_offer}
              >
                <Plus size={13} /> Crear Postulación
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Postulación"
        resumen={buildResumen(formData, catalogs)}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}