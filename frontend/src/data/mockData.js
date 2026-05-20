export const mockEmpresa = {
  nombre: "TalentHub Bolivia",
  sector: "Tecnología",
  ubicacion: "Cochabamba, Bolivia",
  descripcion:
    "Empresa líder en reclutamiento de talento tecnológico en Bolivia. Conectamos a las mejores empresas con profesionales calificados.",
  etiquetas: ["Tecnología", "Startups", "Remoto"],
  logo: "TH",
};

export const convocatorias = [
  {
    id: 1,
    titulo: "Desarrollador Full Stack",
    area: "Tecnología",
    tipo: "Tiempo completo",
    fechaCierre: "2025-04-30",
    postulantes: 18,
    estado: "activa",
    progreso: 60,
    descripcion: "Buscamos desarrollador con experiencia en React y Node.js.",
  },
  {
    id: 2,
    titulo: "Diseñadora UX/UI",
    area: "Diseño",
    tipo: "Tiempo parcial",
    fechaCierre: "2025-04-25",
    postulantes: 9,
    estado: "activa",
    progreso: 40,
    descripcion: "Se requiere portafolio y experiencia en Figma.",
  },
  {
    id: 3,
    titulo: "Analista de Datos",
    area: "Data",
    tipo: "Tiempo completo",
    fechaCierre: "2025-04-10",
    postulantes: 21,
    estado: "cerrada",
    progreso: 100,
    descripcion: "Manejo de Python, SQL y herramientas de BI.",
  },
  {
    id: 4,
    titulo: "DevOps Engineer",
    area: "Infraestructura",
    tipo: "Freelance",
    fechaCierre: "2025-05-15",
    postulantes: 5,
    estado: "activa",
    progreso: 20,
    descripcion: "Experiencia en Docker, Kubernetes y CI/CD.",
  },
];

export const candidatos = [
  {
    id: 1,
    nombre: "María Ríos",
    convocatoria: "Desarrollador Full Stack",
    fecha: "2025-04-20",
    estado: "Entrevista",
    cv: true,
  },
  {
    id: 2,
    nombre: "Jorge Vega",
    convocatoria: "Diseñadora UX/UI",
    fecha: "2025-04-19",
    estado: "Revisión",
    cv: true,
  },
  {
    id: 3,
    nombre: "Ana Lima",
    convocatoria: "Analista de Datos",
    fecha: "2025-04-18",
    estado: "Postulado",
    cv: false,
  },
  {
    id: 4,
    nombre: "Sebastián Paz",
    convocatoria: "Desarrollador Full Stack",
    fecha: "2025-04-17",
    estado: "Finalista",
    cv: true,
  },
  {
    id: 5,
    nombre: "Carla Mamani",
    convocatoria: "Diseñadora UX/UI",
    fecha: "2025-04-16",
    estado: "Descartado",
    cv: true,
  },
  {
    id: 6,
    nombre: "Luis Flores",
    convocatoria: "Desarrollador Full Stack",
    fecha: "2025-04-15",
    estado: "Revisión",
    cv: false,
  },
  {
    id: 7,
    nombre: "Patricia Gutiérrez",
    convocatoria: "Analista de Datos",
    fecha: "2025-04-14",
    estado: "Entrevista",
    cv: true,
  },
  {
    id: 8,
    nombre: "Rafael Torres",
    convocatoria: "DevOps Engineer",
    fecha: "2025-04-13",
    estado: "Postulado",
    cv: true,
  },
];

export const visibilidadInicial = {
  convocatorias: true,
  empresa: true,
  contacto: false,
  redes: true,
};

export const estadoColores = {
  Entrevista: { bg: "#EAF3DE", text: "#3B6D11" },
  Revisión: { bg: "#FAEEDA", text: "#854F0B" },
  Postulado: { bg: "#E6F1FB", text: "#185FA5" },
  Finalista: { bg: "#EAF3DE", text: "#0F6E56" },
  Descartado: { bg: "#F1EFE8", text: "#5F5E5A" },
};
