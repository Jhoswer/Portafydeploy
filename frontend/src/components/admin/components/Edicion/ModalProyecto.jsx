// src/components/admin/components/Edicion/ModalProyecto.jsx

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Eye, EyeOff, FolderKanban, Image, Loader2,
  Plus, Save, Trash2, Upload, X, Zap,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminProject,
  updateAdminProject,
} from "../../../../services/adminProfileTableService";

/* ── Opciones de estado (CHECK constraint) ── */
const PROJECT_STATES = [
  { value: "in_progress", label: "En progreso" },
  { value: "completed",   label: "Completado"  },
  { value: "removed",     label: "Eliminado"   },
];

const STATE_BADGE = {
  in_progress: { bg: "#dbeafe", color: "#1d4ed8" },
  completed:   { bg: "#dcfce7", color: "#15803d" },
  removed:     { bg: "#fee2e2", color: "#b91c1c" },
};

/* ── Campos escalares editables ── */
const PROJECT_FIELDS = [
  { key: "title",          label: "Título",          type: "text",     required: true,  maxLength: 255 },
  { key: "description",    label: "Descripción",     type: "textarea", required: false               },
  { key: "repository_url", label: "URL Repositorio", type: "url",      required: false, maxLength: 255 },
  { key: "url_demo",       label: "URL Demo",        type: "url",      required: false, maxLength: 255 },
];

const FIELD_LABELS = {
  title:          "Título",
  description:    "Descripción",
  repository_url: "URL Repositorio",
  url_demo:       "URL Demo",
  state:          "Estado",
  visibility:     "Visibilidad",
  url_photo_main: "Foto principal",
};

/* ── Helpers ── */
function normalizeProject(raw = {}) {
  return {
    title:          raw.title          ?? "",
    description:    raw.description    ?? "",
    repository_url: raw.repository_url ?? "",
    url_demo:       raw.url_demo       ?? "",
    state:          raw.state          ?? "in_progress",
    visibility:     raw.visibility === true || raw.visibility === 1 || raw.visibility === "1",
    url_photo_main: raw.url_photo_main ?? "",
  };
}

