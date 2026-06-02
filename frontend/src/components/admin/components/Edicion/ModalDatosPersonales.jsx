// src/components/admin/components/Edicion/ModalDatosPersonales.jsx

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  X, Save, Camera, Upload, User, Loader2,
  Globe, Plus, Trash2, Eye, EyeOff, Link2,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import { apiClient } from "../../../../services/http/httpClient";
import {
  getAdminSocials,
  createAdminSocial,
  updateAdminSocial,
  deleteAdminSocial,
} from "../../../../services/adminProfileTableService";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const READONLY_STYLE = {
  background: "#f1f5f9", color: "#64748b", cursor: "default",
  userSelect: "none", fontSize: "12.5px", minHeight: "38px",
  display: "flex", alignItems: "center", padding: "9px 12px",
  border: "1.5px solid #e8ecf4", borderRadius: "9px", lineHeight: "1.4",
};

const EMPTY_NEW_SOCIAL = { id_platform: "", url: "", public: true };

export default function ModalDatosPersonales({ user, onClose, onSave }) {
  const { t } = useTranslation();
  const e  = "adminEdicion.datosPersonales";
  const es = `${e}.socials`;

  const FIELD_LABELS = {
    name:              t(`${e}.fields.name`),
    last_name:         t(`${e}.fields.lastName`),
    biography:         t(`${e}.fields.biography`),
    birthdate:         t(`${e}.fields.birthdate`),
    profile_photo:     t(`${e}.fields.profilePhoto`),
    cover_photo:       t(`${e}.fields.coverPhoto`),
    completed_profile: t(`${e}.fields.completedProfile`),
  };

  const [formData, setFormData] = useState({
    name: "", last_name: "", biography: "", birthdate: "",
    profile_photo: "", cover_photo: "", completed_profile: 0,
  });
  const [originalData,        setOriginalData]        = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [coverPhotoPreview,   setCoverPhotoPreview]   = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [error,        setError]        = useState(null);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const [socials,           setSocials]           = useState([]);
  const [originalSocials,   setOriginalSocials]   = useState([]);
  const [platforms,         setPlatforms]         = useState([]);
  const [isSocialsLoading,  setIsSocialsLoading]  = useState(true);
  const [isAddingSocial,    setIsAddingSocial]    = useState(false);
  const [newSocial,         setNewSocial]         = useState(EMPTY_NEW_SOCIAL);
  const [selectedSocialIdx, setSelectedSocialIdx] = useState(null);

  const profilePhotoRef = useRef(null);
  const coverPhotoRef   = useRef(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        if (user?.id_profile) {
          const data = await apiClient.get(`/admin/profile/${user.id_profile}`,
            { fallbackMessage: t(`${e}.errorLoad`) });
          const loaded = {
            name: data.name ?? "", last_name: data.last_name ?? "",
            biography: data.biography ?? "", birthdate: data.birthdate ?? "",
            profile_photo: data.profile_photo ?? "", cover_photo: data.cover_photo ?? "",
            completed_profile: data.completed_profile ?? 0,
          };
          setFormData(loaded); setOriginalData(loaded);
          setProfilePhotoPreview(data.profile_photo || null);
          setCoverPhotoPreview(data.cover_photo || null);
          return;
        }
        const loaded = {
          name: user.name ?? "", last_name: user.last_name ?? "",
          biography: user.biography ?? "", birthdate: user.birthdate ?? "",
          profile_photo: user.profile_photo ?? "", cover_photo: user.cover_photo ?? "",
          completed_profile: user.completed_profile ?? 0,
        };
        setFormData(loaded); setOriginalData(loaded);
        setProfilePhotoPreview(
          typeof user.profile_photo === "string" && user.profile_photo.trim()
            ? user.profile_photo.trim() : null
        );
        setCoverPhotoPreview(
          typeof user.cover_photo === "string" && user.cover_photo.trim()
            ? user.cover_photo.trim() : null
        );
      } catch (err) {
        setError(t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!user?.id_profile) return;
    const loadSocials = async () => {
      setIsSocialsLoading(true);
      try {
        const data = await getAdminSocials(user.id_profile);
        const loaded = (data?.socials ?? []).map((s) => ({
          ...s,
          public: s.public === true || s.public === 1 || s.public === "1",
          _isNew: false, _delete: false,
        }));
        setSocials(loaded);
        setOriginalSocials(loaded.map((s) => ({ ...s })));
        setPlatforms(data?.platforms ?? []);
      } catch (err) {
        console.error("[ModalDatosPersonales] Error al cargar redes sociales:", err);
      } finally {
        setIsSocialsLoading(false);
      }
    };
    loadSocials();
  }, [user?.id_profile]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePhotoSelect = (field, file, setPreview) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSocialChange = (index, field, value) =>
    setSocials((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));

  const handleDeleteSocial = (index) => {
    setSelectedSocialIdx(null);
    setSocials((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        return s._isNew ? null : { ...s, _delete: true };
      }).filter(Boolean)
    );
  };

  const handleRestoreSocial = (index) =>
    setSocials((prev) => prev.map((s, i) => (i === index ? { ...s, _delete: false } : s)));

  const handleSelectSocial = (index) => {
    if (socials[index]?._delete) { handleRestoreSocial(index); return; }
    setSelectedSocialIdx((prev) => (prev === index ? null : index));
  };

  const handleStartAddSocial  = () => { setNewSocial(EMPTY_NEW_SOCIAL); setIsAddingSocial(true); setSelectedSocialIdx(null); };
  const handleCancelAddSocial = () => { setIsAddingSocial(false); setNewSocial(EMPTY_NEW_SOCIAL); };

  const handleConfirmAddSocial = () => {
    if (!newSocial.id_platform || !newSocial.url.trim()) return;
    const alreadyUsed = socials.some(
      (s) => !s._delete && String(s.id_platform) === String(newSocial.id_platform)
    );
    if (alreadyUsed) return;
    const platformObj = platforms.find((p) => String(p.value) === String(newSocial.id_platform));
    setSocials((prev) => [
      ...prev,
      {
        id_social_networks: null, id_platform: Number(newSocial.id_platform),
        url: newSocial.url.trim(), public: newSocial.public,
        platform_name: platformObj?.label ?? "",
        created_at: null, updated_at: null, _isNew: true, _delete: false,
      },
    ]);
    setIsAddingSocial(false); setNewSocial(EMPTY_NEW_SOCIAL);
  };

  const buildResumen = () => {
    const cambios = [];
    if (originalData) {
      const textFields = ["name", "last_name", "biography", "birthdate", "completed_profile"];
      textFields.forEach((field) => {
        const original = (originalData[field] ?? "").toString().trim();
        const current  = (formData[field]     ?? "").toString().trim();
        if (original !== current)
          cambios.push({ label: FIELD_LABELS[field] ?? field, value: current || "—" });
      });
      if (formData.profile_photo instanceof File)
        cambios.push({ label: FIELD_LABELS.profile_photo, value: t(`${e}.resumen.newImage`) });
      if (formData.cover_photo instanceof File)
        cambios.push({ label: FIELD_LABELS.cover_photo, value: t(`${e}.resumen.newImage`) });
    }
    const addedSocials = socials.filter((s) => s._isNew && !s._delete);
    if (addedSocials.length > 0)
      cambios.push({
        label: t(`${e}.resumen.addedSocials`),
        value: addedSocials.map((s) => s.platform_name || `${t(`${es}.platformLabel`)} #${s.id_platform}`).join(", "),
      });
    const deletedSocials = socials.filter((s) => s._delete && !s._isNew);
    if (deletedSocials.length > 0)
      cambios.push({
        label: t(`${e}.resumen.deletedSocials`),
        value: deletedSocials.map((s) => s.platform_name || `${t(`${es}.platformLabel`)} #${s.id_social_networks}`).join(", "),
      });
    const origMap = Object.fromEntries(originalSocials.map((s) => [s.id_social_networks, s]));
    const modifiedSocials = socials.filter((s) => {
      if (s._isNew || s._delete || !s.id_social_networks) return false;
      const orig = origMap[s.id_social_networks];
      if (!orig) return false;
      return String(orig.id_platform) !== String(s.id_platform) ||
        orig.url !== s.url || Boolean(orig.public) !== Boolean(s.public);
    });
    if (modifiedSocials.length > 0)
      cambios.push({
        label: t(`${e}.resumen.modifiedSocials`),
        value: modifiedSocials.map((s) => s.platform_name || `${t(`${es}.platformLabel`)} #${s.id_social_networks}`).join(", "),
      });
    return cambios;
  };

  const handleSaveClick = () => { setConfirmError(""); setShowConfirm(true); };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      if (!user?.id_profile) throw new Error(t(`${e}.errorLoad`));
      const payload = new FormData();
      payload.append("_method",           "PATCH");
      payload.append("name",              formData.name);
      payload.append("last_name",         formData.last_name);
      payload.append("biography",         formData.biography         ?? "");
      payload.append("birthdate",         formData.birthdate         ?? "");
      payload.append("completed_profile", formData.completed_profile ? "1" : "0");
      if (formData.profile_photo instanceof File)
        payload.append("profile_photo", formData.profile_photo);
      if (formData.cover_photo instanceof File)
        payload.append("cover_photo", formData.cover_photo);

      const response = await apiClient.post(
        `/admin/profile/${user.id_profile}`, payload,
        { fallbackMessage: t(`${e}.errorLoad`) }
      );
      const updatedProfile = response?.data ?? response;

      const origMap = Object.fromEntries(originalSocials.map((s) => [s.id_social_networks, s]));
      const socialOps = [];
      for (const s of socials) {
        if (s._delete && !s._isNew && s.id_social_networks) {
          socialOps.push(deleteAdminSocial(user.id_profile, s.id_social_networks));
        } else if (s._isNew && !s._delete) {
          socialOps.push(createAdminSocial(user.id_profile, {
            id_platform: Number(s.id_platform), url: s.url, public: s.public,
          }));
        } else if (!s._isNew && !s._delete && s.id_social_networks) {
          const orig = origMap[s.id_social_networks];
          if (orig && (
            String(orig.id_platform) !== String(s.id_platform) ||
            orig.url !== s.url || Boolean(orig.public) !== Boolean(s.public)
          )) {
            socialOps.push(updateAdminSocial(user.id_profile, s.id_social_networks, {
              id_platform: Number(s.id_platform), url: s.url, public: s.public,
            }));
          }
        }
      }
      await Promise.all(socialOps);
      onSave?.(updatedProfile); setShowConfirm(false); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally {
      setIsSaving(false);
    }
  };

  const initials = ((formData.name?.[0] ?? "") + (formData.last_name?.[0] ?? "")).toUpperCase();
  const availablePlatforms = platforms.filter(
    (p) => !socials.some((s) => !s._delete && String(s.id_platform) === String(p.value))
  );

  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--personal">

            {/* HEADER */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <User size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">
                    {`${user.name ?? ""} ${user.last_name ?? ""}`.trim()}
                  </p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isSaving} aria-label={t("adminEdicion.common.close")}>
                <X size={16} />
              </button>
            </div>

            {/* BODY */}
            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${e}.loadingMsg`)}</span>
                </div>
              )}
              {error && !isLoading && <div className="edicion-modal__error">{error}</div>}

              {!isLoading && !error && (
                <>
                  {/* Foto de portada */}
                  <div className="edicion-modal__cover-wrap">
                    <div
                      className="edicion-modal__cover"
                      style={{ backgroundImage: coverPhotoPreview ? `url(${coverPhotoPreview})` : "none" }}
                    >
                      {!coverPhotoPreview && (
                        <span className="edicion-modal__cover-empty">{t(`${e}.coverEmpty`)}</span>
                      )}
                      <button type="button" className="edicion-modal__cover-btn"
                        onClick={() => coverPhotoRef.current?.click()}
                        title={t(`${e}.changeCover`)}>
                        <Camera size={13} /> {t(`${e}.changeCover`)}
                      </button>
                      <input ref={coverPhotoRef} type="file" accept="image/*"
                        style={{ display: "none" }}
                        onChange={(ev) =>
                          handlePhotoSelect("cover_photo", ev.target.files[0], setCoverPhotoPreview)
                        }
                      />
                    </div>

                    {/* Foto de perfil */}
                    <div className="edicion-modal__profile-wrap">
                      <div className="edicion-modal__profile-avatar">
                        {profilePhotoPreview ? (
                          <img src={profilePhotoPreview} alt={t(`${e}.fields.profilePhoto`)}
                            className="edicion-modal__profile-img" />
                        ) : (
                          <span className="edicion-modal__profile-initials">
                            {initials || <User size={20} />}
                          </span>
                        )}
                      </div>
                      <button type="button" className="edicion-modal__profile-btn"
                        onClick={() => profilePhotoRef.current?.click()}>
                        <Upload size={11} />
                      </button>
                      <input ref={profilePhotoRef} type="file" accept="image/*"
                        style={{ display: "none" }}
                        onChange={(ev) =>
                          handlePhotoSelect("profile_photo", ev.target.files[0], setProfilePhotoPreview)
                        }
                      />
                    </div>
                  </div>

                  {/* Campos de texto */}
                  <div className="edicion-modal__fields">
                    <div className="edicion-modal__row">
                      <div className="edicion-modal__field">
                        <label className="edicion-modal__label">
                          {t(`${e}.fields.name`)} <span className="edicion-modal__required">*</span>
                        </label>
                        <input className="edicion-modal__input" type="text"
                          value={formData.name}
                          onChange={(ev) => handleChange("name", ev.target.value)}
                          placeholder={t(`${e}.fields.name`)} maxLength={255} />
                      </div>
                      <div className="edicion-modal__field">
                        <label className="edicion-modal__label">
                          {t(`${e}.fields.lastName`)} <span className="edicion-modal__required">*</span>
                        </label>
                        <input className="edicion-modal__input" type="text"
                          value={formData.last_name}
                          onChange={(ev) => handleChange("last_name", ev.target.value)}
                          placeholder={t(`${e}.fields.lastName`)} maxLength={255} />
                      </div>
                    </div>

                    <div className="edicion-modal__field">
                      <label className="edicion-modal__label">{t(`${e}.fields.biography`)}</label>
                      <textarea className="edicion-modal__textarea"
                        value={formData.biography}
                        onChange={(ev) => handleChange("biography", ev.target.value)}
                        placeholder={t(`${e}.biographyPh`)} rows={3} maxLength={255} />
                      <span className="edicion-modal__char-count">
                        {formData.biography?.length ?? 0} / 255
                      </span>
                    </div>

                    <div className="edicion-modal__field edicion-modal__field--half">
                      <label className="edicion-modal__label">{t(`${e}.fields.birthdate`)}</label>
                      <input className="edicion-modal__input" type="date"
                        value={formData.birthdate ? formData.birthdate.slice(0, 10) : ""}
                        onChange={(ev) => handleChange("birthdate", ev.target.value)} />
                    </div>

                    {/* SECCIÓN REDES SOCIALES */}
                    <hr className="edicion-modal__divider" />

                    <div className="edicion-cv-details-header edicion-cv-details-header--socials">
                      <Globe size={14} />
                      <span className="edicion-cv-details-header__label">{t(`${es}.sectionTitle`)}</span>
                      <span className="edicion-tabla__count">
                        {socials.filter((s) => !s._delete).length} {t(`${es}.records`)}
                      </span>
                    </div>

                    <div className="edicion-cv-section">
                      <div className="edicion-cv-section__header">
                        <Link2 size={14} className="edicion-cv-section__icon" />
                        <h3 className="edicion-cv-section__title">{t(`${es}.sectionHeader`)}</h3>
                        <button
                          type="button"
                          className={`edicion-chip edicion-chip--sm ${isAddingSocial ? "edicion-chip--cancel" : ""}`}
                          onClick={isAddingSocial ? handleCancelAddSocial : handleStartAddSocial}
                          disabled={availablePlatforms.length === 0 && !isAddingSocial}
                        >
                          {isAddingSocial ? <X size={12} /> : <Plus size={12} />}
                          {isAddingSocial ? t("adminEdicion.common.cancel") : t("adminEdicion.common.add")}
                        </button>
                      </div>

                      {isSocialsLoading && (
                        <div className="edicion-modal__loading" style={{ padding: "16px 0" }}>
                          <Loader2 size={16} className="edicion-modal__spinner" />
                          <span style={{ fontSize: 12 }}>{t(`${es}.loadingMsg`)}</span>
                        </div>
                      )}

                      {isAddingSocial && !isSocialsLoading && (
                        <div className="modal-social-new-form">
                          <div className="edicion-modal__row">
                            <div className="edicion-modal__field">
                              <label className="edicion-modal__label">
                                {t(`${es}.platformRequired`)}
                              </label>
                              <select className="edicion-modal__input" value={newSocial.id_platform}
                                onChange={(ev) =>
                                  setNewSocial((p) => ({ ...p, id_platform: ev.target.value }))
                                }>
                                <option value="">{t(`${es}.platformPh`)}</option>
                                {availablePlatforms.map((p) => (
                                  <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="edicion-modal__field">
                              <label className="edicion-modal__label">{t(`${es}.visibilityLabel`)}</label>
                              <label className="edicion-modal__check">
                                <input type="checkbox" checked={newSocial.public}
                                  onChange={(ev) =>
                                    setNewSocial((p) => ({ ...p, public: ev.target.checked }))
                                  } />
                                {newSocial.public
                                  ? <><Eye size={12} /> {t(`${es}.publicBadge`)}</>
                                  : <><EyeOff size={12} /> {t(`${es}.privateBadge`)}</>}
                              </label>
                            </div>
                          </div>

                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">{t(`${es}.urlRequired`)}</label>
                            <input className="edicion-modal__input" type="url"
                              value={newSocial.url}
                              onChange={(ev) =>
                                setNewSocial((p) => ({ ...p, url: ev.target.value }))
                              }
                              placeholder="https://..." maxLength={255} />
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button type="button"
                              className="edicion-chip edicion-chip--cancel edicion-chip--sm"
                              onClick={handleCancelAddSocial}>
                              <X size={11} /> {t("adminEdicion.common.cancel")}
                            </button>
                            <button type="button" className="edicion-chip edicion-chip--sm"
                              onClick={handleConfirmAddSocial}
                              disabled={!newSocial.id_platform || !newSocial.url.trim()}
                              style={!newSocial.id_platform || !newSocial.url.trim()
                                ? { opacity: 0.45, cursor: "not-allowed" } : {}}>
                              <Plus size={11} /> {t("adminEdicion.common.confirm")}
                            </button>
                          </div>
                        </div>
                      )}

                      {!isSocialsLoading && socials.length === 0 && !isAddingSocial && (
                        <p className="edicion-cv-section__empty">{t(`${es}.emptyState`)}</p>
                      )}

                      <div className="edicion-cv-section__items"
                        style={{ flexDirection: "column", gap: "6px" }}>
                        {socials.map((social, index) => {
                          const isSelected = selectedSocialIdx === index;
                          const isDeleted  = Boolean(social._delete);
                          const platformLabel =
                            platforms.find((p) => String(p.value) === String(social.id_platform))
                              ?.label ?? social.platform_name ?? `${t(`${es}.platformLabel`)} #${social.id_platform}`;

                          return (
                            <div key={social.id_social_networks ?? `new-social-${index}`}>
                              <div
                                className={[
                                  "edicion-cv-item",
                                  isSelected ? "edicion-cv-item--selected" : "",
                                  isDeleted  ? "edicion-cv-item--deleted"  : "",
                                ].join(" ").trim()}
                                onClick={() => handleSelectSocial(index)}
                                style={{ width: "100%", boxSizing: "border-box" }}
                                title={isDeleted
                                  ? t("adminEdicion.common.clickToRestore")
                                  : t("adminEdicion.common.clickToEdit")}
                              >
                                <Globe size={12} style={{ flexShrink: 0, opacity: 0.6 }} />
                                <span className="edicion-cv-item__id" style={{ flex: 1 }}>
                                  {isDeleted ? "~~ " : ""}
                                  <strong>{platformLabel}</strong>
                                  {social.url && (
                                    <span className="modal-social-url-preview">
                                      {social.url.length > 40
                                        ? social.url.slice(0, 40) + "…"
                                        : social.url}
                                    </span>
                                  )}
                                  {social._isNew && (
                                    <span className="modal-social-badge-new">
                                      {t(`${es}.badgeNew`)}
                                    </span>
                                  )}
                                </span>

                                {!isDeleted && (
                                  <span className={`edicion-tabla__badge ${
                                    social.public
                                      ? "edicion-tabla__badge--state-public"
                                      : "edicion-tabla__badge--state-private"
                                  }`} style={{ fontSize: "10px" }}>
                                    {social.public ? t(`${es}.publicBadge`) : t(`${es}.privateBadge`)}
                                  </span>
                                )}

                                {isSelected && !isDeleted && (
                                  <button type="button" className="edicion-cv-item__delete"
                                    onClick={(ev) => { ev.stopPropagation(); handleDeleteSocial(index); }}>
                                    <Trash2 size={12} />
                                  </button>
                                )}

                                {isDeleted && (
                                  <span className="edicion-cv-item__restore">
                                    {t("adminEdicion.common.restore")}
                                  </span>
                                )}
                              </div>

                              {isSelected && !isDeleted && (
                                <div className="modal-social-edit-panel">
                                  <div className="edicion-modal__row">
                                    <div className="edicion-modal__field">
                                      <label className="edicion-modal__label">
                                        {t(`${es}.platformLabel`)}
                                      </label>
                                      <select className="edicion-modal__input"
                                        value={String(social.id_platform)}
                                        onChange={(ev) =>
                                          handleSocialChange(index, "id_platform", ev.target.value)
                                        }>
                                        <option value="">—</option>
                                        {platforms
                                          .filter((p) =>
                                            String(p.value) === String(social.id_platform) ||
                                            !socials.some(
                                              (s, si) =>
                                                si !== index && !s._delete &&
                                                String(s.id_platform) === String(p.value)
                                            )
                                          )
                                          .map((p) => (
                                            <option key={p.value} value={String(p.value)}>
                                              {p.label}
                                            </option>
                                          ))}
                                      </select>
                                    </div>
                                    <div className="edicion-modal__field">
                                      <label className="edicion-modal__label">
                                        {t(`${es}.visibilityLabel`)}
                                      </label>
                                      <label className="edicion-modal__check">
                                        <input type="checkbox" checked={Boolean(social.public)}
                                          onChange={(ev) =>
                                            handleSocialChange(index, "public", ev.target.checked)
                                          } />
                                        {social.public
                                          ? <><Eye size={12} /> {t(`${es}.publicBadge`)}</>
                                          : <><EyeOff size={12} /> {t(`${es}.privateBadge`)}</>}
                                      </label>
                                    </div>
                                  </div>

                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">{t(`${es}.urlLabel`)}</label>
                                    <input className="edicion-modal__input" type="url"
                                      value={social.url}
                                      onChange={(ev) =>
                                        handleSocialChange(index, "url", ev.target.value)
                                      }
                                      placeholder="https://..." maxLength={255} />
                                  </div>

                                  {!social._isNew && (
                                    <div className="edicion-modal__row">
                                      <div className="edicion-modal__field">
                                        <label className="edicion-modal__label">
                                          {t(`${es}.createdLabel`)}
                                        </label>
                                        <div style={READONLY_STYLE}>
                                          {formatDateTime(social.created_at)}
                                        </div>
                                      </div>
                                      <div className="edicion-modal__field">
                                        <label className="edicion-modal__label">
                                          {t(`${es}.updatedLabel`)}
                                        </label>
                                        <div style={READONLY_STYLE}>
                                          {formatDateTime(social.updated_at)}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t("adminEdicion.common.close")}
              </button>
              <button className="edicion-modal__btn-save" onClick={handleSaveClick}
                disabled={isSaving || isLoading}>
                <Save size={13} /> {t("adminEdicion.common.save")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm} isBusy={isSaving}
        entidad={t(`${e}.confirmEntity`)} accion="actualizar"
        resumen={buildResumen()} error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}