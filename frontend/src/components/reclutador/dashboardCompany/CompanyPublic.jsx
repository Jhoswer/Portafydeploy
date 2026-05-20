// EmpresaPerfil.jsx
import { CompanyHeader } from "../profile/CompanyHeader";
import { CompanyAboutCard } from "../profile/CompanyAboutCard";
import { CompanyContactCard } from "../profile/CompanyContactCard";
import { JobPostCard } from "../shared/JobPostCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Home, BookOpen, Clock, Heart } from "lucide-react";
import { useEmpresa } from "../../../lib/EmpresaContext";
import { Link } from "wouter";
import { useAuth } from "../../../context/useAuth";

const BENEFICIOS = [
  { icon: Home,     label: "Home office"    },
  { icon: Heart,    label: "Obra social"    },
  { icon: Clock,    label: "Horario flex"   },
  { icon: BookOpen, label: "Budget estudio" },
];

export default function EmpresaPerfil() {
  const { convocatorias, loadingConvocatorias } = useEmpresa();
  const { company } = useAuth();
  const companyLogo = company?.logo_url ?? null;
  const nombre      = company?.name     ?? "Mi empresa";

  return (
    <>
      <CompanyHeader />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Feed de convocatorias (izquierda, 2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Convocatorias destacadas
              </CardTitle>
              <Link
                href="/convocatorias/mias"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver todas
              </Link>
            </CardHeader>

            <CardContent>
              {loadingConvocatorias ? (
                <p className="text-center text-sm text-muted-foreground">
                  Cargando...
                </p>
              ) : convocatorias.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No tienes convocatorias
                </p>
              ) : (
                <div className="grid gap-6">
                  {convocatorias.map((c) => (
                    <JobPostCard
                      key={c.id}
                      title={c.title}
                      description={c.description}
                      companyName={nombre}
                      companyLogo={companyLogo}
                      ubicacion={c.ubicacion}
                      modalidad={c.modalidad}
                      skills={c.skills}
                      status={c.status}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info de la empresa (derecha, 1/3) */}
        <div className="space-y-6">

          <CompanyAboutCard />

          <CompanyContactCard />

        </div>
      </div>
    </>
  );
}