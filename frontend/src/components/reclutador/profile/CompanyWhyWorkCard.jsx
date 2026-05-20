import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export function CompanyWhyWorkCard({
  benefits = [],
  images = [],
}) {
  return (
    <Card className="border border-purple-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          ¿Por qué trabajar con nosotros?
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* Beneficios */}
        <div className="grid grid-cols-2 gap-4">
          {benefits.length > 0 ? (
            benefits.map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                {Icon && <Icon className="w-4 h-4 text-primary" />}
                {label}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin beneficios definidos.
            </p>
          )}
        </div>

        {/* Imágenes */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="empresa"
                className="rounded-lg object-cover h-24 w-full"
              />
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
