import { CompanyInfo }      from "./CompanyInfo";
import { CompanyRubro }     from "./CompanyRubro";
import { CompanyContact }   from "./CompanyContact";
import { CompanyFollowers } from "./CompanyFollowers";

export function CompanyInfoSection({ activeTab, isOwner = false, company = null, companyMetrics = {} }) {
  return (
    <>
      {activeTab === "informacion" && (
        <CompanyInfo isOwner={isOwner} companyData={company} />
      )}
      {activeTab === "rubro" && (
        <CompanyRubro isOwner={isOwner} companyData={company} />
      )}
      {activeTab === "contacto" && (
        <CompanyContact company={company} isOwner={isOwner} />
      )}
      {activeTab === "seguidores" && (
        <CompanyFollowers company={company} companyMetrics={companyMetrics} isOwner={isOwner} />
      )}
    </>
  );
}