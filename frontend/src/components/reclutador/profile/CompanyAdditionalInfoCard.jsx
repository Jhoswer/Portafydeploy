import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export function CompanyAdditionalInfoCard({ items = [] }) {
  return (
    <Card className="border border-blue-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Información adicional
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {items.length > 0 ? (
          items.map(({ icon: Icon, label, value }, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm"
            >
              {Icon && (
                <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
              )}

              <div>
                <p className="text-xs text-muted-foreground">
                  {label}
                </p>
                <p className="font-medium text-foreground">
                  {value || "—"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Sin información adicional.
          </p>
        )}

      </CardContent>
    </Card>
  );
}
