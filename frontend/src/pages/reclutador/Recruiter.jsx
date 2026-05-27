import NavBar from "../../components/landing/Navbar";
import AuthTopbar from "../../components/landing/AuthTopbar";
import RecruiterLeftSidebar from "../../components/reclutador/LeftSidebar";
import { EmpresaProvider } from "../../lib/EmpresaContext";

export default function Recruiter() {
  return (
    <EmpresaProvider>
      <div className="page-wrapper page-recruiter">
        <AuthTopbar />
        <div className="layoutrecruiter">
          <RecruiterLeftSidebar />
        </div>
      </div>
    </EmpresaProvider>
  );
}
