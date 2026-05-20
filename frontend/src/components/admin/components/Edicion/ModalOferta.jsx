import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Image,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminOffer,
  updateAdminOffer,
} from "../../../../services/adminProfileTableService";

const OFFER_STATES = ["open", "visible", "closed", "removed", "private"];
const CURRENCIES = ["USD", "BOB", "EUR"];

// Etiquetas legibles para cada campo
const FIELD_LABELS = {
  title: "Título",
  description: "Descripción",
  type: "Tipo",
  modalidad: "Modalidad",
  ubicacion: "Ubicación",
  nivel: "Nivel",
  area: "Área",
  state: "Estado",
  quota_quantity: "Cupos",
  salary_min: "Salario mínimo",
  salary_max: "Salario máximo",
  currency: "Moneda",
  show_salary: "Mostrar salario",
  closed_at: "Fecha de cierre",
  banner_url: "Banner URL",
  id_audience_type: "Alcance (audiencia)",
};

const COMPARABLE_FIELDS = Object.keys(FIELD_LABELS);

function normalizeOffer(raw) {
  if (!raw) return null;
  return {
    id_offer: raw.id_offer ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    type: raw.type ?? "",
    modalidad: raw.modalidad ?? "",
    ubicacion: raw.ubicacion ?? "",
    nivel: raw.nivel ?? "",
    area: raw.area ?? "",
    state: raw.state ?? "open",
    quota_quantity: raw.quota_quantity ?? "",
    salary_min: raw.salary_min ?? "",
    salary_max: raw.salary_max ?? "",
    currency: raw.currency ?? "USD",
    show_salary: raw.show_salary ?? true,
    closed_at: raw.closed_at ? raw.closed_at.slice(0, 10) : "",
    banner_url: raw.banner_url ?? "",
    id_audience_type: raw.id_audience_type ?? null,
  };
}

// Formatea un valor para mostrarlo en el resumen del modal de confirmación
function formatValue(field, value, catalogs) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "show_salary") return value ? "Visible" : "Oculto";
  if (field === "id_audience_type") {
    const aud = catalogs?.audience_types?.find(
      (a) => String(a.value) === String(value)
    );
    return aud ? `${aud.code}${aud.name ? ` — ${aud.name}` : ""}` : String(value);
  }
  return String(value);
}

// Calcula qué cambió entre la snapshot original y el estado actual del formulario
function buildResumen(original, current, details, bannerFile, catalogs) {
  const resumen = [];

  // 1. Campos escalares
  for (const field of COMPARABLE_FIELDS) {
    const oldVal = String(original?.[field] ?? "");
    const newVal = String(current?.[field] ?? "");
    if (oldVal !== newVal) {
      resumen.push({
        label: FIELD_LABELS[field],
        value: `${formatValue(field, original?.[field], catalogs)} → ${formatValue(field, current?.[field], catalogs)}`,
      });
    }
  }

  // 2. Banner: nuevo archivo seleccionado
  if (bannerFile) {
    resumen.push({
      label: "Banner",
      value: `Nueva imagen: ${bannerFile.name} (${(bannerFile.size / 1024).toFixed(0)} KB)`,
    });
  }

  // 3. Skills y puestos
  const addedSkills = details
    .filter((d) => d._isNew && d.id_skill && !d._delete)
    .map((d) => d.skill_name || `Skill #${d.id_skill}`);

  const removedSkills = details
    .filter((d) => d._delete && d.id_skill && !d._isNew)
    .map((d) => d.skill_name || `Skill #${d.id_skill}`);

  const addedJobTitles = details
    .filter((d) => d._isNew && d.id_job_title && !d._delete)
    .map((d) => d.job_title_name || `Puesto #${d.id_job_title}`);

  const removedJobTitles = details
    .filter((d) => d._delete && d.id_job_title && !d._isNew)
    .map((d) => d.job_title_name || `Puesto #${d.id_job_title}`);

  if (addedSkills.length > 0)
    resumen.push({ label: "Skills agregadas", value: addedSkills.join(", ") });
  if (removedSkills.length > 0)
    resumen.push({ label: "Skills eliminadas", value: removedSkills.join(", ") });
  if (addedJobTitles.length > 0)
    resumen.push({ label: "Puestos agregados", value: addedJobTitles.join(", ") });
  if (removedJobTitles.length > 0)
    resumen.push({ label: "Puestos eliminados", value: removedJobTitles.join(", ") });

  return resumen;
}

