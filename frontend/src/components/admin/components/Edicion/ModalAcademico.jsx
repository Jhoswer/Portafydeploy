// src/components/admin/components/Edicion/ModalAcademico.jsx

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X, Save, GraduationCap, Loader2, Plus, Check,
  Eye, EyeOff, Trash2, Briefcase, Calendar,
} from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import {
  getAdminAcademico,
  updateAdminAcademico,
} from "../../../../services/adminProfileTableService";

/* ── Opciones de tipo de formación (campo libre pero con sugerencias) ── */
const TRAINING_TYPES = [
  { value: "pregrado", label: "Pregrado" },
  { value: "posgrado", label: "Posgrado" },
  { value: "maestria", label: "Maestría" },
  { value: "doctorado", label: "Doctorado" },
  { value: "tecnico", label: "Técnico" },
  { value: "diplomado", label: "Diplomado" },
  { value: "curso", label: "Curso" },
  { value: "otro", label: "Otro" },
];

/* ── Helpers ── */
function normalizeBool(v) {
  return v === true || v === 1 || v === "1";
}

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

function emptyCareer() {
  return normalizeCareer({});
}

function formatDateShort(value) {
  if (!value) return "—";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ModalAcademico({ idProfile, user, onClose, onSave }) {
  /* ── Estado del formulario ── */
  const [idJobTitle, setIdJobTitle] = useState("");
  const [careers, setCareers] = useState([]);
  const [catalogs, setCatalogs] = useState({ job_titles: [], universities: [], careers: [] });
  const [originalJobTitle, setOriginalJobTitle] = useState("");
  const [originalCareers, setOriginalCareers] = useState([]);

  /* ── UI ── */
  const [selectedIndex, setSelectedIndex] = useState(null); // índice del item abierto para editar
  const [isAddingCareer, setIsAddingCareer] = useState(false);
  const [newCareer, setNewCareer] = useState(emptyCareer());

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  /* ── Carga ── */
  useEffect(() => {
    if (!idProfile) { setIsLoading(false); setError("Perfil no encontrado."); return; }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminAcademico(idProfile);
        const p = data?.profile ?? {};
        const ucs = (data?.university_careers ?? []).map(normalizeCareer);
        const cats = data?.catalogs ?? { job_titles: [], universities: [], careers: [] };

        setIdJobTitle(String(p.id_job_title ?? ""));
        setCareers(ucs);
        setCatalogs(cats);
        setOriginalJobTitle(String(p.id_job_title ?? ""));
        setOriginalCareers(ucs.map((c) => ({ ...c })));
      } catch (err) {
        console.error("[ModalAcademico] Error al cargar:", err);
        setError("No se pudieron cargar los datos académicos.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idProfile]);

  /* ── Handlers de carrera ── */
  const handleCareerChange = (index, field, value) =>
    setCareers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );

  const handleToggleVisibility = (index) =>
    setCareers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, visibility: !c.visibility } : c))
    );

  const handleDeleteCareer = (index) => {
    setSelectedIndex(null);
    setCareers((prev) =>
      prev
        .map((c, i) => {
          if (i !== index) return c;
          return c.id_university_career ? { ...c, _delete: true } : null;
        })
        .filter(Boolean)
    );
  };

  const handleRestoreCareer = (index) =>
    setCareers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, _delete: false } : c))
    );

  const handleSelectItem = (index) => {
    if (careers[index]?._delete) { handleRestoreCareer(index); return; }
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  /* ── Handlers de agregar nueva carrera ── */
  const handleStartAdd = () => {
    setNewCareer(emptyCareer());
    setIsAddingCareer(true);
    setSelectedIndex(null);
  };

  const handleCancelAdd = () => {
    setIsAddingCareer(false);
    setNewCareer(emptyCareer());
  };

  const handleConfirmAdd = () => {
    if (!newCareer.id_university || !newCareer.id_career) return;

    const univObj = catalogs.universities.find((u) => String(u.value) === String(newCareer.id_university));
    const careerObj = catalogs.careers.find((c) => String(c.value) === String(newCareer.id_career));

    setCareers((prev) => [
      ...prev,
      {
        ...newCareer,
        university_name: univObj?.label ?? "",
        career_name: careerObj?.label ?? "",
      },
    ]);
    setIsAddingCareer(false);
    setNewCareer(emptyCareer());
  };

  /* ── Resumen de cambios ── */
  const buildResumen = () => {
    const changes = [];

    /* Cambio de job_title */
    if (String(originalJobTitle) !== String(idJobTitle)) {
      const jt = catalogs.job_titles.find((j) => String(j.value) === String(idJobTitle));
      changes.push({ label: "Título de trabajo", value: (jt?.label ?? idJobTitle) || "Sin título" });
    }

    /* Carreras eliminadas */
    const deleted = careers.filter((c) => c._delete && c.id_university_career);
    if (deleted.length > 0) {
      changes.push({
        label: "Formaciones eliminadas",
        value: deleted.map((c) => `${c.career_name} (${c.university_name})`).join(", "),
      });
    }

    /* Carreras nuevas */
    const added = careers.filter((c) => !c._delete && !c.id_university_career);
    if (added.length > 0) {
      changes.push({
        label: "Formaciones agregadas",
        value: added.map((c) => `${c.career_name} (${c.university_name})`).join(", "),
      });
    }

    /* Cambios en carreras existentes */
    const originalMap = Object.fromEntries(
      originalCareers.map((c) => [c.id_university_career, c])
    );
    const modified = careers.filter((c) => {
      if (!c.id_university_career || c._delete) return false;
      const orig = originalMap[c.id_university_career];
      if (!orig) return false;
      return (
        orig.training_type !== c.training_type ||
        orig.start_date !== c.start_date ||
        orig.end_date !== c.end_date ||
        normalizeBool(orig.visibility) !== normalizeBool(c.visibility)
      );
    });
    if (modified.length > 0) {
      changes.push({
        label: "Formaciones modificadas",
        value: modified.map((c) => c.career_name || `#${c.id_university_career}`).join(", "),
      });
    }

    return changes;
  };

  /* ── Guardar ── */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");
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
      onSave?.(updated);
      setShowConfirm(false);
      onClose?.();
    } catch (err) {
      console.error("[ModalAcademico] Error al guardar:", err);
      setConfirmError(err?.message || "No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Items visibles (sin eliminados, para conteo) ── */
  const visibleCareers = useMemo(() => careers.filter((c) => !c._delete), [careers]);

  const fullName = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();

  /* ══════════════════════════════ RENDER ══════════════════════════════ */
  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--personal">

            {/* ════ HEADER ════ */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <GraduationCap size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Datos Académicos</h2>
                  <p className="edicion-modal__subtitle">{fullName || "Perfil del usuario"}</p>
                </div>
              </div>
              <button
                className="edicion-modal__close"
                onClick={onClose}
                disabled={isSaving}
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
                  <span>Cargando datos académicos…</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* ── Título de trabajo ── */}
                  <div className="edicion-modal__field">
                    <label className="edicion-modal__label">
                      <Briefcase
                        size={11}
                        style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}
                      />
                      Título de trabajo
                    </label>
                    <select
                      className="edicion-modal__input"
                      value={idJobTitle}
                      onChange={(e) => setIdJobTitle(e.target.value)}
                    >
                      <option value="">— Sin título asignado —</option>
                      {catalogs.job_titles.map((jt) => (
                        <option key={jt.value} value={jt.value}>
                          {jt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <hr className="edicion-modal__divider" />

                  {/* ── Sección de formaciones académicas ── */}
                  <div className="edicion-cv-details-header">
                    <GraduationCap size={14} />
                    <span className="edicion-cv-details-header__label">
                      FORMACIONES ACADÉMICAS
                    </span>
                    <span className="edicion-tabla__count">
                      {visibleCareers.length} registros
                    </span>
                  </div>

                  <div className="edicion-cv-section">
                    {/* Header de la sección */}
                    <div className="edicion-cv-section__header">
                      <GraduationCap size={14} className="edicion-cv-section__icon" />
                      <h3 className="edicion-cv-section__title">Carreras y Universidades</h3>
                      <button
                        type="button"
                        className={`edicion-chip edicion-chip--sm ${isAddingCareer ? "edicion-chip--cancel" : ""}`}
                        onClick={isAddingCareer ? handleCancelAdd : handleStartAdd}
                      >
                        {isAddingCareer ? <X size={12} /> : <Plus size={12} />}
                        {isAddingCareer ? "Cancelar" : "Agregar"}
                      </button>
                    </div>

                    {/* Formulario de nueva carrera */}
                    {isAddingCareer && (
                      <div className="modal-add-career-form">
                        <div className="edicion-modal__row">
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">Universidad *</label>
                            <select
                              className="edicion-modal__input"
                              value={newCareer.id_university}
                              onChange={(e) =>
                                setNewCareer((prev) => ({ ...prev, id_university: e.target.value }))
                              }
                            >
                              <option value="">Seleccionar universidad</option>
                              {catalogs.universities.map((u) => (
                                <option key={u.value} value={u.value}>{u.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">Carrera *</label>
                            <select
                              className="edicion-modal__input"
                              value={newCareer.id_career}
                              onChange={(e) =>
                                setNewCareer((prev) => ({ ...prev, id_career: e.target.value }))
                              }
                            >
                              <option value="">Seleccionar carrera</option>
                              {catalogs.careers.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="edicion-modal__row">
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">Tipo de formación</label>
                            <select
                              className="edicion-modal__input"
                              value={newCareer.training_type}
                              onChange={(e) =>
                                setNewCareer((prev) => ({ ...prev, training_type: e.target.value }))
                              }
                            >
                              <option value="">— Seleccionar —</option>
                              {TRAINING_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">Visibilidad</label>
                            <label className="edicion-modal__check">
                              <input
                                type="checkbox"
                                checked={newCareer.visibility}
                                onChange={(e) =>
                                  setNewCareer((prev) => ({ ...prev, visibility: e.target.checked }))
                                }
                              />
                              {newCareer.visibility ? <Eye size={12} /> : <EyeOff size={12} />}
                              {newCareer.visibility ? "Visible" : "Oculto"}
                            </label>
                          </div>
                        </div>

                        <div className="edicion-modal__row">
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">
                              <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                              Fecha inicio
                            </label>
                            <input
                              className="edicion-modal__input"
                              type="date"
                              value={newCareer.start_date}
                              onChange={(e) =>
                                setNewCareer((prev) => ({ ...prev, start_date: e.target.value }))
                              }
                            />
                          </div>
                          <div className="edicion-modal__field">
                            <label className="edicion-modal__label">
                              <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                              Fecha fin
                            </label>
                            <input
                              className="edicion-modal__input"
                              type="date"
                              value={newCareer.end_date}
                              onChange={(e) =>
                                setNewCareer((prev) => ({ ...prev, end_date: e.target.value }))
                              }
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            type="button"
                            className="edicion-chip edicion-chip--cancel edicion-chip--sm"
                            onClick={handleCancelAdd}
                          >
                            <X size={11} /> Cancelar
                          </button>
                          <button
                            type="button"
                            className="edicion-chip edicion-chip--sm"
                            onClick={handleConfirmAdd}
                            disabled={!newCareer.id_university || !newCareer.id_career}
                            style={
                              !newCareer.id_university || !newCareer.id_career
                                ? { opacity: 0.45, cursor: "not-allowed" }
                                : {}
                            }
                          >
                            <Check size={11} /> Confirmar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {careers.length === 0 && !isAddingCareer && (
                      <p className="edicion-cv-section__empty">
                        Sin formaciones académicas registradas.
                      </p>
                    )}

                    {/* Lista de ítems */}
                    <div className="edicion-cv-section__items" style={{ flexDirection: "column", gap: "6px" }}>
                      {careers.map((career, index) => {
                        const isSelected = selectedIndex === index;
                        const isDeleted = Boolean(career._delete);
                        const isNew = !career.id_university_career;
                        const trainingLabel =
                          TRAINING_TYPES.find((t) => t.value === career.training_type)?.label ??
                          career.training_type ??
                          "Sin tipo";

                        return (
                          <div key={career.id_university_career ?? `new-${index}`}>
                            {/* Chip del ítem */}
                            <div
                              className={[
                                "edicion-cv-item",
                                isSelected ? "edicion-cv-item--selected" : "",
                                isDeleted ? "edicion-cv-item--deleted" : "",
                              ].join(" ").trim()}
                              onClick={() => handleSelectItem(index)}
                              style={{ width: "100%", boxSizing: "border-box" }}
                              title={isDeleted ? "Click para restaurar" : "Click para editar"}
                            >
                              {/* Texto principal */}
                              <span className="edicion-cv-item__id" style={{ flex: 1 }}>
                                {isDeleted ? "~~ " : ""}
                                <strong>{career.career_name || "Carrera sin nombre"}</strong>
                                {" · "}
                                {career.university_name || "Universidad sin nombre"}
                                {career.training_type && (
                                  <span className="modal-career-badge-type">
                                    {trainingLabel}
                                  </span>
                                )}
                                {isNew && (
                                  <span className="modal-career-badge-new">
                                    Nuevo
                                  </span>
                                )}
                              </span>

                              {/* Ojo de visibilidad */}
                              {!isDeleted && (
                                <button
                                  type="button"
                                  className={`edicion-cv-item__eye ${!career.visibility ? "edicion-cv-item__eye--hidden" : ""}`}
                                  onClick={(e) => { e.stopPropagation(); handleToggleVisibility(index); }}
                                  title={career.visibility ? "Ocultar" : "Mostrar"}
                                >
                                  {career.visibility ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>
                              )}

                              {/* Botón eliminar */}
                              {isSelected && !isDeleted && (
                                <button
                                  type="button"
                                  className="edicion-cv-item__delete"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCareer(index); }}
                                  title="Eliminar"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}

                              {/* Indicador restaurar */}
                              {isDeleted && (
                                <span className="edicion-cv-item__restore">↩</span>
                              )}
                            </div>

                            {/* Panel de edición inline (solo si seleccionado y no eliminado) */}
                            {isSelected && !isDeleted && (
                              <div className="modal-career-edit-panel">
                                {/* Universidad + Carrera */}
                                <div className="edicion-modal__row">
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">Universidad</label>
                                    <select
                                      className="edicion-modal__input"
                                      value={career.id_university}
                                      onChange={(e) =>
                                        handleCareerChange(index, "id_university", e.target.value)
                                      }
                                    >
                                      <option value="">— Sin universidad —</option>
                                      {catalogs.universities.map((u) => (
                                        <option key={u.value} value={String(u.value)}>{u.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">Carrera</label>
                                    <select
                                      className="edicion-modal__input"
                                      value={career.id_career}
                                      onChange={(e) =>
                                        handleCareerChange(index, "id_career", e.target.value)
                                      }
                                    >
                                      <option value="">— Sin carrera —</option>
                                      {catalogs.careers.map((c) => (
                                        <option key={c.value} value={String(c.value)}>{c.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Tipo de formación */}
                                <div className="edicion-modal__field">
                                  <label className="edicion-modal__label">Tipo de formación</label>
                                  <select
                                    className="edicion-modal__input"
                                    value={career.training_type}
                                    onChange={(e) =>
                                      handleCareerChange(index, "training_type", e.target.value)
                                    }
                                  >
                                    <option value="">— Seleccionar tipo —</option>
                                    {TRAINING_TYPES.map((t) => (
                                      <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Fechas */}
                                <div className="edicion-modal__row">
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">
                                      <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                                      Fecha inicio
                                    </label>
                                    <input
                                      className="edicion-modal__input"
                                      type="date"
                                      value={career.start_date}
                                      onChange={(e) =>
                                        handleCareerChange(index, "start_date", e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="edicion-modal__field">
                                    <label className="edicion-modal__label">
                                      <Calendar size={10} style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                                      Fecha fin
                                    </label>
                                    <input
                                      className="edicion-modal__input"
                                      type="date"
                                      value={career.end_date}
                                      onChange={(e) =>
                                        handleCareerChange(index, "end_date", e.target.value)
                                      }
                                    />
                                  </div>
                                </div>

                                {/* Resumen de fechas */}
                                {(career.start_date || career.end_date) && (
                                  <span className="edicion-modal__char-count">
                                    {formatDateShort(career.start_date)} → {formatDateShort(career.end_date) || "Presente"}
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

            {/* ════ FOOTER ════ */}
            <div className="edicion-modal__footer">
              <button
                className="edicion-modal__btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                <X size={13} />
                Cerrar
              </button>
              <button
                className="edicion-modal__btn-save"
                onClick={() => { setConfirmError(""); setShowConfirm(true); }}
                disabled={isSaving || isLoading || !!error}
              >
                <Save size={13} />
                Guardar
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ════ MODAL DE CONFIRMACIÓN ════ */}
      <EdicionConfirmModal
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Datos Académicos"
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}