import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';

type DemoRole = 'CLIENTE' | 'VETERINARIO';

type PortalsGridProps = {
  onOpenDemo: (role: DemoRole) => void;
};

const portals: {
  id: DemoRole;
  title: string;
  description: string;
  icon: IconName;
  style: string;
  sectionId: string;
  bullets: string[];
  forms: { title: string; description: string; to: string; icon: IconName }[];
  action: string;
}[] = [
  {
    id: 'CLIENTE',
    title: 'Portal Clientes',
    description: 'Todo el cuidado de tu compañero, organizado contigo.',
    icon: 'paw',
    style: 'bg-[#E8F4F1] border-[#d6ebe5]',
    sectionId: 'portal-clientes',
    bullets: [
      'Agenda y reprograma citas',
      'Registra tus mascotas',
      'Consulta el detalle de tu cita',
    ],
    forms: [
      { title: 'Registrar cliente', description: 'Crear perfil de cliente', to: '/registro', icon: 'user' },
      { title: 'Registrar mascota', description: 'Añadir un paciente', to: '/mascotas/registro', icon: 'paw' },
    ],
    action: 'Ingresar como Cliente Demo',
  },
  {
    id: 'VETERINARIO',
    title: 'Portal Veterinarios',
    description: 'Una agenda clara para dedicar más tiempo a cada paciente.',
    icon: 'stethoscope',
    style: 'bg-[#E6F2F5] border-[#d4e7ed]',
    sectionId: 'portal-veterinarios',
    bullets: [
      'Configura horarios y turnos',
      'Consulta tu agenda diaria',
      'Gestiona cancelaciones por imprevistos',
    ],
    forms: [
      { title: 'Gestionar disponibilidad', description: 'Configurar horarios y turnos', to: '/veterinario/disponibilidad', icon: 'clock' },
      { title: 'Registrar veterinario', description: 'Crear perfil profesional', to: '/veterinarios/registro', icon: 'stethoscope' },
      { title: 'Registrar servicio', description: 'Añadir servicio clínico', to: '/servicios/registro', icon: 'plus' },
    ],
    action: 'Acceso Veterinarios Demo',
  },
];

export function PortalsGrid({ onOpenDemo }: PortalsGridProps) {
  const navigate = useNavigate();
  const [citaId, setCitaId] = useState('');

  return (
    <section id="portales" className="scroll-mt-28 bg-white px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0D5C75]">Nuestros portales</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Una experiencia para cada integrante de la clínica.
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Herramientas pensadas para las familias y los profesionales veterinarios.
          </p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          {portals.map((portal, index) => (
            <Reveal key={portal.id} delay={index * 120}>
            <article
              id={portal.sectionId}
              className={`flex h-full flex-col rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${portal.style}`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0D5C75] shadow-sm" aria-hidden="true"><Icon name={portal.icon} className="h-7 w-7" /></span>
              <h3 className="mt-5 text-xl font-extrabold text-slate-900">{portal.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{portal.description}</p>
              <ul className="mb-6 mt-4 space-y-3">
                {portal.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-slate-700">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[#0D9488]" />
                    {bullet}
                  </li>
                ))}
              </ul>
              {portal.id === 'CLIENTE' && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const id = citaId.trim();
                    if (id) navigate(`/cliente/citas/${encodeURIComponent(id)}`);
                  }}
                  className="mb-5 rounded-2xl border border-white/80 bg-white/70 p-4"
                >
                  <label htmlFor="cita-id" className="text-sm font-bold text-slate-900">
                    Consultar detalle de cita
                  </label>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Ingresa el identificador de tu cita para revisar sus datos.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="cita-id"
                      type="text"
                      value={citaId}
                      onChange={(event) => setCitaId(event.target.value)}
                      placeholder="ID de la cita"
                      required
                      autoComplete="off"
                      className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0D5C75] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                    />
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0D5C75] px-4 text-sm font-bold text-white transition hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                    >
                      Consultar
                      <Icon name="arrow" className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
              <div className="mt-auto rounded-2xl border border-white/80 bg-white/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-700">Formularios de registro</h4>
                  <span className="rounded-full bg-[#E8F4F1] px-2.5 py-1 text-[10px] font-bold text-[#0D5C75]">2 disponibles</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {portal.forms.map((form) => (
                    <Link
                      key={form.to}
                      to={form.to}
                      className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition-all duration-300 hover:border-[#0D9488] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F4F1] text-[#0D5C75]" aria-hidden="true">
                        <Icon name={form.icon} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-900">{form.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-600">{form.description}</span>
                      </span>
                      <Icon name="arrow" className="h-4 w-4 text-[#0D5C75] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenDemo(portal.id)}
                className="mt-4 min-h-12 rounded-full bg-[#0D5C75] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
              >
                {portal.action}
              </button>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
