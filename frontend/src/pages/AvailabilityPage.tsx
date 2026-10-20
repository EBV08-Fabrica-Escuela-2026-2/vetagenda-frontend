import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import { Icon } from '../components/Icon';
import {
  fetchCatalogo,
  fetchDisponibilidad,
  getClinicTodayDate,
  hasAuthenticatedClientSession,
  isFutureReservationSlot,
  type VeterinarioConServicios,
} from '../services/api';

export type AvailabilityService = {
  id: string;
  name: string;
  duration: number;
  price: string;
};

export type VeterinarianOption = { id: string; name: string };

export type AvailableSlot = {
  time: string;
  veterinarioId: number;
  veterinarioNombre: string;
};

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const today = fromDateKey(getClinicTodayDate());
today.setHours(0, 0, 0, 0);

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function normalizeText(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function vetOffersService(
  vet: VeterinarioConServicios,
  serviceId: string,
  serviceName?: string,
): boolean {
  if (!vet.servicios || vet.servicios.length === 0) return false;
  return vet.servicios.some(
    (s) =>
      String(s.id) === String(serviceId) ||
      (serviceName && normalizeText(s.nombre) === normalizeText(serviceName)),
  );
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(a\.\s*m\.|p\.\s*m\.|am|pm)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toLowerCase().replace(/\s/g, '');
  if (period.includes('p') && hours < 12) hours += 12;
  if (period.includes('a') && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatLongDate(dateKey: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fromDateKey(dateKey));
}

function findServiceForVet(vet: VeterinarioConServicios, serviceId: string, serviceName: string) {
  return vet.servicios.find((service) => String(service.id) === serviceId)
    ?? vet.servicios.find((service) => normalizeText(service.nombre) === normalizeText(serviceName));
}

function isFutureApiSlot(dateKey: string, time: string) {
  return isFutureReservationSlot(dateKey, time.slice(0, 5));
}

function formatApiTime(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function extractServicesFromCatalog(catalogo: VeterinarioConServicios[]): AvailabilityService[] {
  const map = new Map<string, AvailabilityService>();
  catalogo.forEach((vet) => {
    vet.servicios?.forEach((s) => {
      const key = String(s.id);
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: s.nombre,
          duration: s.duracionMinutos ?? 30,
          price: typeof s.precio === 'number' ? `$${s.precio.toLocaleString('es-CO')}` : String(s.precio),
        });
      }
    });
  });
  return Array.from(map.values());
}

