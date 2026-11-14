import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Stethoscope,
} from 'lucide-react';
import { BrandHeader } from '../components/BrandHeader';
import { ClientSessionActions } from '../components/ClientSessionActions';
import {
  getClientSession,
  isFutureReservationSlot,
  listClientPets,
  listServices,
  ReservationConflictError,
  reservarCita,
  type CatalogService,
  type PetProfile,
} from '../services/api';

const STEPS = [
  { number: 1, label: 'Paciente y servicio' },
  { number: 2, label: 'Horario' },
  { number: 3, label: 'Confirmación' },
];

function formatDate(value: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' })
    .format(new Date(year, month - 1, day));
}

export function ReservarCitaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateData = (location.state || {}) as {
    servicio?: string;
    servicioId?: number | string;
    fecha?: string;
    horario?: string;
    profesional?: string;
    veterinarioId?: number | string;
    mascota?: string;
    mascotaId?: number | string;
  };

  const paramServicio = stateData.servicio || searchParams.get('servicio') || '';
  const paramFecha = stateData.fecha || searchParams.get('fecha') || '';
  const paramHorario = stateData.horario || searchParams.get('horario') || '';
  const paramProfesional = stateData.profesional || searchParams.get('profesional') || '';
  const paramMascota = stateData.mascota || searchParams.get('mascota') || '';
  const paramServicioId = String(stateData.servicioId || searchParams.get('servicioId') || '');
  const paramVeterinarioId = String(stateData.veterinarioId || searchParams.get('veterinarioId') || '');
  const paramMascotaId = String(stateData.mascotaId || searchParams.get('mascotaId') || '');

  const session = useMemo(() => getClientSession(), []);
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');
  const [petId, setPetId] = useState(paramMascotaId);
  const [serviceId, setServiceId] = useState(paramServicioId);
  const [date, setDate] = useState(paramFecha);
  const [time, setTime] = useState(paramHorario);
  const [professional, setProfessional] = useState(paramProfesional);
  const [veterinarianId, setVeterinarianId] = useState(paramVeterinarioId);
  const [saving, setSaving] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [scheduleConflict, setScheduleConflict] = useState(false);
  const [reservationId, setReservationId] = useState<number | string>('');
  const [reservationCode, setReservationCode] = useState('');

  useEffect(() => {
    let active = true;

    async function loadFormData() {
      if (!session) return;
      setLoadingData(true);
      setDataError('');
      try {
        const [clientPets, catalogServices] = await Promise.all([
          listClientPets(session.documentoIdentidad, session.token),
          listServices(),
        ]);
        if (!active) return;
        setPets(clientPets);
        setServices(catalogServices);

        if (!petId) {
          const petFromName = clientPets.find((pet) => pet.nombre === paramMascota);
          if (petFromName) setPetId(String(petFromName.id));
          else if (clientPets.length === 1) setPetId(String(clientPets[0].id));
        }
        if (!serviceId && paramServicio) {
          const serviceFromName = catalogServices.find(
            (service) => service.nombre.toLowerCase() === paramServicio.toLowerCase(),
          );
          if (serviceFromName) setServiceId(String(serviceFromName.id));
        }
      } catch (error: unknown) {
        if (active) {
          setDataError(error instanceof Error ? error.message : 'No fue posible cargar los datos para reservar.');
        }
      } finally {
        if (active) setLoadingData(false);
      }
    }

    void loadFormData();
    return () => {
      active = false;
    };
  }, [session, paramMascota, paramServicio]);

  const selectedPet = pets.find((pet) => String(pet.id) === petId);
  const selectedService = services.find((service) => String(service.id) === serviceId);
  const hasScheduleSelection = Boolean(date && time && professional && veterinarianId);
  const hasRealSchedule = hasScheduleSelection && isFutureReservationSlot(date, time);
  const reservationConfirmed = Boolean(reservationId && reservationCode);

  function goToStep(nextStep: number) {
    setReservationError('');
    setScheduleConflict(false);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function confirmReservation() {
    if (!session || !selectedPet || !selectedService || !hasRealSchedule) {
      setReservationError('Faltan datos para crear la cita. Regresa al paso anterior y revisa la selección.');
      return;
    }

    setSaving(true);
    setReservationError('');
    setScheduleConflict(false);
    try {
      const response = await reservarCita({
        mascotaId: selectedPet.id,
        mascotaNombre: selectedPet.nombre,
        servicioId: selectedService.id,
        servicioNombre: selectedService.nombre,
        fecha: date,
        hora: time,
        veterinarioId: Number(veterinarianId),
        veterinarioNombre: professional,
        clienteNombre: session.nombre,
        documentoIdentidad: session.documentoIdentidad,
      });
      setReservationId(response.id);
      setReservationCode(response.codigo);
    } catch (error: unknown) {
      if (error instanceof ReservationConflictError) {
        setScheduleConflict(true);
      }
      setReservationError(
        error instanceof Error ? error.message : 'No fue posible crear la cita. Inténtalo nuevamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  function returnToUpdatedAvailability() {
    const query = new URLSearchParams({
      servicio: serviceId,
      veterinario: veterinarianId,
      fecha: date,
    });
    navigate(`/disponibilidad?${query.toString()}`, { replace: true });
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-sky-50 px-4 py-6 text-slate-800 md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <BrandHeader subtitle="Reservar cita" homePath="/cliente" />
          <ClientSessionActions />
        </header>

        <section className="bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0D5C75]">Nueva cita</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">Agenda la atención de tu mascota</h1>
          <p className="mt-2 text-slate-600">Completa los pasos y revisa la información antes de confirmar.</p>

          {!reservationConfirmed && (
            <ol className="mt-7 grid gap-2 sm:grid-cols-3" aria-label="Progreso de la reserva">
              {STEPS.map((item) => {
                const current = item.number === step;
                const completed = item.number < step;
                return (
                  <li
                    key={item.number}
                    aria-current={current ? 'step' : undefined}
                    className={`flex min-h-14 items-center gap-3 border-b-2 px-2 py-3 ${
                      current
                        ? 'border-[#0D5C75] text-[#0D5C75]'
                        : completed
                          ? 'border-emerald-700 text-emerald-900'
                          : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                      current
                        ? 'bg-[#0D5C75] text-white'
                        : completed
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-700'
                    }`}>
                      {completed ? <Check className="h-4 w-4" aria-hidden="true" /> : item.number}
                    </span>
                    <span className="text-sm font-bold">{item.label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {dataError && (
            <div className="mt-6 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert" aria-live="assertive">
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{dataError}</p>
            </div>
          )}

          {!reservationConfirmed && step === 1 && (
            <section className="mt-8" aria-labelledby="step-one-title">
              <div className="flex items-center gap-3">
                <PawPrint className="h-6 w-6 text-[#0D5C75]" aria-hidden="true" />
                <h2 id="step-one-title" className="text-xl font-black text-slate-950">Selecciona paciente y servicio</h2>
              </div>

              {loadingData ? (
                <p role="status" aria-live="polite" aria-busy="true" className="mt-6 text-sm text-slate-600">
                  Cargando tus mascotas y servicios...
                </p>
              ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="reservar-pet-select" className="font-bold text-slate-900">
                      Mascota
                    </label>
                    <select
                      id="reservar-pet-select"
                      value={petId}
                      onChange={(event) => setPetId(event.target.value)}
                      className="min-h-[48px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#0D5C75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                    >
                      <option value="">Selecciona una mascota</option>
                      {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.nombre} · {pet.especie}</option>)}
                    </select>
                    {pets.length === 0 && !dataError && (
                      <span className="text-sm text-slate-600">Primero debes registrar una mascota desde tu portal.</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="reservar-service-select" className="font-bold text-slate-900">
                      Servicio
                    </label>
                    <select
                      id="reservar-service-select"
                      value={serviceId}
                      onChange={(event) => setServiceId(event.target.value)}
                      className="min-h-[48px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#0D5C75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75]"
                    >
                      <option value="">Selecciona un servicio</option>
                      {services.map((service) => <option key={service.id} value={service.id}>{service.nombre}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  disabled={!selectedPet || !selectedService || loadingData}
                  className="inline-flex min-h-[48px] min-w-[44px] items-center gap-2 rounded-lg bg-[#0D5C75] px-5 py-3 font-bold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
                >
                  Continuar <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {!reservationConfirmed && step === 2 && (
            <section className="mt-8" aria-labelledby="step-two-title">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-[#0D5C75]" aria-hidden="true" />
                <h2 id="step-two-title" className="text-xl font-black text-slate-950">Selecciona un horario disponible</h2>
              </div>

              {hasRealSchedule ? (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    ['Fecha', formatDate(date)],
                    ['Hora', time],
                    ['Profesional', professional],
                  ].map(([label, value]) => (
                    <div key={label} className="border-l-4 border-[#0D5C75] bg-sky-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{label}</p>
                      <p className="mt-1 font-bold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 border border-slate-200 bg-slate-50 p-5">
                  <p className="font-bold text-slate-950">
                    {hasScheduleSelection ? 'El horario seleccionado ya no está disponible.' : 'Consulta la agenda para elegir un turno real.'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {hasScheduleSelection
                      ? 'Vuelve a consultar la agenda para escoger una franja futura.'
                      : `Mostraremos únicamente profesionales que prestan ${selectedService?.nombre || 'el servicio seleccionado'}.`}
                  </p>
                  <Link
                    to={`/disponibilidad?servicio=${encodeURIComponent(serviceId)}`}
                    className="mt-4 inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg bg-[#0D5C75] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                  >
                    Ver horarios disponibles <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Atrás
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  disabled={!hasRealSchedule}
                  className="inline-flex min-h-[48px] min-w-[44px] items-center gap-2 rounded-lg bg-[#0D5C75] px-5 py-3 font-bold text-white hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
                >
                  Revisar reserva <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {!reservationConfirmed && step === 3 && (
            <section className="mt-8" aria-labelledby="step-three-title">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-6 w-6 text-[#0D5C75]" aria-hidden="true" />
                <h2 id="step-three-title" className="text-xl font-black text-slate-950">Revisa y confirma la cita</h2>
              </div>

              <dl className="mt-6 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2">
                {[
                  ['Cliente', session?.nombre || ''],
                  ['Mascota', selectedPet?.nombre || ''],
                  ['Servicio', selectedService?.nombre || ''],
                  ['Profesional', professional],
                  ['Fecha', formatDate(date)],
                  ['Hora', time],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white p-4">
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{label}</dt>
                    <dd className="mt-1 font-bold text-slate-950">{value}</dd>
                  </div>
                ))}
              </dl>

              {reservationError && (
                <div className="mt-5 flex gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-950" role="alert" aria-live="assertive">
                  <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-bold">No pudimos crear la cita</p>
                    <p className="mt-1">{reservationError}</p>
                    {scheduleConflict && (
                      <button
                        type="button"
                        onClick={returnToUpdatedAvailability}
                        className="mt-3 inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-rose-800 px-4 py-2 font-bold text-white hover:bg-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                      >
                        Ver horarios actualizados
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  disabled={saving}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Atrás
                </button>
                <button
                  type="button"
                  onClick={confirmReservation}
                  disabled={saving || scheduleConflict}
                  className="inline-flex min-h-[48px] min-w-[44px] items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? 'Confirmando cita...' : 'Confirmar cita'}
                  {!saving && <Check className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </section>
          )}

          {reservationConfirmed && (
            <section className="mt-8 border border-emerald-200 bg-emerald-50 p-6 md:p-8" aria-live="polite">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white" aria-hidden="true">
                <Check className="h-7 w-7" />
              </div>
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-emerald-900">Reserva confirmada</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Tu cita quedó registrada</h2>
              <p className="mt-2 text-slate-700">Código <strong>{reservationCode}</strong> · ID {reservationId}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/cliente/citas/${reservationId}`}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-[#0D5C75] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-2"
                >
                  Ver detalle de la cita
                </Link>
                <Link
                  to="/cliente/citas"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                >
                  Ver mis citas
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setReservationId('');
                    setReservationCode('');
                    setReservationError('');
                    setDate('');
                    setTime('');
                    setProfessional('');
                    setVeterinarianId('');
                    goToStep(1);
                  }}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-bold text-[#0D5C75] hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C75] focus-visible:ring-offset-1"
                >
                  Reservar otra cita
                </button>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
