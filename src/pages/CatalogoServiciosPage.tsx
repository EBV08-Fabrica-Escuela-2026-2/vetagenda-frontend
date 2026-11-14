import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { fetchCatalogo, getClinicTodayDate, VeterinarioConServicios } from '../services/api';

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

function getTodayDate() {
  return getClinicTodayDate();
}

function CatalogSkeleton() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div role="status" aria-live="polite" aria-busy="true" className="mx-auto max-w-7xl">
        <span className="sr-only">Cargando catálogo de servicios...</span>
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
  const [veterinarios, setVeterinarios] = useState<VeterinarioConServicios[]>([]);
  const [selectedVetId, setSelectedVetId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchCatalogo();

        if (!isMounted) return;

        const publicados = data.filter((veterinario) => veterinario.servicios.length > 0);
        setVeterinarios(publicados);
        setSelectedVetId(publicados[0]?.id ?? null);
      } catch (fetchError) {
        if (!isMounted) return;

        setError(fetchError instanceof Error ? fetchError.message : 'Ocurrió un error al cargar los servicios.');
        setVeterinarios([]);
        setSelectedVetId(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVet = useMemo(
    () => veterinarios.find((vet) => vet.id === selectedVetId) ?? null,
    [selectedVetId, veterinarios],
  );

  const selectedService = useMemo(
    () => selectedVet?.servicios.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, selectedVet],
  );

  useEffect(() => {
    if (!selectedVet) {
      setSelectedServiceId(null);
      return;
    }

    if (!selectedVet.servicios.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(selectedVet.servicios[0]?.id ?? null);
    }
  }, [selectedServiceId, selectedVet]);

  const availabilityHref = useMemo(() => {
    if (!selectedVet || !selectedService) return '/disponibilidad';

    const query = new URLSearchParams({
      servicio: String(selectedService.id),
      veterinario: String(selectedVet.id),
      fecha: getTodayDate(),
    });
    return `/disponibilidad?${query.toString()}`;
  }, [selectedService, selectedVet]);

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (error) {
    return (
      <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div role="alert" aria-live="assertive" className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl">⚠️</div>
          <h1 className="mt-5 text-2xl font-black text-slate-900">No pudimos cargar el catálogo</h1>
          <p className="mt-3 text-base text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#0D5C75] px-5 py-3 font-semibold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <BrandHeader subtitle="Catálogo de servicios" />
          <ClientSessionActions />
        </header>

        {veterinarios.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm" role="status">
            <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">🩺</div>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">No hay servicios registrados</h1>
            <p className="mt-3 text-slate-600">
              En este momento no hay veterinarios o servicios disponibles para mostrar.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section aria-label="Veterinarios y servicios" className="grid gap-4">
              {veterinarios.map((veterinario) => {
                const serviciosPreview = veterinario.servicios.slice(0, 2);
                const isSelectedVet = selectedVetId === veterinario.id;

                return (
                  <button
                    key={veterinario.id}
                    type="button"
                    aria-pressed={isSelectedVet}
                    onClick={() => setSelectedVetId(veterinario.id)}
                    className={`min-h-[44px] w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 ${
                      isSelectedVet
                        ? 'border-[#0D5C75] ring-2 ring-[#0D5C75]/20'
                        : 'border-slate-200 hover:border-[#0D5C75]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{veterinario.nombre}</h2>
                        <p className="mt-1 text-sm text-slate-600">{veterinario.direccion}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                        {veterinario.servicios.length} servicios
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {veterinario.servicios.length === 0 ? (
                        <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                          {veterinario.mensajeServicios ?? 'Sin servicios registrados'}
                        </div>
                      ) : (
                        <>
                          {serviciosPreview.map((servicio) => (
                            <div
                              key={servicio.id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
                            >
                              <div>
                                <p className="font-medium text-slate-800">{servicio.nombre}</p>
                                <p className="text-xs text-slate-600">{servicio.descripcion}</p>
                              </div>
                              <span className="shrink-0 font-bold text-[#0D5C75]">{formatPrice(servicio.precio)}</span>
                            </div>
                          ))}
                          {veterinario.servicios.length > serviciosPreview.length && (
                            <p className="px-1 pt-1 text-xs font-semibold text-[#0D5C75]">
                              +{veterinario.servicios.length - serviciosPreview.length} servicios más en el detalle
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </section>

            <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto" aria-live="polite">
              {!selectedVet ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                  Selecciona un veterinario para ver su detalle.
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0D5C75]">Detalle</p>
                  <h2 className="mt-3 text-2xl font-black text-slate-900">{selectedVet.nombre}</h2>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Dirección:</span> {selectedVet.direccion}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Horario:</span> {selectedVet.horarioAtencion}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Teléfono:</span> {selectedVet.telefono}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <h3 className="text-lg font-bold text-slate-900">Servicios</h3>
                    <p className="mt-1 text-sm text-slate-600">Selecciona el servicio que quieres agendar.</p>

                    {selectedVet.servicios.length === 0 ? (
                      <div className="mt-3 rounded-xl bg-amber-50 px-3 py-3 text-sm font-medium text-amber-900">
                        {selectedVet.mensajeServicios ?? 'No hay servicios registrados para este veterinario.'}
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {selectedVet.servicios.map((servicio) => (
                          <button
                            key={servicio.id}
                            type="button"
                            onClick={() => setSelectedServiceId(servicio.id)}
                            aria-pressed={selectedServiceId === servicio.id}
                            className={`min-h-[44px] w-full rounded-2xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1 ${
                              selectedServiceId === servicio.id
                                ? 'border-[#0D5C75] bg-sky-50 ring-2 ring-[#0D5C75]/20'
                                : 'border-slate-200 hover:border-[#0D5C75]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-slate-800">{servicio.nombre}</p>
                              <span className="shrink-0 font-bold text-[#0D5C75]">{formatPrice(servicio.precio)}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{servicio.descripcion}</p>
                            {servicio.duracionMinutos && (
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                                Duración: {servicio.duracionMinutos} min
                              </p>
                            )}
                          </button>
                        ))}

                        {selectedService && (
                          <Link
                            to={availabilityHref}
                            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0D5C75] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                          >
                            Consultar disponibilidad de {selectedService.nombre}
                            <span aria-hidden="true">→</span>
                          </Link>
                        )}
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
