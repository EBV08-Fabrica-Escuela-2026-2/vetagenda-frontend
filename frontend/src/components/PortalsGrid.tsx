import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';

export type PortalRole = 'CLIENTE' | 'VETERINARIO' | 'ADMIN';

type PortalsGridProps = {
  onOpenPortal: (role: PortalRole) => void;
};

const portals: {
  id: PortalRole;
  title: string;
  description: string;
  icon: IconName;
  style: string;
  sectionId: string;
  bullets: string[];
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
    action: 'Ingresar como cliente',
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
      'Agrega servicios a tu catálogo',
      'Gestiona cancelaciones por imprevistos',
    ],
    action: 'Ingresar como veterinario',
  },
  {
    id: 'ADMIN',
    title: 'Portal Administrativo',
    description: 'Control operativo y métricas para tomar mejores decisiones.',
    icon: 'shield',
    style: 'bg-[#F1F5F9] border-[#dbe3ec]',
    sectionId: 'portal-administracion',
    bullets: [
      'Gestiona usuarios y estados de acceso',
      'Consulta ocupación de profesionales',
      'Analiza el uso de los servicios',
      'Accede a indicadores del producto',
    ],
    action: 'Ingresar como administrador',
  },
];

export function PortalsGrid({ onOpenPortal }: PortalsGridProps) {
  return (
    <section id="portales" className="scroll-mt-28 bg-white px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0D5C75]">Nuestros portales</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Una experiencia para cada integrante de la clínica.
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Una sola plataforma con espacios protegidos para clientes, profesionales veterinarios y administración.
          </p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
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
              <button
                type="button"
                onClick={() => onOpenPortal(portal.id)}
                className="mt-auto min-h-12 rounded-full bg-[#0D5C75] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
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
