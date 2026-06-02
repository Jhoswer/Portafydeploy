import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Award, Briefcase, Check, Clock, Eye, EyeOff, FileText,
  Globe, GraduationCap, Loader2, Plus, Save, Star, Trash2, X,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import { getAdminCv, updateAdminCv } from "../../../../services/adminProfileTableService";

function emptyDetail() {
  return { id_cv_detail: null, id_project: "", id_experience: "", id_certificate: "",
    id_university_career: "", id_social_network: "", id_skill_profile: "",
    display_name: "", visibility: true };
}
function normalizeBool(v) { return v === true || v === 1 || v === "1"; }
function normalizeCv(cv = {}) {
  return { name_cv: cv.name_cv ?? "", template: cv.template ?? "", font: cv.font ?? "",
    state: normalizeBool(cv.state), visible: normalizeBool(cv.visible),
    archive_pdf: cv.archive_pdf ?? "", description: cv.description ?? "", cv_url: cv.cv_url ?? "" };
}
function normalizeDetail(d = {}) {
  return { id_cv_detail: d.id_cv_detail ?? null, id_project: d.id_project ?? "",
    id_experience: d.id_experience ?? "", id_certificate: d.id_certificate ?? "",
    id_university_career: d.id_university_career ?? "", id_social_network: d.id_social_network ?? "",
    id_skill_profile: d.id_skill_profile ?? "", display_name: d.display_name ?? "",
    visibility: normalizeBool(d.visibility) };
}
function toNullableNumber(v) { return (v === "" || v === null || v === undefined) ? null : Number(v); }
function compactDetail(d) {
  return { id_cv_detail: d.id_cv_detail,
    id_project: toNullableNumber(d.id_project), id_experience: toNullableNumber(d.id_experience),
    id_certificate: toNullableNumber(d.id_certificate),
    id_university_career: toNullableNumber(d.id_university_career),
    id_social_network: toNullableNumber(d.id_social_network),
    id_skill_profile: toNullableNumber(d.id_skill_profile),
    visibility: Boolean(d.visibility), _delete: Boolean(d._delete) };
}
function sameValue(l, r) { return String(l ?? "") === String(r ?? ""); }

