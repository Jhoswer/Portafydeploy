import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, TrendingUp, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const BENEFITS = [
  { icon: Users,      key: "connect" },
  { icon: Briefcase,  key: "opportunities" },
  { icon: TrendingUp, key: "growth" },
];

const ICON_STYLES = {
  register: {
    iconBg:    "bg-rose-100 dark:bg-rose-500/10",
    iconColor: "text-rose-400 dark:text-rose-400",
  },
  login: {
    iconBg:    "bg-rose-100 dark:bg-rose-500/10",
    iconColor: "text-rose-400 dark:text-rose-400",
  },
};

export default function BrandPanel({ variant = "register" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const v = ICON_STYLES[variant] ?? ICON_STYLES.register;

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
          {t(`register.brandPanel.${variant}.title`)}
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          {t(`register.brandPanel.${variant}.subtitle`)}
        </p>

        {/* Beneficios */}
        <div className="space-y-5 mt-6">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`${v.iconBg} p-3 rounded-xl`}>
                  <Icon size={20} className={v.iconColor} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-slate-200">
                    {t(`register.brandPanel.benefits.${b.key}.title`)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {t(`register.brandPanel.benefits.${b.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Seguridad */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
        <Shield size={16} />
        {t("register.brandPanel.dataProtected")}
      </div>
    </div>
  );
}