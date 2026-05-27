// src/components/admin/components/Creacion/CreacionFormProyecto.jsx
// Formulario de creación de proyecto — POST /admin/profile/{profile}/projects

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Eye, EyeOff, FolderKanban, Image,
  Plus, Trash2, Upload, X,
} from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearProyecto } from "../../../../services/adminCreacionService";

const PROJECT_STATES = [
  { value: "in_progress", label: "En progreso" },
  { value: "completed",   label: "Completado"  },
  { value: "removed",     label: "Eliminado"   },
];

const PROJECT_FIELDS = [
  { key: "title",          label: "Título",          type: "text",     required: true,  maxLength: 255 },
  { key: "description",    label: "Descripción",     type: "textarea", required: false               },
  { key: "repository_url", label: "URL Repositorio", type: "url",      required: false, maxLength: 255 },
  { key: "url_demo",       label: "URL Demo",        type: "url",      required: false, maxLength: 255 },
];

const EMPTY_FORM = {
  title:          "",
  description:    "",
  repository_url: "",
  url_demo:       "",
  state:          "in_progress",
  visibility:     true,
};

function buildResumen(form, photoFile) {
  const entries = [];
  if (form.title)          entries.push({ label: "Título",          value: form.title          });
  if (form.description)    entries.push({ label: "Descripción",     value: form.description    });
  if (form.repository_url) entries.push({ label: "URL Repositorio", value: form.repository_url });
  if (form.url_demo)       entries.push({ label: "URL Demo",        value: form.url_demo       });
  entries.push({ label: "Estado",      value: PROJECT_STATES.find((s) => s.value === form.state)?.label ?? form.state });
  entries.push({ label: "Visibilidad", value: form.visibility ? "Visible" : "Oculto" });
  if (photoFile) {
    entries.push({ label: "Foto", value: `${photoFile.name} (${(photoFile.size / 1024).toFixed(0)} KB)` });
  }
  return entries;
}

export default function CreacionFormProyecto({ idProfile, onClose, onSaved }) {
  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const photoInputRef  = useRef(null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoFile) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (photoFile) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      if (photoFile) {
        const form = new FormData();
        form.append("photo",          photoFile);
        form.append("title",          formData.title          || "");
        form.append("description",    formData.description    || "");
        form.append("repository_url", formData.repository_url || "");
        form.append("url_demo",       formData.url_demo       || "");
        form.append("state",          formData.state);
        form.append("visibility",     formData.visibility ? "1" : "0");
        await crearProyecto(idProfile, form, true);
      } else {
        const payload = {
          title:          formData.title          || null,
          description:    formData.description    || null,
          repository_url: formData.repository_url || null,
          url_demo:       formData.url_demo       || null,
          state:          formData.state,
          visibility:     formData.visibility,
        };
        await crearProyecto(idProfile, payload, false);
      }

      setShowConfirm(false);
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("[CreacionFormProyecto] Error al crear:", err);
      setConfirmError(err?.message || "No se pudo crear el proyecto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal" style={{ maxWidth: 680 }}>

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <FolderKanban size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Nuevo Proyecto</h2>
                  <p className="edicion-modal__subtitle">Perfil #{idProfile}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose} disabled={isSaving} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              <div className="edicion-modal__fields">
                {error && <div className="edicion-modal__error">{error}</div>}

                {/* Foto */}
                <div className="edicion-modal__field">
                  <label className="edicion-modal__label">
                    <Image size={11} style={{ display: "inline", marginRight: 4 }} />Foto principal
                  </label>
                  {photoPreview && (
                    <div style={{ marginBottom: 8 }}>
                      <img src={photoPreview} alt="Preview"
                        style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, border: "1.5px solid #e8ecf4", display: "block", marginBottom: 6 }} />
                      <button type="button" className="edicion-modal__btn-cancel" onClick={handleRemovePhoto}>
                        <Trash2 size={12} /> Quitar imagen
                      </button>
                    </div>
                  )}
                  <input ref={photoInputRef} type="file" accept="image/*"
                    style={{ display: "none" }} onChange={handlePhotoChange} />
                  <button type="button" className="edicion-modal__btn-cancel"
                    onClick={() => photoInputRef.current?.click()}>
                    <Upload size={12} /> {photoPreview ? "Cambiar imagen" : "Seleccionar imagen"}
                  </button>
                  {photoFile && (
                    <span className="edicion-modal__char-count" style={{ marginTop: 4 }}>
                      {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>

                <hr className="edicion-modal__divider" />

                {/* Campos de texto */}
                {PROJECT_FIELDS.map((field) => (
                  <div className="edicion-modal__field" key={field.key}>
                    <label className="edicion-modal__label">
                      {field.label}
                      {field.required && <span className="edicion-modal__required"> *</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea className="edicion-modal__textarea"
                        value={formData[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={`${field.label}…`} rows={4} />
                    ) : (
                      <input className="edicion-modal__input" type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.label} maxLength={field.maxLength} />
                    )}
                  </div>
                ))}

                {/* Estado + Visibilidad */}
                <div className="edicion-modal__row">
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      Estado <span className="edicion-modal__required">*</span>
                    </label>
                    <select className="edicion-modal__input" value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}>
                      {PROJECT_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Visibilidad</label>
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={Boolean(formData.visibility)}
                        onChange={(e) => handleChange("visibility", e.target.checked)} />
                      {formData.visibility ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Oculto</>}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> Cerrar
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving}>
                <Plus size={13} /> Crear Proyecto
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Proyecto"
        resumen={buildResumen(formData, photoFile)}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}