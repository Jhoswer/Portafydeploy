import {
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Share2,
  Sparkles,
} from "lucide-react";

export const TECHNOLOGY_LIBRARY = {
  Frontend: ["React", "Vue", "Angular", "Tailwind CSS", "Next.js"],
  Backend: ["Laravel", "Node.js", "Express", "Spring Boot", "Django"],
  "Base de datos": ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "SQLite"],
  Redes: ["Cisco", "Packet Tracer", "VLAN", "VPN", "MikroTik"],
  Diseno: ["Figma", "Adobe XD", "Photoshop", "Illustrator"],
};

export const SKILL_LIBRARY = {
  Frontend: ["React", "Vue", "Angular", "HTML", "CSS", "JavaScript", "TypeScript", "Next.js", "Tailwind CSS"],
  Backend: ["Laravel", "Node.js", "Express", "PHP", "Python", "Java", "Spring Boot", "Django", "REST API"],
  Mobile: ["React Native", "Flutter", "Kotlin", "Swift", "Android Studio"],
  "Base de datos": ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "SQLite", "Redis", "SQL Server"],
  "Cloud y DevOps": ["Docker", "Git", "GitHub Actions", "AWS", "Azure", "Linux", "CI/CD"],
  "Datos y BI": ["Excel", "Power BI", "Tableau", "Pandas", "ETL", "Data Visualization"],
  "IA y automatizacion": ["Machine Learning", "Prompt Engineering", "Automatizacion", "OpenAI API", "Chatbots"],
  Ciberseguridad: ["OWASP", "Pentesting", "Hardening", "Analisis de vulnerabilidades", "Seguridad de red"],
  QA: ["Testing manual", "Testing automatizado", "Postman", "Cypress", "Playwright", "Jest"],
  Redes: ["Routing", "Switching", "VPN", "Cisco", "Packet Tracer", "MikroTik"],
  Diseno: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "UI Design", "UX Research"],
  "Producto y gestion": ["Scrum", "Kanban", "Gestion de proyectos", "Product Discovery", "Documentacion", "Analisis de requerimientos"],
  Idiomas: ["Ingles", "Portugues", "Frances", "Aleman"],
  Blandas: [
    "Comunicacion",
    "Trabajo en equipo",
    "Liderazgo",
    "Resolucion de problemas",
    "Pensamiento critico",
    "Adaptabilidad",
    "Gestion del tiempo",
    "Negociacion",
    "Empatia",
    "Aprendizaje rapido",
  ],
};

