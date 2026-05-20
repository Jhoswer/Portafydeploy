import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Linkedin, Instagram, Facebook } from "lucide-react";
import { useAuth } from "../../../context/useAuth";

import { CompanyHeader }      from "../profile/CompanyHeader";
import { CompanyAboutCard }   from "../profile/CompanyAboutCard";
import { CompanyContactCard } from "../profile/CompanyContactCard";
import { JobPostCard }        from "../shared/JobPostCard";
import { fetchPublicCompany } from "../../../services/companyTrustService";
import { CompanyInfo, ContactTab } from "../profile/CompanyInfoSection";

function extractCompanyId(slug = "") {
  const parts = slug.split("-");
  return parts[parts.length - 1];
}

export default function EmpresaPerfil() {
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
      .catch((err) => setError(err.message || "No se pudo cargar la empresa."))
      .finally(() => setLoading(false));
  }, [companyId, isPublic, authCompany?.id_company]);

  useEffect(() => {
    if (!isPublic) setCompany(authCompany);
  }, [authCompany, isPublic]);

  if (error)    return <p style={{ textAlign: "center", padding: 40, color: "#dc2626" }}>{error}</p>;
  if (!company) return null;

  const companyLogo = company?.logo_url ?? null;
  const nombre      = company?.name     ?? "Mi empresa";

  return (
    <>
      <CompanyHeader
        editing={editing}
        setEditing={setEditing}
        isOwner={!isPublic}
        companyData={company}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyMetrics={isPublic ? metrics : {
          followers:    company?.followers    ?? 0,
          following:    company?.following    ?? 0,
          is_following: company?.is_following ?? false,
        }}
      />

      <div className="empresa-perfil__grid">

        {/* ── Convocatorias ───────────────────────────── */}
        {activeTab === "convocatorias" && (
          <>
            <div className="empresa-perfil__feed">
              <div className="convocatorias-card">
                <div className="convocatorias-card__header">
                  <h3 className="convocatorias-card__title">
                    {isPublic ? "Convocatorias activas" : "Convocatorias destacadas"}
                  </h3>
                </div>
                <div className="convocatorias-card__body">
                  {loading ? (
                    <p className="convocatorias-card__empty">Cargando...</p>
                  ) : offers.length === 0 ? (
                    <p className="convocatorias-card__empty">
                      {isPublic ? "No hay convocatorias activas." : "No tienes convocatorias"}
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

            <div className="empresa-perfil__sidebar">
              <CompanyAboutCard
                description={company?.description}
                mission={company?.mission}
                vision={company?.vision}
                industry={company?.industry}
                size={company?.size}
              />
              <CompanyContactCard
                phone={company?.phone}
                website={company?.website}
                location={company?.city}
                social={[
                  { icon: Linkedin,  url: "#" },
                  { icon: Instagram, url: "#" },
                  { icon: Facebook,  url: "#" },
                ]}
              />
            </div>
          </>
        )}

        {/* ── Información ─────────────────────────────── */}
        {activeTab === "informacion" && (
          <div className="empresa-perfil__full">
            <CompanyInfo isOwner={!isPublic} />
          </div>
        )}

        {activeTab === "contacto" && (
  <div className="empresa-perfil__full">
    <ContactTab company={company} isOwner={!isPublic} />
  </div>
)}

        {/* ── Equipo ──────────────────────────────────── */}
        {activeTab === "equipo" && (
          <div className="empresa-perfil__full">
            {/* aquí va tu futuro componente de equipo */}
          </div>
        )}

      </div>
    </>
  );
}