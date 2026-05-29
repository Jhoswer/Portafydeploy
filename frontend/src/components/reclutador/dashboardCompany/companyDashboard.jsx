import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../../ui/ui";
import { obtenerMisOfertas } from "../../../services/offerService";
import { useAuth } from "../../../context/useAuth";

function offerBadgeClass(state) {
  if (state === "open")    return { cls: "dash-badge--blue",  label: "Activa"   };
  if (state === "private") return { cls: "dash-badge--amber", label: "Borrador" };
  if (state === "closed")  return { cls: "dash-badge--red",   label: "Cerrada"  };
  return { cls: "dash-badge--gray", label: state };
}

function postulationBadgeClass(state) {
  if (state === "in_verification") return { cls: "dash-badge--amber", label: "En revisión" };
  if (state === "accepted")        return { cls: "dash-badge--green", label: "Aceptado"    };
  if (state === "rejected")        return { cls: "dash-badge--red",   label: "Rechazado"   };
  return { cls: "dash-badge--gray", label: state };
}

function Avatar({ name, photo }) {
  if (photo) return <img src={photo} alt={name} className="dash-avatar" />;
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  return <div className="dash-avatar dash-avatar--initials">{initials}</div>;
}

function Skeleton() {
  return (
    <div className="dash">
      <div className="dash-skeleton" style={{ height: 100 }} />
      <div className="dash-skeleton-grid">
        {[1,2,3,4].map(i => <div key={i} className="dash-skeleton" style={{ height: 90 }} />)}
      </div>
      <div className="dash-skeleton-two">
        <div className="dash-skeleton" style={{ height: 200 }} />
        <div className="dash-skeleton" style={{ height: 200 }} />
      </div>
    </div>
  );
}