export const SKILL_DESCRIPTION_LIBRARY = {
  React: "Biblioteca para crear interfaces dinamicas basadas en componentes.",
  Vue: "Framework progresivo para interfaces claras y reactivas.",
  Angular: "Framework completo para aplicaciones frontend estructuradas.",
  HTML: "Lenguaje base para estructurar contenido web accesible.",
  CSS: "Lenguaje de estilos para diseno visual y responsive.",
  JavaScript: "Lenguaje versatil para agregar logica e interactividad.",
  TypeScript: "JavaScript tipado para reducir errores y mejorar mantenibilidad.",
  "Next.js": "Framework React para aplicaciones web rapidas y preparadas para produccion.",
  "Tailwind CSS": "Framework utilitario para construir interfaces consistentes con rapidez.",
  Laravel: "Framework PHP para construir aplicaciones web ordenadas.",
  "Node.js": "Entorno para ejecutar JavaScript del lado del servidor.",
  Express: "Framework ligero para crear APIs y servicios web con Node.js.",
  PHP: "Lenguaje ampliamente usado para desarrollo web backend.",
  Python: "Lenguaje flexible usado en web, automatizacion y datos.",
  Java: "Lenguaje robusto para aplicaciones empresariales y backend.",
  "Spring Boot": "Framework Java para construir APIs y servicios empresariales.",
  Django: "Framework Python para aplicaciones web seguras y escalables.",
  "REST API": "Diseno e integracion de servicios HTTP para comunicar sistemas.",
  "React Native": "Framework para crear aplicaciones moviles usando React.",
  Flutter: "Framework multiplataforma para apps moviles con interfaces fluidas.",
  Kotlin: "Lenguaje moderno para desarrollo Android.",
  Swift: "Lenguaje principal para aplicaciones iOS.",
  "Android Studio": "Entorno de desarrollo para crear y depurar apps Android.",
  MySQL: "Base de datos relacional popular para aplicaciones web.",
  PostgreSQL: "Base de datos relacional potente y muy confiable.",
  MongoDB: "Base de datos NoSQL orientada a documentos flexibles.",
  Firebase: "Plataforma de backend con base de datos y autenticacion.",
  SQLite: "Base de datos ligera para aplicaciones locales o moviles.",
  Redis: "Almacenamiento en memoria usado para cache, sesiones y colas.",
  "SQL Server": "Motor de base de datos empresarial de Microsoft.",
  Docker: "Herramienta para empaquetar aplicaciones en contenedores reproducibles.",
  Git: "Sistema de control de versiones para colaborar y mantener historial.",
  "GitHub Actions": "Automatizacion de pruebas, builds y despliegues desde GitHub.",
  AWS: "Servicios cloud para desplegar, almacenar y escalar aplicaciones.",
  Azure: "Plataforma cloud de Microsoft para servicios y despliegues.",
  Linux: "Sistema operativo base para servidores y entornos de desarrollo.",
  "CI/CD": "Practicas para automatizar integracion, pruebas y despliegues.",
  Excel: "Herramienta para analisis, organizacion y visualizacion de datos.",
  "Power BI": "Plataforma para construir dashboards e indicadores de negocio.",
  Tableau: "Herramienta de visualizacion e inteligencia de negocios.",
  Pandas: "Biblioteca Python para analisis y transformacion de datos.",
  ETL: "Procesos para extraer, transformar y cargar datos entre sistemas.",
  "Data Visualization": "Presentacion visual de datos para facilitar decisiones.",
  "Machine Learning": "Modelos capaces de aprender patrones a partir de datos.",
  "Prompt Engineering": "Diseno de instrucciones para obtener mejores resultados con IA.",
  Automatizacion: "Uso de scripts o herramientas para reducir tareas repetitivas.",
  "OpenAI API": "Integracion de modelos de IA en productos y flujos de trabajo.",
  Chatbots: "Construccion de asistentes conversacionales para soporte o procesos.",
  OWASP: "Buenas practicas para identificar y prevenir riesgos web comunes.",
  Pentesting: "Pruebas controladas para encontrar vulnerabilidades de seguridad.",
  Hardening: "Configuracion segura de sistemas para reducir superficie de ataque.",
  "Analisis de vulnerabilidades": "Identificacion y priorizacion de riesgos tecnicos.",
  Routing: "Capacidad para enrutar trafico entre redes correctamente.",
  Switching: "Gestion de trafico local mediante conmutacion eficiente.",
  VPN: "Conexion segura para comunicar redes o usuarios remotos.",
  Cisco: "Administracion y configuracion de equipos de red Cisco.",
  "Packet Tracer": "Simulacion de redes para diseno y practica de configuraciones.",
  MikroTik: "Configuracion de routers, redes y servicios con RouterOS.",
  "Seguridad de red": "Buenas practicas para proteger infraestructura y trafico.",
  "Testing manual": "Validacion funcional de software mediante casos de prueba.",
  "Testing automatizado": "Automatizacion de pruebas para detectar regresiones.",
  Postman: "Herramienta para probar, documentar y depurar APIs.",
  Cypress: "Framework para pruebas end-to-end en aplicaciones web.",
  Playwright: "Framework moderno para pruebas automatizadas cross-browser.",
  Jest: "Framework de testing para JavaScript y aplicaciones frontend.",
  Figma: "Herramienta colaborativa para disenar interfaces y prototipos.",
  "Adobe XD": "Herramienta de diseno y prototipado de experiencias digitales.",
  Photoshop: "Software para edicion de imagen y composicion visual.",
  Illustrator: "Software para ilustracion vectorial y branding.",
  "UI Design": "Diseno visual de interfaces claras, consistentes y usables.",
  "UX Research": "Investigacion de usuarios para entender necesidades y mejorar productos.",
  Scrum: "Marco agil para organizar equipos, entregas y mejora continua.",
  Kanban: "Metodo visual para gestionar flujo de trabajo y prioridades.",
  "Gestion de proyectos": "Planificacion, seguimiento y coordinacion de entregables.",
  "Product Discovery": "Exploracion de problemas, usuarios y oportunidades de producto.",
  Documentacion: "Creacion de guias, especificaciones y registros claros.",
  "Analisis de requerimientos": "Identificacion y definicion de necesidades funcionales.",
  Ingles: "Comunicacion profesional en ingles para contextos tecnicos o laborales.",
  Portugues: "Comunicacion profesional en portugues.",
  Frances: "Comunicacion profesional en frances.",
  Aleman: "Comunicacion profesional en aleman.",
  Comunicacion: "Capacidad para transmitir ideas con claridad y empatia.",
  "Trabajo en equipo": "Colaboracion efectiva para lograr objetivos comunes.",
  Liderazgo: "Habilidad para guiar equipos y tomar decisiones.",
  "Resolucion de problemas": "Analisis y accion para destrabar retos con criterio.",
  "Pensamiento critico": "Evaluacion objetiva de informacion para tomar mejores decisiones.",
  Adaptabilidad: "Capacidad para responder bien a cambios de contexto o prioridad.",
  "Gestion del tiempo": "Organizacion de tareas para cumplir objetivos y plazos.",
  Negociacion: "Busqueda de acuerdos utiles entre intereses y restricciones.",
  Empatia: "Comprension de necesidades, emociones y perspectivas de otras personas.",
  "Aprendizaje rapido": "Capacidad para adquirir nuevas herramientas o conceptos con agilidad.",
};

