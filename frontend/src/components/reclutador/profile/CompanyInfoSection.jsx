import { useState } from "react";
import {
  Building2, Globe, Users, Calendar, Briefcase,
  Phone, Mail, Clock, Navigation,
  Linkedin, Facebook, Instagram, Twitter,
  Pencil, Check, X, ChevronRight,
} from "lucide-react";
import { Button }    from "../../ui/button";
import { useAuth }   from "../../../context/useAuth";
import { apiClient } from "../../../services/http/httpClient";

/* ── Sub-secciones ───────────────────────────────────────────── */
const SECTIONS = [
  { key: "about",   label: "Sobre nosotros"   },
  { key: "rubro",   label: "Rubro e industria" },
  { key: "history", label: "Historia"          },
  { key: "social",  label: "Redes sociales"    },
];

const HISTORY_ITEMS = [
  { year: "2015", title: "Fundación",             desc: "Se funda la empresa con 3 colaboradores y el primer proyecto local." },
  { year: "2018", title: "Expansión nacional",     desc: "Apertura de oficinas en otras ciudades. Primer contrato con el sector público." },
  { year: "2022", title: "Premio a la innovación", desc: "Reconocidos por FUNDEMPRESA como empresa destacada del año." },
];

const SOCIAL_LINKS = [
  { key: "linkedin",  label: "LinkedIn",    icon: Linkedin,  placeholder: "linkedin.com/company/tuempresa" },
  { key: "facebook",  label: "Facebook",    icon: Facebook,  placeholder: "facebook.com/tuempresa"         },
  { key: "instagram", label: "Instagram",   icon: Instagram, placeholder: "@tuempresa"                     },
  { key: "twitter",   label: "X / Twitter", icon: Twitter,   placeholder: "@tuempresa"                     },
  { key: "website",   label: "Sitio web",   icon: Globe,     placeholder: "https://tuempresa.com"          },
];

/* ════════════════════════════════════════════════════════════════
   CompanyInfo — Tab Información
   ════════════════════════════════════════════════════════════════ */
