// src/components/admin/components/Eliminacion/ModalDatosPersonales.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase, Building2, Globe, GraduationCap,
  Loader2, Trash2, User, X,
} from "lucide-react";
import EliminarConfirmModal from "./EliminarConfirmModal";
import { getDatosPersonalesData, deleteDatosPersonales } from "../../../../services/EliminacionProfileTableService";

function normalizeBool(v) { return v === true || v === 1 || v === "1"; }

export default function ModalDatosPersonales({ user, onClose, onDeleted }) {
  const { t } = useTranslation();
  const dp = "adminEliminacion.datosPersonales";

  const idProfile = user?.id_profile ?? user?.id ?? null;

  const [providers,   setProviders]   = useState([]);
  const [company,     setCompany]     = useState(null);
  const [socials,     setSocials]     = useState([]);
  const [jobTitle,    setJobTitle]    = useState(null);
  const [studies,     setStudies]     = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!idProfile) return;
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const data = await getDatosPersonalesData(idProfile);
        setProviders((data.providers ?? []).map((p) => ({ ...p, _delete: false })));
        setCompany(data.company ? { ...data.company, _delete: false } : null);
        setSocials((data.socials   ?? []).map((s) => ({ ...s, _delete: false })));
        setJobTitle(data.job_title ? { ...data.job_title, _delete: false } : null);
        setStudies((data.studies   ?? []).map((s) => ({ ...s, _delete: false })));
      } catch (err) {
        setError(err?.message || t(`${dp}.errorLoad`));
      } finally { setIsLoading(false); }
    };
    load();
  }, [idProfile]);

  const toggleProvider = (id) =>
    setProviders((prev) => prev.map((p) => p.id_provider === id ? { ...p, _delete: !p._delete } : p));
  const toggleSocial = (id) =>
    setSocials((prev) => prev.map((s) => s.id_social_networks === id ? { ...s, _delete: !s._delete } : s));
  const toggleStudy = (id) =>
    setStudies((prev) => prev.map((s) => s.id_university_career === id ? { ...s, _delete: !s._delete } : s));
  const toggleCompany  = () => setCompany((prev)  => prev ? { ...prev, _delete: !prev._delete  } : prev);
  const toggleJobTitle = () => setJobTitle((prev) => prev ? { ...prev, _delete: !prev._delete  } : prev);

  const buildResumen = () => {
    const items = [];
    providers.filter((p) => p._delete).forEach((p) =>
      items.push({ label: t(`${dp}.resumen.provider`), value: p.provider }));
    if (company?._delete)
      items.push({ label: t(`${dp}.resumen.company`), value: company.name });
    socials.filter((s) => s._delete).forEach((s) =>
      items.push({ label: t(`${dp}.resumen.social`), value: `${s.platform_name ?? "—"} · ${s.url}` }));
    if (jobTitle?._delete)
      items.push({ label: t(`${dp}.resumen.jobTitle`), value: jobTitle.name });
    studies.filter((s) => s._delete).forEach((s) =>
      items.push({ label: t(`${dp}.resumen.study`), value: `${s.career_name ?? "—"} · ${s.university_name ?? "—"}` }));
    return items;
  };

  const resumen      = buildResumen();
  const hasAnyMarked = resumen.length > 0;

  const handleConfirmedDelete = async () => {
    setIsDeleting(true); setDeleteError("");
    try {
      await deleteDatosPersonales(idProfile, {
        provider_ids:          providers.filter((p) => p._delete).map((p) => p.id_provider),
        delete_company:        Boolean(company?._delete),
        social_network_ids:    socials.filter((s) => s._delete).map((s) => s.id_social_networks),
        delete_job_title:      Boolean(jobTitle?._delete),
        university_career_ids: studies.filter((s) => s._delete).map((s) => s.id_university_career),
      });
      setShowConfirm(false); onDeleted?.(); onClose?.();
    } catch (err) {
      setDeleteError(err?.message || t(`${dp}.errorDelete`));
    } finally { setIsDeleting(false); }
  };

  const Section = ({ icon: Icon, sectionKey, count, empty, children }) => (
    <div className="edicion-cv-section">
      <div className="edicion-cv-section__header">
        <Icon size={14} className="edicion-cv-section__icon" />
        <h3 className="edicion-cv-section__title">{t(`${dp}.sections.${sectionKey}.label`)}</h3>
        {count > 0 && <span className="edicion-tabla__count">{count}</span>}
      </div>
      {empty
        ? <span className="edicion-cv-section__empty">{t(`${dp}.sections.${sectionKey}.empty`)}</span>
        : <div className="edicion-cv-section__items">{children}</div>}
    </div>
  );

  const Item = ({ id, label, sub, isDeleted, onToggle }) => (
    <div key={id}
      className={`edicion-cv-item${isDeleted ? " edicion-cv-item--deleted" : ""}`}
      onClick={onToggle}
      title={isDeleted ? t(`${dp}.restoreTitle`) : t(`${dp}.markTitle`)}
      style={{ cursor: "pointer", userSelect: "none" }}>
      {isDeleted && <Trash2 size={11} style={{ color: "#ef4444", flexShrink: 0 }} />}
      <span className="edicion-cv-item__id">{label}</span>
      {sub && <span style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</span>}
      {isDeleted && <span className="edicion-cv-item__restore" title={t(`${dp}.restoreTitle`)}>↩</span>}
    </div>
  );

  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isDeleting && onClose?.()}>
          <div className="edicion-modal" style={{ maxWidth: 580 }}>

            {/* Header */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <User size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${dp}.headerTitle`)}</h2>
                  <p className="edicion-modal__subtitle">{fullName || `Perfil #${idProfile}`}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                disabled={isDeleting} aria-label={t(`${dp}.closeLabel`)}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${dp}.loading`)}</span>
                </div>
              )}
              {error && !isLoading && <div className="edicion-modal__error">{error}</div>}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">
                  <div className="edicion-modal__note"
                    style={{ borderColor: "#fecaca", background: "#fff5f5", color: "#b91c1c" }}>
                    <Trash2 size={12} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
                    {t(`${dp}.hint`)}
                  </div>

                  <Section icon={Building2} sectionKey="providers"
                    count={providers.length} empty={providers.length === 0}>
                    {providers.map((p) => (
                      <Item key={p.id_provider} id={p.id_provider} label={p.provider}
                        sub={normalizeBool(p.active) ? t(`${dp}.itemActive`) : t(`${dp}.itemInactive`)}
                        isDeleted={p._delete} onToggle={() => toggleProvider(p.id_provider)} />
                    ))}
                  </Section>

                  <Section icon={Building2} sectionKey="company"
                    count={company ? 1 : 0} empty={!company}>
                    {company && (
                      <Item id="company" label={company.name} sub={null}
                        isDeleted={company._delete} onToggle={toggleCompany} />
                    )}
                  </Section>

                  <Section icon={Globe} sectionKey="socials"
                    count={socials.length} empty={socials.length === 0}>
                    {socials.map((s) => (
                      <Item key={s.id_social_networks} id={s.id_social_networks}
                        label={s.platform_name ?? t(`${dp}.socialFallback`)} sub={s.url}
                        isDeleted={s._delete} onToggle={() => toggleSocial(s.id_social_networks)} />
                    ))}
                  </Section>

                  <Section icon={Briefcase} sectionKey="jobTitle"
                    count={jobTitle ? 1 : 0} empty={!jobTitle}>
                    {jobTitle && (
                      <Item id="job_title" label={jobTitle.name} sub={null}
                        isDeleted={jobTitle._delete} onToggle={toggleJobTitle} />
                    )}
                  </Section>

                  <Section icon={GraduationCap} sectionKey="studies"
                    count={studies.length} empty={studies.length === 0}>
                    {studies.map((s) => (
                      <Item key={s.id_university_career} id={s.id_university_career}
                        label={s.career_name ?? t(`${dp}.careerUnknown`)}
                        sub={s.university_name ?? t(`${dp}.universityUnknown`)}
                        isDeleted={s._delete} onToggle={() => toggleStudy(s.id_university_career)} />
                    ))}
                  </Section>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isLoading && !error && (
              <div className="edicion-modal__footer">
                <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isDeleting}>
                  <X size={13} /> {t(`${dp}.btnClose`)}
                </button>
                <button onClick={() => { setDeleteError(""); setShowConfirm(true); }}
                  disabled={!hasAnyMarked || isDeleting}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 20px", borderRadius: 8, border: "none",
                    background: hasAnyMarked ? "#dc2626" : "#e2e8f0",
                    color: hasAnyMarked ? "#fff" : "#94a3b8",
                    fontSize: 13, fontWeight: 600,
                    cursor: hasAnyMarked ? "pointer" : "not-allowed",
                    boxShadow: hasAnyMarked ? "0 2px 8px rgba(220,38,38,0.28)" : "none",
                    transition: "all 0.15s",
                  }}>
                  <Trash2 size={13} />
                  {t(`${dp}.btnDelete`)}
                  {hasAnyMarked && (
                    <span style={{
                      background: "rgba(255,255,255,0.25)", borderRadius: "9999px",
                      padding: "1px 7px", fontSize: 11, fontWeight: 700,
                    }}>
                      {resumen.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      <EliminarConfirmModal
        isOpen={showConfirm} isBusy={isDeleting}
        entidad={t(`${dp}.entidad`)}
        resumen={resumen} error={deleteError}
        onClose={() => !isDeleting && setShowConfirm(false)}
        onConfirm={handleConfirmedDelete} />
    </>
  );
}