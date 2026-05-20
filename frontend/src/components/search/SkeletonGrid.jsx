/**
 * Grid de tarjetas skeleton mostradas durante la carga.
 *
 * @param {{ count?: number }} props
 */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card overflow-hidden shadow-sm animate-pulse"
          aria-hidden
        >
          <div className="h-36 bg-muted" />
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 -mt-7">
              <div className="h-14 w-14 rounded-full bg-muted border-4 border-card" />
              <div className="mt-5 space-y-1.5">
                <div className="h-3.5 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-4/5 bg-muted rounded" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 w-12 bg-muted rounded-md" />
              <div className="h-5 w-16 bg-muted rounded-md" />
              <div className="h-5 w-10 bg-muted rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 bg-muted rounded-lg" />
              <div className="h-8 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}