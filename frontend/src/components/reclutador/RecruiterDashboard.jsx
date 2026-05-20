import AuthTopbar from "../landing/AuthTopbar";
import RecruiterLeftSidebar from "./LeftSidebar";
import { EmpresaProvider } from "../../lib/EmpresaContext";

export default function RecruiterDashboard() {
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
