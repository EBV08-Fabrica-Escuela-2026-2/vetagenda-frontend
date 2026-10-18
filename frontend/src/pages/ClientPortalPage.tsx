import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Clock3,
  PawPrint,
  Search,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClientPortalHeader } from '../components/ClientPortalHeader';
import { ClientPetsModal } from '../components/ClientPetsModal';
import { getClientSession } from '../services/api';

const actions = [
  {
    to: '/catalogo',
    title: 'Consultar servicios',
    description: 'Revisa procedimientos, profesionales, duración y valores disponibles.',
    icon: Stethoscope,
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    to: '/disponibilidad',
    title: 'Buscar un horario',
    description: 'Filtra por servicio, profesional y fecha antes de reservar.',
    icon: Search,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    to: '/cliente/citas',
    title: 'Gestionar mis citas',
    description: 'Consulta detalles, reprograma una visita o libera un cupo.',
    icon: CalendarCheck,
    tone: 'bg-amber-50 text-amber-700',
  },
];

export function ClientPortalPage() {
  const [isPetsModalOpen, setIsPetsModalOpen] = useState(false);
  const session = getClientSession();
  const firstName = session?.nombre.trim().split(/\s+/)[0] || 'Cliente';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ClientPortalHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0D9488]">Portal de clientes</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">Hola, {firstName}</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Administra el cuidado de tus mascotas, encuentra atención disponible y consulta el estado de tus citas.
            </p>
          </div>

          <Link
            to="/disponibilidad"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-lg bg-[#0D5C75] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 lg:self-auto"
          >
            <CalendarDays className="h-5 w-5" />
            Agendar una cita
          </Link>
        </div>

        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-labelledby="client-actions-title">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="client-actions-title" className="text-xl font-bold text-slate-950">¿Qué necesitas hacer?</h2>
                <p className="mt-1 text-sm text-slate-500">Accede a las funciones disponibles desde un solo lugar.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsPetsModalOpen(true)}
                className="group flex min-h-[148px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#0D9488]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              >
                <div className="flex w-full items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <PawPrint className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0D5C75]" />
                </div>
                <div className="mt-5">
                  <h3 className="font-bold text-slate-900">Mis mascotas</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Consulta los pacientes asociados a tu cuenta o registra uno nuevo.</p>
                </div>
              </button>

              {actions.map(({ to, title, description, icon: Icon, tone }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex min-h-[148px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0D9488]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0D5C75]" />
                  </div>
                  <div className="mt-5">
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <h2 className="text-sm font-bold uppercase text-slate-500">Tu cuenta</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]" />
                  <div>
                    <dt className="text-slate-500">Cliente</dt>
                    <dd className="font-semibold text-slate-900">{session?.nombre || 'Perfil de cliente'}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]" />
                  <div>
                    <dt className="text-slate-500">Estado de sesión</dt>
                    <dd className="font-semibold text-emerald-700">Activa</dd>
                  </div>
                </div>
              </dl>
            </section>

            <section className="border-t border-slate-200 pt-5 lg:border-l lg:pl-7">
              <h2 className="text-sm font-bold uppercase text-slate-500">Flujo recomendado</h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex gap-3"><strong className="text-[#0D5C75]">1.</strong><span>Registra tu mascota.</span></li>
                <li className="flex gap-3"><strong className="text-[#0D5C75]">2.</strong><span>Consulta servicios y horarios.</span></li>
                <li className="flex gap-3"><strong className="text-[#0D5C75]">3.</strong><span>Reserva y gestiona la cita.</span></li>
              </ol>
            </section>
          </aside>
        </div>
      </main>

      <ClientPetsModal isOpen={isPetsModalOpen} onClose={() => setIsPetsModalOpen(false)} />
    </div>
  );
}
