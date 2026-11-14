export function OccupancySkeleton() {
  return (
    <div aria-label="Cargando reporte de ocupación" aria-busy="true" className="animate-pulse space-y-5">
      <div className="h-40 rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 rounded-2xl bg-slate-200" />)}
      </div>
      <div className="h-64 rounded-2xl bg-slate-200" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 h-5 w-48 rounded bg-slate-200" />
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="mb-3 h-12 rounded-lg bg-slate-200 last:mb-0" />)}
      </div>
    </div>
  );
}
