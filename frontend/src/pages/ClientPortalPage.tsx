import {
  AlertCircle,
  ArrowRight,
  Brain,
  CalendarDays,
  ChevronRight,
  Clock3,
  History,
  PawPrint,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClientPortalHeader } from '../components/ClientPortalHeader';
import { ClientPetsModal } from '../components/ClientPetsModal';
import { SmartOrientationModal } from '../components/SmartOrientationModal';
import {
  getCitas,
  getClientSession,
  listClientPets,
  type Cita,
  type PetProfile,
} from '../services/api';

const quickActions = [
  { to: '/catalogo', title: 'Servicios y precios', description: 'Procedimientos, duración y valores', icon: Stethoscope, tone: 'bg-sky-50 text-sky-700' },
  { to: '/disponibilidad', title: 'Buscar un horario', description: 'Por servicio, profesional y fecha', icon: Search, tone: 'bg-violet-50 text-violet-700' },
  { to: '/cliente/citas', title: 'Gestionar mis citas', description: 'Consulta, reprograma o cancela', icon: CalendarDays, tone: 'bg-emerald-50 text-emerald-700' },
];

function appointmentTimestamp(appointment: Cita): number {
  if (!appointment.fechaHoraInicio) return appointment.estado === 'PROGRAMADA' ? Number.MAX_SAFE_INTEGER : 0;
  const timestamp = new Date(appointment.fechaHoraInicio).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function statusLabel(status: Cita['estado']) {
  if (status === 'COMPLETADA') return 'Completada';
  if (status === 'NO_ASISTIO') return 'No asistió';
  if (status === 'CANCELADA') return 'Cancelada';
  return 'Confirmada';
}

function statusClass(status: Cita['estado']) {
  if (status === 'COMPLETADA') return 'bg-emerald-100 text-emerald-800';
  if (status === 'NO_ASISTIO') return 'bg-amber-100 text-amber-800';
  if (status === 'CANCELADA') return 'bg-rose-100 text-rose-800';
  return 'bg-sky-100 text-sky-800';
}

function AppointmentCard({ appointment }: { appointment: Cita }) {
  const parsedStart = appointment.fechaHoraInicio ? new Date(appointment.fechaHoraInicio) : null;
  const startsAt = parsedStart && Number.isFinite(parsedStart.getTime()) ? parsedStart : null;
  const day = startsAt ? new Intl.DateTimeFormat('es-CO', { day: '2-digit' }).format(startsAt) : appointment.fecha.split(' ')[0];
  const month = startsAt ? new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(startsAt).replace('.', '').toUpperCase() : '';
  const weekday = startsAt ? new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(startsAt).replace('.', '').toUpperCase() : 'CITA';

  return (
    <article className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[96px_minmax(0,1fr)_160px] sm:items-center">
      <div className="flex min-h-24 items-center justify-center gap-2 rounded-xl bg-[#0D5C75] px-4 py-3 text-center text-white sm:flex-col sm:gap-0">
        <span className="text-xs font-bold uppercase tracking-[0.14em]">{weekday}</span>
        <strong className="text-3xl font-black leading-none sm:my-1">{day}</strong>
        <span className="text-xs font-bold uppercase tracking-[0.12em]">{month}</span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-black text-slate-950">{appointment.servicioNombre}</h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(appointment.estado)}`}>{statusLabel(appointment.estado)}</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-700">Para {appointment.mascotaNombre}{appointment.mascotaRaza ? ` · ${appointment.mascotaRaza}` : ''}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
          <span>{appointment.hora}</span>
          {appointment.duracionMinutos ? <span>· {appointment.duracionMinutos} min</span> : null}
          <span>· {appointment.veterinarioNombre}</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">{appointment.consultorio}</p>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Llega 10 minutos antes para realizar el ingreso con calma.</span>
        </div>
      </div>
      <div className="grid gap-2 sm:self-stretch sm:content-center">
        <Link to={`/reprogramar-cita/${appointment.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0D5C75] px-4 text-sm font-bold text-[#0D5C75] transition hover:bg-[#F0F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]">Reprogramar</Link>
        <Link to="/cliente/citas" className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">Cancelar cita</Link>
      </div>
    </article>
  );
}

export function ClientPortalPage() {
  const [isPetsModalOpen, setIsPetsModalOpen] = useState(false);
  const [isOrientationModalOpen, setIsOrientationModalOpen] = useState(false);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const session = getClientSession();
  const firstName = session?.nombre.trim().split(/\s+/)[0] || 'Cliente';

  const loadDashboard = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    setLoadError('');
    const [petsResult, appointmentsResult] = await Promise.allSettled([
      listClientPets(session.documentoIdentidad, session.token),
      getCitas(session.documentoIdentidad),
    ]);
    if (petsResult.status === 'fulfilled') setPets(petsResult.value);
    if (appointmentsResult.status === 'fulfilled') setAppointments(appointmentsResult.value);
    if (petsResult.status === 'rejected' || appointmentsResult.status === 'rejected') setLoadError('Parte de la información no pudo cargarse. Puedes intentar actualizarla.');
    setIsLoading(false);
  }, [session?.documentoIdentidad, session?.token]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const nextAppointment = useMemo(() => appointments
    .filter((appointment) => appointment.estado === 'PROGRAMADA'
      && (!appointment.fechaHoraInicio || appointmentTimestamp(appointment) >= Date.now()))
    .sort((first, second) => appointmentTimestamp(first) - appointmentTimestamp(second))[0], [appointments]);

  const recentAppointments = useMemo(() => appointments
    .filter((appointment) => appointment.estado !== 'PROGRAMADA')
    .sort((first, second) => appointmentTimestamp(second) - appointmentTimestamp(first))
    .slice(0, 3), [appointments]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ClientPortalHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#0D9488]">Portal de clientes</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Hola, {firstName}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Aquí tienes lo más importante para cuidar y organizar la atención de tus mascotas.</p>
          </div>
          <Link to="/disponibilidad" className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#0D5C75] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 sm:self-auto">
            <CalendarDays className="h-5 w-5" /> Agendar una cita
          </Link>
        </div>

        {loadError && (
          <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <span className="flex items-center gap-2"><AlertCircle className="h-5 w-5" />{loadError}</span>
            <button type="button" onClick={() => void loadDashboard()} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-bold hover:bg-amber-100"><RefreshCw className="h-4 w-4" /> Actualizar</button>
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-8">
            <section aria-labelledby="next-appointment-title">
              <h2 id="next-appointment-title" className="text-xl font-black text-slate-950">Tu próxima cita</h2>
              <div className="mt-4">
                {isLoading ? (
                  <div className="min-h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" role="status"><span className="sr-only">Cargando próxima cita</span></div>
                ) : nextAppointment ? <AppointmentCard appointment={nextAppointment} /> : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center">
                    <CalendarDays className="mx-auto h-9 w-9 text-slate-400" />
                    <h3 className="mt-3 font-black text-slate-900">No tienes citas próximas</h3>
                    <p className="mt-1 text-sm text-slate-600">Busca un servicio y elige el horario que mejor te funcione.</p>
                    <Link to="/disponibilidad" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0D5C75] px-5 text-sm font-bold text-white">Buscar horario</Link>
                  </div>
                )}
              </div>
            </section>

            <section id="mascotas" className="scroll-mt-32" aria-labelledby="pets-title">
              <div className="flex items-center justify-between gap-4">
                <h2 id="pets-title" className="text-xl font-black text-slate-950">Mis mascotas</h2>
                {pets.length > 0 && <button type="button" onClick={() => setIsPetsModalOpen(true)} className="min-h-10 text-sm font-bold text-[#0D5C75] hover:underline">Ver todas</button>}
              </div>
              {isLoading ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="h-44 animate-pulse rounded-2xl bg-white" /><div className="h-44 animate-pulse rounded-2xl bg-white" /></div>
              ) : pets.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {pets.slice(0, 2).map((pet) => (
                    <article key={pet.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F4F1] text-[#0D9488]"><PawPrint className="h-5 w-5" /></span>
                        <div className="min-w-0"><h3 className="truncate font-black text-slate-950">{pet.nombre}</h3><p className="mt-1 text-sm text-slate-600">{pet.especie} · {pet.raza} · {pet.edad} {pet.edad === 1 ? 'año' : 'años'}</p></div>
                      </div>
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <Link to={`/mascotas/${pet.id}/historial`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Ver historial</Link>
                        <Link to={`/disponibilidad?mascotaId=${pet.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0D5C75] px-3 text-sm font-bold text-[#0D5C75] hover:bg-[#F0F7F7]">Agendar cita</Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center"><PawPrint className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm font-semibold text-slate-700">Registra tu primera mascota para comenzar.</p></div>
              )}
              <Link to="/mascotas/registro" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#0D5C75]/50 text-sm font-bold text-[#0D5C75] transition hover:bg-white"><Plus className="h-4 w-4" /> Registrar otra mascota</Link>
            </section>

            <section aria-labelledby="recent-title">
              <div className="flex items-center justify-between gap-4"><h2 id="recent-title" className="text-xl font-black text-slate-950">Citas recientes</h2><Link to="/cliente/citas" className="min-h-10 text-sm font-bold text-[#0D5C75] hover:underline">Ver historial</Link></div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {recentAppointments.length > 0 ? recentAppointments.map((appointment) => (
                  <Link key={appointment.id} to={`/cliente/citas/${appointment.id}`} className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-100 px-5 py-3 last:border-b-0 hover:bg-slate-50">
                    <div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{appointment.servicioNombre} · {appointment.mascotaNombre}</p><p className="mt-1 text-xs text-slate-500">{appointment.fecha} · {appointment.veterinarioNombre}</p></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(appointment.estado)}`}>{statusLabel(appointment.estado)}</span>
                  </Link>
                )) : <div className="p-6 text-center text-sm text-slate-500">Todavía no hay citas finalizadas para mostrar.</div>}
              </div>
            </section>
          </div>

          <aside className="space-y-7 xl:sticky xl:top-28 xl:self-start">
            <section className="rounded-2xl border border-teal-200 bg-[#E8F4F1] p-5" aria-labelledby="orientation-title">
              <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D9488]"><Brain className="h-5 w-5" /></span><div><h2 id="orientation-title" className="text-lg font-black leading-6 text-slate-950">¿Le pasa algo a tu mascota?</h2><p className="mt-2 text-sm leading-6 text-slate-700">Cuéntanos qué has notado y te orientamos sobre qué tipo de atención podría necesitar.</p></div></div>
              <button type="button" onClick={() => setIsOrientationModalOpen(true)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0D5C75] px-4 text-sm font-bold text-white hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]">Recibir orientación <ArrowRight className="h-4 w-4" /></button>
            </section>

            <section aria-labelledby="quick-actions-title">
              <h2 id="quick-actions-title" className="text-xl font-black text-slate-950">Accesos rápidos</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {quickActions.map(({ to, title, description, icon: Icon, tone }) => (
                  <Link key={to} to={to} className="group flex min-h-20 items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{title}</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span></span><ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" /></Link>
                ))}
              </div>
            </section>
            <Link to="/cliente/citas" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><History className="h-4 w-4" /> Ver todas mis citas</Link>
          </aside>
        </div>
      </main>

      <ClientPetsModal isOpen={isPetsModalOpen} onClose={() => setIsPetsModalOpen(false)} />
      <SmartOrientationModal isOpen={isOrientationModalOpen} onClose={() => setIsOrientationModalOpen(false)} />
    </div>
  );
}
