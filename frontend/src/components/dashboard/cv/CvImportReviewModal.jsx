import { useState } from "react";
import { CheckCircle2, X, Briefcase, GraduationCap, Zap, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "../../../services/http/httpClient";
import "../../../styles/components/dashboard/cv-module.css";

// ─── Helpers para guardar entidades ──────────────────────────────────────────

async function guardarExperiencia(exp) {
  return apiClient.post("/experience", {
    empresa:      exp.empresa,
    cargo:        exp.cargo,
    descripcion:  exp.descripcion  ?? "",
    fecha_inicio: exp.fecha_inicio ?? null,
    fecha_fin:    exp.fecha_fin    ?? null,
  });
}

async function guardarHabilidad(skill) {
  return apiClient.post("/skills", {
    nombre:      skill.nombre,
    tipo:        skill.tipo        ?? "tecnica",
    nivel_texto: skill.nivel_texto ?? null,
  });
}

async function guardarFormacion(edu) {
  return apiClient.post("/formacion", {
    institucion:      edu.institucion,
    nombre_programa:  edu.nombre_programa,
    nivel_formacion:  edu.nivel_formacion ?? "otro",
    fecha_inicio:     edu.fecha_inicio    ?? null,
    fecha_fin:        edu.fecha_fin       ?? null,
  });
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(14,30,60,.48)",
    backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1100, padding: 16,
  },
  modal: {
    background: "var(--cv-surface-modal)", borderRadius: 20, width: "100%", maxWidth: 560,
    maxHeight: "85vh", display: "flex", flexDirection: "column",
    boxShadow: "0 24px 64px rgba(14,30,60,.18)", overflow: "hidden",
    border: "1px solid var(--cv-border)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "20px 24px 16px", borderBottom: "1px solid var(--cv-border-soft)",
    flexShrink: 0,
  },
  title: { fontFamily: "var(--f-title)", fontWeight: 800, fontSize: "1.05rem", color: "var(--text)" },
  subtitle: { fontFamily: "var(--f-body)", fontSize: "0.78rem", color: "var(--muted)", marginTop: 3 },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 8 },
  body: { flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 20 },
  groupTitle: {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "var(--f-ui)", fontWeight: 700, fontSize: "0.82rem",
    color: "var(--text)", marginBottom: 8,
  },
  groupIcon: (color) => ({
    width: 26, height: 26, borderRadius: 7, background: color,
    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
  }),
  item: (selected) => ({
    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
    borderRadius: 10, border: `1.5px solid ${selected ? "#255dde" : "var(--cv-border)"}`,
    background: selected ? "var(--cv-bg-hover)" : "var(--cv-bg-secondary)",
    cursor: "pointer", transition: "all .15s", marginBottom: 6,
  }),
  checkbox: (selected) => ({
    width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
    border: `2px solid ${selected ? "#255dde" : "#cbd5e1"}`,
    background: selected ? "#255dde" : "var(--cv-cancel-btn-bg)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }),
  itemName: { fontFamily: "var(--f-ui)", fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" },
  itemSub: { fontFamily: "var(--f-body)", fontSize: "0.75rem", color: "var(--muted)", marginTop: 1 },
  emptyGroup: { fontFamily: "var(--f-body)", fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic" },
  footer: {
    padding: "14px 24px", borderTop: "1px solid var(--cv-border-soft)",
    display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", flexShrink: 0,
  },
  selectAll: { fontFamily: "var(--f-ui)", fontSize: "0.78rem", color: "#255dde", cursor: "pointer", background: "none", border: "none" },
  btnGroup: { display: "flex", gap: 8 },
  btnSecondary: {
    padding: "9px 18px", borderRadius: 10, border: "1px solid var(--cv-cancel-btn-border)",
    background: "var(--cv-cancel-btn-bg)", color: "var(--text)", fontFamily: "var(--f-ui)",
    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
  },
  btnPrimary: (disabled) => ({
    padding: "9px 20px", borderRadius: 10, border: "none",
    background: disabled ? "rgba(37,93,222,.35)" : "linear-gradient(135deg, #12369e 0%, #255dde 100%)",
    color: "#fff", fontFamily: "var(--f-ui)", fontSize: "0.85rem", fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex", alignItems: "center", gap: 6,
  }),
  errorBox: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
    borderRadius: 10, background: "var(--cv-error-bg)", border: "1px solid var(--cv-error-border)",
    color: "var(--cv-error-text)", fontFamily: "var(--f-body)", fontSize: "0.82rem",
  },
  successBox: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
    borderRadius: 10, background: "var(--cv-success-bg)", border: "1px solid var(--cv-success-border)",
    color: "var(--cv-success-text)", fontFamily: "var(--f-body)", fontSize: "0.82rem",
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Props:
 *   normalized  → resultado de normalizarCvImportado(raw)
 *   existing    → { experience[], education[], skills[] } — datos actuales del usuario
 *   onClose()
 *   onSaved()   → se llama cuando se guardaron las entidades seleccionadas
 */
export default function CvImportReviewModal({ normalized, existing, onClose, onSaved }) {
  // ── Filtrar entidades nuevas (que no existen aún) ─────────────────────────

  const newExperiences = (normalized.experiencias ?? []).filter((exp) =>
    !existing.experience.some((e) =>
      (e.company || e.empresa || "").toLowerCase() === (exp.empresa ?? "").toLowerCase() &&
      (e.title || e.cargo || "").toLowerCase()   === (exp.cargo   ?? "").toLowerCase()
    )
  );

  const newSkills = (normalized.habilidades ?? []).filter((skill) =>
    !existing.skills.some((s) =>
      (s.name || s.nombre || "").toLowerCase() === (skill.nombre ?? "").toLowerCase()
    )
  );

  const newEducation = (normalized.formaciones ?? []).filter((edu) =>
    !existing.education.some((e) =>
      (e.nombre_programa || e.careerName || "").toLowerCase() === (edu.nombre_programa ?? "").toLowerCase()
    )
  );

  const totalNew = newExperiences.length + newSkills.length + newEducation.length;

  // ── Selección ─────────────────────────────────────────────────────────────
  const [selectedExp,  setSelectedExp]  = useState(new Set(newExperiences.map((_, i) => i)));
  const [selectedSkill, setSelectedSkill] = useState(new Set(newSkills.map((_, i) => i)));
  const [selectedEdu,  setSelectedEdu]  = useState(new Set(newEducation.map((_, i) => i)));

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  function toggleSet(set, setFn, idx) {
    setFn((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function selectAll() {
    setSelectedExp(new Set(newExperiences.map((_, i) => i)));
    setSelectedSkill(new Set(newSkills.map((_, i) => i)));
    setSelectedEdu(new Set(newEducation.map((_, i) => i)));
  }

  function deselectAll() {
    setSelectedExp(new Set());
    setSelectedSkill(new Set());
    setSelectedEdu(new Set());
  }

  const totalSelected = selectedExp.size + selectedSkill.size + selectedEdu.size;

  // ── Guardar ───────────────────────────────────────────────────────────────
  async function handleSave() {
    if (totalSelected === 0) { onClose(); return; }
    setSaving(true);
    setError("");

    const tasks = [
      ...[...selectedExp].map((i)   => () => guardarExperiencia(newExperiences[i])),
      ...[...selectedSkill].map((i) => () => guardarHabilidad(newSkills[i])),
      ...[...selectedEdu].map((i)   => () => guardarFormacion(newEducation[i])),
    ];

    const errors = [];
    for (const task of tasks) {
      try { await task(); } catch (e) { errors.push(e?.message ?? "Error desconocido"); }
    }

    setSaving(false);

    if (errors.length > 0) {
      setError(`${errors.length} elemento(s) no se pudieron guardar.`);
    } else {
      setSuccess(`${totalSelected} elemento(s) guardados correctamente.`);
      setTimeout(() => { onSaved(); /* onClose(); */ }, 1200);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>

        <div style={s.header}>
          <div>
            <div style={s.title}>Entidades encontradas en tu CV</div>
            <div style={s.subtitle}>
              {totalNew > 0
                ? `Encontramos ${totalNew} elemento(s) nuevos. Seleccioná cuáles agregar a tu perfil.`
                : "No encontramos elementos nuevos respecto a tu perfil actual."}
            </div>
          </div>
          <button type="button" style={s.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={s.body}>
          {error   && <div style={s.errorBox}><AlertCircle size={15} />{error}</div>}
          {success && <div style={s.successBox}><CheckCircle2 size={15} />{success}</div>}

          {totalNew === 0 && (
            <div style={s.emptyGroup}>
              Todo lo que encontramos en el CV ya existe en tu perfil.
            </div>
          )}

          {/* Experiencias */}
          {newExperiences.length > 0 && (
            <div>
              <div style={s.groupTitle}>
                <div style={s.groupIcon("rgba(37,93,222,.85)")}><Briefcase size={13} /></div>
                Experiencias ({newExperiences.length})
              </div>
              {newExperiences.map((exp, i) => (
                <div key={i} style={s.item(selectedExp.has(i))} onClick={() => toggleSet(selectedExp, setSelectedExp, i)}>
                  <div style={s.checkbox(selectedExp.has(i))}>
                    {selectedExp.has(i) && <CheckCircle2 size={11} color="#fff" />}
                  </div>
                  <div>
                    <div style={s.itemName}>{exp.cargo} — {exp.empresa}</div>
                    <div style={s.itemSub}>
                      {exp.fecha_inicio ?? "?"} → {exp.actualmente ? "Presente" : (exp.fecha_fin ?? "?")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Habilidades */}
          {newSkills.length > 0 && (
            <div>
              <div style={s.groupTitle}>
                <div style={s.groupIcon("rgba(13,148,136,.85)")}><Zap size={13} /></div>
                Habilidades ({newSkills.length})
              </div>
              {newSkills.map((skill, i) => (
                <div key={i} style={s.item(selectedSkill.has(i))} onClick={() => toggleSet(selectedSkill, setSelectedSkill, i)}>
                  <div style={s.checkbox(selectedSkill.has(i))}>
                    {selectedSkill.has(i) && <CheckCircle2 size={11} color="#fff" />}
                  </div>
                  <div>
                    <div style={s.itemName}>{skill.nombre}</div>
                    <div style={s.itemSub}>{skill.tipo} · {skill.nivel_texto ?? "sin nivel"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formaciones */}
          {newEducation.length > 0 && (
            <div>
              <div style={s.groupTitle}>
                <div style={s.groupIcon("rgba(124,58,237,.85)")}><GraduationCap size={13} /></div>
                Formaciones ({newEducation.length})
              </div>
              {newEducation.map((edu, i) => (
                <div key={i} style={s.item(selectedEdu.has(i))} onClick={() => toggleSet(selectedEdu, setSelectedEdu, i)}>
                  <div style={s.checkbox(selectedEdu.has(i))}>
                    {selectedEdu.has(i) && <CheckCircle2 size={11} color="#fff" />}
                  </div>
                  <div>
                    <div style={s.itemName}>{edu.nombre_programa}</div>
                    <div style={s.itemSub}>{edu.institucion} · {edu.nivel_formacion}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.footer}>
          {totalNew > 0 ? (
            <button type="button" style={s.selectAll}
              onClick={totalSelected === totalNew ? deselectAll : selectAll}>
              {totalSelected === totalNew ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
          ) : <div />}
          <div style={s.btnGroup}>
            <button type="button" style={s.btnSecondary} onClick={onClose}>
              Omitir
            </button>
            <button
              type="button"
              style={s.btnPrimary(saving || totalSelected === 0)}
              onClick={handleSave}
              disabled={saving || totalSelected === 0}
            >
              {saving
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Guardando...</>
                : <><CheckCircle2 size={14} /> Guardar {totalSelected > 0 ? `(${totalSelected})` : ""}</>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