export default function ModalCV({ idProfile, idCv, onClose, onSaved }) {
  const { t } = useTranslation();
  const e = "adminEdicion.cv";

  const CV_FIELDS = [
    { key: "name_cv",     label: t(`${e}.fields.name_cv`),     type: "text",     maxLength: 255 },
    { key: "template",    label: t(`${e}.fields.template`),    type: "text",     maxLength: 255 },
    { key: "font",        label: t(`${e}.fields.font`),        type: "text",     maxLength: 255 },
    { key: "archive_pdf", label: t(`${e}.fields.archive_pdf`), type: "url",      maxLength: 255 },
    { key: "cv_url",      label: t(`${e}.fields.cv_url`),      type: "url",      maxLength: 255 },
    { key: "description", label: t(`${e}.fields.description`), type: "textarea", maxLength: 255 },
  ];

  const CATEGORIES = [
    { key: "id_skill_profile",     catalogKey: "skill_profile",     label: t(`${e}.categories.skill_profile`),     Icon: Star          },
    { key: "id_project",           catalogKey: "project",           label: t(`${e}.categories.project`),           Icon: Briefcase     },
    { key: "id_certificate",       catalogKey: "certificate",       label: t(`${e}.categories.certificate`),       Icon: Award         },
    { key: "id_experience",        catalogKey: "experience",        label: t(`${e}.categories.experience`),        Icon: Clock         },
    { key: "id_university_career", catalogKey: "university_career", label: t(`${e}.categories.university_career`), Icon: GraduationCap },
    { key: "id_social_network",    catalogKey: "social_network",    label: t(`${e}.categories.social_network`),    Icon: Globe         },
  ];

  const [formData,    setFormData]    = useState(normalizeCv());
  const [details,     setDetails]     = useState([]);
  const [catalogs,    setCatalogs]    = useState({});
  const [original,    setOriginal]    = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [selectedItem,      setSelectedItem]      = useState(null);
  const [addingForCategory, setAddingForCategory] = useState(null);
  const [newItemValue,      setNewItemValue]      = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const data = await getAdminCv(idProfile, idCv);
        const loadedCv = normalizeCv(data.cv);
        const loadedDetails = (data.details ?? []).map(normalizeDetail);
        setFormData(loadedCv); setDetails(loadedDetails);
        setCatalogs(data.catalogs ?? {});
        setOriginal({ cv: loadedCv, details: loadedDetails });
      } catch (err) {
        setError(err?.message || t(`${e}.errorLoad`));
      } finally { setIsLoading(false); }
    };
    if (idProfile && idCv) load();
  }, [idProfile, idCv]);

  const visibleDetails = useMemo(() => details.filter((d) => !d._delete), [details]);

  const handleCvChange     = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleDetailChange = (index, field, value) =>
    setDetails((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  const handleRemoveDetail = (index) =>
    setDetails((prev) => prev.map((d, i) => {
      if (i !== index) return d;
      return d.id_cv_detail ? { ...d, _delete: true } : null;
    }).filter(Boolean));

  const handleAddForCategory  = (key) => { setAddingForCategory(key); setNewItemValue(""); setSelectedItem(null); };
  const handleCancelAdd       = ()    => { setAddingForCategory(null); setNewItemValue(""); };
  const handleConfirmAddItem  = (category) => {
    const num = Number(newItemValue);
    if (!newItemValue || isNaN(num) || num < 1) return;
    const opt = (catalogs[category.catalogKey] ?? []).find((item) => String(item.value) === String(newItemValue));
    setDetails((prev) => [...prev, { ...emptyDetail(), [category.key]: String(num), display_name: opt?.label ?? "" }]);
    setAddingForCategory(null); setNewItemValue("");
  };
  const handleToggleVisibility = (index) =>
    setDetails((prev) => prev.map((d, i) => (i === index ? { ...d, visibility: !d.visibility } : d)));
  const handleSelectItem = (categoryKey, index) => {
    if (details[index]?._delete) {
      setDetails((prev) => prev.map((d, i) => (i === index ? { ...d, _delete: false } : d))); return;
    }
    const isSame = selectedItem?.categoryKey === categoryKey && selectedItem?.index === index;
    setSelectedItem(isSame ? null : { categoryKey, index });
  };

  const buildResumen = () => {
    if (!original) return [];
    const changes = [];
    [...CV_FIELDS, { key: "state", label: t(`${e}.fields.state`) }, { key: "visible", label: t(`${e}.fields.visible`) }]
      .forEach(({ key, label }) => {
        if (!sameValue(original.cv[key], formData[key]))
          changes.push({ label, value: typeof formData[key] === "boolean"
            ? (formData[key] ? t("adminEdicion.common.yes") : t("adminEdicion.common.no"))
            : formData[key] });
      });
    const deleted = details.filter((d) => d._delete && d.id_cv_detail !== null);
    if (deleted.length > 0)
      changes.push({ label: t(`${e}.resumen.deleted`), value: deleted.map((d) => d.display_name || `#${d.id_cv_detail}`).join(", ") });
    const added = details.filter((d) => !d._delete && d.id_cv_detail === null);
    if (added.length > 0)
      changes.push({ label: t(`${e}.resumen.added`), value: added.map((d) => d.display_name || t(`${e}.resumen.noName`)).join(", ") });
    const originalMap = Object.fromEntries(original.details.map((d) => [d.id_cv_detail, d]));
    const visibilityChanged = details.filter((d) =>
      !d._delete && d.id_cv_detail !== null && originalMap[d.id_cv_detail] !== undefined &&
      normalizeBool(originalMap[d.id_cv_detail].visibility) !== normalizeBool(d.visibility));
    if (visibilityChanged.length > 0)
      changes.push({ label: t(`${e}.resumen.visibility`),
        value: visibilityChanged.map((d) =>
          `${d.display_name || `#${d.id_cv_detail}`} → ${d.visibility ? t("adminEdicion.common.visible") : t("adminEdicion.common.hidden")}`
        ).join(", ") });
    return changes;
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const payload = { ...formData, details: details.map(compactDetail) };
      const data = await updateAdminCv(idProfile, idCv, payload);
      const lCv = normalizeCv(data.cv); const lD = (data.details ?? []).map(normalizeDetail);
      setFormData(lCv); setDetails(lD); setCatalogs(data.catalogs ?? {});
      setOriginal({ cv: lCv, details: lD });
      setShowConfirm(false); onSaved?.(data); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally { setIsSaving(false); }
  };

  const renderCategorySection = (category) => {
    const { key, catalogKey, label, Icon } = category;
    const categoryItems = details.map((d, i) => ({ detail: d, index: i }))
      .filter(({ detail }) => detail[key] !== "" && detail[key] !== null && detail[key] !== undefined);
    const activeCount  = categoryItems.filter(({ detail }) => !detail._delete).length;
    const isAddingThis = addingForCategory === key;

    return (
      <div key={key} className="edicion-cv-section">
        <div className="edicion-cv-section__header">
          <Icon size={14} className="edicion-cv-section__icon" />
          <h3 className="edicion-cv-section__title">{label}</h3>
          {activeCount > 0 && <span className="edicion-tabla__count">{activeCount}</span>}
          <button type="button"
            className={`edicion-chip edicion-chip--sm ${isAddingThis ? "edicion-chip--cancel" : ""}`}
            onClick={() => (isAddingThis ? handleCancelAdd() : handleAddForCategory(key))}>
            {isAddingThis ? <X size={12} /> : <Plus size={12} />}
            {isAddingThis ? t("adminEdicion.common.cancel") : t("adminEdicion.common.add")}
          </button>
        </div>

        <div className="edicion-cv-section__items">
          {isAddingThis && (
            <div className="edicion-cv-item edicion-cv-item--adding">
              <select className="edicion-cv-item__input" autoFocus value={newItemValue}
                onChange={(ev) => setNewItemValue(ev.target.value)}
                onKeyDown={(ev) => { if (ev.key === "Enter") handleConfirmAddItem(category); if (ev.key === "Escape") handleCancelAdd(); }}>
                <option value="">{t(`${e}.selectPrefix`)} {label.toLowerCase()}</option>
                {(catalogs[catalogKey] ?? []).map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <button type="button" className="edicion-cv-item__confirm"
                onClick={() => handleConfirmAddItem(category)} disabled={!newItemValue}>
                <Check size={12} />
              </button>
            </div>
          )}

          {categoryItems.length === 0 && !isAddingThis && (
            <span className="edicion-cv-section__empty">{t(`${e}.emptyItems`)}</span>
          )}

          {categoryItems.map(({ detail, index }) => {
            const isSelected = selectedItem?.index === index && selectedItem?.categoryKey === key;
            const isDeleted  = Boolean(detail._delete);
            return (
              <div key={detail.id_cv_detail ?? `new-${index}`}
                className={["edicion-cv-item", isSelected ? "edicion-cv-item--selected" : "", isDeleted ? "edicion-cv-item--deleted" : ""].join(" ").trim()}
                onClick={() => handleSelectItem(key, index)}
                title={isDeleted ? t("adminEdicion.common.clickToRestore") : undefined}>
                <span className="edicion-cv-item__id">
                  {isDeleted ? "~~ " : ""}{detail.display_name || t("adminEdicion.common.noName")}
                </span>
                {!isDeleted && (
                  <button type="button"
                    className={`edicion-cv-item__eye ${!detail.visibility ? "edicion-cv-item__eye--hidden" : ""}`}
                    onClick={(ev) => { ev.stopPropagation(); handleToggleVisibility(index); }}>
                    {detail.visibility ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                )}
                {isSelected && !isDeleted && (
                  <button type="button" className="edicion-cv-item__delete"
                    onClick={(ev) => { ev.stopPropagation(); handleRemoveDetail(index); setSelectedItem(null); }}>
                    <Trash2 size={12} />
                  </button>
                )}
                {isDeleted && <span className="edicion-cv-item__restore">{t("adminEdicion.common.restore")}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && onClose?.()}>
          <div className="edicion-modal edicion-modal--personal">
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <FileText size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${e}.subtitle`)}{idCv}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                aria-label={t("adminEdicion.common.close")}>
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
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.state}
                        onChange={(ev) => handleCvChange("state", ev.target.checked)} />
                      {t(`${e}.active`)}
                    </label>
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.visible}
                        onChange={(ev) => handleCvChange("visible", ev.target.checked)} />
                      {t(`${e}.visible`)}
                    </label>
                  </div>

                  {CV_FIELDS.map((field) => (
                    <div className="edicion-modal__field" key={field.key}>
                      <label className="edicion-modal__label">{field.label}</label>
                      {field.type === "textarea" ? (
                        <>
                          <textarea className="edicion-modal__textarea" value={formData[field.key]}
                            onChange={(ev) => handleCvChange(field.key, ev.target.value)}
                            rows={3} maxLength={field.maxLength} />
                          <span className="edicion-modal__char-count">
                            {formData[field.key]?.length ?? 0} / {field.maxLength}
                          </span>
                        </>
                      ) : (
                        <input className="edicion-modal__input" type={field.type}
                          value={formData[field.key]}
                          onChange={(ev) => handleCvChange(field.key, ev.target.value)}
                          maxLength={field.maxLength} />
                      )}
                    </div>
                  ))}

                  <hr className="edicion-modal__divider" />

                  <div className="edicion-cv-details-header edicion-cv-details-header--socials">
                    <FileText size={14} />
                    <span className="edicion-cv-details-header__label">{t(`${e}.detailHeader`)}</span>
                    <span className="edicion-tabla__count">
                      {visibleDetails.length} {t(`${e}.activeItems`)}
                    </span>
                  </div>

                  {CATEGORIES.map(renderCategorySection)}
                </div>
              )}
            </div>

            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t("adminEdicion.common.close")}
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || Boolean(error)}>
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