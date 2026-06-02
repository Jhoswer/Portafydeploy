import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe, Lightbulb, Bookmark, BookOpen,
  GraduationCap, Building2, Layers,
} from "lucide-react";
import AdminModuleLayout  from "../components/AdminModuleLayout";
import DefinicionSelector from "../components/Definicion/DefinicionSelector";
import PaisForm        from "../components/Definicion/PaisForm";
import HabilidadForm   from "../components/Definicion/HabilidadForm";
import EstadoForm      from "../components/Definicion/EstadoForm";
import UniversidadForm from "../components/Definicion/UniversidadForm";
import CarreraForm     from "../components/Definicion/CarreraForm";
import CompaniaForm    from "../components/Definicion/CompaniaForm";
import AreaForm        from "../components/Definicion/AreaForm";
import VerPais        from "../components/Definicion/VerPais";
import VerHabilidad   from "../components/Definicion/VerHabilidad";
import VerEstado      from "../components/Definicion/VerEstado";
import VerUniversidad from "../components/Definicion/VerUniversidad";
import VerCarrera     from "../components/Definicion/VerCarrera";
import VerCompania    from "../components/Definicion/VerCompania";
import VerArea        from "../components/Definicion/VerArea";
import "../../../styles/components/admin/components/Definicion/Definicion.css";
import { createDefinitionRecord } from "../../../services/definitionService";

const ENTIDADES = {
  pais:        { labelKey: "País",      catalog: "countries",   Icon: Globe,         form: PaisForm,        ver: VerPais        },
  habilidad:   { labelKey: "Habilidad", catalog: "skills",      Icon: Lightbulb,     form: HabilidadForm,   ver: VerHabilidad   },
  estado:      { labelKey: "Estado",    catalog: "states",      Icon: Bookmark,      form: EstadoForm,      ver: VerEstado      },
  universidad: { labelKey: "Universidad",catalog: "universities",Icon: BookOpen,      form: UniversidadForm, ver: VerUniversidad },
  carrera:     { labelKey: "Carrera",   catalog: "careers",     Icon: GraduationCap, form: CarreraForm,     ver: VerCarrera     },
  compania:    { labelKey: "Compañía",  catalog: "companies",   Icon: Building2,     form: CompaniaForm,    ver: VerCompania    },
  area:        { labelKey: "Área",      catalog: "areas",       Icon: Layers,        form: AreaForm,        ver: VerArea        },
};

export default function Definicion() {
  const { t } = useTranslation();
  const [seleccionado, setSeleccionado] = useState("pais");
  const [visible, setVisible] = useState(false);

  const entidad = ENTIDADES[seleccionado] ?? ENTIDADES.pais;
  const ComponenteActivo = visible ? entidad.ver : entidad.form;

  const handleGuardar = async (datos) => {
    await createDefinitionRecord(entidad.catalog, datos);
  };

  return (
    <AdminModuleLayout
      title={t("admin.definicion.module.title")}
      subtitle={t("admin.definicion.module.subtitle")}
    >
      <div className="def-module">
        <DefinicionSelector
          seleccionado={seleccionado}
          onSeleccionar={setSeleccionado}
          visible={visible}
          onToggleVisible={() => setVisible((v) => !v)}
        />

        {ComponenteActivo && (
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
                      ? `${t("admin.definicion.module.recordsPrefix")} ${entidad.labelKey}`
                      : `${t("admin.definicion.module.newRecordPrefix")} ${entidad.labelKey}`}
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
                : <ComponenteActivo onGuardar={handleGuardar} />}
            </div>
          </div>
        )}
      </div>
    </AdminModuleLayout>
  );
}