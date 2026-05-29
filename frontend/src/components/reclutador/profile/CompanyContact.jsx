import { useState } from "react";
import {
  Phone, Mail, Globe, Navigation, MapPin,
  Pencil, Check, X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button }         from "../../ui/button";
import { useAuth }        from "../../../context/useAuth";
import { apiClient }      from "../../../services/http/httpClient";

export function CompanyContact({ company, isOwner = false, companyData = null }) {
  const { t } = useTranslation();
  const { company: authCompany, updateCompany } = useAuth();
  const c = companyData ?? company ?? authCompany;

  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    phone_prefix: c?.phone_prefix ?? "",
    phone:        c?.phone        ?? "",
    email:        c?.email        ?? "",
    website:      c?.website      ?? "",
    address:      c?.address      ?? "",
    city:         c?.city         ?? "",
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleEdit = () => {
    setForm({
      phone_prefix: c?.phone_prefix ?? "",
      phone:        c?.phone        ?? "",
      email:        c?.email        ?? "",
      website:      c?.website      ?? "",
      address:      c?.address      ?? "",
      city:         c?.city         ?? "",
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
      payload.append("_method", "PUT");
      Object.entries(form).forEach(([k, v]) => payload.append(k, v ?? ""));
      const data = await apiClient.post("company", payload);
      updateCompany(data.company);
      setEditing(false);
    } catch (err) {
      setServerError(err.message || t("company.contact.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const phone    = [c?.phone_prefix, c?.phone].filter(Boolean).join(" ");
  const location = [c?.address, c?.city].filter(Boolean).join(", ");

  return (
    <div className="cinfo__card">

      {/* ── Header ── */}
      <div className="cinfo__section-header">
        <h3 className="cinfo__section-title">{t("company.contact.title")}</h3>
        {isOwner && !editing && (
          <button className="cinfo__edit-btn" onClick={handleEdit}>
            <Pencil size={13} /> {t("company.contact.actions.edit")}
          </button>
        )}
        {isOwner && editing && (
          <div className="cinfo__header-actions">
            <button className="cinfo__cancel-btn" onClick={handleCancel} disabled={saving}>
              <X size={13} /> {t("company.contact.actions.cancel")}
            </button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check size={13} /> {saving ? t("company.contact.actions.saving") : t("company.contact.actions.save")}
            </Button>
          </div>
        )}
      </div>

      {serverError && <p className="cinfo__error">{serverError}</p>}

      {/* ── Ubicación ── */}
      <p className="cinfo__subsection-label">{t("company.contact.location.title")}</p>
      {editing ? (
        <div className="cinfo__general-rows" style={{ marginBottom: 20 }}>
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><MapPin size={15} /></span>
            <span className="cinfo__general-label">{t("company.contact.location.addressLabel")}</span>
            <input
              className="cinfo__input"
              value={form.address}
              onChange={set("address")}
              placeholder={t("company.contact.location.addressPlaceholder")}
            />
          </div>
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Navigation size={15} /></span>
            <span className="cinfo__general-label">{t("company.contact.location.cityLabel")}</span>
            <input
              className="cinfo__input"
              value={form.city}
              onChange={set("city")}
              placeholder={t("company.contact.location.cityPlaceholder")}
            />
          </div>
        </div>
      ) : (
        <div className="ccontact__row" style={{ marginBottom: 20 }}>
          <span className="ccontact__row-icon"><MapPin size={15} /></span>
          <span className="ccontact__row-value">
            {location || <span className="cinfo__empty">{t("company.contact.location.empty")}</span>}
          </span>
          {location && (
            <a
              className="ccontact__map-link"
              href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={12} /> {t("company.contact.location.viewOnMaps")}
            </a>
          )}
        </div>
      )}

      {/* ── Datos de contacto ── */}
      <p className="cinfo__subsection-label">{t("company.contact.fields.title")}</p>

      {editing ? (
        <div className="cinfo__general-rows">
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Phone size={15} /></span>
            <span className="cinfo__general-label">{t("company.contact.fields.phoneLabel")}</span>
            <div style={{ display: "flex", gap: 6, flex: 1 }}>
              <input
                className="cinfo__input"
                style={{ width: 70, flex: "none" }}
                value={form.phone_prefix}
                onChange={set("phone_prefix")}
                placeholder={t("company.contact.fields.phonePrefixPlaceholder")}
              />
              <input
                className="cinfo__input"
                value={form.phone}
                onChange={set("phone")}
                placeholder={t("company.contact.fields.phonePlaceholder")}
              />
            </div>
          </div>
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Mail size={15} /></span>
            <span className="cinfo__general-label">{t("company.contact.fields.emailLabel")}</span>
            <input
              className="cinfo__input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder={t("company.contact.fields.emailPlaceholder")}
            />
          </div>
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Globe size={15} /></span>
            <span className="cinfo__general-label">{t("company.contact.fields.websiteLabel")}</span>
            <input
              className="cinfo__input"
              type="url"
              value={form.website}
              onChange={set("website")}
              placeholder={t("company.contact.fields.websitePlaceholder")}
            />
          </div>
        </div>
      ) : (
        <div className="ccontact__rows">
          {phone && (
            <div className="ccontact__row">
              <span className="ccontact__row-icon"><Phone size={15} /></span>
              <a href={`tel:${phone}`} className="ccontact__row-link">{phone}</a>
            </div>
          )}

          <div className="ccontact__row">
            <span className="ccontact__row-icon"><Mail size={15} /></span>
            {c?.email
              ? <a href={`mailto:${c.email}`} className="ccontact__row-link">{c.email}</a>
              : <span className="cinfo__empty">{t("company.contact.fields.emailEmpty")}</span>
            }
          </div>

          {c?.website && (
            <div className="ccontact__row">
              <span className="ccontact__row-icon"><Globe size={15} /></span>
              <a href={c.website} className="ccontact__row-link" target="_blank" rel="noreferrer">
                {c.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>
      )}

    </div>
  );
}