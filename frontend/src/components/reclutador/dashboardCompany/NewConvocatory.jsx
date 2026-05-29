import { useCallback, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Image, FileText, MapPin, Briefcase,
  ChevronDown, ChevronUp, X, Send,
  Monitor, Award, Sparkles,
  Globe, Users, Link2, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { crearOferta, obtenerOferta, actualizarOferta } from "../../../services/offerService";
import { useAuth } from "../../../context/useAuth";
import { hasPermission, PERMISSION_NAMES } from "../../../utils/permissions";
import AudienceModal from "../convocatory/AudienceModal";
import { PROFESSIONAL_AREAS } from "../convocatory/AudienceModal";

const AUDIENCE_CONFIG = {
  public:        { icon: Globe             },
  followers:     { icon: Users             },
  connections:   { icon: Link2             },
  professionals: { icon: SlidersHorizontal },
};

const AUDIENCE_TYPE_IDS = {
  public: 1, followers: 2, connections: 3, professionals: 4,
};

const AUDIENCE_CODES_BY_ID = {
  1: "public", 2: "followers", 3: "connections", 4: "professionals",
};

function ChipSelector({ icon: Icon, label, value, options, onChange, color = "#1a6fbd" }) {
  const [open, setOpen] = useState(false);
  const triggerCls = value ? "nc-chip__trigger" : "nc-chip__trigger nc-chip__trigger--empty";
  const triggerStyle = value
    ? { border: `1.5px solid ${color}`, background: `${color}18`, color }
    : {};

  return (
    <div className="nc-chip">
      <button
        type="button"
        className={triggerCls}
        style={triggerStyle}
        onClick={() => setOpen(o => !o)}
      >
        <Icon size={13} />
        {value || label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="nc-chip__dropdown">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className={`nc-chip__option ${value === opt ? "nc-chip__option--selected" : ""}`}
              style={value === opt ? { color, background: `${color}12` } : {}}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SuccessToast({ message, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: "#dcfce7", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11 }}>✓</span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-text)" }}>{message}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--color-muted-text)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function NewConvocatory({ editId = null, onBack }) {
  const { t } = useTranslation();
  const isEditing = Boolean(editId);
  const goBack    = useCallback(() => onBack?.(), [onBack]);
  const { company, user } = useAuth();
  const canPublishOffer = hasPermission(user, PERMISSION_NAMES.OFFER_PUBLISH);

  const [loadingData,   setLoadingData]   = useState(isEditing);
  const [title,         setTitle]         = useState("");
  const [description,   setDescription]   = useState("");
  const [area,          setArea]          = useState("");
  const [type,          setType]          = useState("");
  const [modalidad,     setModalidad]     = useState("");
  const [nivel,         setNivel]         = useState("");
  const [ubicacion,     setUbicacion]     = useState("");
  const [expanded,      setExpanded]      = useState(false);
  const [salaryMin,     setSalaryMin]     = useState("");
  const [salaryMax,     setSalaryMax]     = useState("");
  const [currency,      setCurrency]      = useState("USD");
  const [showSalary,    setShowSalary]    = useState(true);
  const [closedAt,      setClosedAt]      = useState("");
  const [currentSkill,  setCurrentSkill]  = useState("");
  const [skills,        setSkills]        = useState([]);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile,    setBannerFile]    = useState(null);
  const [pdfFile,       setPdfFile]       = useState(null);
  const [pdfName,       setPdfName]       = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [audience,          setAudience]          = useState("public");
  const [audienceFilters,   setAudienceFilters]   = useState({ id_professional_area: null, career: null });

  const imageRef = useRef(null);
  const pdfRef   = useRef(null);

  const companyName   = company?.name     ?? "Mi empresa";
  const companyAvatar = company?.logo_url ?? null;
  const initials      = companyName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const AudienceIcon = AUDIENCE_CONFIG[audience]?.icon ?? Globe;

  const audienceLabel = audience === "professionals" && audienceFilters?.id_professional_area
    ? (() => {
        const area = PROFESSIONAL_AREAS.find(a => a.id === audienceFilters.id_professional_area);
        if (!area) return t("audienceModal.options.professionals.title");
        return audienceFilters.career
          ? `${area.name} · ${audienceFilters.career}`
          : area.name;
      })()
    : t(`audienceModal.options.${audience}.title`);

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    obtenerOferta(editId)
      .then((oferta) => {
        setTitle(oferta.title ?? "");
        setDescription(oferta.description ?? "");
        setArea(oferta.area ?? "");
        setType(oferta.type ?? "");
        setModalidad(oferta.modalidad ?? "");
        setNivel(oferta.nivel ?? "");
        setUbicacion(oferta.ubicacion ?? "");
        setSalaryMin(oferta.salary_min != null ? String(oferta.salary_min) : "");
        setSalaryMax(oferta.salary_max != null ? String(oferta.salary_max) : "");
        setCurrency(oferta.currency ?? "USD");
        setShowSalary(oferta.show_salary ?? true);
        setClosedAt(oferta.closed_at ? oferta.closed_at.split("T")[0] : "");
        const rawSkills = oferta.skills ?? [];
        setSkills(rawSkills.map(s => typeof s === "string" ? s : s.name ?? "").filter(Boolean));
        const banner = oferta.banner_url ?? oferta.banner_image ?? oferta.banner ?? null;
        if (banner) setBannerPreview(banner);
        if (oferta.id_audience_type)
          setAudience(AUDIENCE_CODES_BY_ID[oferta.id_audience_type] ?? "public");
        if (oferta.audience_filters)
          setAudienceFilters({
            id_professional_area: oferta.audience_filters.id_professional_area ?? null,
            career: oferta.audience_filters.career ?? null,
          });
        if (oferta.salary_min || oferta.closed_at || oferta.skills?.length) setExpanded(true);
      })
      .catch(() => { toast.error(t("newConvocatory.toast.loadError")); goBack(); })
      .finally(() => setLoadingData(false));
  }, [editId, goBack, t]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handlePdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setPdfName(file.name);
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && currentSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(currentSkill.trim())) setSkills(s => [...s, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleAudienceConfirm = ({ audience: aud, filters }) => {
    setAudience(aud);
    if (filters) setAudienceFilters(filters);
    setShowAudienceModal(false);
  };

  const publish = async (asDraft = false) => {
    if (!title.trim()) { toast.error(t("newConvocatory.toast.titleRequired")); return; }
    if (!asDraft && !canPublishOffer) {
      toast.error(t("newConvocatory.toast.noPermission"));
      return;
    }
    setLoading(true);
    const payload = {
      title, description, area, type, modalidad, nivel, ubicacion,
      salaryMin: parseInt(salaryMin) || null,
      salaryMax: parseInt(salaryMax) || null,
      currency, showSalary,
      closedAt: closedAt || null,
      skills, bannerFile, asDraft,
      id_audience_type: AUDIENCE_TYPE_IDS[audience],
      audienceFilters: audience === "professionals" ? audienceFilters : null,
    };
    try {
      if (isEditing) {
        await actualizarOferta(editId, payload);
        toast.custom(() => <SuccessToast
          message={asDraft ? t("newConvocatory.toast.draftUpdated") : t("newConvocatory.toast.editSuccess")}
          sub={asDraft ? t("newConvocatory.toast.draftUpdatedSub") : t("newConvocatory.toast.editSuccessSub")}
        />);
      } else {
        await crearOferta(payload);
        toast.custom(() => <SuccessToast
          message={asDraft ? t("newConvocatory.toast.draftSaved") : t("newConvocatory.toast.createSuccess")}
          sub={asDraft ? t("newConvocatory.toast.draftSavedSub") : t("newConvocatory.toast.createSuccessSub")}
        />);
      }
      goBack();
    } catch (err) {
      toast.error(err.message || t("newConvocatory.toast.saveError"));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="new-conv-loading">
        <div className="new-conv-loading__spinner" />
        <p className="new-conv-loading__text">{t("newConvocatory.loading")}</p>
      </div>
    );
  }

  return (
    <div className="new-conv">

      <div className="new-conv__header">
        <button className="new-conv__back-btn" type="button" onClick={goBack}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="new-conv__header-title">
            {isEditing ? t("newConvocatory.header.edit") : t("newConvocatory.header.new")}
          </h1>
          {isEditing && (
            <p className="new-conv__header-sub">{t("newConvocatory.header.editSub")}</p>
          )}
        </div>
        {isEditing && (
          <span className="new-conv__edit-badge">
            <Sparkles size={11} /> {t("newConvocatory.header.editBadge")}
          </span>
        )}
      </div>

      <div className="new-conv__card">

        <div className="new-conv__author">
          <div className="new-conv__author-avatar">
            {companyAvatar
              ? <img src={companyAvatar} alt={companyName} />
              : initials}
          </div>
          <div className="new-conv__author-info">
            <div className="new-conv__author-name">{companyName}</div>
            <button
              type="button"
              className="new-conv__audience-pill"
              onClick={() => setShowAudienceModal(true)}
            >
              <AudienceIcon size={12} />
              <span>{audienceLabel}</span>
              <ChevronDown size={11} />
            </button>
          </div>
        </div>

        <input
          type="text"
          className="new-conv__title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t("newConvocatory.placeholders.title")}
        />

        <input
          type="text"
          className="new-conv__area-input"
          value={area}
          onChange={e => setArea(e.target.value)}
          placeholder={t("newConvocatory.placeholders.area")}
        />

        <textarea
          className="new-conv__desc-input"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t("newConvocatory.placeholders.description")}
          rows={4}
        />

        {bannerPreview && (
          <div className="new-conv__banner">
            <img src={bannerPreview} alt="Banner" />
            <button
              type="button"
              className="new-conv__banner-remove"
              onClick={() => { setBannerPreview(null); setBannerFile(null); }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {pdfName && (
          <div className="new-conv__pdf">
            <FileText size={18} color="var(--color-blue-mid)" />
            <span className="new-conv__pdf-name">{pdfName}</span>
            <button
              type="button"
              className="new-conv__pdf-remove"
              onClick={() => { setPdfFile(null); setPdfName(""); }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <hr className="new-conv__divider" />
        <div className="new-conv__chips">
          <ChipSelector
            icon={Briefcase}
            label={t("newConvocatory.chips.type")}
            value={type} onChange={setType}
            options={t("newConvocatory.chips.typeOptions", { returnObjects: true })}
            color="#1a6fbd"
          />
          <ChipSelector
            icon={Monitor}
            label={t("newConvocatory.chips.modality")}
            value={modalidad} onChange={setModalidad}
            options={t("newConvocatory.chips.modalityOptions", { returnObjects: true })}
            color="#7c3aed"
          />
          <ChipSelector
            icon={Award}
            label={t("newConvocatory.chips.level")}
            value={nivel} onChange={setNivel}
            options={t("newConvocatory.chips.levelOptions", { returnObjects: true })}
            color="#059669"
          />
          <div className={`nc-location ${ubicacion ? "nc-location--filled" : "nc-location--empty"}`}>
            <MapPin size={13} />
            <input
              type="text"
              className="nc-location__input"
              value={ubicacion}
              onChange={e => setUbicacion(e.target.value)}
              placeholder={t("newConvocatory.placeholders.city")}
              style={{ width: ubicacion ? Math.max(60, ubicacion.length * 8) : 60 }}
            />
          </div>
        </div>

        <hr className="new-conv__divider" />
        <button
          type="button"
          className="new-conv__expand-btn"
          onClick={() => setExpanded(e => !e)}
        >
          <span>{t("newConvocatory.expand.label")}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <div className="new-conv__expand-body">
            <div>
              <label className="new-conv__field-label">{t("newConvocatory.expand.salary")}</label>
              <div className="new-conv__salary-grid">
                <input className="new-conv__input" type="number"
                  placeholder={t("newConvocatory.placeholders.salaryMin")}
                  value={salaryMin} onChange={e => setSalaryMin(e.target.value)} />
                <input className="new-conv__input" type="number"
                  placeholder={t("newConvocatory.placeholders.salaryMax")}
                  value={salaryMax} onChange={e => setSalaryMax(e.target.value)} />
                <select className="new-conv__input" value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option>USD</option>
                  <option>BOB</option>
                  <option>EUR</option>
                </select>
              </div>
              <label className="new-conv__checkbox-row">
                <input type="checkbox" checked={showSalary} onChange={e => setShowSalary(e.target.checked)} />
                {t("newConvocatory.expand.showSalary")}
              </label>
            </div>
            <div>
              <label className="new-conv__field-label">{t("newConvocatory.expand.deadline")}</label>
              <input className="new-conv__input" type="date"
                value={closedAt} onChange={e => setClosedAt(e.target.value)} />
            </div>
            <div>
              <label className="new-conv__field-label">{t("newConvocatory.expand.skills")}</label>
              <input
                className="new-conv__input"
                type="text"
                value={currentSkill}
                onChange={e => setCurrentSkill(e.target.value)}
                onKeyDown={addSkill}
                placeholder={t("newConvocatory.placeholders.skillInput")}
              />
              {skills.length > 0 && (
                <div className="new-conv__skills-row">
                  {skills.map(skill => (
                    <span key={skill} className="new-conv__skill-tag">
                      {skill}
                      <button
                        type="button"
                        className="new-conv__skill-remove"
                        onClick={() => setSkills(s => s.filter(x => x !== skill))}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <hr className="new-conv__divider" />
        <div className="new-conv__actions">
          <div className="new-conv__attach-row">
            <input ref={imageRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            <input ref={pdfRef}   type="file" accept=".pdf"    onChange={handlePdf}   className="hidden" />
            <button
              type="button"
              className={`new-conv__icon-btn ${bannerPreview ? "new-conv__icon-btn--active" : ""}`}
              title={t("newConvocatory.actions.attachImage")}
              onClick={() => imageRef.current?.click()}
            >
              <Image size={18} />
            </button>
            <button
              type="button"
              className={`new-conv__icon-btn ${pdfFile ? "new-conv__icon-btn--active" : ""}`}
              title={t("newConvocatory.actions.attachPdf")}
              onClick={() => pdfRef.current?.click()}
            >
              <FileText size={18} />
            </button>
          </div>

          <div className="new-conv__btn-row">
            <button
              type="button"
              className="new-conv__draft-btn"
              onClick={() => publish(true)}
              disabled={loading}
            >
              {t("newConvocatory.actions.saveDraft")}
            </button>
            <button
              type="button"
              className="new-conv__publish-btn"
              onClick={() => publish(false)}
              disabled={loading || !title.trim() || !canPublishOffer}
            >
              {isEditing
                ? <><Sparkles size={14} />{loading ? t("newConvocatory.actions.saving") : t("newConvocatory.actions.saveChanges")}</>
                : <><Send size={14} />{loading ? t("newConvocatory.actions.publishing") : t("newConvocatory.actions.publish")}</>
              }
            </button>
          </div>
        </div>
      </div>

      {showAudienceModal && (
        <AudienceModal
          currentAudience={audience}
          currentFilters={audienceFilters}
          onClose={() => setShowAudienceModal(false)}
          onConfirm={handleAudienceConfirm}
        />
      )}
    </div>
  );
}