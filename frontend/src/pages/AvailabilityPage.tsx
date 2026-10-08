import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BackToHomeButton } from '../components/BackToHomeButton';
import { BrandHeader } from '../components/BrandHeader';

const services = [
  { id: 'consulta', name: 'Consulta general', duration: 30, price: '$65.000' },
  { id: 'vacunacion', name: 'Vacunación', duration: 30, price: '$90.000' },
  { id: 'desparasitacion', name: 'Desparasitación', duration: 45, price: '$50.000' },
];

const veterinarians = [
  { id: 'all', name: 'Cualquier profesional' },
  { id: 'camila', name: 'Dra. Camila Torres' },
  { id: 'andres', name: 'Dr. Andrés Rojas' },
  { id: 'laura', name: 'Dra. Laura Méndez' },
];

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const timeSlots = ['8:00 a. m.', '9:30 a. m.', '11:00 a. m.', '1:00 p. m.', '2:30 p. m.', '4:00 p. m.'];
const today = new Date();
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

function getOpenSlots(dateKey: string, serviceId: string, veterinarianId: string) {
  const date = fromDateKey(dateKey);
  const seed = [...`${dateKey}-${serviceId}-${veterinarianId}`].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  if (date.getDay() === 0 || seed % 7 === 0) {
    return [];
  }

  return timeSlots.filter((_, index) => (seed + index * 3) % 5 !== 0);
}

function formatLongDate(dateKey: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fromDateKey(dateKey));
}

function AvailabilitySkeleton() {
  return (
    <div aria-label="Cargando horarios disponibles" aria-live="polite" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}

export function AvailabilityPage() {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);
  const [selectedVeterinarianId, setSelectedVeterinarianId] = useState(veterinarians[0].id);
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [isLoading, setIsLoading] = useState(true);

  const slots = useMemo(
    () => getOpenSlots(selectedDate, selectedServiceId, selectedVeterinarianId),
    [selectedDate, selectedServiceId, selectedVeterinarianId],
  );

  useEffect(() => {
    setIsLoading(true);
    setSelectedTime(null);
    const timeoutId = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timeoutId);
  }, [selectedDate, selectedServiceId, selectedVeterinarianId]);

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
    for (let offset = 1; offset <= 30; offset += 1) {
      const dateKey = toDateKey(addDays(fromDateKey(selectedDate), offset));
      if (getOpenSlots(dateKey, selectedServiceId, selectedVeterinarianId).length > 0) {
        return dateKey;
      }
    }
    return null;
  }, [selectedDate, selectedServiceId, selectedVeterinarianId]);

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];
  const selectedVeterinarian = veterinarians.find((vet) => vet.id === selectedVeterinarianId);
  const maxDate = addDays(today, 60);
  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(visibleMonth);
  const canGoToNextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1) <= maxDate;

  function chooseDate(dateKey: string) {
    setSelectedDate(dateKey);
    setSelectedTime(null);
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <BrandHeader subtitle="Consulta de disponibilidad" />
          <BackToHomeButton />
        </header>

        <section className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
          <span aria-hidden="true" className="text-lg">ℹ️</span>
          <p>
            <strong>Vista de demostración:</strong> horarios y profesionales de ejemplo. La conexión a la agenda real
            estará disponible cuando se integre el servicio de reservas.
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  {veterinarians.map((veterinarian) => (
                    <option key={veterinarian.id} value={veterinarian.id}>{veterinarian.name}</option>
                  ))}
                </select>
              </label>
            </div>

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
                    const hasAvailability = !isPast && !isBeyondRange &&
                      getOpenSlots(dateKey, selectedServiceId, selectedVeterinarianId).length > 0;

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
                          <span className={`mt-0.5 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
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
                {selectedVeterinarianId === 'all' ? 'Todos los profesionales' : selectedVeterinarian?.name}
              </p>
            </div>

            <div className="pt-5">
              {isLoading ? (
                <AvailabilitySkeleton />
              ) : slots.length > 0 ? (
                <>
                  <p className="mb-4 text-sm text-slate-600">Selecciona una franja para iniciar tu reserva:</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={selectedTime === slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                          selectedTime === slot
                            ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                            : 'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400 hover:bg-sky-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {selectedTime && (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" role="status">
                      <p className="font-bold text-emerald-900">Horario seleccionado</p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {selectedService.name} · {formatLongDate(selectedDate)} · {selectedTime}
                      </p>
                      <p className="mt-2 text-xs text-emerald-700">
                        Tu selección está lista para continuar con la reserva.
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
                      ? 'Todos los turnos están ocupados o no hay atención para esta fecha.'
                      : `${selectedVeterinarian?.name} no tiene turnos libres para esta fecha.`}
                    {' '}Prueba con otra fecha o profesional.
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
                    <p className="mt-4 text-sm font-semibold text-amber-800">No encontramos fechas cercanas disponibles.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-6 text-center text-sm text-slate-500">
          ¿Quieres explorar primero?{' '}
          <Link to="/catalogo" className="font-semibold text-sky-700 hover:text-sky-900">Ver catálogo de servicios</Link>
        </footer>
      </div>
    </main>
  );
}
