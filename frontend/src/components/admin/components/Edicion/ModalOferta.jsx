import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase, Calendar, DollarSign, Eye, EyeOff, Image,
  Loader2, MapPin, Plus, Save, Trash2, Upload, Users, X,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminOffer,
  updateAdminOffer,
} from "../../../../services/adminProfileTableService";

const OFFER_STATES = ["open", "visible", "closed", "removed", "private"];
const CURRENCIES   = ["USD", "BOB", "EUR"];

function normalizeOffer(raw) {
  if (!raw) return null;
  return {
    id_offer:         raw.id_offer         ?? null,
    title:            raw.title            ?? "",
    description:      raw.description      ?? "",
    type:             raw.type             ?? "",
    modalidad:        raw.modalidad        ?? "",
    ubicacion:        raw.ubicacion        ?? "",
    nivel:            raw.nivel            ?? "",
    area:             raw.area             ?? "",
    state:            raw.state            ?? "open",
    quota_quantity:   raw.quota_quantity   ?? "",
    salary_min:       raw.salary_min       ?? "",
    salary_max:       raw.salary_max       ?? "",
    currency:         raw.currency         ?? "USD",
    show_salary:      raw.show_salary      ?? true,
    closed_at:        raw.closed_at ? raw.closed_at.slice(0, 10) : "",
    banner_url:       raw.banner_url       ?? "",
    id_audience_type: raw.id_audience_type ?? null,
  };
}