function AvailabilitySkeleton() {
  return (
    <div aria-label="Cargando horarios disponibles" aria-live="polite" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}

export function AvailabilityPage() {
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState<VeterinarioConServicios[]>([]);
  const [services, setServices] = useState<AvailabilityService[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    const param = new URLSearchParams(window.location.search).get('servicio');
    return param || '1';
  });

  const [selectedVeterinarianId, setSelectedVeterinarianId] = useState<string>(() => {
    const param = new URLSearchParams(window.location.search).get('veterinario');
    return param || 'all';
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const requestedDate = new URLSearchParams(window.location.search).get('fecha');
    const dateIsValid =
      requestedDate !== null &&
      /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) &&
      !Number.isNaN(fromDateKey(requestedDate).getTime()) &&
      toDateKey(fromDateKey(requestedDate)) === requestedDate;
    const isWithinWindow =
      dateIsValid &&
      requestedDate >= toDateKey(today) &&
      requestedDate <= toDateKey(addDays(today, 60));
    return isWithinWindow && requestedDate ? requestedDate : toDateKey(today);
  });

  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = fromDateKey(selectedDate);
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [availabilityRetry, setAvailabilityRetry] = useState(0);

  // Cargar catálogo de veterinarios con sus servicios reales
  useEffect(() => {
    let isMounted = true;
    fetchCatalogo()
      .then((data) => {
        if (!isMounted) return;
        setCatalogo(data);
        setServices(extractServicesFromCatalog(data));
        if (data.length === 0) {
          setAvailabilityError('No hay profesionales ni servicios publicados en el catálogo.');
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setCatalogo([]);
        setServices([]);
        setAvailabilityError(error instanceof Error ? error.message : 'No fue posible cargar el catálogo.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? services[0] ?? {
      id: selectedServiceId,
      name: 'Servicio clínico',
      duration: 30,
      price: '$50.000',
    },
    [services, selectedServiceId],
  );

  const selectedVeterinarian = useMemo(
    () => catalogo.find((v) => String(v.id) === selectedVeterinarianId),
    [catalogo, selectedVeterinarianId],
  );

  // Veterinarios que sí prestan el servicio seleccionado
  const vetsQuePrestan = useMemo(
    () => catalogo.filter((vet) => vetOffersService(vet, selectedServiceId, selectedService?.name)),
    [catalogo, selectedServiceId, selectedService?.name],
  );

  // Indica si el profesional seleccionado ofrece este servicio
  const profesionalPrestaServicio = useMemo(() => {
    if (selectedVeterinarianId === 'all') return true;
    if (!selectedVeterinarian) return false;
    return vetOffersService(selectedVeterinarian, selectedServiceId, selectedService?.name);
  }, [selectedVeterinarianId, selectedVeterinarian, selectedServiceId, selectedService?.name]);

  // Lista de opciones para el selector de veterinarios (con indicador visual si ofrece el servicio)
  const veterinarianOptions = useMemo(() => {
    return [
      { id: 'all', name: 'Cualquier profesional' },
      ...catalogo.map((vet) => {
        const ofrece = vetOffersService(vet, selectedServiceId, selectedService?.name);
        return {
          id: String(vet.id),
          name: ofrece ? vet.nombre : `${vet.nombre} (No presta este servicio)`,
          ofrece,
        };
      }),
    ];
  }, [catalogo, selectedServiceId, selectedService?.name]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    setIsLoading(true);
    setSelectedSlot(null);
    setAvailabilityError(null);

    const targetVets = selectedVeterinarianId === 'all'
      ? vetsQuePrestan
      : selectedVeterinarian && profesionalPrestaServicio
        ? [selectedVeterinarian]
        : [];

    if (targetVets.length === 0) {
      setSlots([]);
      setIsLoading(false);
      return () => {
        isActive = false;
        controller.abort();
      };
    }

    const timeoutId = window.setTimeout(() => {
      if (!isActive) return;
      controller.abort();
      setSlots([]);
      setAvailabilityError('La agenda está tardando demasiado en responder. Intenta nuevamente en unos segundos.');
      setIsLoading(false);
    }, 15000);

    Promise.all(targetVets.map(async (vet) => {
      const service = findServiceForVet(vet, selectedServiceId, selectedService.name);
      if (!service) return [];

      const availability = await fetchDisponibilidad(
        Number(service.id),
        selectedDate,
        vet.id,
        controller.signal,
      );
      return availability.horariosDisponibles
        .filter((slot) => isFutureApiSlot(selectedDate, slot.horaInicio))
        .map((slot) => ({
          time: formatApiTime(slot.horaInicio),
          veterinarioId: availability.veterinarioId,
          veterinarioNombre: availability.veterinarioNombre,
        }));
    }))
      .then((results) => {
        if (!isActive) return;
        const uniqueSlots = new Map<string, AvailableSlot>();
        results.flat().forEach((slot) => {
          uniqueSlots.set(`${slot.veterinarioId}-${slot.time}`, slot);
        });
        setSlots(Array.from(uniqueSlots.values()).sort(
          (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
        ));
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof DOMException && error.name === 'AbortError')) return;
        setSlots([]);
        setAvailabilityError(
          error instanceof TypeError
            ? 'No fue posible conectar con la agenda. Intenta nuevamente en unos segundos.'
            : error instanceof Error
              ? error.message
              : 'No fue posible consultar los horarios disponibles.',
        );
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (isActive && !controller.signal.aborted) setIsLoading(false);
      });

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    selectedDate,
    selectedServiceId,
    selectedService.name,
    selectedVeterinarianId,
    selectedVeterinarian,
    profesionalPrestaServicio,
    vetsQuePrestan,
    availabilityRetry,
  ]);

  const monthDays = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const numberOfDays = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const leadingDays = (firstDay.getDay() + 6) % 7;
    return [
      ...Array.from({ length: leadingDays }, () => null),
      ...Array.from({ length: numberOfDays }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1)),
    ];
  }, [visibleMonth]);

  const nearestAvailableDate = useMemo(() => {
    // Si seleccionó un profesional que no presta el servicio, no hay fechas disponibles con él
    if (selectedVeterinarianId !== 'all' && !profesionalPrestaServicio) {
      return null;
    }
    // Si no hay ningún profesional que preste el servicio
    if (vetsQuePrestan.length === 0) {
      return null;
    }

    for (let offset = 1; offset <= 30; offset += 1) {
      const dateKey = toDateKey(addDays(fromDateKey(selectedDate), offset));
      const testSlots = getAvailableSlots(dateKey, selectedServiceId, selectedVeterinarianId, catalogo, selectedService?.name);
      if (testSlots.length > 0) {
        return dateKey;
      }
    }
    return null;
  }, [selectedDate, selectedServiceId, selectedVeterinarianId, catalogo, selectedService?.name, profesionalPrestaServicio, vetsQuePrestan.length]);

  const maxDate = addDays(today, 60);
  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(visibleMonth);
  const canGoToNextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1) <= maxDate;

  function chooseDate(dateKey: string) {
    setSelectedDate(dateKey);
    setSelectedSlot(null);
  }

  function buildReservationPath() {
    if (!selectedSlot) return '/citas/reservar';

    const query = new URLSearchParams({
      servicio: selectedService.name,
      servicioId: String(selectedService.id),
      fecha: selectedDate,
      horario: selectedSlot.time,
      profesional: selectedSlot.veterinarioNombre,
      veterinarioId: String(selectedSlot.veterinarioId),
    });
    return `/citas/reservar?${query.toString()}`;
  }

  function continueToReservation() {
    const reservationPath = buildReservationPath();
    if (!hasAuthenticatedClientSession()) {
      navigate(`/login?returnTo=${encodeURIComponent(reservationPath)}`);
      return;
    }

    navigate(reservationPath);
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <BrandHeader subtitle="Consulta de disponibilidad" />
          <ClientSessionActions />
        </header>

        <section className="mb-6 flex gap-3 rounded-2xl border border-sky-200 bg-sky-100/60 p-4 text-sm text-sky-950" role="note">
          <span aria-hidden="true" className="text-lg">ℹ️</span>
          <p>
            <strong>Consulta de disponibilidad por servicio:</strong> los horarios mostrados corresponden únicamente
            a los profesionales habilitados para realizar el servicio seleccionado.
          </p>
        </section>

        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Agenda tu visita</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Encuentra un horario para tu mascota
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Elige el servicio, el profesional y la fecha que mejor se acomoden a tu tiempo.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Servicio clínico</span>
                <select
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-slate-500">
                  {selectedService.duration} min · {selectedService.price}
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Profesional</span>
                <select
                  value={selectedVeterinarianId}
                  onChange={(event) => setSelectedVeterinarianId(event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
                    selectedVeterinarianId !== 'all' && !profesionalPrestaServicio
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {veterinarianOptions.map((vet) => (
                    <option key={vet.id} value={vet.id}>{vet.name}</option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-slate-500">
                  {selectedVeterinarianId === 'all'
                    ? `Mostrando ${vetsQuePrestan.length} profesional(es) que prestan ${selectedService.name}`
                    : profesionalPrestaServicio
                      ? 'Habilitado para este servicio'
                      : '⚠️ No presta este servicio'}
                </span>
              </label>
            </div>

            {/* Alerta y sugerencia cuando el profesional seleccionado NO presta el servicio */}
            {selectedVeterinarianId !== 'all' && !profesionalPrestaServicio && (
              <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 shadow-sm animate-fadeIn" role="alert">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">
                      {selectedVeterinarian?.nombre} no presta el servicio de {selectedService.name}.
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      Te sugerimos elegir a continuación a uno de los profesionales que sí lo ofrecen:
                    </p>

                    {vetsQuePrestan.length > 0 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {vetsQuePrestan.map((vet) => (
                          <button
                            key={vet.id}
                            type="button"
                            onClick={() => setSelectedVeterinarianId(String(vet.id))}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-800 active:scale-95"
                          >
                            <span>👨‍⚕️</span> {vet.nombre}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedVeterinarianId('all')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                        >
                          Ver todos los que lo prestan
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs font-semibold text-amber-900">
                        Ningún profesional registrado tiene asignado este servicio en el catálogo.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Nota de filtrado automático cuando está en "Cualquier profesional" */}
            {selectedVeterinarianId === 'all' && (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
                <span>
                  <strong>Filtro activo:</strong> solo se muestran horarios de profesionales que ofrecen{' '}
                  <span className="font-semibold text-sky-800">{selectedService.name}</span>.
                </span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 font-bold text-sky-800">
                  {vetsQuePrestan.length} prestador(es)
                </span>
              </div>
            )}

            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Selecciona una fecha</h2>
                  <p className="mt-1 text-sm text-slate-500">Consulta disponibilidad para los próximos 60 días.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Mes anterior"
                    disabled={visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth()}
                    onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Mes siguiente"
                    disabled={!canGoToNextMonth}
                    onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 sm:p-4">
                <p className="mb-4 text-center font-bold capitalize text-slate-800">{monthLabel}</p>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weekdays.map((weekday) => (
                    <span key={weekday} className="pb-2 text-xs font-semibold text-slate-400">{weekday}</span>
                  ))}
                  {monthDays.map((date, index) => {
                    if (!date) return <span key={`empty-${index}`} />;
                    const dateKey = toDateKey(date);
                    const isPast = date < today;
                    const isBeyondRange = date > maxDate;
                    const isSelected = dateKey === selectedDate;
                    const hasAvailability = !isPast && !isBeyondRange && dateKey === selectedDate && slots.length > 0;

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        disabled={isPast || isBeyondRange}
                        aria-label={`${date.getDate()} de ${new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(date)}${hasAvailability ? ', con horarios disponibles' : ', sin horarios disponibles'}`}
                        aria-pressed={isSelected}
                        onClick={() => chooseDate(dateKey)}
                        className={`relative flex min-h-11 flex-col items-center justify-center rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:text-slate-300 ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-sm'
                            : hasAvailability
                              ? 'text-slate-800 hover:bg-sky-50'
                              : 'text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {date.getDate()}
                        {hasAvailability && (
                          <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Con horarios</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-300" />Sin horarios</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7" aria-live="polite">
            <div className="border-b border-slate-100 pb-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Horarios disponibles</p>
              <h2 className="mt-2 text-xl font-black capitalize text-slate-900">{formatLongDate(selectedDate)}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedVeterinarianId === 'all'
                  ? `Profesionales que prestan ${selectedService.name}`
                  : selectedVeterinarian?.nombre}
              </p>
            </div>

            <div className="pt-5">
              {isLoading ? (
                <AvailabilitySkeleton />
              ) : availabilityError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
                  <h3 className="font-bold text-red-900">No pudimos consultar la agenda</h3>
                  <p className="mt-2 text-sm leading-6 text-red-800">{availabilityError}</p>
                  <button
                    type="button"
                    onClick={() => setAvailabilityRetry((current) => current + 1)}
                    className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : selectedVeterinarianId !== 'all' && !profesionalPrestaServicio ? (
                /* Estado cuando el profesional NO presta el servicio */
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center" role="status">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm" aria-hidden="true">
                    🚫
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">Servicio no disponible con este profesional</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    <strong className="text-slate-800">{selectedVeterinarian?.nombre}</strong> no presta el servicio de{' '}
                    <strong className="text-slate-800">{selectedService.name}</strong>.
                  </p>

                  {vetsQuePrestan.length > 0 ? (
                    <div className="mt-6 border-t border-amber-200/80 pt-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        Profesionales que sí prestan este servicio:
                      </p>
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {vetsQuePrestan.map((vet) => (
                          <button
                            key={vet.id}
                            type="button"
                            onClick={() => setSelectedVeterinarianId(String(vet.id))}
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-95"
                          >
                            <span>📅</span> Horarios con {vet.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs font-semibold text-amber-800">
                      Actualmente ningún profesional registrado presta este servicio.
                    </p>
                  )}
                </div>
              ) : slots.length > 0 ? (
                <>
                  <p className="mb-4 text-sm text-slate-600">
                    {selectedVeterinarianId === 'all'
                      ? 'Selecciona una franja horaria. Cada turno indica el profesional que te atenderá:'
                      : 'Selecciona una franja para iniciar tu reserva:'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.veterinarioId === slot.veterinarioId && selectedSlot?.time === slot.time;
                      return (
                        <button
                          key={`${slot.veterinarioId}-${slot.time}`}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                            isSelected
                              ? 'border-sky-600 bg-sky-600 text-white shadow-md'
                              : 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-400 hover:bg-sky-100'
                          }`}
                        >
                          <span className="text-sm font-black">{slot.time}</span>
                          {selectedVeterinarianId === 'all' && (
                            <span
                              className={`mt-1 text-[11px] font-medium leading-tight ${
                                isSelected ? 'text-sky-100' : 'text-slate-600'
                              }`}
                            >
                              {slot.veterinarioNombre}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSlot && (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" role="status">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-emerald-900">Horario seleccionado</p>
                          <p className="mt-1 text-sm text-emerald-800">
                            {selectedService.name} · {formatLongDate(selectedDate)} · {selectedSlot.time}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-emerald-700">
                            Atiende: {selectedSlot.veterinarioNombre}
                          </p>
                        </div>
                        <button
                          type="button"
                          id="btn-agendar-cita"
                          onClick={continueToReservation}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <Icon name={hasAuthenticatedClientSession() ? 'calendar' : 'user'} className="h-5 w-5" />
                          {hasAuthenticatedClientSession()
                            ? 'Agendar cita con este horario'
                            : 'Inicia sesión para agendar'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-emerald-700">
                        {hasAuthenticatedClientSession()
                          ? 'Tu selección está lista para continuar con la reserva.'
                          : 'Guardaremos esta selección mientras inicias sesión.'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5" role="status">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm" aria-hidden="true">🗓️</div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">No hay horarios disponibles</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedVeterinarianId === 'all'
                      ? `No hay turnos libres para ${selectedService.name} en esta fecha con los profesionales que lo prestan (${vetsQuePrestan.map((v) => v.nombre).join(', ') || 'ninguno'}).`
                      : `${selectedVeterinarian?.nombre} no tiene turnos libres configurados para esta fecha.`}
                    {' '}Prueba con otra fecha o consulta otro profesional.
                  </p>
                  {nearestAvailableDate && (
                    <button
                      type="button"
                      onClick={() => {
                        chooseDate(nearestAvailableDate);
                        setVisibleMonth(new Date(fromDateKey(nearestAvailableDate).getFullYear(), fromDateKey(nearestAvailableDate).getMonth(), 1));
                      }}
                      className="mt-4 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      Ver próxima fecha disponible: {new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long' }).format(fromDateKey(nearestAvailableDate))}
                    </button>
                  )}
                  {!nearestAvailableDate && (
                    <p className="mt-4 text-sm font-semibold text-amber-800">No encontramos fechas cercanas disponibles para este servicio.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-center gap-4 text-center text-sm text-slate-500">
          <span>
            ¿Prefieres agendar directamente?{' '}
            <Link to="/citas/reservar" className="font-semibold text-sky-700 hover:text-sky-900">
              Ir al formulario de reserva
            </Link>
          </span>
          <span>·</span>
          <span>
            ¿Quieres explorar primero?{' '}
            <Link to="/catalogo" className="font-semibold text-sky-700 hover:text-sky-900">
              Ver catálogo de servicios
            </Link>
          </span>
        </footer>
      </div>
    </main>
  );
}