export default function ModalOferta({ idProfile, idOffer, onClose, onSaved }) {
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null); // snapshot inmutable para el diff
  const [details, setDetails] = useState([]);
  const [catalogs, setCatalogs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [resumen, setResumen] = useState([]);

  // Banner
  const bannerInputRef = useRef(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Agregar nuevos detalles
  const [newSkillId, setNewSkillId] = useState("");
  const [newJobTitleId, setNewJobTitleId] = useState("");

  /* ── Carga inicial ── */
  useEffect(() => {
    if (!idOffer) return;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getAdminOffer(idProfile, idOffer);
        const normalized = normalizeOffer(data?.offer);
        setFormData(normalized);
        setOriginalData(normalized); // snapshot para comparar al confirmar
        setDetails(Array.isArray(data?.details) ? data.details : []);
        setCatalogs(data?.catalogs ?? null);
      } catch (err) {
        setError(err?.message || "No se pudo cargar la oferta.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile, idOffer]);

  // Liberar object URL al desmontar
  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  /* ── Abrir confirmación: calcular diff en ese momento ── */
  const handleOpenConfirm = () => {
    setConfirmError("");
    setResumen(buildResumen(originalData, formData, details, bannerFile, catalogs));
    setShowConfirm(true);
  };

  /* ── Banner ── */
  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    handleChange("banner_url", "");
  };

  const handleRemoveBanner = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview(null);
    handleChange("banner_url", "");
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  /* ── Detalles: agregar skill ── */
  const handleAddSkill = () => {
    if (!newSkillId) return;
    const skillCat = catalogs?.skills?.find((s) => String(s.value) === String(newSkillId));
    if (!skillCat) return;
    const alreadyExists = details.some(
      (d) => !d._delete && String(d.id_skill) === String(newSkillId)
    );
    if (alreadyExists) { setNewSkillId(""); return; }
    setDetails((prev) => [
      ...prev,
      {
        id_offer_detail: null,
        id_skill: Number(newSkillId),
        skill_name: skillCat.label,
        id_job_title: null,
        job_title_name: null,
        _isNew: true,
      },
    ]);
    setNewSkillId("");
  };

  /* ── Detalles: agregar job_title ── */
  const handleAddJobTitle = () => {
    if (!newJobTitleId) return;
    const jtCat = catalogs?.job_titles?.find((j) => String(j.value) === String(newJobTitleId));
    if (!jtCat) return;
    const alreadyExists = details.some(
      (d) => !d._delete && String(d.id_job_title) === String(newJobTitleId)
    );
    if (alreadyExists) { setNewJobTitleId(""); return; }
    setDetails((prev) => [
      ...prev,
      {
        id_offer_detail: null,
        id_skill: null,
        skill_name: null,
        id_job_title: Number(newJobTitleId),
        job_title_name: jtCat.label,
        _isNew: true,
      },
    ]);
    setNewJobTitleId("");
  };

  /* ── Detalles: quitar ── */
  const handleRemoveDetail = (index) => {
    setDetails((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (item._isNew) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...item, _delete: true };
      }
      return updated;
    });
  };

  /* ── Guardar (llamado desde EdicionConfirmModal al confirmar) ── */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type || null,
        modalidad: formData.modalidad || null,
        ubicacion: formData.ubicacion || null,
        nivel: formData.nivel || null,
        area: formData.area || null,
        state: formData.state,
        quota_quantity: formData.quota_quantity !== "" ? Number(formData.quota_quantity) : null,
        salary_min: formData.salary_min !== "" ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max !== "" ? Number(formData.salary_max) : null,
        currency: formData.currency,
        show_salary: formData.show_salary,
        closed_at: formData.closed_at || null,
        banner_url: formData.banner_url || null,
        id_audience_type: formData.id_audience_type || null,
        details: details
          .filter((d) => d._isNew || d._delete)
          .map((d) => ({
            id_offer_detail: d.id_offer_detail,
            id_skill: d.id_skill || null,
            id_job_title: d.id_job_title || null,
            _delete: d._delete || false,
          })),
      };

      if (bannerFile) {
        // Enviar FormData con _method=PUT para que Laravel lo procese como PUT
        const form = new FormData();
        form.append("_method", "PUT");
        form.append("banner", bannerFile);
        Object.entries(payload).forEach(([key, value]) => {
          if (value === null || value === undefined) return;
          if (key === "details") {
            form.append(key, JSON.stringify(value));   // sigue igual
          } else if (typeof value === "boolean") {
            form.append(key, value ? "1" : "0");       // ← '1'/'0' en vez de 'true'/'false'
          } else {
            form.append(key, String(value));
          }
        });
        await updateAdminOffer(idProfile, idOffer, form, true);
      } else {
        await updateAdminOffer(idProfile, idOffer, payload, false);
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

  /* ── Helpers de render ── */
  const visibleDetails = details.filter((d) => !d._delete);
  const selectedAudience = catalogs?.audience_types?.find(
    (a) => String(a.value) === String(formData?.id_audience_type)
  );

  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <div className="edicion-modal" style={{ maxWidth: 700 }}>

            {/* ── Header ── */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <Briefcase size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Editar Oferta</h2>
                  {formData?.id_offer && (
                    <p className="edicion-modal__subtitle">Oferta #{formData.id_offer}</p>
                  )}
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

            {/* ── Body ── */}
            <div className="edicion-modal__body">
              {isLoading ? (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>Cargando oferta...</span>
                </div>
              ) : error && !formData ? (
                <div className="edicion-modal__error">{error}</div>
              ) : formData ? (
                <div className="edicion-modal__fields">
                  {error && <div className="edicion-modal__error">{error}</div>}

                  {/* Título */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Título</label>
                    <input
                      className="edicion-modal__input"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Título de la oferta"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Descripción</label>
                    <textarea
                      className="edicion-modal__textarea"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Descripción de la oferta"
                    />
                  </div>

                  {/* Tipo + Modalidad */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Tipo</label>
                      <input
                        className="edicion-modal__input"
                        value={formData.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                        placeholder="Ej: full-time, part-time"
                      />
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Modalidad</label>
                      <input
                        className="edicion-modal__input"
                        value={formData.modalidad}
                        onChange={(e) => handleChange("modalidad", e.target.value)}
                        placeholder="Ej: remoto, presencial"
                      />
                    </div>
                  </div>

                  {/* Área + Nivel */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Área</label>
                      <input
                        className="edicion-modal__input"
                        value={formData.area}
                        onChange={(e) => handleChange("area", e.target.value)}
                        placeholder="Ej: Tecnología"
                      />
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Nivel</label>
                      <input
                        className="edicion-modal__input"
                        value={formData.nivel}
                        onChange={(e) => handleChange("nivel", e.target.value)}
                        placeholder="Ej: junior, senior"
                      />
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <MapPin size={11} style={{ display: "inline", marginRight: 4 }} />
                      Ubicación
                    </label>
                    <input
                      className="edicion-modal__input"
                      value={formData.ubicacion}
                      onChange={(e) => handleChange("ubicacion", e.target.value)}
                      placeholder="Ej: Cochabamba, Bolivia"
                    />
                  </div>

                  {/* Estado + Cupos */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Estado</label>
                      <select
                        className="edicion-modal__input"
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                      >
                        {OFFER_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                        Cupos
                      </label>
                      <input
                        className="edicion-modal__input"
                        type="number"
                        min={0}
                        value={formData.quota_quantity}
                        onChange={(e) => handleChange("quota_quantity", e.target.value)}
                        placeholder="Cantidad de cupos"
                      />
                    </div>
                  </div>

                  {/* Salario */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <DollarSign size={11} style={{ display: "inline", marginRight: 4 }} />
                      Salario
                    </label>
                    <div className="edicion-modal__row">
                      <input
                        className="edicion-modal__input"
                        type="number"
                        min={0}
                        value={formData.salary_min}
                        onChange={(e) => handleChange("salary_min", e.target.value)}
                        placeholder="Mínimo"
                      />
                      <input
                        className="edicion-modal__input"
                        type="number"
                        min={0}
                        value={formData.salary_max}
                        onChange={(e) => handleChange("salary_max", e.target.value)}
                        placeholder="Máximo"
                      />
                    </div>
                  </div>

                  {/* Moneda + Mostrar salario */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Moneda</label>
                      <select
                        className="edicion-modal__input"
                        value={formData.currency}
                        onChange={(e) => handleChange("currency", e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Mostrar salario</label>
                      <label className="edicion-modal__check">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.show_salary)}
                          onChange={(e) => handleChange("show_salary", e.target.checked)}
                        />
                        {formData.show_salary
                          ? <><Eye size={13} /> Visible</>
                          : <><EyeOff size={13} /> Oculto</>}
                      </label>
                    </div>
                  </div>

                  {/* Fecha de cierre */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Calendar size={11} style={{ display: "inline", marginRight: 4 }} />
                      Fecha de cierre
                    </label>
                    <input
                      className="edicion-modal__input"
                      type="date"
                      value={formData.closed_at}
                      onChange={(e) => handleChange("closed_at", e.target.value)}
                    />
                  </div>

                  {/* Alcance (AUDIENCE_TYPE) */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                      Alcance
                    </label>
                    <select
                      className="edicion-modal__input"
                      value={formData.id_audience_type ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "id_audience_type",
                          e.target.value !== "" ? Number(e.target.value) : null
                        )
                      }
                    >
                      <option value="">— Sin especificar —</option>
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

                  {/* Banner */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Image size={11} style={{ display: "inline", marginRight: 4 }} />
                      Banner
                    </label>

                    {(bannerPreview || formData.banner_url) && (
                      <div className="edicion-modal__banner-preview">
                        <img
                          src={bannerPreview || formData.banner_url}
                          alt="Banner preview"
                          style={{
                            width: "100%",
                            maxHeight: 160,
                            objectFit: "cover",
                            borderRadius: 8,
                            marginBottom: 8,
                            border: "1px solid var(--color-border, #e5e7eb)",
                          }}
                        />
                        <button
                          type="button"
                          className="edicion-modal__btn-cancel"
                          style={{ marginBottom: 6 }}
                          onClick={handleRemoveBanner}
                        >
                          <Trash2 size={12} /> Quitar banner
                        </button>
                      </div>
                    )}

                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBannerFileChange}
                    />

                    <button
                      type="button"
                      className="edicion-modal__btn-cancel"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Upload size={12} />
                      {bannerPreview || formData.banner_url ? "Cambiar imagen" : "Seleccionar imagen"}
                    </button>

                    {bannerFile && (
                      <p className="edicion-modal__hint" style={{ marginTop: 4 }}>
                        {bannerFile.name} ({(bannerFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>

                  {/* Skills asociadas */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Skills asociadas</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {visibleDetails.filter((d) => d.id_skill).map((d) => {
                        const realIdx = details.indexOf(d);
                        return (
                          <span
                            key={d.id_offer_detail ?? `new-skill-${realIdx}`}
                            className="edicion-cv-item"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}
                          >
                            {d.skill_name || `Skill #${d.id_skill}`}
                            <button
                              type="button"
                              onClick={() => handleRemoveDetail(realIdx)}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: 0, display: "flex", alignItems: "center",
                                color: "inherit", opacity: 0.7,
                              }}
                              aria-label="Quitar skill"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        );
                      })}
                      {visibleDetails.filter((d) => d.id_skill).length === 0 && (
                        <span style={{ fontSize: 12, opacity: 0.5 }}>Sin skills agregadas</span>
                      )}
                    </div>
                    {catalogs?.skills?.length > 0 && (
                      <div className="edicion-modal__row" style={{ alignItems: "center" }}>
                        <select
                          className="edicion-modal__input"
                          value={newSkillId}
                          onChange={(e) => setNewSkillId(e.target.value)}
                        >
                          <option value="">— Agregar skill —</option>
                          {catalogs.skills.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
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

                  {/* Puestos asociados */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">Puestos asociados</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {visibleDetails.filter((d) => d.id_job_title).map((d) => {
                        const realIdx = details.indexOf(d);
                        return (
                          <span
                            key={d.id_offer_detail ?? `new-jt-${realIdx}`}
                            className="edicion-cv-item"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}
                          >
                            {d.job_title_name || `Puesto #${d.id_job_title}`}
                            <button
                              type="button"
                              onClick={() => handleRemoveDetail(realIdx)}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: 0, display: "flex", alignItems: "center",
                                color: "inherit", opacity: 0.7,
                              }}
                              aria-label="Quitar puesto"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        );
                      })}
                      {visibleDetails.filter((d) => d.id_job_title).length === 0 && (
                        <span style={{ fontSize: 12, opacity: 0.5 }}>Sin puestos agregados</span>
                      )}
                    </div>
                    {catalogs?.job_titles?.length > 0 && (
                      <div className="edicion-modal__row" style={{ alignItems: "center" }}>
                        <select
                          className="edicion-modal__input"
                          value={newJobTitleId}
                          onChange={(e) => setNewJobTitleId(e.target.value)}
                        >
                          <option value="">— Agregar puesto —</option>
                          {catalogs.job_titles.map((j) => (
                            <option key={j.value} value={j.value}>{j.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="edicion-modal__btn-save"
                          style={{ flexShrink: 0 }}
                          onClick={handleAddJobTitle}
                          disabled={!newJobTitleId}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ) : null}
            </div>

            {/* ── Footer ── */}
            {!isLoading && formData && (
              <div className="edicion-modal__footer">
                <button
                  className="edicion-modal__btn-cancel"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  <X size={13} /> Cancelar
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

      {/* EdicionConfirmModal recibe el resumen calculado al abrir */}
      <EdicionConfirmModal
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Oferta"
        accion="actualizar"
        resumen={resumen}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}