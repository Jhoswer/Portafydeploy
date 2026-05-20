import { useTranslation } from "react-i18next";

const FILTER_OPTIONS = {
    usuario: [
        { key: "nombre", label: "filter.usuario.nombre" },
        { key: "bio", label: "filter.usuario.bio" },
        { key: "ubicacion", label: "filter.usuario.ubicacion" },
    ],
    proyecto: [
        { key: "nombre", label: "filter.proyecto.nombre" },
        { key: "tecnologia", label: "filter.proyecto.tecnologia" },
        { key: "descripcion", label: "filter.proyecto.descripcion" },
    ],
    habilidad: [
        { key: "nombre", label: "filter.habilidad.nombre" },
        { key: "tecnica", label: "filter.habilidad.tecnica" },
        { key: "blanda", label: "filter.habilidad.blanda" },
    ],
    experiencia: [
        { key: "empresa", label: "filter.experiencia.empresa" },
        { key: "laboral", label: "filter.experiencia.laboral" },
        { key: "academica", label: "filter.experiencia.academica" },
    ],
    profesional: [
        { key: "universidad", label: "filter.profesional.universidad" },
        { key: "carrera", label: "filter.profesional.carrera" },
        { key: "nivel", label: "filter.profesional.nivel" },
    ],
};

export default function FilterBar({ category, activeFilter, onFilterChange }) {
    const { t } = useTranslation();
    const buttons = FILTER_OPTIONS[category] ?? [];

    return (
        <div className="pf-filterbar">
            <div className="pf-filterbar__inner">
                {buttons.map((option) => (
                    <button
                        key={option.key}
                        className={
                            "pf-filterbar__btn" +
                            (activeFilter.key === option.key ? " pf-filterbar__btn--active" : "")
                        }
                        onClick={() => onFilterChange(option)}
                    >
                        {t(option.label)}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Exporta el mapa para que Explore y Navbar puedan leer las claves
export { FILTER_OPTIONS };