export default function ModalOferta({ idProfile, idOffer, onClose, onSaved }) {
  const { t } = useTranslation();
  const e = "adminEdicion.oferta";

  const FIELD_LABELS = {
    title:            t(`${e}.fields.title`),
    description:      t(`${e}.fields.description`),
    type:             t(`${e}.fields.type`),
    modalidad:        t(`${e}.fields.modalidad`),
    ubicacion:        t(`${e}.fields.ubicacion`),
    nivel:            t(`${e}.fields.nivel`),
    area:             t(`${e}.fields.area`),
    state:            t(`${e}.fields.state`),
    quota_quantity:   t(`${e}.fields.quota`),
    salary_min:       `${t(`${e}.fields.salary`)} ${t(`${e}.fields.salaryMin`)}`,
    salary_max:       `${t(`${e}.fields.salary`)} ${t(`${e}.fields.salaryMax`)}`,
    currency:         t(`${e}.fields.currency`),
    show_salary:      t(`${e}.fields.showSalary`),
    closed_at:        t(`${e}.fields.closedAt`),
    banner_url:       t(`${e}.fields.banner`),
    id_audience_type: t(`${e}.fields.id_audience_type`),
  };

  const COMPARABLE_FIELDS = Object.keys(FIELD_LABELS);

  const formatValue = (field, value, catalogs) => {
    if (value === null || value === undefined || value === "") return "—";
    if (field === "show_salary")
      return value ? t(`${e}.showSalaryOn`) : t(`${e}.showSalaryOff`);
    if (field === "id_audience_type") {
      const aud = catalogs?.audience_types?.find((a) => String(a.value) === String(value));
      return aud ? `${aud.code}${aud.name ? ` — ${aud.name}` : ""}` : String(value);
    }
    return String(value);
  };

  const buildResumenFn = (original, current, details, bannerFile, catalogs) => {
    const resumen = [];
    for (const field of COMPARABLE_FIELDS) {
      const oldVal = String(original?.[field] ?? "");
      const newVal = String(current?.[field]  ?? "");
      if (oldVal !== newVal)
        resumen.push({
          label: FIELD_LABELS[field],
          value: `${formatValue(field, original?.[field], catalogs)} → ${formatValue(field, current?.[field], catalogs)}`,
        });
    }
    if (bannerFile)
      resumen.push({
        label: t(`${e}.fields.banner`),
        value: `${t(`${e}.resumen.bannerNew`)}: ${bannerFile.name} (${(bannerFile.size / 1024).toFixed(0)} KB)`,
      });
    const addedSkills    = details.filter((d) => d._isNew && d.id_skill     && !d._delete).map((d) => d.skill_name     || `Skill #${d.id_skill}`);
    const removedSkills  = details.filter((d) => d._delete && d.id_skill    && !d._isNew).map((d) => d.skill_name     || `Skill #${d.id_skill}`);
    const addedJT        = details.filter((d) => d._isNew && d.id_job_title && !d._delete).map((d) => d.job_title_name || `Puesto #${d.id_job_title}`);
    const removedJT      = details.filter((d) => d._delete && d.id_job_title && !d._isNew).map((d) => d.job_title_name || `Puesto #${d.id_job_title}`);
    if (addedSkills.length)   resumen.push({ label: t(`${e}.resumen.addedSkills`),    value: addedSkills.join(", ")   });
    if (removedSkills.length) resumen.push({ label: t(`${e}.resumen.removedSkills`),  value: removedSkills.join(", ") });
    if (addedJT.length)       resumen.push({ label: t(`${e}.resumen.addedJobTitles`), value: addedJT.join(", ")       });
    if (removedJT.length)     resumen.push({ label: t(`${e}.resumen.removedJobTitles`), value: removedJT.join(", ")   });
    return resumen;
  };

  const [formData,     setFormData]     = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [details,      setDetails]      = useState([]);
  const [catalogs,     setCatalogs]     = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [resumen,      setResumen]      = useState([]);

  const bannerInputRef = useRef(null);
  const [bannerFile,    setBannerFile]    = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [newSkillId,    setNewSkillId]    = useState("");
  const [newJobTitleId, setNewJobTitleId] = useState("");

  useEffect(() => {
    if (!idOffer) return;
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const data       = await getAdminOffer(idProfile, idOffer);
        const normalized = normalizeOffer(data?.offer);
        setFormData(normalized); setOriginalData(normalized);
        setDetails(Array.isArray(data?.details) ? data.details : []);
        setCatalogs(data?.catalogs ?? null);
      } catch (err) {
        setError(err?.message || t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, idOffer]);

  useEffect(() => {
    return () => { if (bannerPreview) URL.revokeObjectURL(bannerPreview); };
  }, [bannerPreview]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleOpenConfirm = () => {
    setConfirmError("");
    setResumen(buildResumenFn(originalData, formData, details, bannerFile, catalogs));
    setShowConfirm(true);
  };

  const handleBannerFileChange = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file); setBannerPreview(URL.createObjectURL(file));
    handleChange("banner_url", "");
  };

  const handleRemoveBanner = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null); setBannerPreview(null);
    handleChange("banner_url", "");
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleAddSkill = () => {
    if (!newSkillId) return;
    const skillCat = catalogs?.skills?.find((s) => String(s.value) === String(newSkillId));
    if (!skillCat) return;
    if (details.some((d) => !d._delete && String(d.id_skill) === String(newSkillId))) {
      setNewSkillId(""); return;
    }
    setDetails((prev) => [...prev, {
      id_offer_detail: null, id_skill: Number(newSkillId),
      skill_name: skillCat.label, id_job_title: null, job_title_name: null, _isNew: true,
    }]);
    setNewSkillId("");
  };

  const handleAddJobTitle = () => {
    if (!newJobTitleId) return;
    const jtCat = catalogs?.job_titles?.find((j) => String(j.value) === String(newJobTitleId));
    if (!jtCat) return;
    if (details.some((d) => !d._delete && String(d.id_job_title) === String(newJobTitleId))) {
      setNewJobTitleId(""); return;
    }
    setDetails((prev) => [...prev, {
      id_offer_detail: null, id_skill: null, skill_name: null,
      id_job_title: Number(newJobTitleId), job_title_name: jtCat.label, _isNew: true,
    }]);
    setNewJobTitleId("");
  };

  const handleRemoveDetail = (index) => {
    setDetails((prev) => {
      const updated = [...prev];
      const item    = updated[index];
      if (item._isNew) updated.splice(index, 1);
      else updated[index] = { ...item, _delete: true };
      return updated;
    });
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const payload = {
        title: formData.title, description: formData.description,
        type: formData.type || null, modalidad: formData.modalidad || null,
        ubicacion: formData.ubicacion || null, nivel: formData.nivel || null,
        area: formData.area || null, state: formData.state,
        quota_quantity: formData.quota_quantity !== "" ? Number(formData.quota_quantity) : null,
        salary_min: formData.salary_min !== "" ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max !== "" ? Number(formData.salary_max) : null,
        currency: formData.currency, show_salary: formData.show_salary,
        closed_at: formData.closed_at || null, banner_url: formData.banner_url || null,
        id_audience_type: formData.id_audience_type || null,
        details: details.filter((d) => d._isNew || d._delete).map((d) => ({
          id_offer_detail: d.id_offer_detail,
          id_skill: d.id_skill || null, id_job_title: d.id_job_title || null,
          _delete: d._delete || false,
        })),
      };
      if (bannerFile) {
        const form = new FormData();
        form.append("_method", "PUT");
        form.append("banner", bannerFile);
        Object.entries(payload).forEach(([key, value]) => {
          if (value === null || value === undefined) return;
          if (key === "details") form.append(key, JSON.stringify(value));
          else if (typeof value === "boolean") form.append(key, value ? "1" : "0");
          else form.append(key, String(value));
        });
        await updateAdminOffer(idProfile, idOffer, form, true);
      } else {
        await updateAdminOffer(idProfile, idOffer, payload, false);
      }
      setShowConfirm(false); onSaved?.(); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally {
      setIsSaving(false);
    }
  };

  const visibleDetails    = details.filter((d) => !d._delete);
  const selectedAudience  = catalogs?.audience_types?.find(
    (a) => String(a.value) === String(formData?.id_audience_type)
  );

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && onClose?.()}>
          <div className="edicion-modal" style={{ maxWidth: 700 }}>

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Briefcase size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  {formData?.id_offer && (
                    <p className="edicion-modal__subtitle">{t(`${e}.subtitle`)}{formData.id_offer}</p>
                  )}
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t("adminEdicion.common.close")}>
                <X size={16} />
              </button>
            </div>

            <div className="edicion-modal__body">
              {isLoading ? (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${e}.loadingMsg`)}</span>
                </div>
              ) : error && !formData ? (
                <div className="edicion-modal__error">{error}</div>
              ) : formData ? (
                <div className="edicion-modal__fields">
                  {error && <div className="edicion-modal__error">{error}</div>}

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.fields.title`)}</label>
                    <input className="edicion-modal__input" value={formData.title}
                      onChange={(ev) => handleChange("title", ev.target.value)}
                      placeholder={t(`${e}.fields.title`)} />
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.fields.description`)}</label>
                    <textarea className="edicion-modal__textarea" rows={3}
                      value={formData.description}
                      onChange={(ev) => handleChange("description", ev.target.value)}
                      placeholder={t(`${e}.fields.description`)} />
                  </div>

                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.type`)}</label>
                      <input className="edicion-modal__input" value={formData.type}
                        onChange={(ev) => handleChange("type", ev.target.value)}
                        placeholder={t(`${e}.fields.typePh`)} />
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.modalidad`)}</label>
                      <input className="edicion-modal__input" value={formData.modalidad}
                        onChange={(ev) => handleChange("modalidad", ev.target.value)}
                        placeholder={t(`${e}.fields.modalidadPh`)} />
                    </div>
                  </div>

                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.area`)}</label>
                      <input className="edicion-modal__input" value={formData.area}
                        onChange={(ev) => handleChange("area", ev.target.value)}
                        placeholder={t(`${e}.fields.areaPh`)} />
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.nivel`)}</label>
                      <input className="edicion-modal__input" value={formData.nivel}
                        onChange={(ev) => handleChange("nivel", ev.target.value)}
                        placeholder={t(`${e}.fields.nivelPh`)} />
                    </div>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <MapPin size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${e}.fields.ubicacion`)}
                    </label>
                    <input className="edicion-modal__input" value={formData.ubicacion}
                      onChange={(ev) => handleChange("ubicacion", ev.target.value)}
                      placeholder={t(`${e}.fields.ubicacionPh`)} />
                  </div>

                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.state`)}</label>
                      <select className="edicion-modal__input" value={formData.state}
                        onChange={(ev) => handleChange("state", ev.target.value)}>
                        {OFFER_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                        {t(`${e}.fields.quota`)}
                      </label>
                      <input className="edicion-modal__input" type="number" min={0}
                        value={formData.quota_quantity}
                        onChange={(ev) => handleChange("quota_quantity", ev.target.value)}
                        placeholder={t(`${e}.fields.quotaPh`)} />
                    </div>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <DollarSign size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${e}.fields.salary`)}
                    </label>
                    <div className="edicion-modal__row">
                      <input className="edicion-modal__input" type="number" min={0}
                        value={formData.salary_min}
                        onChange={(ev) => handleChange("salary_min", ev.target.value)}
                        placeholder={t(`${e}.fields.salaryMin`)} />
                      <input className="edicion-modal__input" type="number" min={0}
                        value={formData.salary_max}
                        onChange={(ev) => handleChange("salary_max", ev.target.value)}
                        placeholder={t(`${e}.fields.salaryMax`)} />
                    </div>
                  </div>

                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.currency`)}</label>
                      <select className="edicion-modal__input" value={formData.currency}
                        onChange={(ev) => handleChange("currency", ev.target.value)}>
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.showSalary`)}</label>
                      <label className="edicion-modal__check">
                        <input type="checkbox" checked={Boolean(formData.show_salary)}
                          onChange={(ev) => handleChange("show_salary", ev.target.checked)} />
                        {formData.show_salary
                          ? <><Eye size={13} /> {t(`${e}.showSalaryOn`)}</>
                          : <><EyeOff size={13} /> {t(`${e}.showSalaryOff`)}</>}
                      </label>
                    </div>
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Calendar size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${e}.fields.closedAt`)}
                    </label>
                    <input className="edicion-modal__input" type="date"
                      value={formData.closed_at}
                      onChange={(ev) => handleChange("closed_at", ev.target.value)} />
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${e}.fields.id_audience_type`)}
                    </label>
                    <select className="edicion-modal__input"
                      value={formData.id_audience_type ?? ""}
                      onChange={(ev) =>
                        handleChange("id_audience_type",
                          ev.target.value !== "" ? Number(ev.target.value) : null)
                      }>
                      <option value="">{t(`${e}.fields.audiencePh`)}</option>
                      {(catalogs?.audience_types ?? []).map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.code}{a.name ? ` — ${a.name}` : ""}
                        </option>
                      ))}
                    </select>
                    {selectedAudience?.name && (
                      <p className="edicion-modal__hint">{selectedAudience.name}</p>
                    )}
                  </div>

                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Image size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${e}.fields.banner`)}
                    </label>
                    {(bannerPreview || formData.banner_url) && (
                      <div className="edicion-modal__banner-preview">
                        <img src={bannerPreview || formData.banner_url} alt="Banner preview"
                          style={{ width: "100%", maxHeight: 160, objectFit: "cover",
                            borderRadius: 8, marginBottom: 8,
                            border: "1px solid var(--color-border, #e5e7eb)" }} />
                        <button type="button" className="edicion-modal__btn-cancel"
                          style={{ marginBottom: 6 }} onClick={handleRemoveBanner}>
                          <Trash2 size={12} /> {t(`${e}.bannerRemove`)}
                        </button>
                      </div>
                    )}
                    <input ref={bannerInputRef} type="file" accept="image/*"
                      style={{ display: "none" }} onChange={handleBannerFileChange} />
                    <button type="button" className="edicion-modal__btn-cancel"
                      onClick={() => bannerInputRef.current?.click()}>
                      <Upload size={12} />
                      {bannerPreview || formData.banner_url
                        ? t(`${e}.bannerChange`)
                        : t(`${e}.bannerSelect`)}
                    </button>
                    {bannerFile && (
                      <p className="edicion-modal__hint" style={{ marginTop: 4 }}>
                        {bannerFile.name} ({(bannerFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.skillsLabel`)}</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {visibleDetails.filter((d) => d.id_skill).map((d) => {
                        const realIdx = details.indexOf(d);
                        return (
                          <span key={d.id_offer_detail ?? `new-skill-${realIdx}`}
                            className="edicion-cv-item"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {d.skill_name || `Skill #${d.id_skill}`}
                            <button type="button" onClick={() => handleRemoveDetail(realIdx)}
                              style={{ background: "none", border: "none", cursor: "pointer",
                                padding: 0, display: "flex", alignItems: "center",
                                color: "inherit", opacity: 0.7 }}
                              aria-label="x">
                              <X size={11} />
                            </button>
                          </span>
                        );
                      })}
                      {visibleDetails.filter((d) => d.id_skill).length === 0 && (
                        <span style={{ fontSize: 12, opacity: 0.5 }}>{t(`${e}.skillsEmpty`)}</span>
                      )}
                    </div>
                    {catalogs?.skills?.length > 0 && (
                      <div className="edicion-modal__row" style={{ alignItems: "center" }}>
                        <select className="edicion-modal__input" value={newSkillId}
                          onChange={(ev) => setNewSkillId(ev.target.value)}>
                          <option value="">{t(`${e}.addSkillPh`)}</option>
                          {catalogs.skills.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button type="button" className="edicion-modal__btn-save"
                          style={{ flexShrink: 0 }} onClick={handleAddSkill} disabled={!newSkillId}>
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Puestos */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${e}.jobTitlesLabel`)}</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {visibleDetails.filter((d) => d.id_job_title).map((d) => {
                        const realIdx = details.indexOf(d);
                        return (
                          <span key={d.id_offer_detail ?? `new-jt-${realIdx}`}
                            className="edicion-cv-item"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {d.job_title_name || `Puesto #${d.id_job_title}`}
                            <button type="button" onClick={() => handleRemoveDetail(realIdx)}
                              style={{ background: "none", border: "none", cursor: "pointer",
                                padding: 0, display: "flex", alignItems: "center",
                                color: "inherit", opacity: 0.7 }}
                              aria-label="x">
                              <X size={11} />
                            </button>
                          </span>
                        );
                      })}
                      {visibleDetails.filter((d) => d.id_job_title).length === 0 && (
                        <span style={{ fontSize: 12, opacity: 0.5 }}>{t(`${e}.jobTitlesEmpty`)}</span>
                      )}
                    </div>
                    {catalogs?.job_titles?.length > 0 && (
                      <div className="edicion-modal__row" style={{ alignItems: "center" }}>
                        <select className="edicion-modal__input" value={newJobTitleId}
                          onChange={(ev) => setNewJobTitleId(ev.target.value)}>
                          <option value="">{t(`${e}.addJobTitlePh`)}</option>
                          {catalogs.job_titles.map((j) => (
                            <option key={j.value} value={j.value}>{j.label}</option>
                          ))}
                        </select>
                        <button type="button" className="edicion-modal__btn-save"
                          style={{ flexShrink: 0 }} onClick={handleAddJobTitle}
                          disabled={!newJobTitleId}>
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {!isLoading && formData && (
              <div className="edicion-modal__footer">
                <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                  <X size={13} /> {t("adminEdicion.common.cancel")}
                </button>
                <button className="edicion-modal__btn-save" onClick={handleOpenConfirm}
                  disabled={isSaving || Boolean(error)}>
                  <Save size={13} /> {t("adminEdicion.common.save")}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm} isBusy={isSaving}
        entidad={t(`${e}.confirmEntity`)} accion="actualizar"
        resumen={resumen} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}