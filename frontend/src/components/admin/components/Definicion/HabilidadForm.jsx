// src/components/admin/components/Definicion/HabilidadForm.jsx
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getAreas } from "../../../../services/definitionService";
import DefinicionConfirmModal from "./DefinicionConfirmModal";

const initialState = {
  name: "", state: "activate", type: "hard",
  quantitative_level: "", qualitative_level: "",
  description: "", id_area: "",
};

const STATE_LABEL = { activate: "Activo",  deactivate: "Desactivo" };
const TYPE_LABEL  = { hard:     "Dura",    soft:       "Blanda"    };

export default function HabilidadForm({ onGuardar, onCancelar }) {
  const [form, setForm]     = useState(initialState);
  const [modal, setModal]   = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError]   = useState("");
  const [areas, setAreas]   = useState([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [areasError, setAreasError]         = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoadingAreas(true); setAreasError("");
      try {
        const data = await getAreas();
        if (isMounted) setAreas(data);
      } catch (err) {
        if (isMounted) setAreasError(err.message);
      } finally {
        if (isMounted) setIsLoadingAreas(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleChange  = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };
  const handleSubmit  = (e) => { e.preventDefault(); setModal(true); };
  const handleConfirm = async () => {
    setIsBusy(true); setError("");
    try {
      await onGuardar?.({
        ...form,
        quantitative_level: form.quantitative_level || null,
        qualitative_level: form.qualitative_level === "" ? null : Number(form.qualitative_level),
      });
      setModal(false); setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  };
  const handleReset = () => { setForm(initialState); onCancelar?.(); };

  const areaLabel = areas.find((a) => String(a.id_area) === String(form.id_area))?.name ?? form.id_area;

  return (
    <>
      <form className="def-form" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Nombre <span className="def-field__required">*</span></label>
            <input className="def-field__input" name="name" value={form.name}
              onChange={handleChange} placeholder="Ej: React.js" maxLength={255} required />
          </div>
          <div className="def-field">
            <label className="def-field__label">Tipo <span className="def-field__required">*</span></label>
            <select className="def-field__select" name="type" value={form.type} onChange={handleChange} required>
              <option value="hard">Dura</option>
              <option value="soft">Blanda</option>
            </select>
            <span className="def-field__hint">Valores permitidos dura o blanda</span>
          </div>
        </div>

        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Estado <span className="def-field__required">*</span></label>
            <select className="def-field__select" name="state" value={form.state} onChange={handleChange}>
              <option value="activate">Activo</option>
              <option value="deactivate">Desactivo</option>
            </select>
          </div>
          <div className="def-field">
            <label className="def-field__label">Área <span className="def-field__required">*</span></label>
            <select className="def-field__select" name="id_area" value={form.id_area}
              onChange={handleChange} disabled={isLoadingAreas} required>
              <option value="">{isLoadingAreas ? "Cargando áreas..." : "Selecciona un área"}</option>
              {areas.map((a) => (
                <option key={a.id_area} value={a.id_area}>{a.name}</option>
              ))}
            </select>
            <span className="def-field__hint">{areasError || "Referencia al área de la nueva habilidad"}</span>
          </div>
        </div>

        <div className="def-form__divider">Niveles de competencia</div>

        <div className="def-form__row">
          <div className="def-field">
            <label className="def-field__label">Nivel Cualitativo</label>
            <input className="def-field__input" name="quantitative_level" value={form.quantitative_level}
              onChange={handleChange} placeholder="Ej: Avanzado" maxLength={255} />
          </div>
          <div className="def-field">
            <label className="def-field__label">Nivel Cuantitativo</label>
            <input className="def-field__input" name="qualitative_level" value={form.qualitative_level}
              onChange={handleChange} placeholder="Ej: 3" type="number" min={0} />
          </div>
        </div>

        <div className="def-form__row--full def-field">
          <label className="def-field__label">Descripción <span className="def-field__required">*</span></label>
          <textarea className="def-field__textarea" name="description" value={form.description}
            onChange={handleChange} placeholder="Describe brevemente esta habilidad..." maxLength={255} required />
        </div>

        <div className="def-form__actions">
          <button type="submit" className="def-btn def-btn--primary"><Save size={14} /> Guardar Habilidad</button>
        </div>
      </form>

      <DefinicionConfirmModal
        isOpen={modal} isBusy={isBusy} error={error} entidad="Habilidad"
        resumen={[
          { label: "Nombre",             value: form.name },
          { label: "Tipo",               value: TYPE_LABEL[form.type]   ?? form.type  },
          { label: "Estado",             value: STATE_LABEL[form.state] ?? form.state },
          { label: "Área",               value: areaLabel },
          { label: "Nivel cualitativo",  value: form.quantitative_level },
          { label: "Nivel cuantitativo", value: form.qualitative_level  },
          { label: "Descripción",        value: form.description },
        ]}
        onClose={() => !isBusy && setModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
