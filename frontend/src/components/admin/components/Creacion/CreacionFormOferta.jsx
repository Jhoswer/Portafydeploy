// src/components/admin/components/Creacion/CreacionFormOferta.jsx
// Formulario de creación de oferta — POST /admin/profile/{profile}/offers

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase, Calendar, DollarSign, Eye, EyeOff,
  Image, Loader2, MapPin, Plus, Trash2, Upload, Users, X,
} from "lucide-react";
import CreacionModalConfirmacion from "./CreacionModalConfirmacion";
import {
  crearOferta,
  getCatalogosOferta,
} from "../../../../services/adminCreacionService";

// ── Combobox options ──────────────────────────────────────────────────────────

/** Tipo de oferta: valor en BD → label visible */
const TYPE_OFFER_OPTIONS = [
  { value: "",          label: "Sin especificar" },
  { value: "full-time", label: "Tiempo completo" },
];

/** Modalidad: valor en BD → label visible */
const MODALIDAD_OPTIONS = [
  { value: "",       label: "Sin especificar" },
  { value: "Remoto", label: "Remoto"          },
];

/** Nivel de experiencia (se guarda tal cual en BD) */
const NIVEL_OPTIONS = [
  { value: "",                label: "Sin especificar"  },
  { value: "sin experiencia", label: "Sin experiencia"  },
  { value: "junior",          label: "Junior"           },
  { value: "mid",             label: "Mid"              },
  { value: "senior",          label: "Senior"           },
];

const OFFER_STATES = ["open", "visible", "closed", "removed", "private"];
const CURRENCIES   = ["USD", "BOB", "EUR"];

// ── Estado inicial ────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title:            "",
  description:      "",
  type:             "",
  modalidad:        "",
  ubicacion:        "",
  nivel:            "",
  area:             "",
  state:            "private",
  quota_quantity:   "",
  salary_min:       "",
  salary_max:       "",
  currency:         "USD",
  show_salary:      false,
  closed_at:        "",
  id_audience_type: null,
};

