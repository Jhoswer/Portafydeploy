import {
  Bookmark,
  Briefcase,
  Compass,
  House,
  Layers,
  LayoutDashboard,
  Search,
  SlidersHorizontal,
  TrendingUp,
  User,
} from "lucide-react";

export const NAV_ITEMS = {
  panel: [
    { page: "home", route: "/feed", icon: House, labelKey: "home", color: "res-blue" },
    { page: "dashboard", route: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard", color: "res-violet" },
    { page: "search", route: "/search", icon: Search, labelKey: "search", color: "res-blue" },
  ],
  actividad: [
    { page: "guardados", route: "/guardados", icon: Bookmark, labelKey: "saved", color: "res-teal" },
    { page: "tendencias", route: "/tendencias", icon: TrendingUp, labelKey: "trending", color: "res-blue" },
  ],
};

export const EXPLORE_FILTER_ITEMS = [
  { filter: "todos", icon: User, labelKey: "all", color: "res-violet" },
  { filter: "portafolios", icon: Layers, labelKey: "portfolios", color: "res-teal" },
  { filter: "oferta", icon: Briefcase, labelKey: "jobs", color: "res-blue" },
];

export const SEARCH_FILTERS = [
  {
    id: "tipo",
    label: "Tipo",
    icon: User,
    options: ["Todos", "Usuario", "Proyecto", "Convocatoria"],
  },
  {
    id: "habilidad",
    label: "Habilidad",
    icon: Layers,
    options: ["Todas", "React", "Node.js", "Python", "TypeScript", "Vue", "Flutter"],
  },
  {
    id: "experiencia",
    label: "Experiencia",
    icon: Briefcase,
    options: ["Cualquiera", "Junior", "Semi-Senior", "Senior", "Lead"],
  },
  {
    id: "profesional",
    label: "Profesional",
    icon: SlidersHorizontal,
    options: ["Todos", "Freelance", "Tiempo completo", "Practicas"],
  },
];
