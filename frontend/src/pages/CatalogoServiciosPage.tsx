import { useEffect, useMemo, useState } from 'react';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { BrandHeader } from '../components/BrandHeader';
import { listServices } from '../services/api';

type Servicio = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
};

type Veterinario = {
  id: number;
  nombre: string;
  direccion: string;
  horario: string;
  telefono: string;
  servicios: Servicio[];
};

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const formatPrice = (value: string | number) => {
  if (typeof value === 'string') {
    return value;
  }

  return currencyFormatter.format(value);
};

const fetchCatalogData = async (): Promise<Veterinario[]> => {
  const services = await listServices();

  return [
    {
      id: 1,
      nombre: 'Veterinario registrado',
      direccion: 'Sede clínica',
      horario: 'Atención según agenda del veterinario',
      telefono: 'Sin registro',
      servicios: services,
    },
  ];
};

function CatalogSkeleton() {
  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded-xl bg-slate-200" />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            {[1, 2, 3].map((id) => (
              <div key={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-6 w-44 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-3 h-4 w-56 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-5 space-y-3">
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </section>

          <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-3 h-7 w-48 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export function CatalogoServiciosPage() {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [selectedVetId, setSelectedVetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchCatalogData();

        if (!isMounted) {
          return;
        }

        setVeterinarios(response);
        setSelectedVetId(response[0]?.id ?? null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : 'Ocurrió un error al cargar los servicios.');
        setVeterinarios([]);
        setSelectedVetId(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVet = useMemo(
    () => veterinarios.find((vet) => vet.id === selectedVetId) ?? null,
    [selectedVetId, veterinarios]
  );

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl">⚠️</div>
          <h1 className="mt-5 text-2xl font-black text-slate-900">No pudimos cargar el catálogo</h1>
          <p className="mt-3 text-base text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <BrandHeader subtitle="Catálogo de servicios" />
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Moneda: COP
            </div>
            <BackToHomeButton />
          </div>
        </header>

        {veterinarios.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">🩺</div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">No hay servicios registrados</h2>
            <p className="mt-3 text-slate-600">En este momento no hay veterinarios o servicios disponibles para mostrar.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="grid gap-4">
              {veterinarios.map((veterinario) => {
                const serviciosPreview = veterinario.servicios.slice(0, 2);

                return (
                  <button
                    key={veterinario.id}
                    type="button"
                    onClick={() => setSelectedVetId(veterinario.id)}
                    className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
                      selectedVetId === veterinario.id
                        ? 'border-sky-400 ring-2 ring-sky-100'
                        : 'border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{veterinario.nombre}</h2>
                        <p className="mt-1 text-sm text-slate-500">{veterinario.direccion}</p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                        {veterinario.servicios.length} servicios
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {veterinario.servicios.length === 0 ? (
                        <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                          Sin servicios registrados
                        </div>
                      ) : (
                        serviciosPreview.map((servicio) => (
                          <div key={servicio.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                            <div>
                              <p className="font-medium text-slate-800">{servicio.nombre}</p>
                              <p className="text-xs text-slate-500">{servicio.descripcion}</p>
                            </div>
                            <span className="font-bold text-sky-700">{formatPrice(servicio.precio)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </button>
                );
              })}
            </section>

            <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              {!selectedVet ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-slate-500">
                  Selecciona un veterinario para ver su detalle.
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Detalle</p>
                  <h2 className="mt-3 text-2xl font-black text-slate-900">{selectedVet.nombre}</h2>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Dirección:</span> {selectedVet.direccion}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Horario:</span> {selectedVet.horario}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Teléfono:</span> {selectedVet.telefono}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <h3 className="text-lg font-bold text-slate-900">Servicios</h3>

                    {selectedVet.servicios.length === 0 ? (
                      <div className="mt-3 rounded-xl bg-amber-50 px-3 py-3 text-sm font-medium text-amber-700">
                        No hay servicios registrados para este veterinario.
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {selectedVet.servicios.map((servicio) => (
                          <div key={servicio.id} className="rounded-2xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-slate-800">{servicio.nombre}</p>
                              <span className="font-bold text-sky-700">{formatPrice(servicio.precio)}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{servicio.descripcion}</p>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Precio: {formatPrice(servicio.precio)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
