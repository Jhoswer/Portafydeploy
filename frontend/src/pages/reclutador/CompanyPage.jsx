import EmpresaPerfil from "../../components/reclutador/dashboardCompany/CompanyProfile";
import { EmpresaProvider } from "../../lib/EmpresaContext";
import AuthTopbar from "../../components/landing/AuthTopbar"; 

export default function CompanyPage() {
  return (
    <EmpresaProvider>
      <div className="page-wrapper page-recruiter">
        <AuthTopbar />
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "140px 16px 24px" }}>
          <EmpresaPerfil />
        </main>
      </div>
    </EmpresaProvider>
  );
}