import { motion, AnimatePresence } from "framer-motion";
import { Check, UserCircle2, Briefcase } from "lucide-react";

const ROLE_OPTIONS = [
  {
    value: "PROFESIONAL",
    title: "Profesional",
    subtitle: "Buscar empleo",
    icon: UserCircle2,
    accent: "from-blue-500 to-cyan-500",
    ringLight: "border-blue-500 bg-white shadow-blue-200",
    ringDark:  "dark:border-blue-400 dark:bg-[hsl(220,30%,14%)] dark:shadow-blue-900/30",
  },
  {
    value: "RECLUTADOR",
    title: "Reclutador",
    subtitle: "Publicar ofertas",
    icon: Briefcase,
    accent: "from-violet-500 to-fuchsia-500",
    ringLight: "border-violet-500 bg-white shadow-violet-200",
    ringDark:  "dark:border-violet-400 dark:bg-[hsl(220,30%,14%)] dark:shadow-violet-900/30",
  },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ROLE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative px-4 py-3 rounded-xl border text-left transition-all duration-200
              ${isActive
                ? `${option.ringLight} ${option.ringDark} border-2 shadow-md`
                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-transparent"
              }`}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-linear-to-br ${option.accent} flex items-center justify-center`}
                >
                  <Check size={10} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                ${isActive
                  ? `bg-linear-to-br ${option.accent}`
                  : "bg-gray-100 dark:bg-white/8"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-gray-500 dark:text-slate-400"} />
              </div>

              <div>
                <p className={`font-semibold text-sm ${isActive ? "text-gray-900 dark:text-slate-100" : "text-gray-700 dark:text-slate-300"}`}>
                  {option.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-500">{option.subtitle}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}