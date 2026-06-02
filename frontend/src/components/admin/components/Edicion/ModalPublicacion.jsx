// src/components/admin/components/Edicion/ModalPublicacion.jsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Check, Loader2, Newspaper, Plus, Save, Trash2, X,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminPublication,
  updateAdminPublication,
} from "../../../../services/adminProfileTableService";

function normalizeBool(value) {
  return value === true || value === 1 || value === "1";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
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
    id_publicized:         detail?.id_publicized   ? String(detail.id_publicized)  : "",
    id_offer:              detail?.id_offer         ? String(detail.id_offer)       : "",
    id_project:            detail?.id_project       ? String(detail.id_project)     : "",
    id_cv:                 detail?.id_cv            ? String(detail.id_cv)          : "",
    id_experience:         detail?.id_experience    ? String(detail.id_experience)  : "",
  };
}

function sameValue(a, b) { return String(a ?? "") === String(b ?? ""); }

function labelFor(catalog = [], id) {
  if (!id && id !== 0) return null;
  const found = catalog.find((c) => String(c.value) === String(id));
  return found?.label ?? found?.name ?? `ID ${id}`;
}

const EXCLUSIVE_KEYS = ["id_offer", "id_project", "id_cv", "id_experience"];

export default function ModalPublicacion({ idProfile, idPublication, onClose, onSaved }) {
  const { t } = useTranslation();
  const e = "adminEdicion.publicacion";

  const STATE_OPTIONS = [
    { value: "incomplete", label: t(`${e}.states.incomplete`) },
    { value: "published",  label: t(`${e}.states.published`)  },
    { value: "removed",    label: t(`${e}.states.removed`)    },
  ];

  const STATE_BADGE = {
    incomplete: { color: "#f59e0b", bg: "#fef3c722", border: "#f59e0b55", label: t(`${e}.states.incomplete`) },
    published:  { color: "#10b981", bg: "#d1fae522", border: "#10b98155", label: t(`${e}.states.published`)  },
    removed:    { color: "#ef4444", bg: "#fee2e222", border: "#ef444455", label: t(`${e}.states.removed`)    },
  };

  const DETAIL_FIELDS_EDITABLE = [
    { key: "id_offer",      label: t(`${e}.detailFields.id_offer`),      catalogKey: "offers"      },
    { key: "id_project",    label: t(`${e}.detailFields.id_project`),    catalogKey: "projects"    },
    { key: "id_cv",         label: t(`${e}.detailFields.id_cv`),         catalogKey: "cvs"         },
    { key: "id_experience", label: t(`${e}.detailFields.id_experience`), catalogKey: "experiences" },
  ];

  const [formData,    setFormData]    = useState(normalizePublication());
  const [detail,      setDetail]      = useState(normalizeDetail());
  const [audiences,   setAudiences]   = useState([]);
  const [catalogs,    setCatalogs]    = useState({});
  const [original,    setOriginal]    = useState(null);
  const [rawPub,      setRawPub]      = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError,setConfirmError]= useState("");

  const [isAddingAud, setIsAddingAud] = useState(false);
  const [newArea,     setNewArea]     = useState("");
  const [newCareer,   setNewCareer]   = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const data = await getAdminPublication(idProfile, idPublication);
        const pub  = normalizePublication(data.publication);
        const det  = normalizeDetail(data.detail);
        const auds = (data.audiences ?? []).map((a) => ({ ...a, _delete: false, _new: false }));
        setFormData(pub); setDetail(det); setAudiences(auds);
        setCatalogs(data.catalogs ?? {}); setRawPub(data.publication);
        setOriginal({ pub, det, auds: JSON.parse(JSON.stringify(auds)) });
      } catch (err) {
        setError(err?.message || t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    if (idProfile && idPublication) load();
  }, [idProfile, idPublication]);

  const handleFieldChange = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleDetailChange = (field, value) => {
    setDetail((prev) => {
      const next = { ...prev, [field]: value };
      if (value && EXCLUSIVE_KEYS.includes(field))
        EXCLUSIVE_KEYS.forEach((k) => { if (k !== field) next[k] = ""; });
      return next;
    });
  };

  const handleAddAudience = () => {
    if (!newArea) return;
    setAudiences((prev) => [
      ...prev,
      { id: null, id_professional_area: newArea, id_professional_career: newCareer || null,
        _delete: false, _new: true },
    ]);
    setNewArea(""); setNewCareer(""); setIsAddingAud(false);
  };

  const handleRemoveAudience = (index) =>
    setAudiences((prev) => prev.map((a, i) => (i === index ? { ...a, _delete: true } : a)));

  const buildResumen = () => {
    if (!original) return [];
    const changes = [];
    const FIELD_LABELS = {
      description:      t(`${e}.fields.description`),
      outstanding:      t(`${e}.fields.outstanding`),
      visibility:       t(`${e}.fields.visibility`),
      state:            t(`${e}.fields.state`),
      id_audience_type: t(`${e}.fields.id_audience_type`),
    };
    Object.entries(FIELD_LABELS).forEach(([key, label]) => {
      if (!sameValue(original.pub[key], formData[key])) {
        let val = formData[key];
        if (typeof val === "boolean") val = val ? t("adminEdicion.common.yes") : t("adminEdicion.common.no");
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
          : t(`${e}.detailNone`);
        changes.push({ label, value: val });
      }
    });
    const deleted = audiences.filter((a) => a._delete && !a._new);
    if (deleted.length > 0)
      changes.push({ label: t(`${e}.resumen.deletedAudiences`), value: `${deleted.length} ${t(`${e}.resumen.records`)}` });
    const added = audiences.filter((a) => a._new && !a._delete);
    if (added.length > 0)
      changes.push({ label: t(`${e}.resumen.addedAudiences`), value: `${added.length} ${t(`${e}.resumen.records`)}` });
    return changes;
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const payload = {
        description:      formData.description,
        outstanding:      formData.outstanding,
        visibility:       formData.visibility,
        state:            formData.state,
        id_audience_type: formData.id_audience_type ? Number(formData.id_audience_type) : null,
        detail: {
          id_publication_detail: detail.id_publication_detail,
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
          _delete: Boolean(a._delete),
        })),
      };
      const data = await updateAdminPublication(idProfile, idPublication, payload);
      const pub  = normalizePublication(data.publication);
      const det  = normalizeDetail(data.detail);
      const auds = (data.audiences ?? []).map((a) => ({ ...a, _delete: false, _new: false }));
      setFormData(pub); setDetail(det); setAudiences(auds);
      setCatalogs(data.catalogs ?? catalogs); setRawPub(data.publication);
      setOriginal({ pub, det, auds: JSON.parse(JSON.stringify(auds)) });
      setShowConfirm(false); onSaved?.(); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorSave`));
    } finally {
      setIsSaving(false);
    }
  };

  const visibleAudiences = audiences.filter((a) => !a._delete);

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal" style={{ maxWidth: 640 }}>

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Newspaper size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${e}.subtitle`)}{idPublication}</p>
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
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.outstanding}
                        onChange={(ev) => handleFieldChange("outstanding", ev.target.checked)} />
                      {t(`${e}.fields.outstanding`)}
                    </label>
                    <label className="edicion-modal__check">
                      <input type="checkbox" checked={formData.visibility}
                        onChange={(ev) => handleFieldChange("visibility", ev.target.checked)} />
                      {t(`${e}.fields.visibility`)}
                    </label>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.fields.description`)}</label>
                    <textarea className="edicion-modal__textarea" value={formData.description}
                      onChange={(ev) => handleFieldChange("description", ev.target.value)}
                      rows={3} maxLength={255} />
                    <span className="edicion-modal__char-count">
                      {formData.description?.length ?? 0} / 255
                    </span>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.fields.state`)}</label>
                    <select className="edicion-modal__input" value={formData.state}
                      onChange={(ev) => handleFieldChange("state", ev.target.value)}>
                      {STATE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.fields.id_audience_type`)}</label>
                    <select className="edicion-modal__input" value={formData.id_audience_type}
                      onChange={(ev) => handleFieldChange("id_audience_type", ev.target.value)}>
                      <option value="">{t(`${e}.audienceTypePh`)}</option>
                      {(catalogs.audience_types ?? []).map((a) => (
                        <option key={a.value} value={String(a.value)}>{a.name ?? a.code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field" style={{ flex: 1 }}>
                      <label className="edicion-modal__label">{t(`${e}.fields.created_at`)}</label>
                      <div className="edicion-modal__input edicion-modal__input--readonly">
                        {formatDate(rawPub?.created_at)}
                      </div>
                    </div>
                    <div className="edicion-modal__field" style={{ flex: 1 }}>
                      <label className="edicion-modal__label">{t(`${e}.fields.updated_at`)}</label>
                      <div className="edicion-modal__input edicion-modal__input--readonly">
                        {formatDate(rawPub?.updated_at)}
                      </div>
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  <div className="edicion-cv-section">
                    <div className="edicion-cv-section__header">
                      <Newspaper size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">{t(`${e}.detailSection`)}</h3>
                    </div>
                    <p className="edicion-modal__note" style={{ marginBottom: 4 }}>
                      {t(`${e}.detailNote`)}
                    </p>
                    <div className="edicion-modal__fields" style={{ gap: 10 }}>
                      {DETAIL_FIELDS_EDITABLE.map(({ key, label, catalogKey }) => {
                        const isActive     = Boolean(detail[key]);
                        const otherHasValue = EXCLUSIVE_KEYS.some((k) => k !== key && Boolean(detail[k]));
                        return (
                          <div className="edicion-modal__field" key={key}>
                            <label className={`edicion-modal__label${isActive ? " edicion-modal__label--active" : ""}`}>
                              {label}
                              {isActive && (
                                <span className="edicion-tabla__badge edicion-tabla__badge--state-public"
                                  style={{ marginLeft: 6, verticalAlign: "middle" }}>
                                  {t(`${e}.detailActive`)}
                                </span>
                              )}
                            </label>
                            <select
                              className={`edicion-modal__input${isActive ? " edicion-modal__input--detail-active" : ""}`}
                              value={detail[key]}
                              onChange={(ev) => handleDetailChange(key, ev.target.value)}
                              disabled={otherHasValue && !isActive}
                              style={otherHasValue && !isActive ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
                              <option value="">{t(`${e}.detailNone`)}</option>
                              {(catalogs[catalogKey] ?? []).map((item) => (
                                <option key={item.value} value={String(item.value)}>{item.label}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="edicion-modal__divider" />

                  <div className="edicion-cv-section">
                    <div className="edicion-cv-section__header">
                      <Newspaper size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">{t(`${e}.audienceSection`)}</h3>
                      {visibleAudiences.length > 0 && (
                        <span className="edicion-tabla__count">{visibleAudiences.length}</span>
                      )}
                      <button type="button"
                        className={`edicion-chip edicion-chip--sm${isAddingAud ? " edicion-chip--cancel" : ""}`}
                        style={{ marginLeft: "auto" }}
                        onClick={() => { setIsAddingAud((v) => !v); setNewArea(""); setNewCareer(""); }}>
                        {isAddingAud ? <X size={12} /> : <Plus size={12} />}
                        {isAddingAud ? t("adminEdicion.common.cancel") : t("adminEdicion.common.add")}
                      </button>
                    </div>

                    {isAddingAud && (
                      <div className="modal-add-career-form">
                        <div className="edicion-modal__field">
                          <label className="edicion-modal__label">{t(`${e}.areaRequired`)}</label>
                          <select className="edicion-modal__input" value={newArea}
                            onChange={(ev) => setNewArea(ev.target.value)} autoFocus>
                            <option value="">{t(`${e}.areaPh`)}</option>
                            {(catalogs.professional_areas ?? []).map((a) => (
                              <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="edicion-modal__field">
                          <label className="edicion-modal__label">
                            {t(`${e}.careerLabel`)}
                            <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>
                              {t(`${e}.careerOptional`)}
                            </span>
                          </label>
                          <select className="edicion-modal__input" value={newCareer}
                            onChange={(ev) => setNewCareer(ev.target.value)}>
                            <option value="">{t(`${e}.careerPh`)}</option>
                            {(catalogs.professional_careers ?? []).map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button type="button" className="edicion-modal__btn-save"
                            onClick={handleAddAudience} disabled={!newArea}
                            style={{ padding: "7px 16px", fontSize: 12 }}>
                            <Check size={13} /> {t("adminEdicion.common.confirm")}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="edicion-cv-section__items">
                      {visibleAudiences.length === 0 && !isAddingAud && (
                        <span className="edicion-cv-section__empty">{t(`${e}.audienceEmpty`)}</span>
                      )}
                      {audiences.map((aud, i) => {
                        if (aud._delete) return null;
                        const areaLabel   = labelFor(catalogs.professional_areas   ?? [], aud.id_professional_area);
                        const careerLabel = aud.id_professional_career
                          ? labelFor(catalogs.professional_careers ?? [], aud.id_professional_career)
                          : null;
                        return (
                          <div key={aud.id ?? `new-aud-${i}`} className="edicion-cv-item">
                            <span className="edicion-cv-item__id">
                              {areaLabel ?? `Área ${aud.id_professional_area}`}
                              {careerLabel && ` · ${careerLabel}`}
                            </span>
                            {aud._new && (
                              <span className="modal-career-badge-new">{t(`${e}.badgeNew`)}</span>
                            )}
                            <button type="button" className="edicion-cv-item__delete"
                              onClick={() => handleRemoveAudience(i)}>
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