import { ChevronRight } from "lucide-react";

export default function AdminModuleLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="adm-reports">
      <nav className="adm-breadcrumb">
        <span>Administrar</span>
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