export default function DashboardCompany({ onNavigate }) {
  const { t } = useTranslation();
  const { company } = useAuth();
  const [offers,      setOffers]      = useState([]);
  const [postulantes, setPostulantes] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [visibility,  setVisibility]  = useState({
    convocatorias: true, empresa: true, contacto: false, redes: false,
  });

  const companyName = company?.name ?? "Mi empresa";

  const VIS_ITEMS = [
    { key: "convocatorias", label: t("empresa.visibilidad.convocatorias") },
    { key: "empresa",       label: t("empresa.visibilidad.empresa")       },
    { key: "contacto",      label: t("empresa.visibilidad.contacto")      },
    { key: "redes",         label: t("empresa.visibilidad.redes")         },
  ];

  useEffect(() => {
    obtenerMisOfertas()
      .then((res) => {
        const list = res?.data ?? res?.offers ?? res ?? [];
        const safeList = Array.isArray(list) ? list : [];
        setOffers(safeList);

        const allPostulants = [];
        safeList.forEach((o) => {
          try {
            const raw = sessionStorage.getItem(`pf_recruiter_postulants_${o.id_offer}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.data?.length) {
                parsed.data.forEach((p) => allPostulants.push({ ...p, offerTitle: o.title }));
              }
            }
          } catch {}
        });
        setPostulantes(allPostulants);
      })
      .catch((e) => console.error("Error cargando ofertas:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const activas    = offers.filter(o => o.state === "open");
  const enRevision = postulantes.filter(p => p.state === "in_verification");
  const aceptados  = postulantes.filter(p => p.state === "accepted");
  const visiblesCount = Object.values(visibility).filter(Boolean).length;

  const STATS = [
    { label: t("empresa.stats.convocatorias_activas"),  value: activas.length,     badgeCls: "dash-badge--blue",  badge: t("empresa.badges.en_curso"),   nav: "convocatorias" },
    { label: t("empresa.stats.candidatos_por_revisar"), value: enRevision.length,  badgeCls: "dash-badge--amber", badge: t("empresa.badges.pendiente"),   nav: "convocatorias" },
    { label: t("empresa.stats.candidatos_aceptados"),   value: aceptados.length,   badgeCls: "dash-badge--green", badge: t("empresa.badges.aceptados"),   nav: "convocatorias" },
    { label: t("empresa.stats.total_postulantes"),      value: postulantes.length, badgeCls: "dash-badge--gray",  badge: t("empresa.badges.historico")                        },
  ];

  return (
    <div className="dash">

      <div className="dash-banner">
        <div>
          <div className="dash-banner__eyebrow">{t("empresa.dashboard.eyebrow")}</div>
          <h2 className="dash-banner__title">{t("empresa.dashboard.bienvenido", { nombre: companyName })}</h2>
          <p className="dash-banner__sub">
            {t("empresa.dashboard.resumen", { activas: activas.length, revision: enRevision.length })}
          </p>
        </div>
        <button className="dash-banner__btn" onClick={() => onNavigate("nueva")}>
          {t("empresa.dashboard.nueva_convocatoria")}
        </button>
      </div>

      <div className="dash-stats">
        {STATS.map(({ label, value, badgeCls, badge, nav }) => (
          <div key={label} className="dash-stat" onClick={() => nav && onNavigate(nav)}>
            <div className="dash-stat__label">{label}</div>
            <div className="dash-stat__value">{value}</div>
            <span className={`dash-stat__badge ${badgeCls}`}>{badge}</span>
          </div>
        ))}
      </div>

      <div className="dash-two-col">

        <div className="dash-card">
          <div className="dash-card__header">
            <h3 className="dash-card__title">{t("empresa.dashboard.convocatorias_recientes")}</h3>
            <button className="dash-card__link" onClick={() => onNavigate("convocatorias")}>
              {t("empresa.dashboard.ver_todas")}
            </button>
          </div>
          {offers.length === 0 ? (
            <p className="dash-card__empty">{t("empresa.dashboard.sin_convocatorias")}</p>
          ) : (
            <div className="dash-conv-list">
              {offers.slice(0, 3).map((o) => {
                const badge = offerBadgeClass(o.state);
                const totalPost = (() => {
                  try {
                    const raw = sessionStorage.getItem(`pf_recruiter_postulants_${o.id_offer}`);
                    return raw ? JSON.parse(raw)?.data?.length ?? 0 : 0;
                  } catch { return 0; }
                })();
                return (
                  <div key={o.id_offer} className="dash-conv-item" onClick={() => onNavigate("convocatorias")}>
                    <div className="dash-conv-item__top">
                      <span className="dash-conv-item__name">{o.title}</span>
                      <span className={`dash-stat__badge ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div className="dash-conv-item__meta">
                      {t("empresa.dashboard.postulantes", { count: totalPost, area: o.area ?? "—" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <h3 className="dash-card__title">{t("empresa.dashboard.candidatos_recientes")}</h3>
            <button className="dash-card__link" onClick={() => onNavigate("convocatorias")}>
              {t("empresa.dashboard.ver_todos")}
            </button>
          </div>
          {postulantes.length === 0 ? (
            <p className="dash-card__empty">{t("empresa.dashboard.sin_postulantes")}</p>
          ) : (
            <div>
              {postulantes.slice(0, 4).map((p) => {
                const badge    = postulationBadgeClass(p.state);
                const fullName = `${p.name} ${p.last_name ?? ""}`.trim();
                return (
                  <div key={p.id_postulation} className="dash-cand-item">
                    <Avatar name={fullName} photo={p.profile_photo} />
                    <div className="dash-cand-item__info">
                      <div className="dash-cand-item__name">{fullName}</div>
                      <div className="dash-cand-item__role">{p.offerTitle}</div>
                    </div>
                    <span className={`dash-stat__badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <div className="dash-vis">
        <h3 className="dash-vis__title">{t("empresa.dashboard.visibilidad_titulo")}</h3>
        <div className="dash-vis__grid">
          {VIS_ITEMS.map(({ key, label }) => (
            <div key={key} className="dash-vis__row">
              <span className={`dash-vis__label ${visibility[key] ? "dash-vis__label--on" : "dash-vis__label--off"}`}>
                {label}
              </span>
              <ToggleSwitch
                checked={visibility[key]}
                onChange={() => setVisibility(prev => ({ ...prev, [key]: !prev[key] }))}
              />
            </div>
          ))}
        </div>
        <p className={`dash-vis__summary ${visiblesCount > 0 ? "dash-vis__summary--on" : "dash-vis__summary--off"}`}>
          {visiblesCount > 0
            ? t("empresa.dashboard.secciones_visibles", { count: visiblesCount })
            : t("empresa.dashboard.perfil_privado")}
        </p>
      </div>

    </div>
  );
}