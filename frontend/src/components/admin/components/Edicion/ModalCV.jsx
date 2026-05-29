import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Award, Briefcase, Check, Clock, Eye, EyeOff, FileText,
  Globe, GraduationCap, Loader2, Plus, Save, Star, Trash2, X,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import { getAdminCv, updateAdminCv } from "../../../../services/adminProfileTableService";

const CV_FIELDS = [
  { key: "name_cv",      label: "Nombre CV",  type: "text",     maxLength: 255 },
  { key: "template",     label: "Plantilla",  type: "text",     maxLength: 255 },
  { key: "font",         label: "Fuente",     type: "text",     maxLength: 255 },
  { key: "archive_pdf",  label: "PDF",        type: "url",      maxLength: 255 },
  { key: "cv_url",       label: "URL CV",     type: "url",      maxLength: 255 },
  { key: "description",  label: "Descripcion",type: "textarea", maxLength: 255 },
];

const CATEGORIES = [
  { key: "id_skill_profile",     catalogKey: "skill_profile",      label: "Habilidades",          Icon: Star           },
  { key: "id_project",           catalogKey: "project",            label: "Proyectos",             Icon: Briefcase      },
  { key: "id_certificate",       catalogKey: "certificate",        label: "Certificados",          Icon: Award          },
  { key: "id_experience",        catalogKey: "experience",         label: "Experiencias",          Icon: Clock          },
  { key: "id_university_career", catalogKey: "university_career",  label: "Universidad / Carrera", Icon: GraduationCap  },
  { key: "id_social_network",    catalogKey: "social_network",     label: "Redes Sociales",        Icon: Globe          },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function emptyDetail() {
  return {
    id_cv_detail: null,
    id_project: "",
    id_experience: "",
    id_certificate: "",
    id_university_career: "",
    id_social_network: "",
    id_skill_profile: "",
    display_name: "",
    visibility: true,
  };
}

function normalizeBool(value) {
  return value === true || value === 1 || value === "1";
}

function normalizeCv(cv = {}) {
  return {
    name_cv:     cv.name_cv     ?? "",
    template:    cv.template    ?? "",
    font:        cv.font        ?? "",
    state:       normalizeBool(cv.state),
    visible:     normalizeBool(cv.visible),
    archive_pdf: cv.archive_pdf ?? "",
    description: cv.description ?? "",
    cv_url:      cv.cv_url      ?? "",
  };
}

function normalizeDetail(detail = {}) {
  return {
    id_cv_detail:       detail.id_cv_detail       ?? null,
    id_project:         detail.id_project          ?? "",
    id_experience:      detail.id_experience       ?? "",
    id_certificate:     detail.id_certificate      ?? "",
    id_university_career: detail.id_university_career ?? "",
    id_social_network:  detail.id_social_network   ?? "",
    id_skill_profile:   detail.id_skill_profile    ?? "",
    display_name:       detail.display_name         ?? "",
    visibility:         normalizeBool(detail.visibility),
  };
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  return Number(value);
}

function compactDetail(detail) {
  return {
    id_cv_detail:        detail.id_cv_detail,
    id_project:          toNullableNumber(detail.id_project),
    id_experience:       toNullableNumber(detail.id_experience),
    id_certificate:      toNullableNumber(detail.id_certificate),
    id_university_career: toNullableNumber(detail.id_university_career),
    id_social_network:   toNullableNumber(detail.id_social_network),
    id_skill_profile:    toNullableNumber(detail.id_skill_profile),
    visibility:          Boolean(detail.visibility),
    _delete:             Boolean(detail._delete),
  };
}

function sameValue(left, right) {
  return String(left ?? "") === String(right ?? "");
}

/* ── Componente ──────────────────────────────────────────────── */
export default function ModalCV({ idProfile, idCv, onClose, onSaved }) {
  const [formData,   setFormData]   = useState(normalizeCv());
  const [details,    setDetails]    = useState([]);
  const [catalogs,   setCatalogs]   = useState({});
  const [original,   setOriginal]   = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isSaving,   setIsSaving]   = useState(false);
  const [error,      setError]      = useState("");
  const [showConfirm,setShowConfirm]= useState(false);
  const [confirmError, setConfirmError] = useState("");

  /* Estados para la UI de categorías */
  const [selectedItem,      setSelectedItem]      = useState(null);   // { categoryKey, index }
  const [addingForCategory, setAddingForCategory] = useState(null);   // key de categoría
  const [newItemValue,      setNewItemValue]      = useState("");

  /* ── Carga ── */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data        = await getAdminCv(idProfile, idCv);
        const loadedCv    = normalizeCv(data.cv);
        const loadedDetails = (data.details ?? []).map(normalizeDetail);
        setFormData(loadedCv);
        setDetails(loadedDetails);
        setCatalogs(data.catalogs ?? {});
        setOriginal({ cv: loadedCv, details: loadedDetails });
      } catch (err) {
        console.error("[ModalCV] Error al cargar:", err);
        setError(err?.message || "No se pudo cargar el CV seleccionado.");
      } finally {
        setIsLoading(false);
      }
    };
    if (idProfile && idCv) load();
  }, [idProfile, idCv]);

  const visibleDetails = useMemo(
    () => details.filter((d) => !d._delete),
    [details]
  );

  /* ── Handlers generales ── */
  const handleCvChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDetailChange = (index, field, value) =>
    setDetails((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );

  const handleRemoveDetail = (index) => {
    setDetails((prev) =>
      prev
        .map((d, i) => {
          if (i !== index) return d;
          return d.id_cv_detail ? { ...d, _delete: true } : null;
        })
        .filter(Boolean)
    );
  };

  /* ── Handlers de categorías ── */
  const handleAddForCategory = (categoryKey) => {
    setAddingForCategory(categoryKey);
    setNewItemValue("");
    setSelectedItem(null);
  };

  const handleCancelAdd = () => {
    setAddingForCategory(null);
    setNewItemValue("");
  };

  const handleConfirmAddItem = (category) => {
    const categoryKey = category.key;
    const num = Number(newItemValue);
    if (!newItemValue || isNaN(num) || num < 1) return;
    const selectedOption = (catalogs[category.catalogKey] ?? [])
      .find((item) => String(item.value) === String(newItemValue));
    setDetails((prev) => [
      ...prev,
      {
        ...emptyDetail(),
        [categoryKey]: String(num),
        display_name: selectedOption?.label ?? "",
      },
    ]);
    setAddingForCategory(null);
    setNewItemValue("");
  };

  const handleToggleVisibility = (index) =>
    setDetails((prev) =>
      prev.map((d, i) => (i === index ? { ...d, visibility: !d.visibility } : d))
    );

  const handleSelectItem = (categoryKey, index) => {
    /* Si ya está eliminado, restaurar al hacer click */
    if (details[index]?._delete) {
      setDetails((prev) =>
        prev.map((d, i) => (i === index ? { ...d, _delete: false } : d))
      );
      return;
    }
    const isSame =
      selectedItem?.categoryKey === categoryKey && selectedItem?.index === index;
    setSelectedItem(isSame ? null : { categoryKey, index });
  };
  
  /* ── Resumen de cambios ── */
const buildResumen = () => {
  if (!original) return [];
  const changes = [];

  /* 1. Cambios en campos del CV y checkboxes */
  [...CV_FIELDS, { key: "state", label: "Estado" }, { key: "visible", label: "Visible" }]
    .forEach(({ key, label }) => {
      if (!sameValue(original.cv[key], formData[key])) {
        changes.push({
          label,
          value:
            typeof formData[key] === "boolean"
              ? formData[key] ? "Sí" : "No"
              : formData[key],
        });
      }
    });

  /* 2. Items eliminados (tienen _delete: true y ya existían en BD) */
  const deleted = details.filter((d) => d._delete && d.id_cv_detail !== null);
  if (deleted.length > 0) {
    changes.push({
      label: "Elementos eliminados",
      value: deleted.map((d) => d.display_name || `#${d.id_cv_detail}`).join(", "),
    });
  }

  /* 3. Items nuevos (sin id_cv_detail y sin marcar como eliminados) */
  const added = details.filter((d) => !d._delete && d.id_cv_detail === null);
  if (added.length > 0) {
    changes.push({
      label: "Elementos agregados",
      value: added.map((d) => d.display_name || "Nuevo elemento").join(", "),
    });
  }

  /* 4. Cambios de visibilidad en items existentes */
  const originalMap = Object.fromEntries(
    original.details.map((d) => [d.id_cv_detail, d])
  );
  const visibilityChanged = details.filter(
    (d) =>
      !d._delete &&
      d.id_cv_detail !== null &&
      originalMap[d.id_cv_detail] !== undefined &&
      normalizeBool(originalMap[d.id_cv_detail].visibility) !== normalizeBool(d.visibility)
  );
  if (visibilityChanged.length > 0) {
    changes.push({
      label: "Visibilidad modificada",
      value: visibilityChanged
        .map((d) => `${d.display_name || `#${d.id_cv_detail}`} → ${d.visibility ? "Visible" : "Oculto"}`)
        .join(", "),
    });
  }

  return changes;
};

  /* ── Guardar ── */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = { ...formData, details: details.map(compactDetail) };
      const data = await updateAdminCv(idProfile, idCv, payload);
      const loadedCv      = normalizeCv(data.cv);
      const loadedDetails = (data.details ?? []).map(normalizeDetail);
      setFormData(loadedCv);
      setDetails(loadedDetails);
      setCatalogs(data.catalogs ?? {});
      setOriginal({ cv: loadedCv, details: loadedDetails });
      setShowConfirm(false);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("[ModalCV] Error al guardar:", err);
      setConfirmError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Render de una sección de categoría ── */
  const renderCategorySection = (category) => {
    const { key, catalogKey, label, Icon } = category;
    const categoryItems = details
      .map((detail, index) => ({ detail, index }))
      .filter(({ detail }) => detail[key] !== "" && detail[key] !== null && detail[key] !== undefined);

    const activeCount  = categoryItems.filter(({ detail }) => !detail._delete).length;
    const isAddingThis = addingForCategory === key;

    return (
      <div key={key} className="edicion-cv-section">
        {/* Header de la sección */}
        <div className="edicion-cv-section__header">
          <Icon size={14} className="edicion-cv-section__icon" />
          <h3 className="edicion-cv-section__title">{label}</h3>
          {activeCount > 0 && (
            <span className="edicion-tabla__count">{activeCount}</span>
          )}
          <button
            type="button"
            className={`edicion-chip edicion-chip--sm ${isAddingThis ? "edicion-chip--cancel" : ""}`}
            onClick={() => (isAddingThis ? handleCancelAdd() : handleAddForCategory(key))}
          >
            {isAddingThis ? <X size={12} /> : <Plus size={12} />}
            {isAddingThis ? "Cancelar" : "Agregar"}
          </button>
        </div>

        {/* Área de items */}
        <div className="edicion-cv-section__items">
          {/* Input de nuevo item */}
          {isAddingThis && (
            <div className="edicion-cv-item edicion-cv-item--adding">
              <select
                className="edicion-cv-item__input"
                autoFocus
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmAddItem(category);
                  if (e.key === "Escape") handleCancelAdd();
                }}
              >
                <option value="">Seleccionar {label.toLowerCase()}</option>
                {(catalogs[catalogKey] ?? []).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="edicion-cv-item__confirm"
                onClick={() => handleConfirmAddItem(category)}
                disabled={!newItemValue}
                title="Confirmar"
              >
                <Check size={12} />
              </button>
            </div>
          )}

          {/* Empty state */}
          {categoryItems.length === 0 && !isAddingThis && (
            <span className="edicion-cv-section__empty">Sin elementos agregados</span>
          )}

          {/* Items existentes */}
          {categoryItems.map(({ detail, index }) => {
            const isSelected =
              selectedItem?.index === index && selectedItem?.categoryKey === key;
            const isDeleted = Boolean(detail._delete);

            return (
              <div
                key={detail.id_cv_detail ?? `new-${index}`}
                className={[
                  "edicion-cv-item",
                  isSelected  ? "edicion-cv-item--selected" : "",
                  isDeleted   ? "edicion-cv-item--deleted"  : "",
                ].join(" ").trim()}
                onClick={() => handleSelectItem(key, index)}
                title={isDeleted ? "Click para restaurar" : undefined}
              >
                <span className="edicion-cv-item__id">
                  {isDeleted ? "~~ " : ""}{detail.display_name || "Elemento sin nombre"}
                </span>

                {/* Ojo de visibilidad (solo si no está eliminado) */}
                {!isDeleted && (
                  <button
                    type="button"
                    className={`edicion-cv-item__eye ${!detail.visibility ? "edicion-cv-item__eye--hidden" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleVisibility(index); }}
                    title={detail.visibility ? "Ocultar" : "Mostrar"}
                  >
                    {detail.visibility ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                )}

                {/* Botón eliminar (solo si está seleccionado y no eliminado) */}
                {isSelected && !isDeleted && (
                  <button
                    type="button"
                    className="edicion-cv-item__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDetail(index);
                      setSelectedItem(null);
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                {/* Indicador de restaurar (eliminados) */}
                {isDeleted && (
                  <span className="edicion-cv-item__restore">↩</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── JSX principal ── */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--personal">
            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <FileText size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar CV</h2>
                  <p className="edicion-modal__subtitle">CV #{idCv}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>Cargando CV...</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">
                  {/* Checkboxes estado / visible */}
                  <div className="edicion-modal__row">
                    <label className="edicion-modal__check">
                      <input
                        type="checkbox"
                        checked={formData.state}
                        onChange={(e) => handleCvChange("state", e.target.checked)}
                      />
                      Activo
                    </label>
                    <label className="edicion-modal__check">
                      <input
                        type="checkbox"
                        checked={formData.visible}
                        onChange={(e) => handleCvChange("visible", e.target.checked)}
                      />
                      Visible
                    </label>
                  </div>

                  {/* Campos del CV */}
                  {CV_FIELDS.map((field) => (
                    <div className="edicion-modal__field" key={field.key}>
                      <label className="edicion-modal__label">{field.label}</label>
                      {field.type === "textarea" ? (
                        <>
                          <textarea
                            className="edicion-modal__textarea"
                            value={formData[field.key]}
                            onChange={(e) => handleCvChange(field.key, e.target.value)}
                            rows={3}
                            maxLength={field.maxLength}
                          />
                          <span className="edicion-modal__char-count">
                            {formData[field.key]?.length ?? 0} / {field.maxLength}
                          </span>
                        </>
                      ) : (
                        <input
                          className="edicion-modal__input"
                          type={field.type}
                          value={formData[field.key]}
                          onChange={(e) => handleCvChange(field.key, e.target.value)}
                          maxLength={field.maxLength}
                        />
                      )}
                    </div>
                  ))}

                  {/* Divisor antes de las secciones */}
                  <hr className="edicion-modal__divider" />

                  {/* Título de la zona de detalles */}
                  <div className="edicion-cv-details-header edicion-cv-details-header--socials">
                    <FileText size={14} />
                    <span className="edicion-cv-details-header__label">Detalle del CV</span>
                    <span className="edicion-tabla__count">{visibleDetails.length} activos</span>
                  </div>

                  {/* Secciones por categoría */}
                  {CATEGORIES.map(renderCategorySection)}
                </div>
              )}
            </div>

            {/* Footer */}
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
        entidad="CV"
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}
