import { useState } from "react";
import {
  Building2, MapPin, Globe, Camera, Share2,
  Pencil, Check, X, Users, Calendar,
} from "lucide-react";
import { useTranslation }      from "react-i18next";
import { Button }              from "../../ui/button";
import { useAuth }             from "../../../context/useAuth";
import { apiClient }           from "../../../services/http/httpClient";
import { CompanyFollowBlock }  from "../shared/FollowBlock";
import { useCompanyFollowSystem } from "../../../hooks/useCompanyFollowSystem";
import { ConfirmUnfollowModal } from "../../dashboard/profile/ProfileTrustModals";

const RUBROS = [
  "Tecnología", "Salud", "Finanzas", "Educación", "Comercio",
  "Manufactura", "Construcción", "Logística", "Marketing", "Legal",
  "Recursos Humanos", "Consultoría", "Energía", "Agro", "Turismo", "Medios",
];

const TABS = [
  { key: "convocatorias", labelKey: "company.header.tabs.convocatorias" },
  { key: "informacion",   labelKey: "company.header.tabs.informacion"   },
  { key: "rubro",         labelKey: "company.header.tabs.rubro"         },
  { key: "contacto",      labelKey: "company.header.tabs.contacto"      },
  { key: "seguidores",    labelKey: "company.header.tabs.seguidores"    },
];