export const EXPERIENCE_ROLE_LIBRARY = {
  "Software y tecnologia": [
    "Desarrollador Frontend",
    "Desarrollador Backend",
    "Desarrollador Full Stack",
    "Desarrollador Mobile",
    "Ingeniero de Software",
    "QA Tester",
    "DevOps Engineer",
    "Data Engineer",
    "Analista de Datos",
    "Especialista en Ciberseguridad",
  ],
  "Diseno y producto": [
    "Product Manager",
    "Product Owner",
    "UX Designer",
    "UI Designer",
    "UX Researcher",
    "Disenador Grafico",
  ],
  "Negocios y marketing": [
    "Analista de Negocios",
    "Marketing Digital",
    "Community Manager",
    "Content Manager",
    "SEO Specialist",
    "Customer Success",
  ],
  "Operaciones y gestion": [
    "Project Manager",
    "Scrum Master",
    "Coordinador de Operaciones",
    "Asistente Administrativo",
    "Recursos Humanos",
    "Soporte Tecnico",
  ],
  "Academica": [
    "Auxiliar de docencia",
    "Investigador academico",
    "Tutor academico",
    "Becario de investigacion",
    "Estudiante investigador",
  ],
  "Freelance": [
    "Freelancer",
    "Consultor Independiente",
    "Desarrollador Freelance",
    "Disenador Freelance",
    "Creador de Contenido Independiente",
    "Emprendedor",
  ],
};

export const SOCIAL_PLATFORM_LIBRARY = [
  "GitHub",
  "LinkedIn",
  "Sitio web / Portafolio",
  "X (Twitter)",
  "Behance",
  "Dribbble",
  "YouTube",
  "Instagram",
  "Facebook",
  "TikTok",
  "Otra",
];

