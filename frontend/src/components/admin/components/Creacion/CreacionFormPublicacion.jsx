// src/components/admin/components/Creacion/CreacionFormPublicacion.jsx
// Formulario de creación de publicación — POST /admin/profile/{profile}/publications

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Newspaper, Plus, X } from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import {
  crearPublicacion,
  getCatalogosPublicacion,
} from "../../../../services/adminCreacionService";

/* ── Constantes ───────────────────────────────────────────────── */
const STATE_OPTIONS = [
  { value: "incomplete", label: "Incompleta" },
  { value: "published", label: "Publicada" },
  { value: "removed", label: "Eliminada" },
];

const DETAIL_FIELDS = [
  { key: "id_offer", label: "Oferta asociada", catalogKey: "offers" },
  { key: "id_project", label: "Proyecto asociado", catalogKey: "projects" },
  { key: "id_cv", label: "CV asociado", catalogKey: "cvs" },
  { key: "id_experience", label: "Experiencia asociada", catalogKey: "experiences" },
];

const EXCLUSIVE_KEYS = DETAIL_FIELDS.map((f) => f.key);

const EMPTY_FORM = {
  description: "",
  outstanding: false,
  visibility: true,
  state: "incomplete",
  id_audience_type: "",
};

const EMPTY_DETAIL = {
  id_offer: "",
  id_project: "",
  id_cv: "",
  id_experience: "",
};

function labelFor(catalog = [], id) {
  if (!id) return null;
  return catalog.find((c) => String(c.value) === String(id))?.label ?? `ID ${id}`;
}

function buildResumen(form, detail, catalogs) {
  const entries = [];
  if (form.description) entries.push({ label: "Descripción", value: form.description });
  entries.push({ label: "Destacada", value: form.outstanding ? "Sí" : "No" });
  entries.push({ label: "Visible", value: form.visibility ? "Sí" : "No" });
  entries.push({ label: "Estado", value: STATE_OPTIONS.find((o) => o.value === form.state)?.label ?? form.state });

  if (form.id_audience_type) {
    const aud = labelFor(catalogs?.audience_types ?? [], form.id_audience_type);
    if (aud) entries.push({ label: "Tipo de audiencia", value: aud });
  }

  DETAIL_FIELDS.forEach(({ key, label, catalogKey }) => {
    if (detail[key]) {
      const val = labelFor(catalogs?.[catalogKey] ?? [], detail[key]);
      if (val) entries.push({ label, value: val });
    }
  });

  return entries;
}

/* ════════════════════════════════════════════════════════════════
   COMPONENTE
════════════════════════════════════════════════════════════════ */
export default function CreacionFormPublicacion({ idProfile, onClose, onSaved }) {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [detail, setDetail] = useState({ ...EMPTY_DETAIL });
  const [catalogs, setCatalogs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getCatalogosPublicacion(idProfile);
        setCatalogs(data);
      } catch {
        setError("No se pudieron cargar los catálogos de la publicación.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile]);

  const handleFieldChange = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleDetailChange = (field, value) => {
    setDetail((prev) => {
      const next = { ...prev, [field]: value };
      // Excluyentes: al seleccionar uno, limpiar los demás
      if (value && EXCLUSIVE_KEYS.includes(field)) {
        EXCLUSIVE_KEYS.forEach((k) => { if (k !== field) next[k] = ""; });
      }
      return next;
    });
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        description: formData.description || null,
        outstanding: formData.outstanding,
        visibility: formData.visibility,
        state: formData.state,
        id_audience_type: formData.id_audience_type ? Number(formData.id_audience_type) : null,
        detail: {
          id_offer: detail.id_offer ? Number(detail.id_offer) : null,
          id_project: detail.id_project ? Number(detail.id_project) : null,
          id_cv: detail.id_cv ? Number(detail.id_cv) : null,
          id_experience: detail.id_experience ? Number(detail.id_experience) : null,
        },
      };

      const data = await crearPublicacion(idProfile, payload);
      setShowConfirm(false);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("[CreacionFormPublicacion] Error al crear:", err);
      setConfirmError(err?.message || "No se pudo crear la publicación.");
    } finally {
      setIsSaving(false);
    }
  };

  const audienceTypes = catalogs?.audience_types ?? [];

  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal" style={{ maxWidth: 640 }}>

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Newspaper size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Nueva Publicación</h2>
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

                  {/* Checkboxes */}
                  <div className="edicion-modal__row">
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.outstanding}
                        onChange={(e) => handleFieldChange("outstanding", e.target.checked)} />
                      Destacada
                    </label>
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.visibility}
                        onChange={(e) => handleFieldChange("visibility", e.target.checked)} />
                      Visible
                    </label>
                  </div>

                  {/* Descripción */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Descripción</label>
                    <textarea className="edicion-modal__textarea"
                      value={formData.description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      rows={3} maxLength={255} placeholder="Descripción de la publicación…" />
                    <span className="edicion-modal__char-count">
                      {formData.description?.length ?? 0} / 255
                    </span>
                  </div>

                  {/* Estado */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Estado</label>
                    <select className="edicion-modal__input" value={formData.state}
                      onChange={(e) => handleFieldChange("state", e.target.value)}>
                      {STATE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de audiencia */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Alcance</label>
                    <select className="edicion-modal__input" value={formData.id_audience_type}
                      onChange={(e) => handleFieldChange("id_audience_type", e.target.value)}>
                      <option value="">Sin tipo</option>
                      {audienceTypes.map((a) => (
                        <option key={a.value} value={String(a.value)}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* Detalle — excluyentes */}
                  <div className="edicion-cv-section">
                    <div className="edicion-cv-section__header">
                      <Newspaper size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">Detalle de publicación</h3>
                    </div>
                    <p className="edicion-modal__note" style={{ marginBottom: 4 }}>
                      Solo puede asociarse <strong>un motivo</strong> por publicación.
                    </p>
                    <div className="edicion-modal__fields" style={{ gap: 10 }}>
                      {DETAIL_FIELDS.map(({ key, label, catalogKey }) => {
                        const isActive = Boolean(detail[key]);
                        const otherHasVal = EXCLUSIVE_KEYS.some((k) => k !== key && Boolean(detail[k]));
                        const opts = catalogs?.[catalogKey] ?? [];
                        return (
                          <div className="edicion-modal__field" key={key}>
                            <label className="edicion-modal__label"
                              style={isActive ? { color: "#2563eb" } : undefined}>
                              {label}
                              {isActive && (
                                <span className="edicion-tabla__badge edicion-tabla__badge--state-public"
                                  style={{ marginLeft: 6, verticalAlign: "middle" }}>
                                  Activo
                                </span>
                              )}
                            </label>
                            <select className="edicion-modal__input"
                              value={detail[key]}
                              onChange={(e) => handleDetailChange(key, e.target.value)}
                              disabled={otherHasVal && !isActive}
                              style={
                                otherHasVal && !isActive ? { opacity: 0.4, cursor: "not-allowed" }
                                  : isActive ? { borderColor: "#60a5fa", background: "#eff6ff" }
                                    : undefined
                              }>
                              <option value="">Ninguno</option>
                              {opts.map((item) => (
                                <option key={item.value} value={String(item.value)}>{item.label}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> Cerrar
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || Boolean(error)}>
                <Plus size={13} /> Crear Publicación
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Publicación"
        resumen={buildResumen(formData, detail, catalogs)}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}