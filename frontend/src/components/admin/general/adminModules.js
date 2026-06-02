import {
  FileText, Lightbulb, Clock, MessageCircle, ClipboardList,
  ShieldCheck, PlusCircle, Trash2, Pencil, Compass, CheckCircle,
  BarChart2, Bookmark, UserPlus, CornerUpRight, Plus,
  Ban, Database, AlertTriangle, BookOpen,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   getAdminModuleGroups(t)
   Llama esta función desde los componentes que usan useTranslation.
   Devuelve la misma estructura que ADMIN_MODULE_GROUPS pero con
   títulos e ítems traducidos.
───────────────────────────────────────────────────────────── */
export function getAdminModuleGroups(t) {
  const g = "adminModules.groups";
  const i = "adminModules.items";

  return {
    left: [
      {
        key: "panel",
        title: t(`${g}.panel`),
        items: [
          { page: "reportes",    icon: FileText,      label: t(`${i}.reportes`),    color: "res-blue"   },
          { page: "sugerencias", icon: Lightbulb,     label: t(`${i}.sugerencias`), color: "res-violet" },
          { page: "historial",   icon: Clock,         label: t(`${i}.historial`),   color: "res-teal"   },
        ],
      },
      {
        key: "soporte",
        title: t(`${g}.soporte`),
        items: [
          /*{ page: "mensajes", icon: MessageCircle, label: t(`${i}.mensajes`), color: "res-blue" },*/
          { page: "solicitudes", icon: ClipboardList, label: t(`${i}.solicitudes`), color: "res-teal" },
        ],
      },
      {
        key: "gestion",
        title: t(`${g}.gestion`),
        items: [
          { page: "permisos",    icon: ShieldCheck, label: t(`${i}.permisos`),    color: "res-violet" },
          { page: "creacion",    icon: PlusCircle,  label: t(`${i}.creacion`),    color: "res-teal"   },
          { page: "eliminacion", icon: Trash2,      label: t(`${i}.eliminacion`), color: "res-blue"   },
          { page: "edicion",     icon: Pencil,      label: t(`${i}.edicion`),     color: "res-violet" },
        ],
      },
    ],
    right: [
      /*{
        key: "miHistoria",
        title: t(`${g}.miHistoria`),
        superadminOnly: false,
        items: [
          { page: "atendido",    icon: CheckCircle, label: t(`${i}.atendido`),    color: "res-teal"   },
          { page: "estadistica", icon: BarChart2,   label: t(`${i}.estadistica`), color: "res-violet" },
          { page: "guardado",    icon: Bookmark,    label: t(`${i}.guardado`),    color: "res-blue"   },
        ],
      },*/
      {
        key: "atencion",
        title: t(`${g}.atencion`),
        superadminOnly: true,
        items: [
          { page: "nuevos", icon: UserPlus, label: t(`${i}.nuevos`), color: "res-teal" },
          /*{ page: "redirigidos", icon: CornerUpRight, label: t(`${i}.redirigidos`), color: "res-blue"   },
          { page: "anadir",      icon: Plus,          label: t(`${i}.anadir`),      color: "res-violet" },*/
        ],
      },
      {
        key: "critico",
        title: t(`${g}.critico`),
        superadminOnly: true,
        items: [
          { page: "suspension", icon: Ban,      label: t(`${i}.suspension`), color: "res-blue" },
          { page: "backups",    icon: Database, label: t(`${i}.backups`),    color: "res-teal" },
          /*{ page: "mensaje", icon: AlertTriangle, label: t(`${i}.mensaje`), color: "res-violet" },*/
          { page: "definicion", icon: BookOpen, label: t(`${i}.definicion`), color: "res-blue" },
        ],
      },
    ],
  };
}

/* ─────────────────────────────────────────────────────────────
   Constantes estáticas — para lógica interna (routing, permisos).
   NO se usan para mostrar labels en UI.
───────────────────────────────────────────────────────────── */
export const ADMIN_MODULE_GROUPS = {
  left: [
    {
      key: "panel",
      title: "Panel",
      items: [
        { page: "reportes",    icon: FileText,      label: "Reportes",    color: "res-blue"   },
        { page: "sugerencias", icon: Lightbulb,     label: "Sugerencias", color: "res-violet" },
        { page: "historial",   icon: Clock,         label: "Historial",   color: "res-teal"   },
      ],
    },
    {
      key: "soporte",
      title: "Soporte",
      items: [
        { page: "solicitudes", icon: ClipboardList, label: "Solicitudes", color: "res-teal" },
      ],
    },
    {
      key: "gestion",
      title: "Gestion",
      items: [
        { page: "permisos",    icon: ShieldCheck, label: "Permisos",    color: "res-violet" },
        { page: "creacion",    icon: PlusCircle,  label: "Creacion",    color: "res-teal"   },
        { page: "eliminacion", icon: Trash2,      label: "Eliminacion", color: "res-blue"   },
        { page: "edicion",     icon: Pencil,      label: "Edicion",     color: "res-violet" },
      ],
    },
  ],
  right: [
    {
      key: "atencion",
      title: "Atencion",
      superadminOnly: true,
      items: [
        { page: "nuevos", icon: UserPlus, label: "Nuevos", color: "res-teal" },
      ],
    },
    {
      key: "critico",
      title: "Critico",
      superadminOnly: true,
      items: [
        { page: "suspension", icon: Ban,      label: "Suspension", color: "res-blue" },
        { page: "backups",    icon: Database, label: "Backups",    color: "res-teal" },
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
  ADMIN_MODULES.map(({ page, label }) => [page, label])
);