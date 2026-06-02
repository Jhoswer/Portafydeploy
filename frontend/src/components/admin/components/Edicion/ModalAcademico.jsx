import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  X, Save, GraduationCap, Loader2, Plus, Check,
  Eye, EyeOff, Trash2, Briefcase, Calendar,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import { getAdminAcademico, updateAdminAcademico } from "../../../../services/adminProfileTableService";

function normalizeBool(v) { return v === true || v === 1 || v === "1"; }

function normalizeCareer(c = {}) {
  return {
    id_university_career: c.id_university_career ?? null,
    id_university: c.id_university ?? "",
    id_career: c.id_career ?? "",
    training_type: c.training_type ?? "",
    start_date: c.start_date ? c.start_date.slice(0, 10) : "",
    end_date: c.end_date ? c.end_date.slice(0, 10) : "",
    visibility: normalizeBool(c.visibility ?? true),
    university_name: c.university_name ?? "",
    career_name: c.career_name ?? "",
    _delete: false,
  };
}

function emptyCareer() { return normalizeCareer({}); }

function formatDateShort(value) {
  if (!value) return "—";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ModalAcademico({ idProfile, user, onClose, onSave }) {
  const { t } = useTranslation();
  const e = "adminEdicion.academico";

  const TRAINING_TYPES_I18N = [
    { value: "pregrado",  label: t(`${e}.trainingTypes.pregrado`)  },
    { value: "posgrado",  label: t(`${e}.trainingTypes.posgrado`)  },
    { value: "maestria",  label: t(`${e}.trainingTypes.maestria`)  },
    { value: "doctorado", label: t(`${e}.trainingTypes.doctorado`) },
    { value: "tecnico",   label: t(`${e}.trainingTypes.tecnico`)   },
    { value: "diplomado", label: t(`${e}.trainingTypes.diplomado`) },
    { value: "curso",     label: t(`${e}.trainingTypes.curso`)     },
    { value: "otro",      label: t(`${e}.trainingTypes.otro`)      },
  ];

  const [idJobTitle, setIdJobTitle] = useState("");
  const [careers, setCareers] = useState([]);
  const [catalogs, setCatalogs] = useState({ job_titles: [], universities: [], careers: [] });
  const [originalJobTitle, setOriginalJobTitle] = useState("");
  const [originalCareers, setOriginalCareers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAddingCareer, setIsAddingCareer] = useState(false);
  const [newCareer, setNewCareer] = useState(emptyCareer());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!idProfile) { setIsLoading(false); setError(t(`${e}.errorLoad`)); return; }
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const data = await getAdminAcademico(idProfile);
        const p = data?.profile ?? {};
        const ucs = (data?.university_careers ?? []).map(normalizeCareer);
        const cats = data?.catalogs ?? { job_titles: [], universities: [], careers: [] };
        setIdJobTitle(String(p.id_job_title ?? ""));
        setCareers(ucs); setCatalogs(cats);
        setOriginalJobTitle(String(p.id_job_title ?? ""));
        setOriginalCareers(ucs.map((c) => ({ ...c })));
      } catch (err) {
        setError(t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile]);

  const handleCareerChange = (index, field, value) =>
    setCareers((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));

  const handleToggleVisibility = (index) =>
    setCareers((prev) => prev.map((c, i) => (i === index ? { ...c, visibility: !c.visibility } : c)));

  const handleDeleteCareer = (index) => {
    setSelectedIndex(null);
    setCareers((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        return c.id_university_career ? { ...c, _delete: true } : null;
      }).filter(Boolean)
    );
  };

  const handleRestoreCareer = (index) =>
    setCareers((prev) => prev.map((c, i) => (i === index ? { ...c, _delete: false } : c)));

  const handleSelectItem = (index) => {
    if (careers[index]?._delete) { handleRestoreCareer(index); return; }
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  const handleStartAdd = () => { setNewCareer(emptyCareer()); setIsAddingCareer(true); setSelectedIndex(null); };
  const handleCancelAdd = () => { setIsAddingCareer(false); setNewCareer(emptyCareer()); };

  const handleConfirmAdd = () => {
    if (!newCareer.id_university || !newCareer.id_career) return;
    const univObj   = catalogs.universities.find((u) => String(u.value) === String(newCareer.id_university));
    const careerObj = catalogs.careers.find((c) => String(c.value) === String(newCareer.id_career));
    setCareers((prev) => [...prev, { ...newCareer, university_name: univObj?.label ?? "", career_name: careerObj?.label ?? "" }]);
    setIsAddingCareer(false); setNewCareer(emptyCareer());
  };

  const buildResumen = () => {
    const changes = [];
    if (String(originalJobTitle) !== String(idJobTitle)) {
      const jt = catalogs.job_titles.find((j) => String(j.value) === String(idJobTitle));
      changes.push({ label: t(`${e}.resumen.jobTitle`), value: (jt?.label ?? idJobTitle) || t("adminEdicion.common.noName") });
    }
    const deleted = careers.filter((c) => c._delete && c.id_university_career);
    if (deleted.length > 0)
      changes.push({ label: t(`${e}.resumen.deleted`), value: deleted.map((c) => `${c.career_name} (${c.university_name})`).join(", ") });
    const added = careers.filter((c) => !c._delete && !c.id_university_career);
    if (added.length > 0)
      changes.push({ label: t(`${e}.resumen.added`), value: added.map((c) => `${c.career_name} (${c.university_name})`).join(", ") });
    const originalMap = Object.fromEntries(originalCareers.map((c) => [c.id_university_career, c]));
    const modified = careers.filter((c) => {
      if (!c.id_university_career || c._delete) return false;
      const orig = originalMap[c.id_university_career];
      if (!orig) return false;
      return orig.training_type !== c.training_type || orig.start_date !== c.start_date ||
        orig.end_date !== c.end_date || normalizeBool(orig.visibility) !== normalizeBool(c.visibility);
    });
    if (modified.length > 0)
      changes.push({ label: t(`${e}.resumen.modified`), value: modified.map((c) => c.career_name || `#${c.id_university_career}`).join(", ") });
    return changes;
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      const payload = {
        id_job_title: idJobTitle ? Number(idJobTitle) : null,
        careers: careers.map((c) => ({
          id_university_career: c.id_university_career,
          id_university: c.id_university ? Number(c.id_university) : null,
          id_career: c.id_career ? Number(c.id_career) : null,
          training_type: c.training_type || null,
          start_date: c.start_date || null,
          end_date: c.end_date || null,
          visibility: Boolean(c.visibility),
          _delete: Boolean(c._delete),
        })),
      };
      const updated = await updateAdminAcademico(idProfile, payload);
      onSave?.(updated); setShowConfirm(false); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally {
      setIsSaving(false);
    }
  };

  const visibleCareers = useMemo(() => careers.filter((c) => !c._delete), [careers]);
  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal edicion-modal--personal">

            {/* HEADER */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <GraduationCap size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">{fullName || t("adminEdicion.common.noName")}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose} disabled={isSaving}
                aria-label={t("adminEdicion.common.close")}>
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
                <div className="edicion-modal__fields">

                  {/* Título de trabajo */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Briefcase size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                      {t(`${e}.jobTitleLabel`)}
                    </label>
                    <select className="edicion-modal__input" value={idJobTitle}
                      onChange={(ev) => setIdJobTitle(ev.target.value)}>
                      <option value="">{t(`${e}.jobTitleEmpty`)}</option>
                      {catalogs.job_titles.map((jt) => (
                        <option key={jt.value} value={jt.value}>{jt.label}</option>
                      ))}
                    </select>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* Header sección */}
                  <div className="edicion-cv-details-header">
                    <GraduationCap size={14} />
                    <span className="edicion-cv-details-header__label">{t(`${e}.sectionTitle`)}</span>
                    <span className="edicion-tabla__count">
                      {visibleCareers.length} {t(`${e}.records`)}
                    </span>
                  </div>

                  <div className="edicion-cv-section">
                    <div className="edicion-cv-section__header">
                      <GraduationCap size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">{t(`${e}.sectionHeader`)}</h3>
                      <button type="button"
                        className={`edicion-chip edicion-chip--sm ${isAddingCareer ? "edicion-chip--cancel" : ""}`}
                        onClick={isAddingCareer ? handleCancelAdd : handleStartAdd}>
                        {isAddingCareer ? <X size={12} /> : <Plus size={12} />}
                        {isAddingCareer ? t("adminEdicion.common.cancel") : t("adminEdicion.common.add")}
                      </button>
                    </div>

                    {/* Formulario nueva carrera */}
                    {isAddingCareer && (
                      <div className="modal-add-career-form">
                        <div className="edicion-modal__row">
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">{t(`${e}.addForm.universityLabel`)}</label>
                            <select className="edicion-modal__input" value={newCareer.id_university}
                              onChange={(ev) => setNewCareer((prev) => ({ ...prev, id_university: ev.target.value }))}>
                              <option value="">{t(`${e}.addForm.universityPh`)}</option>
                              {catalogs.universities.map((u) => (
                                <option key={u.value} value={u.value}>{u.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">{t(`${e}.addForm.careerLabel`)}</label>
                            <select className="edicion-modal__input" value={newCareer.id_career}
                              onChange={(ev) => setNewCareer((prev) => ({ ...prev, id_career: ev.target.value }))}>
                              <option value="">{t(`${e}.addForm.careerPh`)}</option>
                              {catalogs.careers.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="edicion-modal__row">
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">{t(`${e}.addForm.trainingTypeLabel`)}</label>
                            <select className="edicion-modal__input" value={newCareer.training_type}
                              onChange={(ev) => setNewCareer((prev) => ({ ...prev, training_type: ev.target.value }))}>
                              <option value="">{t(`${e}.addForm.trainingTypePh`)}</option>
                              {TRAINING_TYPES_I18N.map((tt) => (
                                <option key={tt.value} value={tt.value}>{tt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">{t(`${e}.addForm.visibilityLabel`)}</label>
                            <label className="edicion-modal__check">
                              <input type="checkbox" checked={newCareer.visibility}
                                onChange={(ev) => setNewCareer((prev) => ({ ...prev, visibility: ev.target.checked }))} />
                              {newCareer.visibility ? <Eye size={12} /> : <EyeOff size={12} />}
                              {newCareer.visibility ? t("adminEdicion.common.visible") : t("adminEdicion.common.hidden")}
                            </label>
                          </div>
                        </div>

                        <div className="edicion-modal__row">
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">
                              <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                              {t(`${e}.addForm.startDateLabel`)}
                            </label>
                            <input className="edicion-modal__input" type="date" value={newCareer.start_date}
                              onChange={(ev) => setNewCareer((prev) => ({ ...prev, start_date: ev.target.value }))} />
                          </div>
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">
                              <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                              {t(`${e}.addForm.endDateLabel`)}
                            </label>
                            <input className="edicion-modal__input" type="date" value={newCareer.end_date}
                              onChange={(ev) => setNewCareer((prev) => ({ ...prev, end_date: ev.target.value }))} />
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button type="button" className="edicion-chip edicion-chip--cancel edicion-chip--sm"
                            onClick={handleCancelAdd}>
                            <X size={11} /> {t("adminEdicion.common.cancel")}
                          </button>
                          <button type="button" className="edicion-chip edicion-chip--sm"
                            onClick={handleConfirmAdd}
                            disabled={!newCareer.id_university || !newCareer.id_career}
                            style={!newCareer.id_university || !newCareer.id_career ? { opacity: 0.45, cursor: "not-allowed" } : {}}>
                            <Check size={11} /> {t("adminEdicion.common.confirm")}
                          </button>
                        </div>
                      </div>
                    )}

                    {careers.length === 0 && !isAddingCareer && (
                      <p className="edicion-cv-section__empty">{t(`${e}.emptyState`)}</p>
                    )}

                    <div className="edicion-cv-section__items" style={{ flexDirection: "column", gap: "6px" }}>
                      {careers.map((career, index) => {
                        const isSelected = selectedIndex === index;
                        const isDeleted  = Boolean(career._delete);
                        const isNew      = !career.id_university_career;
                        const trainingLabel =
                          TRAINING_TYPES_I18N.find((tt) => tt.value === career.training_type)?.label ??
                          career.training_type ?? t(`${e}.itemLabels.noType`);

                        return (
                          <div key={career.id_university_career ?? `new-${index}`}>
                            <div
                              className={["edicion-cv-item", isSelected ? "edicion-cv-item--selected" : "", isDeleted ? "edicion-cv-item--deleted" : ""].join(" ").trim()}
                              onClick={() => handleSelectItem(index)}
                              style={{ width: "100%", boxSizing: "border-box" }}
                              title={isDeleted ? t("adminEdicion.common.clickToRestore") : t("adminEdicion.common.clickToEdit")}
                            >
                              <span className="edicion-cv-item__id" style={{ flex: 1 }}>
                                {isDeleted ? "~~ " : ""}
                                <strong>{career.career_name || t(`${e}.itemLabels.noCareer`)}</strong>
                                {" · "}
                                {career.university_name || t(`${e}.itemLabels.noUniversity`)}
                                {career.training_type && (
                                  <span className="modal-career-badge-type">{trainingLabel}</span>
                                )}
                                {isNew && (
                                  <span className="modal-career-badge-new">{t("adminEdicion.common.new")}</span>
                                )}
                              </span>

                              {!isDeleted && (
                                <button type="button"
                                  className={`edicion-cv-item__eye ${!career.visibility ? "edicion-cv-item__eye--hidden" : ""}`}
                                  onClick={(ev) => { ev.stopPropagation(); handleToggleVisibility(index); }}>
                                  {career.visibility ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>
                              )}

                              {isSelected && !isDeleted && (
                                <button type="button" className="edicion-cv-item__delete"
                                  onClick={(ev) => { ev.stopPropagation(); handleDeleteCareer(index); }}>
                                  <Trash2 size={12} />
                                </button>
                              )}

                              {isDeleted && (
                                <span className="edicion-cv-item__restore">{t("adminEdicion.common.restore")}</span>
                              )}
                            </div>

                            {isSelected && !isDeleted && (
                              <div className="modal-career-edit-panel">
                                <div className="edicion-modal__row">
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">{t(`${e}.addForm.universityLabel`).replace(" *","")}</label>
                                    <select className="edicion-modal__input" value={career.id_university}
                                      onChange={(ev) => handleCareerChange(index, "id_university", ev.target.value)}>
                                      <option value="">—</option>
                                      {catalogs.universities.map((u) => (
                                        <option key={u.value} value={String(u.value)}>{u.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">{t(`${e}.addForm.careerLabel`).replace(" *","")}</label>
                                    <select className="edicion-modal__input" value={career.id_career}
                                      onChange={(ev) => handleCareerChange(index, "id_career", ev.target.value)}>
                                      <option value="">—</option>
                                      {catalogs.careers.map((c) => (
                                        <option key={c.value} value={String(c.value)}>{c.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="edicion-modal__field">
                                  <label className="edicion-modal__label">{t(`${e}.addForm.trainingTypeLabel`)}</label>
                                  <select className="edicion-modal__input" value={career.training_type}
                                    onChange={(ev) => handleCareerChange(index, "training_type", ev.target.value)}>
                                    <option value="">{t(`${e}.addForm.trainingTypePh`)}</option>
                                    {TRAINING_TYPES_I18N.map((tt) => (
                                      <option key={tt.value} value={tt.value}>{tt.label}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="edicion-modal__row">
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">
                                      <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                                      {t(`${e}.addForm.startDateLabel`)}
                                    </label>
                                    <input className="edicion-modal__input" type="date" value={career.start_date}
                                      onChange={(ev) => handleCareerChange(index, "start_date", ev.target.value)} />
                                  </div>
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">
                                      <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                                      {t(`${e}.addForm.endDateLabel`)}
                                    </label>
                                    <input className="edicion-modal__input" type="date" value={career.end_date}
                                      onChange={(ev) => handleCareerChange(index, "end_date", ev.target.value)} />
                                  </div>
                                </div>

                                {(career.start_date || career.end_date) && (
                                  <span className="edicion-modal__char-count">
                                    {formatDateShort(career.start_date)} → {formatDateShort(career.end_date) || t("adminEdicion.common.present")}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t("adminEdicion.common.close")}
              </button>
              <button className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || !!error}>
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