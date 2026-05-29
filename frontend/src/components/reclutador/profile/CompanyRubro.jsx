import { useState } from "react";
import { Building2, Globe, Users, Pencil, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button }         from "../../ui/button";
import { useAuth }        from "../../../context/useAuth";
import { apiClient }      from "../../../services/http/httpClient";

export function CompanyRubro({ isOwner = false, companyData = null }) {
  const { t } = useTranslation();
  const { company: authCompany, updateCompany } = useAuth();
  const company = companyData ?? authCompany;

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
      setServerError(err.message || t("company.rubro.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const servicesList = (company?.services ?? "").split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div className="cinfo__card">
      <div className="cinfo__section-header">
        <h3 className="cinfo__section-title">{t("company.rubro.title")}</h3>
        {isOwner && !editing && (
          <button className="cinfo__edit-btn" onClick={handleEdit}>
            <Pencil size={13} /> {t("company.rubro.actions.edit")}
          </button>
        )}
        {isOwner && editing && (
          <div className="cinfo__header-actions">
            <button className="cinfo__cancel-btn" onClick={handleCancel} disabled={saving}>
              <X size={13} /> {t("company.rubro.actions.cancel")}
            </button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check size={13} /> {saving ? t("company.rubro.actions.saving") : t("company.rubro.actions.save")}
            </Button>
          </div>
        )}
      </div>

      {serverError && <p className="cinfo__error">{serverError}</p>}

      <div className="cinfo__data-rows">
        <div className="cinfo__data-row">
          <span className="cinfo__data-icon"><Building2 size={15} /></span>
          <span className="cinfo__data-label">{t("company.rubro.fields.sector")}</span>
          {editing
            ? <input
                className="cinfo__input"
                value={form.industry}
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                placeholder={t("company.rubro.fields.sectorPlaceholder")}
              />
            : <span className="cinfo__data-value">{company?.industry || t("company.rubro.fields.empty")}</span>
          }
        </div>

        <div className="cinfo__data-row">
          <span className="cinfo__data-icon"><Globe size={15} /></span>
          <span className="cinfo__data-label">{t("company.rubro.fields.specialty")}</span>
          {editing
            ? <input
                className="cinfo__input"
                value={form.specialty}
                onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                placeholder={t("company.rubro.fields.specialtyPlaceholder")}
              />
            : <span className="cinfo__data-value">{company?.specialty || t("company.rubro.fields.empty")}</span>
          }
        </div>

        <div className="cinfo__data-row">
          <span className="cinfo__data-icon"><Users size={15} /></span>
          <span className="cinfo__data-label">{t("company.rubro.fields.segment")}</span>
          {editing
            ? <input
                className="cinfo__input"
                value={form.segment}
                onChange={e => setForm(f => ({ ...f, segment: e.target.value }))}
                placeholder={t("company.rubro.fields.segmentPlaceholder")}
              />
            : <span className="cinfo__data-value">{company?.segment || t("company.rubro.fields.empty")}</span>
          }
        </div>
      </div>

      <div className="cinfo__subsection">
        <p className="cinfo__subsection-label">{t("company.rubro.services.title")}</p>
        {editing ? (
          <>
            <input
              className="cinfo__input"
              value={form.services}
              onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
              placeholder={t("company.rubro.services.placeholder")}
            />
            <p className="cinfo__hint">{t("company.rubro.services.hint")}</p>
          </>
        ) : (
          <div className="cinfo__tags">
            {servicesList.length > 0
              ? servicesList.map(s => <span key={s} className="cinfo__tag">{s}</span>)
              : <span className="cinfo__empty">{t("company.rubro.services.empty")}</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}