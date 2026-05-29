import { useTranslation } from "react-i18next";
import { useEmpresa } from "../../../lib/EmpresaContext";
import { JobPostCard } from "../shared/JobPostCard";
import PostulantesConvocatoria from "../postulantes/PostulantesConvocatoria";
import { Plus, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/useAuth";
import { toast } from "sonner";

export default function MisConvocatorias({ onEdit, onNueva }) {
  const { t } = useTranslation();
  const { convocatorias, eliminarConvocatoria, cambiarEstadoConvocatoria } = useEmpresa();
  const [activeTab, setActiveTab]               = useState("publicadas");
  const [vistaPostulantes, setVistaPostulantes] = useState(null);
  const { company } = useAuth();

  const companyName = company?.name     ?? "Mi empresa";
  const companyLogo = company?.logo_url ?? null;

  const statsFor = (job) => ({
    total:           Number(job.stats?.total           ?? 0),
    accepted:        Number(job.stats?.accepted        ?? 0),
    refused:         Number(job.stats?.refused         ?? 0),
    in_verification: Number(job.stats?.in_verification ?? 0),
    nuevo:           Number(job.stats?.nuevo           ?? 0),
    in_interview:    Number(job.stats?.in_interview    ?? 0),
  });

  const handleToggleStatus = async (id, statusActual) => {
    const nuevoState =
      statusActual === "Activa"  ? "closed" :
      statusActual === "Cerrada" ? "open"   : "open";

    await cambiarEstadoConvocatoria(id, nuevoState);
    toast.success(
      nuevoState === "closed" ? t("misConvocatorias.toast.closed")    :
      nuevoState === "open"   ? t("misConvocatorias.toast.opened")    :
                                t("misConvocatorias.toast.published")
    );
  };

  const handleDelete = async (id) => {
    await eliminarConvocatoria(id);
    toast.success(t("misConvocatorias.toast.deleted"));
  };

  const resolveState = (c) => c.real_state ?? c.realState ?? c.state;

  const activas    = convocatorias.filter((c) => c.status === "Activa"   || resolveState(c) === "open"    || resolveState(c) === "visible");
  const borradores = convocatorias.filter((c) => c.status === "Borrador" || resolveState(c) === "private" || resolveState(c) === "draft");
  const cerradas   = convocatorias.filter((c) => c.status === "Cerrada"  || resolveState(c) === "closed");

  if (vistaPostulantes) {
    return (
      <PostulantesConvocatoria
        jobId={vistaPostulantes.id}
        jobTitle={vistaPostulantes.title}
        onBack={() => setVistaPostulantes(null)}
      />
    );
  }

  const commonProps = (job, isDraft = false) => {
    const stats = statsFor(job);
    return {
      id:          job.id ?? job.id_offer,
      title:       job.title,
      description: job.description,
      companyName,
      companyLogo,
      ubicacion:   job.ubicacion,
      type:        job.type,
      modalidad:   job.modalidad,
      nivel:       job.nivel,
      salaryMin:   job.salary_min  ?? job.salaryMin,
      salaryMax:   job.salary_max  ?? job.salaryMax,
      currency:    job.currency,
      skills:      job.skills,
      status:      job.status,
      bannerImage: job.banner_url  ?? job.bannerImage,
      createdAt:   job.created_at  ?? job.createdAt,
      realState:   job.real_state  ?? job.realState ?? job.state,
      onDelete:       () => handleDelete(job.id ?? job.id_offer),
      onToggleStatus: () => handleToggleStatus(job.id ?? job.id_offer, job.status),
      onEdit:         () => onEdit(job.id ?? job.id_offer),
      onApply: isDraft
        ? () => onEdit(job.id ?? job.id_offer)
        : () => setVistaPostulantes({ id: job.id ?? job.id_offer, title: job.title }),
      compact:          true,
      postulantesCount: stats.total,
      interviewsCount:  stats.in_interview,
      hiredCount:       stats.accepted,
    };
  };

  const renderGrid = (list, isDraft = false) => (
    <div className="mc-grid">
      {list.map((job) => (
        <JobPostCard
          key={job.id ?? job.id_offer}
          {...commonProps(job, isDraft)}
          timeAgo={isDraft ? t("misConvocatorias.timeAgo.draft") : undefined}
          viewsCount={job.viewsCount ?? job.views_count ?? undefined}
        />
      ))}
    </div>
  );

  const EmptyState = ({ icon: Icon, title, text, action }) => (
    <div className="mc-empty">
      {Icon && <div className="mc-empty__icon"><Icon size={24} /></div>}
      <h3 className="mc-empty__title">{title}</h3>
      <p className="mc-empty__text">{text}</p>
      {action && (
        <button onClick={action.fn} className="mc-empty__btn">{action.label}</button>
      )}
    </div>
  );

  const TABS = [
    { key: "publicadas", label: t("misConvocatorias.tabs.published"), count: activas.length    },
    { key: "borradores", label: t("misConvocatorias.tabs.drafts"),    count: borradores.length },
    { key: "cerradas",   label: t("misConvocatorias.tabs.closed"),    count: cerradas.length   },
  ];

  return (
    <div className="mc-wrap">
      <div className="mc-header">
        <div className="mc-header__top">
          <div>
            <h1 className="mc-title">{t("misConvocatorias.title")}</h1>
            <p className="mc-subtitle">{t("misConvocatorias.subtitle")}</p>
          </div>
          <button onClick={onNueva} className="pf-btn pf-btn--red">
            <Plus size={15} /> {t("misConvocatorias.newBtn")}
          </button>
        </div>
        <div className="mc-tabs">
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              className={`mc-tab ${activeTab === key ? "mc-tab--active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "publicadas" && (
          <motion.div key="publicadas"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          >
            {activas.length > 0 ? renderGrid(activas) : (
              <EmptyState
                icon={LayoutGrid}
                title={t("misConvocatorias.empty.noActive.title")}
                text={t("misConvocatorias.empty.noActive.text")}
                action={{ fn: onNueva, label: t("misConvocatorias.empty.noActive.action") }}
              />
            )}
          </motion.div>
        )}

        {activeTab === "borradores" && (
          <motion.div key="borradores"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          >
            {borradores.length > 0 ? renderGrid(borradores, true) : (
              <EmptyState
                title={t("misConvocatorias.empty.noDrafts.title")}
                text={t("misConvocatorias.empty.noDrafts.text")}
              />
            )}
          </motion.div>
        )}

        {activeTab === "cerradas" && (
          <motion.div key="cerradas"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          >
            {cerradas.length > 0 ? renderGrid(cerradas) : (
              <EmptyState
                title={t("misConvocatorias.empty.noClosed.title")}
                text={t("misConvocatorias.empty.noClosed.text")}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}