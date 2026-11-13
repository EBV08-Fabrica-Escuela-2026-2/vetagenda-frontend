export function TimelineSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="space-y-3" aria-label="Cargando historial" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex w-24 flex-col items-center justify-center gap-2 border-r border-line py-6">
            <div className="skeleton h-7 w-9" />
            <div className="skeleton h-3 w-14" />
            <div className="skeleton h-3 w-10" />
          </div>
          <div className="flex flex-1 items-center gap-4 p-5">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <div className="skeleton h-5 w-48" />
              <div className="skeleton h-3.5 w-72 max-w-full" />
              <div className="skeleton h-3 w-40" />
            </div>
            <div className="skeleton hidden h-7 w-28 rounded-full sm:block" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DrawerSkeleton() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Cargando detalle">
      <div className="skeleton h-16 w-full" />
      <div className="flex items-center gap-3">
        <div className="skeleton h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-3 w-28" />
        </div>
      </div>
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-20 w-full" />
    </div>
  );
}
