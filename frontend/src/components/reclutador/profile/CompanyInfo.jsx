import { useState } from "react";
import {
  Globe, Users, Calendar, Briefcase,
  Pencil, Check, X, Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button }         from "../../ui/button";
import { useAuth }        from "../../../context/useAuth";
import { apiClient }      from "../../../services/http/httpClient";

export function CompanyInfo({ isOwner = true, companyData = null }) {
  const { t } = useTranslation();
  const { company: authCompany, updateCompany } = useAuth();
  const company = companyData ?? authCompany;

  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    description:  company?.description  ?? "",
    mission:      company?.mission      ?? "",
    vision:       company?.vision       ?? "",
    founded_year: company?.founded_year ?? "",
    size:         company?.size         ?? "",
    alcance:      company?.alcance      ?? "",
    personeria:   company?.personeria   ?? "",
    schedule:     company?.schedule     ?? "",
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleEdit = () => {
    setForm({
      description:  company?.description  ?? "",
      mission:      company?.mission      ?? "",
      vision:       company?.vision       ?? "",
      founded_year: company?.founded_year ?? "",
      size:         company?.size         ?? "",
      alcance:      company?.alcance      ?? "",
      personeria:   company?.personeria   ?? "",
      schedule:     company?.schedule     ?? "",
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
      setServerError(err.message || t("company.info.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const SIZE_OPTIONS = [
    t("company.info.size.1_10"),
    t("company.info.size.11_50"),
    t("company.info.size.51_200"),
    t("company.info.size.201_500"),
    t("company.info.size.500plus"),
  ];

  const ALCANCE_OPTIONS = [
    t("company.info.alcance.local"),
    t("company.info.alcance.regional"),
    t("company.info.alcance.nacional"),
    t("company.info.alcance.internacional"),
  ];

  const PERSONERIA_OPTIONS = [
    t("company.info.personeria.natural"),
    t("company.info.personeria.srl"),
    t("company.info.personeria.sa"),
    t("company.info.personeria.unipersonal"),
    t("company.info.personeria.ong"),
    t("company.info.personeria.cooperativa"),
  ];

  return (
    <div className="cinfo__card">

      {/* ── Header ── */}
      <div className="cinfo__section-header">
        <h3 className="cinfo__section-title">{t("company.info.title")}</h3>
        {isOwner && !editing && (
          <button className="cinfo__edit-btn" onClick={handleEdit}>
            <Pencil size={13} /> {t("company.info.actions.edit")}
          </button>
        )}
        {isOwner && editing && (
          <div className="cinfo__header-actions">
            <button className="cinfo__cancel-btn" onClick={handleCancel} disabled={saving}>
              <X size={13} /> {t("company.info.actions.cancel")}
            </button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check size={13} /> {saving ? t("company.info.actions.saving") : t("company.info.actions.save")}
            </Button>
          </div>
        )}
      </div>

      {serverError && <p className="cinfo__error">{serverError}</p>}

      {/* ── Descripción ── */}
      <div className="cinfo__field">
        <p className="cinfo__field-label"></p>
        {editing ? (
          <>
            <textarea
              className="cinfo__textarea"
              value={form.description}
              onChange={set("description")}
              rows={4}
              maxLength={500}
              placeholder={t("company.info.description.placeholder")}
            />
            <p className="cinfo__char-count">
              {t("company.info.description.charCount", { count: form.description.length })}
            </p>
          </>
        ) : (
          <p className="cinfo__desc">
            {company?.description?.trim()
              ? company.description
              : <span className="cinfo__empty">{t("company.info.description.empty")}</span>
            }
          </p>
        )}
      </div>

      {/* ── Datos generales ── */}
      <div className="cinfo__general">
        <p className="cinfo__subsection-label">{t("company.info.general.title")}</p>
        <div className="cinfo__general-rows">

          {/* Año de fundación */}
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Calendar size={15} /></span>
            <span className="cinfo__general-label">{t("company.info.general.foundedYear")}</span>
            {editing
              ? <input
                  className="cinfo__input"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={form.founded_year}
                  onChange={set("founded_year")}
                  placeholder={t("company.info.general.foundedYearPlaceholder")}
                />
              : <span className="cinfo__general-value">{company?.founded_year || t("company.info.general.empty")}</span>
            }
          </div>

          {/* Tamaño */}
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Users size={15} /></span>
            <span className="cinfo__general-label">{t("company.info.general.size")}</span>
            {editing
              ? <select className="cinfo__input" value={form.size} onChange={set("size")}>
                  <option value="">{t("company.info.general.sizePlaceholder")}</option>
                  {SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              : <span className="cinfo__general-value">{company?.size || t("company.info.general.empty")}</span>
            }
          </div>

          {/* Alcance */}
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Globe size={15} /></span>
            <span className="cinfo__general-label">{t("company.info.general.alcance")}</span>
            {editing
              ? <select className="cinfo__input" value={form.alcance} onChange={set("alcance")}>
                  <option value="">{t("company.info.general.sizePlaceholder")}</option>
                  {ALCANCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              : <span className="cinfo__general-value">{company?.alcance || t("company.info.general.empty")}</span>
            }
          </div>

          {/* Personería */}
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Briefcase size={15} /></span>
            <span className="cinfo__general-label">{t("company.info.general.personeria")}</span>
            {editing
              ? <select className="cinfo__input" value={form.personeria} onChange={set("personeria")}>
                  <option value="">{t("company.info.general.sizePlaceholder")}</option>
                  {PERSONERIA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              : <span className="cinfo__general-value">{company?.personeria || t("company.info.general.empty")}</span>
            }
          </div>

          {/* Horario */}
          <div className="cinfo__general-row">
            <span className="cinfo__general-icon"><Clock size={15} /></span>
            <span className="cinfo__general-label">{t("company.info.general.schedule")}</span>
            {editing
              ? <input
                  className="cinfo__input"
                  value={form.schedule}
                  onChange={set("schedule")}
                  placeholder={t("company.info.general.schedulePlaceholder")}
                />
              : <span className="cinfo__general-value">{company?.schedule || t("company.info.general.empty")}</span>
            }
          </div>

        </div>
      </div>

    </div>
  );
}