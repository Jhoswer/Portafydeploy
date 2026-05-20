import {
  FileText,
  Lightbulb,
  Clock,
  MessageCircle,
  ClipboardList,
  ShieldCheck,
  PlusCircle,
  Trash2,
  Pencil,
  Compass,
  CheckCircle,
  BarChart2,
  Bookmark,
  UserPlus,
  CornerUpRight,
  Plus,
  Ban,
  Database,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

export const ADMIN_MODULE_GROUPS = {
  left: [
    {
      key: "panel",
      title: "Panel",
      items: [
        { page: "reportes", icon: FileText, label: "Reportes", color: "res-blue" },
        { page: "sugerencias", icon: Lightbulb, label: "Sugerencias", color: "res-violet" },
        { page: "historial", icon: Clock, label: "Historial", color: "res-teal" },
      ],
    },
    /*{
      key: "soporte",
      title: "Soporte",
      items: [
        { page: "mensajes", icon: MessageCircle, label: "Mensajes", color: "res-blue" },
        { page: "solicitudes", icon: ClipboardList, label: "Solicitudes", color: "res-teal" },
      ],
    },*/
    {
      key: "gestion",
      title: "Gestion",
      items: [
        { page: "permisos", icon: ShieldCheck, label: "Permisos", color: "res-violet" },
        { page: "creacion", icon: PlusCircle, label: "Creacion", color: "res-teal" },
        { page: "eliminacion", icon: Trash2, label: "Eliminacion", color: "res-blue" },
        { page: "edicion", icon: Pencil, label: "Edicion", color: "res-violet" },
      ],
    },
  ],
  right: [
    /*{
      key: "miHistoria",
      title: "Mi Historia",
      superadminOnly: false,
      items: [
        { page: "atendido", icon: CheckCircle, label: "Atendido", color: "res-teal" },
        { page: "estadistica", icon: BarChart2, label: "Estadistica", color: "res-violet" },
        { page: "guardado", icon: Bookmark, label: "Guardado", color: "res-blue" },
      ],
    },*/
    {
      key: "atencion",
      title: "Atencion",
      superadminOnly: true,
      items: [
        { page: "nuevos", icon: UserPlus, label: "Nuevos", color: "res-teal" },
        /*{ page: "redirigidos", icon: CornerUpRight, label: "Redirigidos", color: "res-blue" },
        { page: "anadir", icon: Plus, label: "Anadir", color: "res-violet" },*/
      ],
    },
    {
      key: "critico",
      title: "Critico",
      superadminOnly: true,
      items: [
        { page: "suspension", icon: Ban, label: "Suspension", color: "res-blue" },
        { page: "backups", icon: Database, label: "Backups", color: "res-teal" },
        /*{ page: "mensaje", icon: AlertTriangle, label: "Mensaje", color: "res-violet" },*/
        { page: "definicion", icon: BookOpen, label: "Definicion", color: "res-blue" },
      ],
    },
  ],
};

export const ADMIN_MODULES = [
  ...ADMIN_MODULE_GROUPS.left.flatMap((group) => group.items),
  ...ADMIN_MODULE_GROUPS.right.flatMap((group) => group.items),
];

export const ADMIN_MODULE_LABELS = Object.fromEntries(
  ADMIN_MODULES.map(({ page, label }) => [page, label]),
);
