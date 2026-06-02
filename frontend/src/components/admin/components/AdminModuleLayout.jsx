import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

export default function AdminModuleLayout({ title, subtitle, children }) {
  const { t } = useTranslation();

  return (
    <section className="adm-reports">
      <nav className="adm-breadcrumb">
        <span>{t("adminCommon.breadcrumb.manage")}</span>
        <ChevronRight size={13} />
        <span className="adm-breadcrumb__active-wrapper">
          <span className="adm-breadcrumb__active">{title}</span>
          {subtitle ? <span className="adm-breadcrumb__tooltip">{subtitle}</span> : null}
        </span>
      </nav>
      {children}
    </section>
  );
}