// src/components/admin/components/Edicion/ModalPublicacion.jsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check, Loader2, Newspaper, Plus, Save, Trash2, X,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminPublication,
  updateAdminPublication,
} from "../../../../services/adminProfileTableService";

/* ── Helpers ─────────────────────────────────────────────────── */
function normalizeBool(value) {
  return value === true || value === 1 || value === "1";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function normalizePublication(pub = {}) {
  return {
    description:      pub.description      ?? "",
    outstanding:      normalizeBool(pub.outstanding),
    visibility:       normalizeBool(pub.visibility),
    state:            pub.state            ?? "incomplete",
    id_audience_type: pub.id_audience_type ? String(pub.id_audience_type) : "",
  };
}

function normalizeDetail(detail = {}) {
  return {
    id_publication_detail: detail?.id_publication_detail ?? null,
    /* id_publicized se preserva pero NO se muestra en el form */
    id_publicized: detail?.id_publicized ? String(detail.id_publicized) : "",
    id_offer:      detail?.id_offer      ? String(detail.id_offer)      : "",
    id_project:    detail?.id_project    ? String(detail.id_project)    : "",
    id_cv:         detail?.id_cv         ? String(detail.id_cv)         : "",
    id_experience: detail?.id_experience ? String(detail.id_experience) : "",
  };
}

function sameValue(a, b) {
  return String(a ?? "") === String(b ?? "");
}

function labelFor(catalog = [], id) {
  if (!id && id !== 0) return null;
  const found = catalog.find((c) => String(c.value) === String(id));
  return found?.label ?? found?.name ?? `ID ${id}`;
}

/* ── Constantes ──────────────────────────────────────────────── */
const STATE_OPTIONS = [
  { value: "incomplete", label: "Incompleta" },
  { value: "published",  label: "Publicada"  },
  { value: "removed",    label: "Eliminada"  },
];

const STATE_BADGE = {
  incomplete: { color: "#f59e0b", bg: "#fef3c722", border: "#f59e0b55", label: "Incompleta" },
  published:  { color: "#10b981", bg: "#d1fae522", border: "#10b98155", label: "Publicada"  },
  removed:    { color: "#ef4444", bg: "#fee2e222", border: "#ef444455", label: "Eliminada"  },
};

/**
 * Solo estos cuatro son editables y mutuamente excluyentes.
 * "Perfil publicado" (id_publicized) se omite del formulario.
 */
const DETAIL_FIELDS_EDITABLE = [
  { key: "id_offer",      label: "Oferta asociada",   catalogKey: "offers"      },
  { key: "id_project",    label: "Proyecto asociado", catalogKey: "projects"    },
  { key: "id_cv",         label: "CV asociado",       catalogKey: "cvs"         },
  { key: "id_experience", label: "Experiencia asoc.", catalogKey: "experiences" },
];

/** Claves mutualmente excluyentes entre sí */
const EXCLUSIVE_KEYS = DETAIL_FIELDS_EDITABLE.map((f) => f.key);

/* ── Componente ──────────────────────────────────────────────── */
export default function ModalPublicacion({
  idProfile,
  idPublication,
  onClose,
  onSaved,
}) {
  const [formData,     setFormData]     = useState(normalizePublication());
  const [detail,       setDetail]       = useState(normalizeDetail());
  const [audiences,    setAudiences]    = useState([]);
  const [catalogs,     setCatalogs]     = useState({});
  const [original,     setOriginal]     = useState(null);
  const [rawPub,       setRawPub]       = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  /* Audiencia – formulario de agregar */
  const [isAddingAud, setIsAddingAud] = useState(false);
  const [newArea,     setNewArea]     = useState("");
  const [newCareer,   setNewCareer]   = useState("");

  /* ── Carga ── */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getAdminPublication(idProfile, idPublication);
        const pub  = normalizePublication(data.publication);
        const det  = normalizeDetail(data.detail);
        const auds = (data.audiences ?? []).map((a) => ({ ...a, _delete: false, _new: false }));
        setFormData(pub);
        setDetail(det);
        setAudiences(auds);
        setCatalogs(data.catalogs ?? {});
        setRawPub(data.publication);
        setOriginal({ pub, det, auds: JSON.parse(JSON.stringify(auds)) });
      } catch (err) {
        console.error("[ModalPublicacion] Error al cargar:", err);
        setError(err?.message || "No se pudo cargar la publicación.");
      } finally {
        setIsLoading(false);
      }
    };
    if (idProfile && idPublication) load();
  }, [idProfile, idPublication]);

  /* ── Handlers generales ── */
  const handleFieldChange = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  /**
   * Al seleccionar un valor en cualquier campo del detalle,
   * se limpian los demás campos excluyentes.
   */
  const handleDetailChange = (field, value) => {
    setDetail((prev) => {
      const next = { ...prev, [field]: value };
      // Si se eligió un valor real, vaciar los demás campos exclusivos
      if (value && EXCLUSIVE_KEYS.includes(field)) {
        EXCLUSIVE_KEYS.forEach((k) => {
          if (k !== field) next[k] = "";
        });
      }
      return next;
    });
  };

  /* ── Audiencias ── */
  const handleAddAudience = () => {
    if (!newArea) return;
    setAudiences((prev) => [
      ...prev,
      {
        id: null,
        id_professional_area:   newArea,
        id_professional_career: newCareer || null,
        _delete: false,
        _new: true,
      },
    ]);
    setNewArea("");
    setNewCareer("");
    setIsAddingAud(false);
  };

  const handleRemoveAudience = (index) =>
    setAudiences((prev) =>
      prev.map((a, i) => (i === index ? { ...a, _delete: true } : a))
    );

  /* ── Resumen de cambios ── */
  const buildResumen = () => {
    if (!original) return [];
    const changes = [];

    const FIELD_LABELS = {
      description:      "Descripción",
      outstanding:      "Destacada",
      visibility:       "Visible",
      state:            "Estado",
      id_audience_type: "Tipo de audiencia",
    };
    Object.entries(FIELD_LABELS).forEach(([key, label]) => {
      if (!sameValue(original.pub[key], formData[key])) {
        let val = formData[key];
        if (typeof val === "boolean") val = val ? "Sí" : "No";
        if (key === "state") val = STATE_BADGE[val]?.label ?? val;
        if (key === "id_audience_type")
          val = labelFor(catalogs.audience_types ?? [], val) ?? val;
        changes.push({ label, value: String(val) });
      }
    });

    DETAIL_FIELDS_EDITABLE.forEach(({ key, label, catalogKey }) => {
      if (!sameValue(original.det[key], detail[key])) {
        const val = detail[key]
          ? labelFor(catalogs[catalogKey] ?? [], detail[key]) ?? `ID ${detail[key]}`
          : "Ninguno";
        changes.push({ label, value: val });
      }
    });

    const deleted = audiences.filter((a) => a._delete && !a._new);
    if (deleted.length > 0)
      changes.push({ label: "Audiencias eliminadas", value: `${deleted.length} registro(s)` });
    const added = audiences.filter((a) => a._new && !a._delete);
    if (added.length > 0)
      changes.push({ label: "Audiencias agregadas", value: `${added.length} registro(s)` });

    return changes;
  };

  /* ── Guardar ── */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        description:      formData.description,
        outstanding:      formData.outstanding,
        visibility:       formData.visibility,
        state:            formData.state,
        id_audience_type: formData.id_audience_type
          ? Number(formData.id_audience_type)
          : null,
        detail: {
          id_publication_detail: detail.id_publication_detail,
          /* id_publicized se envía tal cual, sin permitir edición */
          id_publicized:  detail.id_publicized  ? Number(detail.id_publicized)  : null,
          id_offer:       detail.id_offer        ? Number(detail.id_offer)       : null,
          id_project:     detail.id_project      ? Number(detail.id_project)     : null,
          id_cv:          detail.id_cv           ? Number(detail.id_cv)          : null,
          id_experience:  detail.id_experience   ? Number(detail.id_experience)  : null,
        },
        audiences: audiences.map((a) => ({
          id:                     a.id ?? null,
          id_professional_area:   a.id_professional_area   ? Number(a.id_professional_area)   : null,
          id_professional_career: a.id_professional_career ? Number(a.id_professional_career) : null,
          _delete:                Boolean(a._delete),
        })),
      };

      const data = await updateAdminPublication(idProfile, idPublication, payload);
      const pub  = normalizePublication(data.publication);
      const det  = normalizeDetail(data.detail);
      const auds = (data.audiences ?? []).map((a) => ({ ...a, _delete: false, _new: false }));
      setFormData(pub);
      setDetail(det);
      setAudiences(auds);
      setCatalogs(data.catalogs ?? catalogs);
      setRawPub(data.publication);
      setOriginal({ pub, det, auds: JSON.parse(JSON.stringify(auds)) });
      setShowConfirm(false);
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("[ModalPublicacion] Error al guardar:", err);
      setConfirmError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Derivados ── */
  const badge            = STATE_BADGE[formData.state];
  const visibleAudiences = audiences.filter((a) => !a._delete);

  /* ── Render ── */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal" style={{ maxWidth: 640 }}>

            {/* ════ HEADER ════ */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Newspaper size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar Publicación</h2>
                  <p className="edicion-modal__subtitle">Publicación #{idPublication}</p>
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
                  <span>Cargando publicación…</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* ── Checkboxes ── */}
                  <div className="edicion-modal__row">
                    <label className="edicion-modal__check">
                      <input
                        type="checkbox"
                        checked={formData.outstanding}
                        onChange={(e) => handleFieldChange("outstanding", e.target.checked)}
                      />
                      Destacada
                    </label>
                    <label className="edicion-modal__check">
                      <input
                        type="checkbox"
                        checked={formData.visibility}
                        onChange={(e) => handleFieldChange("visibility", e.target.checked)}
                      />
                      Visible
                    </label>
                  </div>

                  {/* ── Descripción ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Descripción</label>
                    <textarea
                      className="edicion-modal__textarea"
                      value={formData.description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      rows={3}
                      maxLength={255}
                    />
                    <span className="edicion-modal__char-count">
                      {formData.description?.length ?? 0} / 255
                    </span>
                  </div>

                  {/* ── Estado ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Estado</label>
                    <select
                      className="edicion-modal__input"
                      value={formData.state}
                      onChange={(e) => handleFieldChange("state", e.target.value)}
                    >
                      {STATE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* ── Tipo de audiencia ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Tipo de audiencia</label>
                    <select
                      className="edicion-modal__input"
                      value={formData.id_audience_type}
                      onChange={(e) => handleFieldChange("id_audience_type", e.target.value)}
                    >
                      <option value="">Sin tipo</option>
                      {(catalogs.audience_types ?? []).map((a) => (
                        <option key={a.value} value={String(a.value)}>
                          {a.name ?? a.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ── Fechas readonly ── */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field" style={{ flex: 1 }}>
                      <label className="edicion-modal__label">Creado</label>
                      <div
                        className="edicion-modal__input"
                        style={{ background: "#f1f5f9", cursor: "default", color: "#64748b" }}
                      >
                        {formatDate(rawPub?.created_at)}
                      </div>
                    </div>
                    <div className="edicion-modal__field" style={{ flex: 1 }}>
                      <label className="edicion-modal__label">Actualizado</label>
                      <div
                        className="edicion-modal__input"
                        style={{ background: "#f1f5f9", cursor: "default", color: "#64748b" }}
                      >
                        {formatDate(rawPub?.updated_at)}
                      </div>
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* ════ DETALLE DE PUBLICACIÓN ════
                      - id_publicized: oculto, se envía pero no se edita
                      - Los 4 campos restantes son mutuamente excluyentes:
                        seleccionar uno limpia los demás automáticamente.
                  ════════════════════════════════════════════════════════ */}
                  <div className="edicion-cv-section">
                    <div className="edicion-cv-section__header">
                      <Newspaper size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">Detalle de publicación</h3>
                    </div>

                    {/* Nota explicativa sobre exclusividad */}
                    <p className="edicion-modal__note" style={{ marginBottom: 4 }}>
                      Solo puede asociarse <strong>un motivo</strong> por publicación.
                    </p>

                    <div className="edicion-modal__fields" style={{ gap: 10 }}>
                      {DETAIL_FIELDS_EDITABLE.map(({ key, label, catalogKey }) => {
                        const isActive  = Boolean(detail[key]);
                        /* Un campo se deshabilita si otro ya tiene valor */
                        const otherHasValue = EXCLUSIVE_KEYS.some(
                          (k) => k !== key && Boolean(detail[k])
                        );

                        return (
                          <div className="edicion-modal__field" key={key}>
                            <label
                              className="edicion-modal__label"
                              style={isActive ? { color: "#2563eb" } : undefined}
                            >
                              {label}
                              {isActive && (
                                <span
                                  className="edicion-tabla__badge edicion-tabla__badge--state-public"
                                  style={{ marginLeft: 6, verticalAlign: "middle" }}
                                >
                                  Activo
                                </span>
                              )}
                            </label>
                            <select
                              className="edicion-modal__input"
                              value={detail[key]}
                              onChange={(e) => handleDetailChange(key, e.target.value)}
                              disabled={otherHasValue && !isActive}
                              style={
                                otherHasValue && !isActive
                                  ? { opacity: 0.4, cursor: "not-allowed" }
                                  : isActive
                                  ? { borderColor: "#60a5fa", background: "#eff6ff" }
                                  : undefined
                              }
                            >
                              <option value="">Ninguno</option>
                              {(catalogs[catalogKey] ?? []).map((item) => (
                                <option key={item.value} value={String(item.value)}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* ════ AUDIENCIA PROFESIONAL ════ */}
                  <div className="edicion-cv-section">
                    <div className="edicion-cv-section__header">
                      <Newspaper size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">Audiencia profesional</h3>
                      {visibleAudiences.length > 0 && (
                        <span className="edicion-tabla__count">{visibleAudiences.length}</span>
                      )}
                      <button
                        type="button"
                        className={`edicion-chip edicion-chip--sm${isAddingAud ? " edicion-chip--cancel" : ""}`}
                        style={{ marginLeft: "auto" }}
                        onClick={() => {
                          setIsAddingAud((v) => !v);
                          setNewArea("");
                          setNewCareer("");
                        }}
                      >
                        {isAddingAud ? <X size={12} /> : <Plus size={12} />}
                        {isAddingAud ? "Cancelar" : "Agregar"}
                      </button>
                    </div>

                    {/* Formulario para nueva audiencia — usa clases de modal, no de item */}
                    {isAddingAud && (
                      <div
                        style={{
                          display:       "flex",
                          flexDirection: "column",
                          gap:           8,
                          padding:       "10px 12px",
                          background:    "#f0f7ff",
                          border:        "1.5px dashed #93c5fd",
                          borderRadius:  8,
                        }}
                      >
                        <div className="edicion-modal__field">
                          <label className="edicion-modal__label">
                            Área profesional <span className="edicion-modal__required">*</span>
                          </label>
                          <select
                            className="edicion-modal__input"
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            autoFocus
                          >
                            <option value="">— Selecciona un área —</option>
                            {(catalogs.professional_areas ?? []).map((a) => (
                              <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="edicion-modal__field">
                          <label className="edicion-modal__label">
                            Carrera profesional
                            <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>
                              (opcional)
                            </span>
                          </label>
                          <select
                            className="edicion-modal__input"
                            value={newCareer}
                            onChange={(e) => setNewCareer(e.target.value)}
                          >
                            <option value="">— Sin carrera específica —</option>
                            {(catalogs.professional_careers ?? []).map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="edicion-modal__btn-save"
                            onClick={handleAddAudience}
                            disabled={!newArea}
                            style={{ padding: "7px 16px", fontSize: 12 }}
                          >
                            <Check size={13} /> Confirmar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lista de audiencias */}
                    <div className="edicion-cv-section__items">
                      {visibleAudiences.length === 0 && !isAddingAud && (
                        <span className="edicion-cv-section__empty">
                          Sin audiencia profesional definida
                        </span>
                      )}

                      {audiences.map((aud, i) => {
                        if (aud._delete) return null;
                        const areaLabel   = labelFor(catalogs.professional_areas ?? [], aud.id_professional_area);
                        const careerLabel = aud.id_professional_career
                          ? labelFor(catalogs.professional_careers ?? [], aud.id_professional_career)
                          : null;

                        return (
                          <div
                            key={aud.id ?? `new-aud-${i}`}
                            className="edicion-cv-item"
                          >
                            <span className="edicion-cv-item__id">
                              {areaLabel ?? `Área ${aud.id_professional_area}`}
                              {careerLabel && ` · ${careerLabel}`}
                            </span>
                            {aud._new && (
                              <span
                                style={{
                                  fontSize:     "9.5px",
                                  padding:      "1px 6px",
                                  borderRadius: "9999px",
                                  background:   "#dcfce7",
                                  color:        "#15803d",
                                  fontWeight:   700,
                                }}
                              >
                                Nueva
                              </span>
                            )}
                            <button
                              type="button"
                              className="edicion-cv-item__delete"
                              onClick={() => handleRemoveAudience(i)}
                              title="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
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
                <X size={13} /> Cerrar
              </button>
              <button
                className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || Boolean(error)}
              >
                <Save size={13} /> Guardar
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Publicación"
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}