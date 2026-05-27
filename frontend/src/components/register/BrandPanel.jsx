import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, TrendingUp, Shield } from "lucide-react";

const BENEFITS = [
  { icon: Users,     title: "Conecta",       desc: "Amplía tu red de contactos profesionales" },
  { icon: Briefcase, title: "Oportunidades", desc: "Encuentra las mejores ofertas laborales" },
  { icon: TrendingUp,title: "Crecimiento",   desc: "Desarrolla tus habilidades y avanza" },
];

const VARIANTS = {
  register: {
    iconBg:   "bg-rose-100 dark:bg-rose-500/10",
    iconColor:"text-rose-400 dark:text-rose-400",
    title:    "Únete a nuestra comunidad profesional",
    subtitle: "Crea tu cuenta y accede a oportunidades, conecta con profesionales y construye tu futuro.",
  },
  login: {
    iconBg:   "bg-rose-100 dark:bg-rose-500/10",
    iconColor:"text-rose-400 dark:text-rose-400",
    title:    "Bienvenido de vuelta a PortaFy",
    subtitle: "Inicia sesión y continúa construyendo tu futuro profesional.",
  },
};

export default function BrandPanel({ variant = "register" }) {
  const v = VARIANTS[variant] ?? VARIANTS.register;
  const navigate = useNavigate();

  return (
    <div className="relative h-full flex flex-col justify-between p-10 overflow-hidden
      bg-linear-to-br from-indigo-50 via-white to-indigo-100
      dark:from-[hsl(228,30%,11%)] dark:via-[hsl(230,28%,13%)] dark:to-[hsl(240,28%,12%)]
      rounded-l-3xl border-r border-white/20 dark:border-white/5">

      {/* Logo */}
      <div className="pf-logo" onClick={() => navigate("/")}>
        <img src="/logos/portafy.png" alt="PortaFy" className="pf-logo__img" />
        <span className="pf-logo__text">
          Porta<span className="pf-logo__fy">Fy</span>
        </span>
      </div>

      {/* Texto principal */}
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-slate-100">
          {v.title}
        </h1>
        <p className="text-gray-500 dark:text-slate-400">{v.subtitle}</p>

        {/* Beneficios */}
        <div className="space-y-5 mt-6">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`${v.iconBg} p-3 rounded-xl`}>
                  <Icon size={20} className={v.iconColor} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-slate-200">{b.title}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Seguridad */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
        <Shield size={16} />
        Datos protegidos
      </div>
    </div>
  );
}