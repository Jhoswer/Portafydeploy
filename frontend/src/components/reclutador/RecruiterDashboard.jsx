import AuthTopbar from "../landing/AuthTopbar";
import RecruiterLeftSidebar from "./LeftSidebar";
import { EmpresaProvider } from "../../lib/EmpresaContext";
import { SidebarNavProvider } from "../landing/SidebarNavContext";

export default function RecruiterDashboard() {
  return (
    <EmpresaProvider>
      <SidebarNavProvider>
        <div className="page-wrapper page-recruiter">
          <AuthTopbar />
          <div className="layoutrecruiter">
            <RecruiterLeftSidebar />
          </div>
        </div>
      </SidebarNavProvider>
    </EmpresaProvider>
  );
}