function buildResumen(original, current, skills, photoFile) {
  const changes = [];

  /* Campos escalares */
  for (const { key, label } of [...PROJECT_FIELDS, { key: "state", label: "Estado" }]) {
    if (String(original?.[key] ?? "") !== String(current?.[key] ?? "")) {
      changes.push({
        label: FIELD_LABELS[key] ?? label,
        value: current?.[key] || "—",
      });
    }
  }

  /* Visibilidad */
  if (Boolean(original?.visibility) !== Boolean(current?.visibility)) {
    changes.push({
      label: FIELD_LABELS.visibility,
      value: current?.visibility ? "Visible" : "Oculto",
    });
  }

  /* Foto nueva */
  if (photoFile) {
    changes.push({
      label: FIELD_LABELS.url_photo_main,
      value: `Nueva imagen: ${photoFile.name} (${(photoFile.size / 1024).toFixed(0)} KB)`,
    });
  }

  /* Foto eliminada */
  if (original?.url_photo_main && !current?.url_photo_main) {
    changes.push({
      label: FIELD_LABELS.url_photo_main,
      value: "Foto eliminada",
    });
  }

  /* Skills agregadas */
  const added = skills.filter((s) => s._isNew && !s._delete);
  if (added.length > 0) {
    changes.push({ label: "Skills agregadas", value: added.map((s) => s.skill_name).join(", ") });
  }

  /* Skills eliminadas */
  const removed = skills.filter((s) => s._delete && !s._isNew);
  if (removed.length > 0) {
    changes.push({ label: "Skills eliminadas", value: removed.map((s) => s.skill_name).join(", ") });
  }

  return changes;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE
══════════════════════════════════════════════════════════════ */
export default function ModalProyecto({ idProfile, idProject, onClose, onSaved }) {
  const [formData,     setFormData]     = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [skills,       setSkills]       = useState([]);   // PROJECT_SKILL
  const [catalogs,     setCatalogs]     = useState(null); // { skills: [] }

  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [resumen,      setResumen]      = useState([]);

  /* Foto principal */
  const photoInputRef  = useRef(null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  /* Selector de nueva skill */
  const [newSkillId, setNewSkillId] = useState("");

  /* ── Carga ── */
  useEffect(() => {
    if (!idProject) return;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data       = await getAdminProject(idProfile, idProject);
        const normalized = normalizeProject(data?.project);
        setFormData(normalized);
        setOriginalData(normalized);
        setSkills(data?.skills ?? []);
        setCatalogs(data?.catalogs ?? { skills: [] });
        setPhotoPreview(normalized.url_photo_main || null);
      } catch (err) {
        setError(err?.message || "No se pudo cargar el proyecto.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, idProject]);

  /* Liberar object URL al desmontar */
  useEffect(() => () => { if (photoPreview && photoFile) URL.revokeObjectURL(photoPreview); }, []);

  /* ── Handlers ── */
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  /* Foto */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoFile) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    handleChange("url_photo_main", ""); // se enviará como archivo
  };

  const handleRemovePhoto = () => {
    if (photoFile) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    handleChange("url_photo_main", "");
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  /* Skills */
  const handleAddSkill = () => {
    if (!newSkillId) return;
    const cat = catalogs?.skills?.find((s) => String(s.value) === String(newSkillId));
    if (!cat) return;
    const exists = skills.some((s) => !s._delete && String(s.id_skill) === String(newSkillId));
    if (exists) { setNewSkillId(""); return; }
    setSkills((prev) => [
      ...prev,
      { id_project_skill: null, id_skill: Number(newSkillId), skill_name: cat.label, _isNew: true },
    ]);
    setNewSkillId("");
  };

  const handleRemoveSkill = (index) => {
    setSkills((prev) => {
      const updated = [...prev];
      const item    = updated[index];
      if (item._isNew) { updated.splice(index, 1); }
      else             { updated[index] = { ...item, _delete: true }; }
      return updated;
    });
  };

  /* Abrir confirmación */
  const handleOpenConfirm = () => {
    setConfirmError("");
    setResumen(buildResumen(originalData, formData, skills, photoFile));
    setShowConfirm(true);
  };

  /* Guardar */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        title:          formData.title,
        description:    formData.description    || null,
        repository_url: formData.repository_url || null,
        url_demo:       formData.url_demo       || null,
        state:          formData.state,
        visibility:     formData.visibility,
        url_photo_main: formData.url_photo_main || null,
        _delete_photo:  originalData?.url_photo_main && !formData.url_photo_main ? true : false,
        skills: skills
          .filter((s) => s._isNew || s._delete)
          .map((s) => ({
            id_project_skill: s.id_project_skill,
            id_skill:         s.id_skill,
            _delete:          s._delete || false,
          })),
      };

      if (photoFile) {
        const form = new FormData();
        form.append("_method",  "PUT");
        form.append("photo",    photoFile);
        form.append("skills",   JSON.stringify(payload.skills));
        Object.entries(payload).forEach(([key, val]) => {
          if (key === "skills" || val === null || val === undefined) return;
          form.append(key, typeof val === "boolean" ? (val ? "1" : "0") : String(val));
        });
        await updateAdminProject(idProfile, idProject, form, true);
      } else {
        await updateAdminProject(idProfile, idProject, payload, false);
      }

      setShowConfirm(false);
      onSaved?.();
      onClose?.();
    } catch (err) {
      setConfirmError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const visibleSkills      = skills.filter((s) => !s._delete);
  const currentStateBadge  = STATE_BADGE[formData?.state] ?? STATE_BADGE.in_progress;
  const currentStateLabel  = PROJECT_STATES.find((s) => s.value === formData?.state)?.label ?? formData?.state;

  /* ══════════════════════════════ RENDER ══════════════════════════════ */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal" style={{ maxWidth: 680 }}>

            {/* ════ HEADER ════ */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <FolderKanban size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar Proyecto</h2>
                  <p className="edicion-modal__subtitle">Proyecto #{idProject}</p>
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
                  <span>Cargando proyecto…</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && formData && (
                <div className="edicion-modal__fields">

                  {/* ── Foto principal ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Image size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                      Foto principal
                    </label>

                    {/* Preview de la imagen */}
                    {(photoPreview || formData.url_photo_main) && (
                      <div style={{ marginBottom: 8 }}>
                        <img
                          src={photoPreview || formData.url_photo_main}
                          alt="Preview"
                          style={{
                            width:        "100%",
                            maxHeight:    180,
                            objectFit:    "cover",
                            borderRadius: 10,
                            border:       "1.5px solid #e8ecf4",
                            display:      "block",
                            marginBottom: 6,
                          }}
                        />
                        <button
                          type="button"
                          className="edicion-modal__btn-cancel"
                          onClick={handleRemovePhoto}
                        >
                          <Trash2 size={12} /> Quitar imagen
                        </button>
                      </div>
                    )}

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePhotoChange}
                    />
                    <button
                      type="button"
                      className="edicion-modal__btn-cancel"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Upload size={12} />
                      {photoPreview || formData.url_photo_main ? "Cambiar imagen" : "Seleccionar imagen"}
                    </button>
                    {photoFile && (
                      <span className="edicion-modal__char-count" style={{ marginTop: 4 }}>
                        {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* ── Campos de texto ── */}
                  {PROJECT_FIELDS.map((field) => (
                    <div className="edicion-modal__field" key={field.key}>
                      <label className="edicion-modal__label">
                        {field.label}
                        {field.required && (
                          <span className="edicion-modal__required"> *</span>
                        )}
                      </label>
                      {field.type === "textarea" ? (
                        <>
                          <textarea
                            className="edicion-modal__textarea"
                            value={formData[field.key]}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={`${field.label}…`}
                            rows={4}
                          />
                        </>
                      ) : (
                        <input
                          className="edicion-modal__input"
                          type={field.type}
                          value={formData[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.label}
                          maxLength={field.maxLength}
                        />
                      )}
                    </div>
                  ))}

                  {/* ── Estado + Visibilidad ── */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        Estado <span className="edicion-modal__required">*</span>
                      </label>
                      <select
                        className="edicion-modal__input"
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                      >
                        {PROJECT_STATES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Visibilidad</label>
                      <label className="edicion-modal__check">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.visibility)}
                          onChange={(e) => handleChange("visibility", e.target.checked)}
                        />
                        {formData.visibility
                          ? <><Eye size={13} /> Visible</>
                          : <><EyeOff size={13} /> Oculto</>}
                      </label>
                      <span className="edicion-modal__char-count" style={{ marginTop: 2 }}>
                        {formData.visibility
                          ? "El proyecto es visible en el portafolio."
                          : "El proyecto está oculto."}
                      </span>
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* ── Sección de skills ── */}
                  <div className="edicion-cv-section">
                    <div className="edicion-cv-section__header">
                      <Zap size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">Skills del proyecto</h3>
                      {visibleSkills.length > 0 && (
                        <span className="edicion-tabla__count">{visibleSkills.length}</span>
                      )}
                    </div>

                    {/* Pills de skills activas */}
                    <div className="edicion-cv-section__items">
                      {visibleSkills.length === 0 && (
                        <span className="edicion-cv-section__empty">Sin skills agregadas</span>
                      )}
                      {skills.map((s, index) => {
                        if (s._delete) return null;
                        return (
                          <div
                            key={s.id_project_skill ?? `new-${index}`}
                            className="edicion-cv-item"
                          >
                            <span className="edicion-cv-item__id">{s.skill_name}</span>
                            {s._isNew && (
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
                              onClick={() => handleRemoveSkill(index)}
                              title="Quitar skill"
                              style={{ opacity: 1 }}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selector para agregar skill */}
                    {(catalogs?.skills?.length ?? 0) > 0 && (
                      <div
                        className="edicion-modal__row"
                        style={{ alignItems: "center", marginTop: 8 }}
                      >
                        <select
                          className="edicion-modal__input"
                          value={newSkillId}
                          onChange={(e) => setNewSkillId(e.target.value)}
                        >
                          <option value="">— Agregar skill —</option>
                          {catalogs.skills
                            .filter(
                              (s) =>
                                !skills.some(
                                  (existing) =>
                                    !existing._delete &&
                                    String(existing.id_skill) === String(s.value)
                                )
                            )
                            .map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          className="edicion-modal__btn-save"
                          style={{ flexShrink: 0 }}
                          onClick={handleAddSkill}
                          disabled={!newSkillId}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* ════ FOOTER ════ */}
            {!isLoading && formData && (
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
                  onClick={handleOpenConfirm}
                  disabled={isSaving || Boolean(error)}
                >
                  <Save size={13} /> Guardar
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Proyecto"
        accion="actualizar"
        resumen={resumen}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}