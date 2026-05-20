// src/components/admin/modulos/Definicion.jsx
import { useState } from "react";
import {
  Globe, Lightbulb, Bookmark, BookOpen,
  GraduationCap, Building2, Layers,
} from "lucide-react";

import AdminModuleLayout  from "../components/AdminModuleLayout";
import DefinicionSelector from "../components/Definicion/DefinicionSelector";

// Formularios
import PaisForm        from "../components/Definicion/PaisForm";
import HabilidadForm   from "../components/Definicion/HabilidadForm";
import EstadoForm      from "../components/Definicion/EstadoForm";
import UniversidadForm from "../components/Definicion/UniversidadForm";
import CarreraForm     from "../components/Definicion/CarreraForm";
import CompaniaForm    from "../components/Definicion/CompaniaForm";
import AreaForm        from "../components/Definicion/AreaForm";

// Vistas de registros
import VerPais        from "../components/Definicion/VerPais";
import VerHabilidad   from "../components/Definicion/VerHabilidad";
import VerEstado      from "../components/Definicion/VerEstado";
import VerUniversidad from "../components/Definicion/VerUniversidad";
import VerCarrera     from "../components/Definicion/VerCarrera";
import VerCompania    from "../components/Definicion/VerCompania";
import VerArea        from "../components/Definicion/VerArea";

import "../../../styles/components/admin/components/Definicion/Definicion.css";
import { createDefinitionRecord } from "../../../services/definitionService";

/* ── Mapa de entidades ──────────────────────────────────────── */
const ENTIDADES = {
  pais: {
    label: "País",
    catalog: "countries",
    Icon: Globe,
    subtitle: "Registra un nuevo país para los usuarios de Portafy.",
    verSubtitle: "Lista de países registrados en Portafy.",
    form: PaisForm,
    ver: VerPais,
  },
  habilidad: {
    label: "Habilidad",
    catalog: "skills",
    Icon: Lightbulb,
    subtitle: "Define una nueva habilidad para los usuarios de Portafy.",
    verSubtitle: "Lista de habilidades registradas en Portafy.",
    form: HabilidadForm,
    ver: VerHabilidad,
  },
  estado: {
    label: "Estado",
    catalog: "states",
    Icon: Bookmark,
    subtitle: "Registra un nuevo estado o departamento para un País para los usuarios de Portafy.",
    verSubtitle: "Lista de estados/departamentos en Portafy.",
    form: EstadoForm,
    ver: VerEstado,
  },
  universidad: {
    label: "Universidad",
    catalog: "universities",
    Icon: BookOpen,
    subtitle: "Agrega una nueva universidad para los usuarios de Portafy.",
    verSubtitle: "Lista de universidades registradas en Portafy.",
    form: UniversidadForm,
    ver: VerUniversidad,
  },
  carrera: {
    label: "Carrera",
    catalog: "careers",
    Icon: GraduationCap,
    subtitle: "Registra una nueva carrera universitaria para los usuarios de Portafy.",
    verSubtitle: "Lista de carreras registradas en Portafy.",
    form: CarreraForm,
    ver: VerCarrera,
  },
  compania: {
    label: "Compañía",
    catalog: "companies",
    Icon: Building2,
    subtitle: "Registra una nueva empresa para los usuarios de Portafy.",
    verSubtitle: "Lista de compañías registradas en Portafy.",
    form: CompaniaForm,
    ver: VerCompania,
  },
  area: {
    label: "Área",
    catalog: "areas",
    Icon: Layers,
    subtitle: "Define una nueva área de conocimiento o trabajo para los usuarios de Portafy.",
    verSubtitle: "Lista de áreas registradas en Portafy.",
    form: AreaForm,
    ver: VerArea,
  },
};

/* ── Componente principal ───────────────────────────────────── */
export default function Definicion() {
  const [seleccionado, setSeleccionado] = useState("pais");

  // false = ojo cerrado → muestra formulario
  // true  = ojo abierto → muestra vista de registros
  const [visible, setVisible] = useState(false);

  const entidad = ENTIDADES[seleccionado] ?? ENTIDADES.pais;

  // Según el ojo: ver registros o nuevo registro
  const ComponenteActivo = entidad
    ? (visible ? entidad.ver : entidad.form)
    : null;

  const handleGuardar = async (datos) => {
    await createDefinitionRecord(entidad.catalog, datos);
  };

  return (
    <AdminModuleLayout
      title="Definición"
      subtitle="Gestiona los catálogos base del sistema: países, habilidades, estados, universidades, carreras, compañías y áreas."
    >
      <div className="def-module">

        {/* ── Selector de entidad ── */}
        <DefinicionSelector
          seleccionado={seleccionado}
          onSeleccionar={setSeleccionado}
          visible={visible}
          onToggleVisible={() => setVisible((v) => !v)}
        />

        {/* ── Panel principal ── */}
        {ComponenteActivo ? (
          <div
            className="def-form-panel"
            key={`${seleccionado}-${visible ? "ver" : "form"}`}
          >
            <div className="def-form-panel__header">
              <div className="def-form-panel__title-wrap">
                <div className="def-form-panel__icon">
                  <entidad.Icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="def-form-panel__title">
                    {visible
                      ? `Registros — ${entidad.label}`
                      : `Nuevo registro — ${entidad.label}`}
                  </div>
                  <div className="def-form-panel__subtitle">
                    {visible ? entidad.verSubtitle : entidad.subtitle}
                  </div>
                </div>
              </div>
            </div>

            <div className="def-form-panel__body">
              {visible
                ? <ComponenteActivo />
                : <ComponenteActivo onGuardar={handleGuardar} />
              }
            </div>
          </div>
        ) : (
          null
        )}

      </div>
    </AdminModuleLayout>
  );
}
