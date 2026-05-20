// src/components/admin/components/Eliminacion/ModalDatosPersonales.jsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase, Building2, Globe, GraduationCap,
  Loader2, Trash2, User, X,
} from "lucide-react";
import EliminarConfirmModal from "./EliminarConfirmModal";
import {
  getDatosPersonalesData,
  deleteDatosPersonales,
} from "../../../../services/EliminacionProfileTableService";

/* ── Helper ── */
function normalizeBool(v) {
  return v === true || v === 1 || v === "1";
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE
══════════════════════════════════════════════════════════════ */
export default function ModalDatosPersonales({ user, onClose, onDeleted }) {
  const idProfile = user?.id_profile ?? user?.id ?? null;

  /* ── Datos cargados (cada item lleva _delete: false) ── */
  const [providers, setProviders] = useState([]);
  const [company,   setCompany]   = useState(null);   // null | { id_company, name, _delete }
  const [socials,   setSocials]   = useState([]);
  const [jobTitle,  setJobTitle]  = useState(null);   // null | { id_job_title, name, _delete }
  const [studies,   setStudies]   = useState([]);

  /* ── UI ── */
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ── Carga ── */
  useEffect(() => {
    if (!idProfile) return;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getDatosPersonalesData(idProfile);
        setProviders((data.providers ?? []).map((p) => ({ ...p, _delete: false })));
        setCompany(data.company ? { ...data.company, _delete: false } : null);
        setSocials((data.socials   ?? []).map((s) => ({ ...s, _delete: false })));
        setJobTitle(data.job_title ? { ...data.job_title, _delete: false } : null);
        setStudies((data.studies   ?? []).map((s) => ({ ...s, _delete: false })));
      } catch (err) {
        setError(err?.message || "No se pudieron cargar los datos personales.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile]);

  /* ── Toggles ── */
  const toggleProvider = (id) =>
    setProviders((prev) =>
      prev.map((p) => (p.id_provider === id ? { ...p, _delete: !p._delete } : p))
    );
  const toggleSocial = (id) =>
    setSocials((prev) =>
      prev.map((s) => (s.id_social_networks === id ? { ...s, _delete: !s._delete } : s))
    );
  const toggleStudy = (id) =>
    setStudies((prev) =>
      prev.map((s) => (s.id_university_career === id ? { ...s, _delete: !s._delete } : s))
    );
  const toggleCompany  = () => setCompany((prev)  => prev  ? { ...prev,  _delete: !prev._delete  } : prev);
  const toggleJobTitle = () => setJobTitle((prev)  => prev  ? { ...prev,  _delete: !prev._delete  } : prev);

  /* ── Resumen para EliminarConfirmModal ── */
  const buildResumen = () => {
    const items = [];
    providers.filter((p) => p._delete).forEach((p) =>
      items.push({ label: "Proveedor", value: p.provider })
    );
    if (company?._delete)
      items.push({ label: "Compañía", value: company.name });
    socials.filter((s) => s._delete).forEach((s) =>
      items.push({ label: "Red social", value: `${s.platform_name ?? "—"} · ${s.url}` })
    );
    if (jobTitle?._delete)
      items.push({ label: "Título profesional", value: jobTitle.name });
    studies.filter((s) => s._delete).forEach((s) =>
      items.push({ label: "Estudio", value: `${s.career_name ?? "—"} · ${s.university_name ?? "—"}` })
    );
    return items;
  };

  const resumen      = buildResumen();
  const hasAnyMarked = resumen.length > 0;

  /* ── Guardar (eliminar) ── */
  const handleOpenConfirm = () => { setDeleteError(""); setShowConfirm(true); };

  const handleConfirmedDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteDatosPersonales(idProfile, {
        provider_ids:          providers.filter((p) => p._delete).map((p) => p.id_provider),
        delete_company:        Boolean(company?._delete),
        social_network_ids:    socials.filter((s) => s._delete).map((s) => s.id_social_networks),
        delete_job_title:      Boolean(jobTitle?._delete),
        university_career_ids: studies.filter((s) => s._delete).map((s) => s.id_university_career),
      });
      setShowConfirm(false);
      onDeleted?.();
      onClose?.();
    } catch (err) {
      setDeleteError(err?.message || "No se pudieron eliminar los datos.");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     Render helpers  (siguen el patrón visual de ModalCV)
  ───────────────────────────────────────────────────────── */

  /** Contenedor de sección (= edicion-cv-section de ModalCV) */
  const Section = ({ icon: Icon, label, count, empty, emptyText, children }) => (
    <div className="edicion-cv-section">
      <div className="edicion-cv-section__header">
        <Icon size={14} className="edicion-cv-section__icon" />
        <h3 className="edicion-cv-section__title">{label}</h3>
        {count > 0 && <span className="edicion-tabla__count">{count}</span>}
      </div>
      {empty ? (
        <span className="edicion-cv-section__empty">{emptyText}</span>
      ) : (
        <div className="edicion-cv-section__items">{children}</div>
      )}
    </div>
  );

  /** Pill individual (= edicion-cv-item de ModalCV) */
  const Item = ({ id, label, sub, isDeleted, onToggle }) => (
    <div
      key={id}
      className={`edicion-cv-item${isDeleted ? " edicion-cv-item--deleted" : ""}`}
      onClick={onToggle}
      title={isDeleted ? "Click para restaurar" : "Click para marcar como eliminar"}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {isDeleted && (
        <Trash2 size={11} style={{ color: "#ef4444", flexShrink: 0 }} />
      )}
      <span className="edicion-cv-item__id">
        {label}
      </span>
      {sub && (
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</span>
      )}
      {isDeleted && (
        <span className="edicion-cv-item__restore" title="Restaurar">↩</span>
      )}
    </div>
  );

  /* ── Nombre del usuario ── */
  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();

  /* ══════════════════════════════ RENDER ══════════════════════════════ */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && !isDeleting && onClose?.()
          }
        >
          <div className="edicion-modal" style={{ maxWidth: 580 }}>

            {/* ════ HEADER ════ */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <User size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Datos Personales</h2>
                  <p className="edicion-modal__subtitle">{fullName || `Perfil #${idProfile}`}</p>
                </div>
              </div>
              <button
                className="edicion-modal__close"
                onClick={onClose}
                disabled={isDeleting}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {/* ════ BODY ════ */}
            <div className="edicion-modal__body">

              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>Cargando datos personales…</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* Aviso de uso */}
                  <div
                    className="edicion-modal__note"
                    style={{
                      borderColor: "#fecaca",
                      background:  "#fff5f5",
                      color:       "#b91c1c",
                    }}
                  >
                    <Trash2 size={12} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
                    Haz <strong>click en un elemento</strong> para marcarlo para eliminar.
                    Vuelve a hacer click para desmarcarlo. Confirma al final con el botón rojo.
                  </div>

                  {/* ── 1. Proveedores ── */}
                  <Section
                    icon={Building2}
                    label="Proveedores"
                    count={providers.length}
                    empty={providers.length === 0}
                    emptyText="Sin proveedores registrados"
                  >
                    {providers.map((p) => (
                      <Item
                        key={p.id_provider}
                        id={p.id_provider}
                        label={p.provider}
                        sub={normalizeBool(p.active) ? "Activo" : "Inactivo"}
                        isDeleted={p._delete}
                        onToggle={() => toggleProvider(p.id_provider)}
                      />
                    ))}
                  </Section>

                  {/* ── 2. Compañía ── */}
                  <Section
                    icon={Building2}
                    label="Compañía"
                    count={company ? 1 : 0}
                    empty={!company}
                    emptyText="Sin compañía asociada"
                  >
                    {company && (
                      <Item
                        id="company"
                        label={company.name}
                        sub={null}
                        isDeleted={company._delete}
                        onToggle={toggleCompany}
                      />
                    )}
                  </Section>

                  {/* ── 3. Redes Sociales ── */}
                  <Section
                    icon={Globe}
                    label="Redes Sociales"
                    count={socials.length}
                    empty={socials.length === 0}
                    emptyText="Sin redes sociales registradas"
                  >
                    {socials.map((s) => (
                      <Item
                        key={s.id_social_networks}
                        id={s.id_social_networks}
                        label={s.platform_name ?? "Red social"}
                        sub={s.url}
                        isDeleted={s._delete}
                        onToggle={() => toggleSocial(s.id_social_networks)}
                      />
                    ))}
                  </Section>

                  {/* ── 4. Título Profesional ── */}
                  <Section
                    icon={Briefcase}
                    label="Título Profesional"
                    count={jobTitle ? 1 : 0}
                    empty={!jobTitle}
                    emptyText="Sin título profesional asignado"
                  >
                    {jobTitle && (
                      <Item
                        id="job_title"
                        label={jobTitle.name}
                        sub={null}
                        isDeleted={jobTitle._delete}
                        onToggle={toggleJobTitle}
                      />
                    )}
                  </Section>

                  {/* ── 5. Estudios ── */}
                  <Section
                    icon={GraduationCap}
                    label="Estudios"
                    count={studies.length}
                    empty={studies.length === 0}
                    emptyText="Sin estudios registrados"
                  >
                    {studies.map((s) => (
                      <Item
                        key={s.id_university_career}
                        id={s.id_university_career}
                        label={s.career_name ?? "Carrera desconocida"}
                        sub={s.university_name ?? "Universidad desconocida"}
                        isDeleted={s._delete}
                        onToggle={() => toggleStudy(s.id_university_career)}
                      />
                    ))}
                  </Section>

                </div>
              )}
            </div>

            {/* ════ FOOTER ════ */}
            {!isLoading && !error && (
              <div className="edicion-modal__footer">
                <button
                  className="edicion-modal__btn-cancel"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  <X size={13} /> Cerrar
                </button>

                <button
                  onClick={handleOpenConfirm}
                  disabled={!hasAnyMarked || isDeleting}
                  style={{
                    display:      "inline-flex",
                    alignItems:   "center",
                    gap:          7,
                    padding:      "9px 20px",
                    borderRadius: 8,
                    border:       "none",
                    background:   hasAnyMarked ? "#dc2626" : "#e2e8f0",
                    color:        hasAnyMarked ? "#fff" : "#94a3b8",
                    fontSize:     13,
                    fontWeight:   600,
                    cursor:       hasAnyMarked ? "pointer" : "not-allowed",
                    boxShadow:    hasAnyMarked ? "0 2px 8px rgba(220,38,38,0.28)" : "none",
                    transition:   "all 0.15s",
                  }}
                >
                  <Trash2 size={13} />
                  Eliminar seleccionados
                  {hasAnyMarked && (
                    <span
                      style={{
                        background:   "rgba(255,255,255,0.25)",
                        borderRadius: "9999px",
                        padding:      "1px 7px",
                        fontSize:     11,
                        fontWeight:   700,
                      }}
                    >
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
        isOpen={showConfirm}
        isBusy={isDeleting}
        entidad="Datos Personales"
        resumen={resumen}
        error={deleteError}
        onClose={() => !isDeleting && setShowConfirm(false)}
        onConfirm={handleConfirmedDelete}
      />
    </>
  );
}