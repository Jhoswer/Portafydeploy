// src/components/admin/components/Creacion/CreacionFormOferta.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase, Calendar, DollarSign, Eye, EyeOff,
  Image, Loader2, MapPin, Plus, Trash2, Upload, Users, X,
} from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import { crearOferta, getCatalogosOferta } from "../../../../services/adminCreacionService";

const OFFER_STATES = ["open", "visible", "closed", "removed", "private"];
const CURRENCIES   = ["USD", "BOB", "EUR"];

const EMPTY_FORM = {
  title: "", description: "", type: "", modalidad: "", ubicacion: "",
  nivel: "", area: "", state: "private", quota_quantity: "",
  salary_min: "", salary_max: "", currency: "USD", show_salary: false,
  closed_at: "", id_audience_type: null,
};

export default function CreacionFormOferta({ idProfile, onClose, onSaved }) {
  const { t } = useTranslation();
  const o = "adminCreacion.oferta";

  // ── Opciones con t() ────────────────────────────────────────────
  const TYPE_OFFER_OPTIONS = [
    { value: "",          label: t(`${o}.types.empty`)     },
    { value: "full-time", label: t(`${o}.types.full-time`) },
  ];
  const MODALIDAD_OPTIONS = [
    { value: "",       label: t(`${o}.modalidades.empty`)  },
    { value: "Remoto", label: t(`${o}.modalidades.Remoto`) },
  ];
  const NIVEL_OPTIONS = [
    { value: "",                label: t(`${o}.niveles.empty`)           },
    { value: "sin experiencia", label: t(`${o}.niveles.sin experiencia`) },
    { value: "junior",          label: t(`${o}.niveles.junior`)          },
    { value: "mid",             label: t(`${o}.niveles.mid`)             },
    { value: "senior",          label: t(`${o}.niveles.senior`)          },
  ];

  // ── buildResumen ────────────────────────────────────────────────
  function buildResumen(form, catalogs, bannerFile, audienceProfessional) {
    const entries = [];
    const add = (label, value) => {
      if (value !== "" && value !== null && value !== undefined)
        entries.push({ label, value: String(value) });
    };

    add(t(`${o}.resumen.title`),       form.title);
    add(t(`${o}.resumen.description`), form.description);

    const typeLabel = TYPE_OFFER_OPTIONS.find((opt) => opt.value === form.type)?.label;
    if (typeLabel && form.type) add(t(`${o}.resumen.type`), typeLabel);

    const modalLabel = MODALIDAD_OPTIONS.find((opt) => opt.value === form.modalidad)?.label;
    if (modalLabel && form.modalidad) add(t(`${o}.resumen.modalidad`), modalLabel);

    add(t(`${o}.resumen.area`), form.area);

    const nivelLabel = NIVEL_OPTIONS.find((opt) => opt.value === form.nivel)?.label;
    if (nivelLabel && form.nivel) add(t(`${o}.resumen.nivel`), nivelLabel);

    add(t(`${o}.resumen.ubicacion`),  form.ubicacion);
    add(t(`${o}.resumen.state`),      form.state);
    add(t(`${o}.resumen.quota`),      form.quota_quantity);
    add(t(`${o}.resumen.salaryMin`),  form.salary_min);
    add(t(`${o}.resumen.salaryMax`),  form.salary_max);
    add(t(`${o}.resumen.currency`),   form.currency);
    entries.push({
      label: t(`${o}.resumen.showSalary`),
      value: form.show_salary ? t(`${o}.resumen.yes`) : t(`${o}.resumen.no`),
    });
    add(t(`${o}.resumen.closedAt`), form.closed_at);

    if (form.id_audience_type) {
      const aud = catalogs?.audience_types?.find(
        (a) => String(a.value) === String(form.id_audience_type)
      );
      add(t(`${o}.resumen.audience`), aud?.label ?? `ID ${form.id_audience_type}`);
    }

    audienceProfessional.forEach((entry, i) => {
      const areaName =
        catalogs?.professional_areas?.find(
          (a) => String(a.value) === String(entry.id_professional_area)
        )?.label ?? `Área #${entry.id_professional_area}`;
      const careerName = entry.id_professional_career
        ? catalogs?.professional_careers?.find(
            (c) => String(c.value) === String(entry.id_professional_career)
          )?.label ?? `Carrera #${entry.id_professional_career}`
        : t(`${o}.allCareers`);
      entries.push({ label: `Audiencia Prof. ${i + 1}`, value: `${areaName} › ${careerName}` });
    });

    if (bannerFile) {
      entries.push({
        label: t(`${o}.resumen.banner`),
        value: `${bannerFile.name} (${(bannerFile.size / 1024).toFixed(0)} KB)`,
      });
    }

    return entries;
  }

  // ── State ───────────────────────────────────────────────────────
  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [catalogs,     setCatalogs]     = useState(null);
  const [jobTitleIds,  setJobTitleIds]  = useState([]);
  const [newJtId,      setNewJtId]      = useState("");
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const [audienceProfessional, setAudienceProfessional] = useState([]);
  const [newAreaId,   setNewAreaId]   = useState("");
  const [newCareerId, setNewCareerId] = useState("");

  const bannerInputRef            = useRef(null);
  const [bannerFile,    setBannerFile]    = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // ── Effects ─────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getCatalogosOferta();
        setCatalogs(data);
      } catch {
        setError(t(`${o}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(
    () => () => { if (bannerPreview) URL.revokeObjectURL(bannerPreview); },
    [bannerPreview]
  );

  // ── Handlers ────────────────────────────────────────────────────
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleRemoveBanner = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleAddJobTitle = () => {
    if (!newJtId || jobTitleIds.includes(newJtId)) { setNewJtId(""); return; }
    setJobTitleIds((prev) => [...prev, newJtId]);
    setNewJtId("");
  };

  const handleAreaChange = (areaId) => {
    setNewAreaId(areaId);
    setNewCareerId("");
  };

  const handleAddAudienceProfessional = () => {
    if (!newAreaId) return;
    const isDuplicate = audienceProfessional.some(
      (e) =>
        String(e.id_professional_area) === String(newAreaId) &&
        String(e.id_professional_career ?? "") === String(newCareerId ?? "")
    );
    if (isDuplicate) { setNewAreaId(""); setNewCareerId(""); return; }
    setAudienceProfessional((prev) => [
      ...prev,
      {
        id_professional_area:   Number(newAreaId),
        id_professional_career: newCareerId ? Number(newCareerId) : null,
      },
    ]);
    setNewAreaId("");
    setNewCareerId("");
  };

  const handleRemoveAudienceProfessional = (index) =>
    setAudienceProfessional((prev) => prev.filter((_, i) => i !== index));

  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const details = [
        ...jobTitleIds.map((id) => ({ id_skill: null, id_job_title: Number(id) })),
      ];
      const payload = {
        title:                 formData.title            || null,
        description:           formData.description      || null,
        type:                  formData.type             || null,
        modalidad:             formData.modalidad        || null,
        nivel:                 formData.nivel            || null,
        ubicacion:             formData.ubicacion        || null,
        area:                  formData.area             || null,
        state:                 formData.state,
        quota_quantity:        formData.quota_quantity !== "" ? Number(formData.quota_quantity) : null,
        salary_min:            formData.salary_min !== "" ? Number(formData.salary_min) : null,
        salary_max:            formData.salary_max !== "" ? Number(formData.salary_max) : null,
        currency:              formData.currency,
        show_salary:           formData.show_salary,
        closed_at:             formData.closed_at        || null,
        id_audience_type:      formData.id_audience_type || null,
        details,
        audience_professional: audienceProfessional,
      };

      if (bannerFile) {
        const form = new FormData();
        form.append("banner", bannerFile);
        Object.entries(payload).forEach(([key, val]) => {
          if (val === null || val === undefined) return;
          if (key === "details" || key === "audience_professional") {
            form.append(key, JSON.stringify(val));
            return;
          }
          form.append(key, typeof val === "boolean" ? (val ? "1" : "0") : String(val));
        });
        await crearOferta(idProfile, form, true);
      } else {
        await crearOferta(idProfile, payload, false);
      }

      setShowConfirm(false);
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("[CreacionFormOferta] Error al crear:", err);
      setConfirmError(err?.message || t(`${o}.errorCreate`));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Datos derivados ─────────────────────────────────────────────
  const jtOptions       = catalogs?.job_titles           ?? [];
  const audienceOptions = catalogs?.audience_types       ?? [];
  const areaOptions     = catalogs?.professional_areas   ?? [];
  const careerOptions   = catalogs?.professional_careers ?? [];

  const filteredCareers = newAreaId
    ? careerOptions.filter((c) => String(c.area_id) === String(newAreaId))
    : [];

  const selectedJtNames = jobTitleIds.map(
    (id) => jtOptions.find((j) => String(j.value) === id)?.label ?? `#${id}`
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal" style={{ maxWidth: 700 }}>

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Briefcase size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${o}.headerTitle`)}</h2>
                  <p className="edicion-modal__subtitle">{t(`${o}.headerSubtitle`)}{idProfile}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t(`${o}.closeLabel`)}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              {isLoading ? (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${o}.loading`)}</span>
                </div>
              ) : (
                <div className="edicion-modal__fields">
                  {error && <div className="edicion-modal__error">{error}</div>}

                  {/* Título */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${o}.fieldTitle`)}</label>
                    <input className="edicion-modal__input" value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder={t(`${o}.titlePh`)} />
                  </div>

                  {/* Descripción */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">{t(`${o}.fieldDesc`)}</label>
                    <textarea className="edicion-modal__textarea" rows={3}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder={t(`${o}.descPh`)} />
                  </div>

                  {/* Tipo + Modalidad */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldType`)}</label>
                      <select className="edicion-modal__input" value={formData.type}
                        onChange={(e) => handleChange("type", e.target.value)}>
                        {TYPE_OFFER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldModalidad`)}</label>
                      <select className="edicion-modal__input" value={formData.modalidad}
                        onChange={(e) => handleChange("modalidad", e.target.value)}>
                        {MODALIDAD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Área + Nivel */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldArea`)}</label>
                      <input className="edicion-modal__input" value={formData.area}
                        onChange={(e) => handleChange("area", e.target.value)}
                        placeholder={t(`${o}.areaPh`)} />
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldNivel`)}</label>
                      <select className="edicion-modal__input" value={formData.nivel}
                        onChange={(e) => handleChange("nivel", e.target.value)}>
                        {NIVEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <MapPin size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${o}.fieldUbicacion`)}
                    </label>
                    <input className="edicion-modal__input" value={formData.ubicacion}
                      onChange={(e) => handleChange("ubicacion", e.target.value)}
                      placeholder={t(`${o}.ubicacionPh`)} />
                  </div>

                  {/* Estado + Cupos */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldState`)}</label>
                      <select className="edicion-modal__input" value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}>
                        {OFFER_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                        {t(`${o}.fieldQuota`)}
                      </label>
                      <input className="edicion-modal__input" type="number" min={0}
                        value={formData.quota_quantity}
                        onChange={(e) => handleChange("quota_quantity", e.target.value)}
                        placeholder={t(`${o}.quotaPh`)} />
                    </div>
                  </div>

                  {/* Salario */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <DollarSign size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${o}.fieldSalary`)}
                    </label>
                    <div className="edicion-modal__row">
                      <input className="edicion-modal__input" type="number" min={0}
                        value={formData.salary_min}
                        onChange={(e) => handleChange("salary_min", e.target.value)}
                        placeholder={t(`${o}.salaryMin`)} />
                      <input className="edicion-modal__input" type="number" min={0}
                        value={formData.salary_max}
                        onChange={(e) => handleChange("salary_max", e.target.value)}
                        placeholder={t(`${o}.salaryMax`)} />
                    </div>
                  </div>

                  {/* Moneda + Mostrar salario */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldCurrency`)}</label>
                      <select className="edicion-modal__input" value={formData.currency}
                        onChange={(e) => handleChange("currency", e.target.value)}>
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldShowSalary`)}</label>
                      <label className="edicion-modal__check">
                        <input type="checkbox" checked={Boolean(formData.show_salary)}
                          onChange={(e) => handleChange("show_salary", e.target.checked)} />
                        {formData.show_salary
                          ? <><Eye size={13} /> {t(`${o}.salaryVisible`)}</>
                          : <><EyeOff size={13} /> {t(`${o}.salaryHidden`)}</>}
                      </label>
                    </div>
                  </div>

                  {/* Fecha de cierre */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Calendar size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${o}.fieldClosedAt`)}
                    </label>
                    <input className="edicion-modal__input" type="date"
                      value={formData.closed_at}
                      onChange={(e) => handleChange("closed_at", e.target.value)} />
                  </div>

                  {/* Alcance */}
                  {audienceOptions.length > 0 && (
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                        {t(`${o}.fieldAudience`)}
                      </label>
                      <select className="edicion-modal__input"
                        value={formData.id_audience_type ?? ""}
                        onChange={(e) =>
                          handleChange("id_audience_type",
                            e.target.value !== "" ? Number(e.target.value) : null)
                        }>
                        <option value="">{t(`${o}.audiencePh`)}</option>
                        {audienceOptions.map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Audiencia Profesional */}
                  {areaOptions.length > 0 && (
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                        {t(`${o}.fieldAudienceProf`)}
                      </label>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                        {audienceProfessional.length === 0 && (
                          <span style={{ fontSize: 12, opacity: 0.5 }}>
                            {t(`${o}.audienceProfEmpty`)}
                          </span>
                        )}
                        {audienceProfessional.map((entry, i) => {
                          const areaName =
                            areaOptions.find(
                              (a) => String(a.value) === String(entry.id_professional_area)
                            )?.label ?? `Área #${entry.id_professional_area}`;
                          const careerName = entry.id_professional_career
                            ? careerOptions.find(
                                (c) => String(c.value) === String(entry.id_professional_career)
                              )?.label ?? `Carrera #${entry.id_professional_career}`
                            : t(`${o}.allCareers`);
                          return (
                            <span key={i} className="edicion-cv-item"
                              style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                              <strong style={{ fontWeight: 600 }}>{areaName}</strong>
                              <span style={{ opacity: 0.5 }}>›</span>
                              <span>{careerName}</span>
                              <button type="button"
                                onClick={() => handleRemoveAudienceProfessional(i)}
                                style={{ marginLeft: "auto", background: "none", border: "none",
                                  cursor: "pointer", padding: 0, display: "flex",
                                  alignItems: "center", color: "inherit", opacity: 0.6 }}>
                                <X size={11} />
                              </button>
                            </span>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <select className="edicion-modal__input" value={newAreaId}
                          onChange={(e) => handleAreaChange(e.target.value)}>
                          <option value="">{t(`${o}.areaPh2`)}</option>
                          {areaOptions.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                          ))}
                        </select>

                        <select className="edicion-modal__input" value={newCareerId}
                          onChange={(e) => setNewCareerId(e.target.value)}
                          disabled={!newAreaId}>
                          <option value="">
                            {newAreaId ? t(`${o}.careerAll`) : t(`${o}.careerAreaFirst`)}
                          </option>
                          {filteredCareers.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>

                        <button type="button" className="edicion-modal__btn-save"
                          style={{ alignSelf: "flex-start" }}
                          onClick={handleAddAudienceProfessional}
                          disabled={!newAreaId}>
                          <Plus size={13} /> {t(`${o}.btnAddAudience`)}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Banner */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Image size={11} style={{ display: "inline", marginRight: 4 }} />
                      {t(`${o}.fieldBanner`)}
                    </label>
                    {bannerPreview && (
                      <div className="edicion-modal__banner-preview" style={{ marginBottom: 8 }}>
                        <img src={bannerPreview} alt="Preview"
                          style={{ width: "100%", maxHeight: 160, objectFit: "cover",
                            borderRadius: 8, marginBottom: 6,
                            border: "1px solid var(--color-border, #e5e7eb)" }} />
                        <button type="button" className="edicion-modal__btn-cancel"
                          onClick={handleRemoveBanner}>
                          <Trash2 size={12} /> {t(`${o}.bannerRemove`)}
                        </button>
                      </div>
                    )}
                    <input ref={bannerInputRef} type="file" accept="image/*"
                      style={{ display: "none" }} onChange={handleBannerChange} />
                    <button type="button" className="edicion-modal__btn-cancel"
                      onClick={() => bannerInputRef.current?.click()}>
                      <Upload size={12} />
                      {bannerPreview ? t(`${o}.bannerChange`) : t(`${o}.bannerSelect`)}
                    </button>
                    {bannerFile && (
                      <p className="edicion-modal__hint" style={{ marginTop: 4 }}>
                        {bannerFile.name} ({(bannerFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>

                  {/* Puestos */}
                  {jtOptions.length > 0 && (
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${o}.fieldPuestos`)}</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {selectedJtNames.map((name, i) => (
                          <span key={i} className="edicion-cv-item"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {name}
                            <button type="button"
                              onClick={() => setJobTitleIds((prev) => prev.filter((_, j) => j !== i))}
                              style={{ background: "none", border: "none", cursor: "pointer",
                                padding: 0, display: "flex", alignItems: "center",
                                color: "inherit", opacity: 0.7 }}>
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                        {selectedJtNames.length === 0 && (
                          <span style={{ fontSize: 12, opacity: 0.5 }}>
                            {t(`${o}.puestosEmpty`)}
                          </span>
                        )}
                      </div>
                      <div className="edicion-modal__row" style={{ alignItems: "center" }}>
                        <select className="edicion-modal__input" value={newJtId}
                          onChange={(e) => setNewJtId(e.target.value)}>
                          <option value="">{t(`${o}.puestosPh`)}</option>
                          {jtOptions
                            .filter((j) => !jobTitleIds.includes(String(j.value)))
                            .map((j) => (
                              <option key={j.value} value={j.value}>{j.label}</option>
                            ))}
                        </select>
                        <button type="button" className="edicion-modal__btn-save"
                          style={{ flexShrink: 0 }} onClick={handleAddJobTitle} disabled={!newJtId}>
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isLoading && (
              <div className="edicion-modal__footer">
                <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                  <X size={13} /> {t(`${o}.btnCancel`)}
                </button>
                <button className="edicion-modal__btn-save"
                  onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                  disabled={isSaving || Boolean(error)}>
                  <Plus size={13} /> {t(`${o}.btnCreate`)}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm} isBusy={isSaving} entidad="Oferta"
        resumen={buildResumen(formData, catalogs, bannerFile, audienceProfessional)}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave} />
    </>
  );
}