export function CompanyHeader({
  editing, setEditing,
  description, setDescription,
  activeTab, setActiveTab,
  companyData    = null,
  isOwner        = true,
  companyMetrics = {},
}) {
  const { t } = useTranslation();
  const { company: authCompany, updateCompany } = useAuth();
  const company = companyData ?? authCompany;

  const fw = useCompanyFollowSystem(company?.id_company);
  const [fwInit, setFwInit] = useState(false);
  if (!fwInit && company?.id_company) {
    fw.init(companyMetrics);
    setFwInit(true);
  }

  const [bannerPreview, setBannerPreview] = useState(company?.banner_url ?? "/banner-empresa.png");
  const [bannerFile,    setBannerFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(company?.logo_url   ?? null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [serverError,   setServerError]   = useState("");
  const [rubroSugs,     setRubroSugs]     = useState([]);
  const [copied,        setCopied]        = useState(false);

  const [form, setForm] = useState({
    name:     company?.name     ?? "",
    industry: company?.industry ?? "",
    city:     company?.city     ?? "",
    website:  company?.website  ?? "",
    phone:    company?.phone    ?? "",
  });

  const nombre    = editing ? form.name     : (company?.name     ?? "Mi empresa");
  const industria = editing ? form.industry : (company?.industry ?? "");
  const ciudad    = editing ? form.city     : (company?.city     ?? "");
  const sitio     = editing ? form.website  : (company?.website  ?? "");
  const anio      = company?.founded_year   ?? null;

  const initials = (company?.name ?? "M")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerPreview(URL.createObjectURL(file));
    setBannerFile(file);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const handleEdit = () => {
    setForm({
      name:     company?.name     ?? "",
      industry: company?.industry ?? "",
      city:     company?.city     ?? "",
      website:  company?.website  ?? "",
      phone:    company?.phone    ?? "",
    });
    setServerError("");
    setEditing(true);
  };

  const slugify = (text) =>
    text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

  const handleShare = async () => {
    const slug = slugify(company?.name || "empresa");
    const url  = `${window.location.origin}/empresa/${slug}-${company?.id_company}`;
    try { await navigator.clipboard.writeText(url); }
    catch { prompt("Copia este enlace:", url); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCancel = () => {
    setBannerPreview(company?.banner_url ?? "/banner-empresa.png");
    setAvatarPreview(company?.logo_url   ?? null);
    setBannerFile(null);
    setAvatarFile(null);
    setServerError("");
    setRubroSugs([]);
    setEditing(false);
  };

  const handleRubroChange = (val) => {
    setForm(f => ({ ...f, industry: val }));
    const q = val.toLowerCase();
    setRubroSugs(q ? RUBROS.filter(r => r.toLowerCase().includes(q)).slice(0, 5) : []);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setServerError(t("company.header.errors.nameRequired")); return; }
    setSaving(true);
    setServerError("");
    try {
      const payload = new FormData();
      payload.append("_method",     "PUT");
      payload.append("name",        form.name);
      payload.append("description", description ?? "");
      payload.append("industry",    form.industry);
      payload.append("city",        form.city);
      payload.append("phone",       form.phone);
      if (form.website) payload.append("website", form.website);
      if (avatarFile)   payload.append("logo",    avatarFile);
      if (bannerFile)   payload.append("banner",  bannerFile);

      const data = await apiClient.post("company", payload);
      updateCompany(data.company);
      if (data.company?.logo_url)   setAvatarPreview(data.company.logo_url);
      if (data.company?.banner_url) setBannerPreview(data.company.banner_url);
      setBannerFile(null);
      setAvatarFile(null);
      setEditing(false);
    } catch (err) {
      setServerError(err.message || t("company.header.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (!company) return null;

  return (
    <div className="company-header">

      {isOwner && (
        <>
          <input type="file" accept="image/*" id="bannerInput" className="hidden" onChange={handleBannerChange} />
          <input type="file" accept="image/*" id="avatarInput" className="hidden" onChange={handleAvatarChange} />
        </>
      )}

      {/* Banner */}
      <div className="company-header__banner group">
        <img src={bannerPreview} alt="Banner" />
        <div className="company-header__banner-overlay" />
        {isOwner && (
          <button
            onClick={() => document.getElementById("bannerInput").click()}
            className={`company-header__banner-btn ${editing ? "visible" : ""}`}
          >
            <Camera size={14} />
            {editing ? t("company.header.banner.change") : t("company.header.banner.edit")}
          </button>
        )}
      </div>

      {/* Cuerpo */}
      <div className="company-header__body">
        <div className="company-header__inner">

          <div className="company-header__left">

            {/* Avatar */}
            <div className="company-header__avatar-wrap">
              <div className="company-header__avatar">
                {avatarPreview ? <img src={avatarPreview} alt="Logo" /> : initials}
              </div>
              {isOwner && (
                <button
                  onClick={() => document.getElementById("avatarInput").click()}
                  className={`company-header__avatar-edit ${editing ? "visible" : ""}`}
                >
                  <Camera size={13} />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="company-header__info">

              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="company-header__input company-header__input--name"
                  placeholder={t("company.header.fields.namePlaceholder")}
                />
              ) : (
                <h1 className="company-header__name">{nombre}</h1>
              )}

              <div className="company-header__meta">
                {editing ? (
                  <>
                    <div className="company-header__meta-item relative">
                      <Building2 size={14} />
                      <div className="relative">
                        <input
                          type="text"
                          value={form.industry}
                          onChange={e => handleRubroChange(e.target.value)}
                          autoComplete="off"
                          className="company-header__input"
                          placeholder={t("company.header.fields.industryPlaceholder")}
                        />
                        {rubroSugs.length > 0 && (
                          <div className="company-header__suggestions">
                            {rubroSugs.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => { setForm(f => ({ ...f, industry: s })); setRubroSugs([]); }}
                                className="company-header__suggestion-item"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="company-header__meta-item">
                      <MapPin size={14} />
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        className="company-header__input"
                        placeholder={t("company.header.fields.cityPlaceholder")}
                      />
                    </div>

                    <div className="company-header__meta-item">
                      <Globe size={14} />
                      <input
                        type="url"
                        value={form.website}
                        onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                        className="company-header__input"
                        placeholder={t("company.header.fields.websitePlaceholder")}
                      />
                    </div>
                  </>
                ) : (
                  <p className="company-header__meta-line">
                    {[
                      industria,
                      ciudad,
                      anio ? t("company.header.founded", { year: anio }) : null,
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              {serverError && <p className="company-header__error">{serverError}</p>}

              {/* Contadores — solo números, sin modal */}
              {!editing && company?.id_company && (
                <div className="company-header__follow-row">
                  <CompanyFollowBlock
                    companyId={company.id_company}
                    initialMetrics={companyMetrics}
                    targetName={company.name}
                    readonly
                  />
                </div>
              )}

            </div>
          </div>

          {/* Acciones */}
          <div className="company-header__actions">
            {editing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  <X className="w-4 h-4 mr-1.5" /> {t("company.header.actions.cancel")}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Check className="w-4 h-4 mr-1.5" />
                  {saving ? t("company.header.actions.saving") : t("company.header.actions.save")}
                </Button>
              </>
            ) : (
              <>
                {/* Botón seguir — solo para visitantes */}
                {!isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fw.toggle}
                    disabled={fw.busy}
                  >
                    {fw.isFollowing
                      ? t("company.header.actions.unfollow")
                      : t("company.header.actions.follow")}
                  </Button>
                )}

                <div className="flex flex-col items-end gap-1">
                  <Button variant="white" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-1.5" /> {t("company.header.actions.share")}
                  </Button>
                  {copied && (
                    <span className="company-header__copied">
                      {t("company.header.actions.linkCopied")}
                    </span>
                  )}
                </div>

                {isOwner && (
                  <Button variant="destructive" size="sm" onClick={handleEdit}>
                    <Pencil className="w-4 h-4 mr-1.5" /> {t("company.header.actions.edit")}
                  </Button>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* Modal confirmar dejar de seguir */}
      {fw.unfollowOpen && (
        <ConfirmUnfollowModal
          user={{ name: company?.name ?? "esta empresa" }}
          busy={fw.busy}
          error={fw.error}
          onCancel={fw.cancelUnfollow}
          onConfirm={fw.confirmUnfollow}
        />
      )}

      {/* Tabs */}
      <nav className="company-header__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`company-header__tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab?.(tab.key)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </nav>

    </div>
  );
}