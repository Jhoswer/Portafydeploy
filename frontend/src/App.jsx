import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext";

const Home = lazy(() => import("./pages/landing/Home"));
const Login = lazy(() => import("./pages/auth/Login2"));
const Register = lazy(() => import("./pages/auth/Register"));
const OAuthPopupCallback = lazy(() => import("./pages/auth/OAuthPopupCallback"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Forms = lazy(() => import("./pages/dashboard/Forms"));
const CrearPerfilProfesional = lazy(() => import("./pages/profile/CrearPerfilProfesional"));
const SearchUsers = lazy(() => import("./pages/discovery/SearchUsers"));
const Explore = lazy(() => import("./pages/discovery/Explore"));
const Search = lazy(() => import("./pages/search/nuevaBusqueda"));
const Recruiter = lazy(() => import("./pages/reclutador/Recruiter"));
const FeedPage = lazy(() => import("./pages/feed/FeedPage"));
const SavedPage = lazy(() => import("./pages/saved/SavedPage"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const CvEditor = lazy(() => import("./pages/dashboard/CvEditor"));
const EmpresaPage = lazy(() => import("./pages/reclutador/CompanyPage"));
const RecruiterForms = lazy(() => import("./pages/reclutador/Form"));
const DashboardCompartido = lazy(() => import("./pages/sharedDashboard/Dashboard"));
const DashboardLegacy = lazy(() => import("./pages/dashboard/Dashboard"));
const NotificationsPage = lazy(() => import("./pages/notificaciones/NotificationsPage"));

function RouteLoader() {
  return (
    <div className="app-shell-loading">
      <div className="app-shell-spinner" />
      <p>Cargando interfaz...</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <div className="background-layer" />
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/popup-callback" element={<OAuthPopupCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/profesional/forms" element={<Forms />} />
            <Route path="/perfil-profesional" element={<CrearPerfilProfesional />} />
            <Route path="/buscar" element={<SearchUsers />} />
            <Route path="/dashboard" element={<DashboardCompartido />} />
            <Route path="/dashboard-clasico" element={<DashboardLegacy />} />
            <Route path="/explorar" element={<Explore />} />
            <Route path="/search" element={<Search />} />
            <Route path="/reclutadorform" element={<RecruiterForms />} />
            <Route path="/reclutador/forms" element={<RecruiterForms />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/guardados" element={<SavedPage />} />
            <Route path="/configuracion" element={<Settings />} />
            <Route path="/dashboard/cv/editor" element={<CvEditor />} />
            <Route path="/empresa/:slug" element={<EmpresaPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notificaciones" element={<NotificationsPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