export const EDUCATION_LEVEL_LIBRARY = [
  "tecnico",
  "tecnologo",
  "licenciatura",
  "ingenieria",
  "maestria",
  "doctorado",
  "curso",
  "diplomado",
  "otro",
];

export const SECTION_META = {
  projects: {
    key: "projects",
    title: "Proyectos",
    singular: "proyecto",
    icon: FolderKanban,
    color: "#3157d5",
    description:
      "Gestiona proyectos destacados, repositorios, tecnologias y piezas visuales.",
    helper:
      "Agrega proyectos destacados con descripcion, categoria tecnica, repositorio, demo y portada.",
    listSubtitle: (item) => item.status,
    fields: [
      {
        key: "title",
        label: "Titulo",
        type: "text",
        placeholder: "Nombre del proyecto",
      },
      {
        key: "description",
        label: "Descripcion",
        type: "textarea",
        placeholder: "Resumen corto del proyecto",
      },
      {
        key: "techCategory",
        label: "Categoria tecnica",
        type: "select",
        options: [...Object.keys(TECHNOLOGY_LIBRARY), "Otra"],
      },
      {
        key: "tags",
        label: "Tecnologias",
        type: "catalog-tags",
        library: TECHNOLOGY_LIBRARY,
        categoryKey: "techCategory",
        placeholder:
          "Selecciona tecnologias de la categoria o agrega una manualmente",
      },
      {
        key: "repoUrl",
        label: "Repositorio URL",
        type: "url",
        placeholder: "https://github.com/usuario/proyecto",
      },
      {
        key: "demoUrl",
        label: "Demo URL",
        type: "url",
        placeholder: "https://demo.com",
      },
      {
        key: "status",
        label: "Estado del proyecto",
        type: "select",
        options: ["Completo", "En proceso", "Pausado"],
      },
      {
        key: "cover",
        label: "Portada del proyecto",
        type: "file",
        placeholder: "Sube una portada opcional",
      },
    ],
  },
  experience: {
    key: "experience",
    title: "Experiencia",
    singular: "experiencia",
    icon: BriefcaseBusiness,
    color: "#0ea5e9",
    description:
      "Administra experiencia laboral o academica de forma ligera e independiente.",
    helper:
      "Registra tipo, cargo, empresa, fechas y si la experiencia sigue activa.",
    listSubtitle: (item) => `${item.type} · ${item.company}`,
    fields: [
      {
        key: "type",
        label: "Tipo",
        type: "select",
        options: ["Profesional", "Academica", "Freelance"],
      },
      {
        key: "roleArea",
        label: "Area",
        type: "select",
        optionsByType: {
          Profesional: [
            "Software y tecnologia",
            "Diseno y producto",
            "Negocios y marketing",
            "Operaciones y gestion",
            "Otra",
          ],
          Academica: ["Academica", "Otra"],
          Freelance: ["Freelance", "Software y tecnologia", "Diseno y producto", "Otra"],
        },
      },
      {
        key: "title",
        label: "Cargo",
        type: "catalog-select",
        library: EXPERIENCE_ROLE_LIBRARY,
        categoryKey: "roleArea",
        placeholder: "Selecciona un cargo o escribe otro",
      },
      {
        key: "company",
        label: "Empresa / institucion / cliente",
        type: "text",
        placeholder: "Nombre de empresa o institucion",
      },
      {
        key: "description",
        label: "Descripcion",
        type: "textarea",
        placeholder: "Impacto, tareas o logros",
      },
      { key: "startDate", label: "Fecha inicio", type: "date" },
      { key: "endDate", label: "Fecha fin", type: "date" },
      { key: "isCurrent", label: "Sigo aqui", type: "checkbox" },
    ],
  },
  skills: {
    key: "skills",
    title: "Habilidades",
    singular: "habilidad",
    icon: Sparkles,
    color: "#6d5bd0",
    description:
      "Separa habilidades tecnicas y blandas para mantener el registro liviano.",
    helper:
      "Selecciona categoria, elige una habilidad sugerida o agrega otra y asignale nivel.",
    listSubtitle: (item) => item.level,
    fields: [
      {
        key: "category",
        label: "Categoria",
        type: "select",
        options: [...Object.keys(SKILL_LIBRARY), "Otra"],
      },
      {
        key: "name",
        label: "Nombre de la habilidad",
        type: "catalog-select",
        library: SKILL_LIBRARY,
        categoryKey: "category",
        placeholder: "Selecciona una habilidad o escribe otra manualmente",
      },
      {
        key: "level",
        label: "Nivel",
        type: "select",
        options: ["Junior", "Mid", "Senior"],
      },
      {
        key: "description",
        label: "Descripcion",
        type: "textarea",
        placeholder: "Describe la habilidad",
        pattern: "^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$",
      },
      {
        key: "category",
        label: "Categoria",
        type: "text",
        placeholder: "Frontend / Soft skill / Backend",
        pattern: "^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$",
        maxLength: 50,
      },
    ],
  },
  social: {
    key: "social",
    title: "Social",
    singular: "enlace",
    icon: Share2,
    color: "#d97706",
    description:
      "Organiza enlaces profesionales y redes con plataformas predefinidas.",
    helper:
      "Agrega tus redes y enlaces principales para mostrarlos mejor en el perfil.",
    listSubtitle: (item) => item.url,
    fields: [
      {
        key: "platform",
        label: "Plataforma",
        type: "select",
        options: SOCIAL_PLATFORM_LIBRARY,
      },
      { key: "url", label: "URL", type: "url", placeholder: "https://..." },
    ],
  },
  education: {
    key: "education",
    title: "Formacion profesional",
    singular: "formacion",
    icon: GraduationCap,
    color: "#0f766e",
    description:
      "Registra carreras, diplomados, cursos, maestrias y otros estudios relevantes.",
    helper:
      "Agrega tu formacion academica o profesional usando la misma informacion del registro inicial.",
    listSubtitle: (item) => [item.institution, item.level].filter(Boolean).join(" · "),
    fields: [
      {
        key: "level",
        label: "Tipo de formacion",
        type: "select",
        options: EDUCATION_LEVEL_LIBRARY,
      },
      {
        key: "program",
        label: "Programa o carrera",
        type: "text",
        placeholder: "Ingenieria de Sistemas / Diplomado en QA",
        maxLength: 140,
      },
      {
        key: "institution",
        label: "Institucion",
        type: "text",
        placeholder: "Universidad o institucion",
        maxLength: 120,
      },
      { key: "startDate", label: "Fecha inicio", type: "date" },
      { key: "endDate", label: "Fecha fin", type: "date" },
      { key: "isCurrent", label: "Actualmente", type: "checkbox" },
    ],
  },
};

export const INITIAL_ITEMS = {
  projects: [],
  experience: [],
  skills: [],
  social: [],
  education: [],
};

export const INITIAL_EXTRA_BY_SECTION = {
  social: {},
};

export function createEmptyForm(sectionKey) {
  const meta = SECTION_META[sectionKey];
  return meta.fields.reduce((acc, field) => {
    acc[field.key] =
      field.type === "checkbox"
        ? false
        : field.type === "tags" || field.type === "catalog-tags"
          ? []
          : "";
    return acc;
  }, {});
}

export function createFilledForm(sectionKey, item) {
  const meta = SECTION_META[sectionKey];
  return meta.fields.reduce((acc, field) => {
    acc[field.key] =
      item[field.key] ??
      (field.type === "checkbox"
        ? false
        : field.type === "tags" || field.type === "catalog-tags"
          ? []
          : "");
    return acc;
  }, {});
}