export function CompanyInfo({ isOwner = true, companyData = null }) {
  const { company: authCompany, updateCompany } = useAuth();
  const company = companyData ?? authCompany;
  const [active, setActive] = useState("about");

  return (
    <div className="cinfo">
      <div className="cinfo__layout">

        <div className="cinfo__nav-card">
          <p className="cinfo__nav-heading">Información</p>
          <nav className="cinfo__nav">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                className={`cinfo__nav-item${active === s.key ? " active" : ""}`}
                onClick={() => setActive(s.key)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="cinfo__card">
          {active === "about"   && <SectionAbout   isOwner={isOwner} company={company} updateCompany={updateCompany} />}
          {active === "rubro"   && <SectionRubro   isOwner={isOwner} company={company} updateCompany={updateCompany} />}
          {active === "history" && <SectionHistory isOwner={isOwner} />}
          {active === "social"  && <SectionSocial  isOwner={isOwner} />}
        </div>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ContactTab — úsalo en EmpresaPerfil para activeTab="contacto"
   ════════════════════════════════════════════════════════════════ */
export function ContactTab({ company, isOwner = false }) {
  const phone = [company?.phone_prefix, company?.phone].filter(Boolean).join(" ");

  const contactRows = [
    { icon: Phone, value: phone,           href: phone          ? `tel:${phone}`             : null },
    { icon: Mail,  value: company?.email,  href: company?.email ? `mailto:${company.email}`  : null },
    { icon: Globe, value: company?.website?.replace(/^https?:\/\//, ""), href: company?.website || null },
  ].filter((r) => r.value);

  return (
    <div className="cinfo__card">

      <div className="cinfo__section-header" style={{ marginBottom: 16 }}>
        <h3 className="cinfo__section-title">Dirección</h3>
      </div>

      <div className="ccontact__map-placeholder">
        <Navigation size={28} className="ccontact__map-icon" />
        <p className="ccontact__map-address">
          {company?.address ?? company?.city ?? "Sin dirección registrada"}
        </p>
        {(company?.address || company?.city) && (
          <a
            className="ccontact__map-link"
            href={`https://maps.google.com/?q=${encodeURIComponent(company?.address ?? company?.city)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ver en Google Maps
          </a>
        )}
      </div>

      {contactRows.length > 0 && (
        <>
          <p className="cinfo__subsection-label" style={{ marginTop: 24, marginBottom: 0 }}>
            Datos de contacto
          </p>
          <div className="ccontact__rows">
            {contactRows.map(({ icon: Icon, value, href }) => (
              <div key={value} className="ccontact__row">
                <span className="ccontact__row-icon"><Icon size={15} /></span>
                {href
                  ? <a href={href} className="ccontact__row-link" target="_blank" rel="noreferrer">{value}</a>
                  : <span className="ccontact__row-value">{value}</span>
                }
              </div>
            ))}
          </div>
        </>
      )}

      {company?.schedule && (
        <>
          <p className="cinfo__subsection-label" style={{ marginTop: 24, marginBottom: 0 }}>
            Horario de atención
          </p>
          <div className="ccontact__rows">
            <div className="ccontact__row">
              <span className="ccontact__row-icon"><Clock size={15} /></span>
              <span className="ccontact__row-value">{company.schedule}</span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Sección: Sobre nosotros
   ════════════════════════════════════════════════════════════════ */
function SectionAbout({ isOwner, company, updateCompany }) {
  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    description: company?.description ?? "",
    mission:     company?.mission     ?? "",
    vision:      company?.vision      ?? "",
  });

  const handleEdit = () => {
    setForm({
      description: company?.description ?? "",
      mission:     company?.mission     ?? "",
      vision:      company?.vision      ?? "",
    });
    setServerError("");
    setEditing(true);
  };

  const handleCancel = () => { setServerError(""); setEditing(false); };

  const handleSave = async () => {
    setSaving(true);
    setServerError("");
    try {
      const payload = new FormData();
      payload.append("_method",     "PUT");
      payload.append("description", form.description);
      payload.append("mission",     form.mission);
      payload.append("vision",      form.vision);
      const data = await apiClient.post("company", payload);
      updateCompany(data.company);
      setEditing(false);
    } catch (err) {
      setServerError(err.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  // Solo muestra filas con valor — agrega campos a BD cuando los tengas
  const generalData = [
    {
      icon:  Calendar,
      label: "Año de fundación",
      value: company?.founded_year
        ?? (company?.created_at ? new Date(company.created_at).getFullYear() : null),
    },
    { icon: Users,     label: "Tamaño",     value: company?.size       ?? null },
    { icon: Globe,     label: "Alcance",    value: company?.alcance    ?? null },
    { icon: Briefcase, label: "Personería", value: company?.personeria ?? null },
  ].filter((d) => d.value !== null && d.value !== undefined && d.value !== "");

  return (
    <>
      <div className="cinfo__section-header">
        <h3 className="cinfo__section-title">Sobre nosotros</h3>
        {isOwner && !editing && (
          <button className="cinfo__edit-btn" onClick={handleEdit}>
            <Pencil size={13} /> Editar
          </button>
        )}
        {isOwner && editing && (
          <div className="cinfo__header-actions">
            <button className="cinfo__cancel-btn" onClick={handleCancel} disabled={saving}>
              <X size={13} /> Cancelar
            </button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check size={13} /> {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}
      </div>

      {serverError && <p className="cinfo__error">{serverError}</p>}

      <div className="cinfo__field">
        {editing ? (
          <>
            <textarea
              className="cinfo__textarea"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              maxLength={500}
              placeholder="Describe tu empresa, qué hace y cuál es su cultura..."
            />
            <p className="cinfo__char-count">{form.description.length} / 500</p>
          </>
        ) : (
          <p className="cinfo__desc">
            {company?.description?.trim()
              ? company.description
              : <span className="cinfo__empty">Sin descripción disponible.</span>
            }
          </p>
        )}
      </div>

      <div className="cinfo__mv-grid">
        <div className="cinfo__mv-block">
          <p className="cinfo__mv-label">Misión</p>
          {editing ? (
            <>
              <textarea
                className="cinfo__textarea"
                value={form.mission}
                onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
                rows={3}
                maxLength={300}
                placeholder="¿Cuál es el propósito de tu empresa?"
              />
              <p className="cinfo__char-count">{form.mission.length} / 300</p>
            </>
          ) : (
            <p className="cinfo__mv-text">
              {company?.mission?.trim() || <span className="cinfo__empty">No definida</span>}
            </p>
          )}
        </div>
        <div className="cinfo__mv-block">
          <p className="cinfo__mv-label">Visión</p>
          {editing ? (
            <>
              <textarea
                className="cinfo__textarea"
                value={form.vision}
                onChange={e => setForm(f => ({ ...f, vision: e.target.value }))}
                rows={3}
                maxLength={300}
                placeholder="¿A dónde quiere llegar tu empresa?"
              />
              <p className="cinfo__char-count">{form.vision.length} / 300</p>
            </>
          ) : (
            <p className="cinfo__mv-text">
              {company?.vision?.trim() || <span className="cinfo__empty">No definida</span>}
            </p>
          )}
        </div>
      </div>

      {!editing && generalData.length > 0 && (
        <div className="cinfo__general">
          <p className="cinfo__subsection-label">Datos generales</p>
          <div className="cinfo__general-rows">
            {generalData.map(({ icon: Icon, label, value }) => (
              <div key={label} className="cinfo__general-row">
                <span className="cinfo__general-icon"><Icon size={15} /></span>
                <span className="cinfo__general-label">{label}:</span>
                <span className="cinfo__general-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Sección: Rubro e industria
   ════════════════════════════════════════════════════════════════ */
function SectionRubro({ isOwner, company, updateCompany }) {
  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    industry:  company?.industry  ?? "",
    specialty: company?.specialty ?? "",
    segment:   company?.segment   ?? "",
    services:  company?.services  ?? "",
  });

  const handleEdit = () => {
    setForm({
      industry:  company?.industry  ?? "",
      specialty: company?.specialty ?? "",
      segment:   company?.segment   ?? "",
      services:  company?.services  ?? "",
    });
    setServerError("");
    setEditing(true);
  };

  const handleCancel = () => { setServerError(""); setEditing(false); };

  const handleSave = async () => {
    setSaving(true);
    setServerError("");
    try {
      const payload = new FormData();
      payload.append("_method",   "PUT");
      payload.append("industry",  form.industry);
      payload.append("specialty", form.specialty);
      payload.append("segment",   form.segment);
      payload.append("services",  form.services);
      const data = await apiClient.post("company", payload);
      updateCompany(data.company);
      setEditing(false);
    } catch (err) {
      setServerError(err.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const servicesList = (company?.services ?? "").split(",").map(s => s.trim()).filter(Boolean);

  return (
    <>
      <div className="cinfo__section-header">
        <h3 className="cinfo__section-title">Rubro e industria</h3>
        {isOwner && !editing && (
          <button className="cinfo__edit-btn" onClick={handleEdit}><Pencil size={13} /> Editar</button>
        )}
        {isOwner && editing && (
          <div className="cinfo__header-actions">
            <button className="cinfo__cancel-btn" onClick={handleCancel} disabled={saving}><X size={13} /> Cancelar</button>
            <Button size="sm" onClick={handleSave} disabled={saving}><Check size={13} /> {saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        )}
      </div>

      {serverError && <p className="cinfo__error">{serverError}</p>}

      <div className="cinfo__data-rows">
        <div className="cinfo__data-row">
          <span className="cinfo__data-icon"><Building2 size={15} /></span>
          <span className="cinfo__data-label">Sector principal:</span>
          {editing
            ? <input className="cinfo__input" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="Ej: Tecnología" />
            : <span className="cinfo__data-value">{company?.industry || "—"}</span>
          }
        </div>
        <div className="cinfo__data-row">
          <span className="cinfo__data-icon"><Globe size={15} /></span>
          <span className="cinfo__data-label">Especialidad:</span>
          {editing
            ? <input className="cinfo__input" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Ej: Desarrollo de software" />
            : <span className="cinfo__data-value">{company?.specialty || "—"}</span>
          }
        </div>
        <div className="cinfo__data-row">
          <span className="cinfo__data-icon"><Users size={15} /></span>
          <span className="cinfo__data-label">Segmento:</span>
          {editing
            ? <input className="cinfo__input" value={form.segment} onChange={e => setForm(f => ({ ...f, segment: e.target.value }))} placeholder="Ej: B2B y sector público" />
            : <span className="cinfo__data-value">{company?.segment || "—"}</span>
          }
        </div>
      </div>

      <div className="cinfo__subsection">
        <p className="cinfo__subsection-label">Servicios principales</p>
        {editing ? (
          <>
            <input className="cinfo__input" value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))} placeholder="Separados por coma: Desarrollo web, Apps móviles..." />
            <p className="cinfo__hint">Separa cada servicio con una coma</p>
          </>
        ) : (
          <div className="cinfo__tags">
            {servicesList.length > 0
              ? servicesList.map(s => <span key={s} className="cinfo__tag">{s}</span>)
              : <span className="cinfo__empty">Sin servicios registrados</span>
            }
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Sección: Historia
   ════════════════════════════════════════════════════════════════ */
function SectionHistory({ isOwner }) {
  const [editing, setEditing] = useState(false);
  const [items,   setItems]   = useState(HISTORY_ITEMS);
  const [draft,   setDraft]   = useState(HISTORY_ITEMS);

  const handleSave   = () => { setItems(draft); setEditing(false); };
  const handleCancel = () => { setDraft(items); setEditing(false); };
  const updateItem   = (i, field, val) => setDraft(d => d.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const addItem      = () => setDraft(d => [...d, { year: "", title: "", desc: "" }]);
  const removeItem   = (i) => setDraft(d => d.filter((_, idx) => idx !== i));

  return (
    <>
      <div className="cinfo__section-header">
        <h3 className="cinfo__section-title">Historia</h3>
        {isOwner && !editing && (
          <button className="cinfo__edit-btn" onClick={() => setEditing(true)}><Pencil size={13} /> Editar</button>
        )}
        {isOwner && editing && (
          <div className="cinfo__header-actions">
            <button className="cinfo__cancel-btn" onClick={handleCancel}><X size={13} /> Cancelar</button>
            <Button size="sm" onClick={handleSave}><Check size={13} /> Guardar</Button>
          </div>
        )}
      </div>

      <div className="cinfo__timeline">
        {(editing ? draft : items).map((it, i) => (
          <div key={i} className="cinfo__timeline-item">
            <div className="cinfo__timeline-line">
              <div className="cinfo__timeline-dot" />
            </div>
            <div className="cinfo__timeline-body">
              {editing ? (
                <>
                  <div className="cinfo__timeline-edit-row">
                    <input className="cinfo__input cinfo__input--year" value={it.year}  onChange={e => updateItem(i, "year",  e.target.value)} placeholder="Año" />
                    <input className="cinfo__input"                    value={it.title} onChange={e => updateItem(i, "title", e.target.value)} placeholder="Título" />
                    <button className="cinfo__remove-btn" onClick={() => removeItem(i)}><X size={13} /></button>
                  </div>
                  <textarea className="cinfo__textarea" value={it.desc} onChange={e => updateItem(i, "desc", e.target.value)} rows={2} placeholder="Descripción..." />
                </>
              ) : (
                <>
                  <p className="cinfo__timeline-year">{it.year}</p>
                  <p className="cinfo__timeline-title">{it.title}</p>
                  <p className="cinfo__timeline-desc">{it.desc}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && <button className="cinfo__add-btn" onClick={addItem}>+ Agregar hito</button>}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Sección: Redes sociales
   ════════════════════════════════════════════════════════════════ */
function SectionSocial({ isOwner }) {
  const [editing, setEditing] = useState(false);
  const [values,  setValues]  = useState({ linkedin: "", facebook: "", instagram: "", twitter: "", website: "" });
  const [draft,   setDraft]   = useState({ linkedin: "", facebook: "", instagram: "", twitter: "", website: "" });

  const handleSave   = () => { setValues(draft); setEditing(false); };
  const handleCancel = () => { setDraft(values); setEditing(false); };

  return (
    <>
      <div className="cinfo__section-header">
        <h3 className="cinfo__section-title">Redes sociales</h3>
        {isOwner && !editing && (
          <button className="cinfo__edit-btn" onClick={() => setEditing(true)}><Pencil size={13} /> Editar</button>
        )}
        {isOwner && editing && (
          <div className="cinfo__header-actions">
            <button className="cinfo__cancel-btn" onClick={handleCancel}><X size={13} /> Cancelar</button>
            <Button size="sm" onClick={handleSave}><Check size={13} /> Guardar</Button>
          </div>
        )}
      </div>

      <div className="cinfo__social-list">
        {SOCIAL_LINKS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="cinfo__social-row">
            <div className="cinfo__social-icon"><Icon size={16} /></div>
            <div className="cinfo__social-info">
              <p className="cinfo__social-label">{label}</p>
              {editing
                ? <input className="cinfo__input" value={draft[key] ?? ""} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} placeholder={placeholder} />
                : values[key]
                  ? <a className="cinfo__social-link" href={values[key]} target="_blank" rel="noreferrer">{values[key]}</a>
                  : <span className="cinfo__empty">No configurado</span>
              }
            </div>
            {!editing && values[key] && <ChevronRight size={15} className="cinfo__social-arrow" />}
          </div>
        ))}
      </div>
    </>
  );
}