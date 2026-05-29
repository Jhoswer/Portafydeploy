import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/useAuth";

import { CompanyHeader }      from "../profile/CompanyHeader";
import { CompanyAboutCard }   from "../profile/CompanyAboutCard";
import { CompanyContactCard } from "../profile/CompanyContactCard";
import { JobPostCard }        from "../shared/JobPostCard";
import { fetchPublicCompany } from "../../../services/companyTrustService";
import { CompanyInfoSection } from "../profile/CompanyInfoSection";

function extractCompanyId(slug = "") {
  const parts = slug.split("-");
  return parts[parts.length - 1];
}

export default function EmpresaPerfil() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { company: authCompany } = useAuth();

  const [activeTab, setActiveTab] = useState("convocatorias");

  const isPublic  = Boolean(slug);
  const companyId = isPublic ? extractCompanyId(slug) : null;

  const [company, setCompany] = useState(isPublic ? null : authCompany);
  const [metrics, setMetrics] = useState({ followers: 0, following: 0, is_following: false });
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(isPublic);
  const [error,   setError]   = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const id = isPublic ? companyId : authCompany?.id_company;
    if (!id) return;

    if (!isPublic) {
      try {
        const raw = sessionStorage.getItem("pf_recruiter_offers");
        if (raw) {
          const cached = JSON.parse(raw);
          setOffers(cached.data ?? []);
          setLoading(false);
          return;
        }
      } catch {}
    }

    setLoading(true);
    fetchPublicCompany(id)
      .then((data) => {
        if (isPublic) setCompany(data.company);
        setMetrics(data.metrics ?? {});
        setOffers(data.offers   ?? []);
      })
      .catch((err) => setError(err.message || t("empresa.perfil.error_cargar")))
      .finally(() => setLoading(false));
  }, [companyId, isPublic, authCompany?.id_company]);

  useEffect(() => {
    if (!isPublic) setCompany(authCompany);
  }, [authCompany, isPublic]);

  if (error)    return <p style={{ textAlign: "center", padding: 40, color: "#dc2626" }}>{error}</p>;
  if (!company) return null;

  const companyLogo = company?.logo_url ?? null;
  const nombre      = company?.name     ?? "Mi empresa";

  const companyMetrics = isPublic ? metrics : {
    followers:    company?.followers    ?? 0,
    following:    company?.following    ?? 0,
    is_following: company?.is_following ?? false,
  };

  return (
    <>
      <CompanyHeader
        editing={editing}
        setEditing={setEditing}
        isOwner={!isPublic}
        companyData={company}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyMetrics={companyMetrics}
      />

      <div className="empresa-perfil__grid">

        {activeTab === "convocatorias" && (
          <>
            <div className="empresa-perfil__full">
              <div className="convocatorias-card">
                <div className="convocatorias-card__header">
                  <h3 className="convocatorias-card__title">
                    {isPublic
                      ? t("empresa.perfil.convocatorias_activas")
                      : t("empresa.perfil.convocatorias_destacadas")}
                  </h3>
                </div>
                <div className="convocatorias-card__body">
                  {loading ? (
                    <p className="convocatorias-card__empty">{t("empresa.perfil.cargando")}</p>
                  ) : offers.length === 0 ? (
                    <p className="convocatorias-card__empty">
                      {isPublic
                        ? t("empresa.perfil.sin_convocatorias_publicas")
                        : t("empresa.perfil.sin_convocatorias_propias")}
                    </p>
                  ) : (
                    <div className="convocatorias-card__list">
                      {offers.map((o) => (
                        <JobPostCard
                          key={o.id_offer ?? o.id}
                          title={o.title}
                          description={o.description}
                          companyName={nombre}
                          companyLogo={companyLogo}
                          ubicacion={o.ubicacion}
                          modalidad={o.modalidad}
                          skills={o.skills?.map(s => s.name ?? s) ?? []}
                          status={o.status}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {["informacion", "rubro", "contacto", "seguidores"].includes(activeTab) && (
          <div className="empresa-perfil__full">
            <CompanyInfoSection
              activeTab={activeTab}
              isOwner={!isPublic}
              company={company}
              companyMetrics={companyMetrics}
            />
          </div>
        )}

      </div>
    </>
  );
}