import { cn } from "../../../lib/utils";

export function StatCard({ icon: Icon, label, value, trend, trendUp }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>

          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>

            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trendUp ? "text-green-600" : "text-red-600"
                )}
              >
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