// ── Resumen para modal de confirmación ────────────────────────────────────────
function buildResumen(form, catalogs, bannerFile, audienceProfessional) {
  const entries = [];
  const add = (label, value) => {
    if (value !== "" && value !== null && value !== undefined)
      entries.push({ label, value: String(value) });
  };

  add("Título",      form.title);
  add("Descripción", form.description);

  const typeLabel = TYPE_OFFER_OPTIONS.find((o) => o.value === form.type)?.label;
  if (typeLabel && form.type) add("Tipo", typeLabel);

  const modalLabel = MODALIDAD_OPTIONS.find((o) => o.value === form.modalidad)?.label;
  if (modalLabel && form.modalidad) add("Modalidad", modalLabel);

  add("Área",      form.area);

  const nivelLabel = NIVEL_OPTIONS.find((o) => o.value === form.nivel)?.label;
  if (nivelLabel && form.nivel) add("Nivel", nivelLabel);

  add("Ubicación",     form.ubicacion);
  add("Estado",        form.state);
  add("Cupos",         form.quota_quantity);
  add("Salario mín.",  form.salary_min);
  add("Salario máx.",  form.salary_max);
  add("Moneda",        form.currency);
  entries.push({ label: "Mostrar salario", value: form.show_salary ? "Sí" : "No" });
  add("Fecha cierre",  form.closed_at);

  if (form.id_audience_type) {
    const aud = catalogs?.audience_types?.find(
      (a) => String(a.value) === String(form.id_audience_type)
    );
    add("Alcance", aud?.label ?? `ID ${form.id_audience_type}`);
  }

  // Audiencia profesional
  audienceProfessional.forEach((entry, i) => {
    const areaName =
      catalogs?.professional_areas?.find(
        (a) => String(a.value) === String(entry.id_professional_area)
      )?.label ?? `Área #${entry.id_professional_area}`;
    const careerName = entry.id_professional_career
      ? catalogs?.professional_careers?.find(
          (c) => String(c.value) === String(entry.id_professional_career)
        )?.label ?? `Carrera #${entry.id_professional_career}`
      : "Todas las carreras";
    entries.push({ label: `Audiencia Prof. ${i + 1}`, value: `${areaName} › ${careerName}` });
  });

  if (bannerFile) {
    entries.push({
      label: "Banner",
      value: `${bannerFile.name} (${(bannerFile.size / 1024).toFixed(0)} KB)`,
    });
  }

  return entries;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CreacionFormOferta({ idProfile, onClose, onSaved }) {
  const [formData,     setFormData]     = useState({ ...EMPTY_FORM });
  const [catalogs,     setCatalogs]     = useState(null);
  const [jobTitleIds,  setJobTitleIds]  = useState([]);
  const [newJtId,      setNewJtId]      = useState("");
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // ── Audiencia profesional (área + carrera) ────────────────────────────────
  /** Array de { id_professional_area, id_professional_career | null } */
  const [audienceProfessional, setAudienceProfessional] = useState([]);
  const [newAreaId,   setNewAreaId]   = useState("");
  const [newCareerId, setNewCareerId] = useState("");

  // Banner
  const bannerInputRef                        = useRef(null);
  const [bannerFile,    setBannerFile]        = useState(null);
  const [bannerPreview, setBannerPreview]     = useState(null);

  // ── Carga de catálogos ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getCatalogosOferta();
        setCatalogs(data);
      } catch {
        setError("No se pudo cargar el catálogo de la oferta.");
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

  // ── Handlers generales ────────────────────────────────────────────────────
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

  // ── Handlers skills / puestos ─────────────────────────────────────────────
  const handleAddJobTitle = () => {
    if (!newJtId || jobTitleIds.includes(newJtId)) { setNewJtId(""); return; }
    setJobTitleIds((prev) => [...prev, newJtId]);
    setNewJtId("");
  };

  // ── Handlers audiencia profesional ────────────────────────────────────────
  /** Al cambiar el área, reinicia la carrera seleccionada */
  const handleAreaChange = (areaId) => {
    setNewAreaId(areaId);
    setNewCareerId("");
  };

  /** Agrega el par área/carrera a la lista; carrera es opcional */
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

  // ── Confirmar guardado ────────────────────────────────────────────────────
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
        // Comboboxes: vacío → null para la BD
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
        /** Pares área/carrera para OFFER_AUDIENCE_PROFESSIONAL */
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
      setConfirmError(err?.message || "No se pudo crear la oferta.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Datos derivados ───────────────────────────────────────────────────────
  const jtOptions       = catalogs?.job_titles          ?? [];
  const audienceOptions = catalogs?.audience_types      ?? [];
  const areaOptions     = catalogs?.professional_areas  ?? [];
  const careerOptions   = catalogs?.professional_careers ?? [];

  /** Carreras filtradas según el área actualmente seleccionada en el picker */
  const filteredCareers = newAreaId
    ? careerOptions.filter((c) => String(c.area_id) === String(newAreaId))
    : [];

  const selectedJtNames = jobTitleIds.map(
    (id) => jtOptions.find((j) => String(j.value) === id)?.label ?? `#${id}`
  );

  // ── Render ────────────────────────────────────────────────────────────────
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
                  <h2 className="edicion-modal__title">Nueva Oferta</h2>
                  <p className="edicion-modal__subtitle">Perfil #{idProfile}</p>
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

                  {/* ── Tipo (combobox) + Modalidad (combobox) ── */}
                  <div className="edicion-modal__row">
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Tipo</label>
                      <select
                        className="edicion-modal__input"
                        value={formData.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                      >
                        {TYPE_OFFER_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">Modalidad</label>
                      <select
                        className="edicion-modal__input"
                        value={formData.modalidad}
                        onChange={(e) => handleChange("modalidad", e.target.value)}
                      >
                        {MODALIDAD_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ── Área (texto libre) + Nivel (combobox) ── */}
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
                      <select
                        className="edicion-modal__input"
                        value={formData.nivel}
                        onChange={(e) => handleChange("nivel", e.target.value)}
                      >
                        {NIVEL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
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
                        {OFFER_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
                          : <><EyeOff size={13} /> Oculto</>
                        }
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

                  {/* Alcance (id_audience_type) */}
                  {audienceOptions.length > 0 && (
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
                        {audienceOptions.map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ── Audiencia Profesional (OFFER_AUDIENCE_PROFESSIONAL) ── */}
                  {areaOptions.length > 0 && (
                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">
                        <Users size={11} style={{ display: "inline", marginRight: 4 }} />
                        Audiencia Profesional
                      </label>

                      {/* Lista de pares ya agregados */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                        {audienceProfessional.length === 0 && (
                          <span style={{ fontSize: 12, opacity: 0.5 }}>
                            Sin audiencia profesional agregada
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
                            : "Todas las carreras";
                          return (
                            <span
                              key={i}
                              className="edicion-cv-item"
                              style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}
                            >
                              <strong style={{ fontWeight: 600 }}>{areaName}</strong>
                              <span style={{ opacity: 0.5 }}>›</span>
                              <span>{careerName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAudienceProfessional(i)}
                                style={{
                                  marginLeft: "auto",
                                  background: "none", border: "none",
                                  cursor: "pointer", padding: 0,
                                  display: "flex", alignItems: "center",
                                  color: "inherit", opacity: 0.6,
                                }}
                              >
                                <X size={11} />
                              </button>
                            </span>
                          );
                        })}
                      </div>

                      {/* Picker: Área → Carrera → Agregar */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {/* Combobox 1: Área */}
                        <select
                          className="edicion-modal__input"
                          value={newAreaId}
                          onChange={(e) => handleAreaChange(e.target.value)}
                        >
                          <option value="">— Seleccionar área —</option>
                          {areaOptions.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                          ))}
                        </select>

                        {/* Combobox 2: Carrera (depende del área; opcional) */}
                        <select
                          className="edicion-modal__input"
                          value={newCareerId}
                          onChange={(e) => setNewCareerId(e.target.value)}
                          disabled={!newAreaId}
                        >
                          <option value="">
                            {newAreaId
                              ? "— Todas las carreras (opcional) —"
                              : "— Primero selecciona un área —"}
                          </option>
                          {filteredCareers.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>

                        {/* Botón agregar */}
                        <button
                          type="button"
                          className="edicion-modal__btn-save"
                          style={{ alignSelf: "flex-start" }}
                          onClick={handleAddAudienceProfessional}
                          disabled={!newAreaId}
                        >
                          <Plus size={13} /> Agregar audiencia
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Banner */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Image size={11} style={{ display: "inline", marginRight: 4 }} />
                      Banner
                    </label>
                    {bannerPreview && (
                      <div className="edicion-modal__banner-preview" style={{ marginBottom: 8 }}>
                        <img
                          src={bannerPreview}
                          alt="Preview"
                          style={{
                            width: "100%", maxHeight: 160, objectFit: "cover",
                            borderRadius: 8, marginBottom: 6,
                            border: "1px solid var(--color-border, #e5e7eb)",
                          }}
                        />
                        <button
                          type="button"
                          className="edicion-modal__btn-cancel"
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
                      onChange={handleBannerChange}
                    />
                    <button
                      type="button"
                      className="edicion-modal__btn-cancel"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Upload size={12} />
                      {bannerPreview ? "Cambiar imagen" : "Seleccionar imagen"}
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
                      <label className="edicion-modal__label">Puestos asociados</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {selectedJtNames.map((name, i) => (
                          <span
                            key={i}
                            className="edicion-cv-item"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}
                          >
                            {name}
                            <button
                              type="button"
                              onClick={() => setJobTitleIds((prev) => prev.filter((_, j) => j !== i))}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: 0, display: "flex", alignItems: "center",
                                color: "inherit", opacity: 0.7,
                              }}
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                        {selectedJtNames.length === 0 && (
                          <span style={{ fontSize: 12, opacity: 0.5 }}>Sin puestos agregados</span>
                        )}
                      </div>
                      <div className="edicion-modal__row" style={{ alignItems: "center" }}>
                        <select
                          className="edicion-modal__input"
                          value={newJtId}
                          onChange={(e) => setNewJtId(e.target.value)}
                        >
                          <option value="">— Agregar puesto —</option>
                          {jtOptions
                            .filter((j) => !jobTitleIds.includes(String(j.value)))
                            .map((j) => (
                              <option key={j.value} value={j.value}>{j.label}</option>
                            ))}
                        </select>
                        <button
                          type="button"
                          className="edicion-modal__btn-save"
                          style={{ flexShrink: 0 }}
                          onClick={handleAddJobTitle}
                          disabled={!newJtId}
                        >
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
                <button
                  className="edicion-modal__btn-cancel"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  <X size={13} /> Cancelar
                </button>
                <button
                  className="edicion-modal__btn-save"
                  onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                  disabled={isSaving || Boolean(error)}
                >
                  <Plus size={13} /> Crear Oferta
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      <CreacionModalConfirmacion
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Oferta"
        resumen={buildResumen(formData, catalogs, bannerFile, audienceProfessional)}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}