import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroSearch } from './components/HeroSearch';
import { MockRoleSwitcher, type DemoProfile } from './components/MockRoleSwitcher';
import { Navbar } from './components/Navbar';
import { PortalsGrid } from './components/PortalsGrid';
import { Footer } from './components/Footer';
import { Icon, type IconName } from './components/Icon';
import { FaqSection, HowItWorks } from './components/LandingSections';
import { Reveal } from './components/Reveal';
import { listServices, type CatalogService } from './services/api';

const serviceVisuals = [
  'bg-[#E8F4F1] text-[#0D5C75]',
  'bg-[#F0F7F7] text-[#0D9488]',
  'bg-[#EEF2F7] text-[#475569]',
  'bg-[#F4F5F7] text-[#475569]',
];

const featuredServiceSpecs: { name: string; description: string; matches: string[]; icon: IconName }[] = [
  {
    name: 'Consulta general',
    description: 'Valoración clínica para acompañar el bienestar de tu mascota.',
    matches: ['consulta'],
    icon: 'stethoscope',
  },
  {
    name: 'Vacunación',
    description: 'Protección preventiva de acuerdo con su esquema de salud.',
    matches: ['vacun'],
    icon: 'syringe',
  },
  {
    name: 'Profilaxis',
    description: 'Atención preventiva para mantener la salud oral.',
    matches: ['profilaxis', 'dental', 'odont'],
    icon: 'tooth',
  },
  {
    name: 'Control',
    description: 'Seguimiento clínico para acompañar su recuperación y bienestar.',
    matches: ['control'],
    icon: 'heart',
  },
];

function normalizeServiceName(name: string) {
  return name.toLocaleLowerCase('es-CO').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getServiceIcon(name: string, index: number): IconName {
  const normalizedName = normalizeServiceName(name);
  if (normalizedName.includes('vacun')) return 'syringe';
  if (normalizedName.includes('dental') || normalizedName.includes('odont') || normalizedName.includes('profilaxis')) return 'tooth';
  if (normalizedName.includes('consulta')) return 'stethoscope';
  if (normalizedName.includes('control')) return 'heart';
  return (['stethoscope', 'syringe', 'tooth', 'heart'] as IconName[])[index % 4];
}

function formatServiceDuration(service: CatalogService) {
  return service.duracionMinutos ? `${service.duracionMinutos} min` : 'Duración por confirmar';
}

function LandingPage() {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [preferredRole, setPreferredRole] = useState<DemoProfile['rol'] | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [catalogServices, setCatalogServices] = useState<CatalogService[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  useEffect(() => {
    let isMounted = true;
    listServices().then((services) => {
      if (isMounted) {
        setCatalogServices(services);
        setIsCatalogLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function startDemo(profile: DemoProfile) {
    const session = {
      id: profile.id,
      nombre: profile.nombre,
      rol: profile.rol,
      email: profile.email,
      token: 'mock-jwt-token',
      ...(profile.rol === 'CLIENTE'
        ? {
            documento: '1012345678',
            documentoIdentidad: '1012345678',
            mascota: { nombre: 'Rocky', especie: 'Canino', raza: 'Golden Retriever' },
          }
        : {}),
    };

    localStorage.setItem('vetagenda_user', JSON.stringify(session));
    localStorage.setItem('vetagenda_session', 'true');
    localStorage.setItem('vetagenda_role', profile.rol === 'CLIENTE' ? 'Cliente' : 'Veterinario');
    localStorage.setItem('vetagenda_token', session.token);
    if (profile.rol === 'CLIENTE') {
      localStorage.setItem('vetagenda_documento', '1012345678');
    }
    closeLogin();
    setToastMessage(`Has iniciado sesión en modo demostración como ${profile.rol === 'CLIENTE' ? 'Cliente' : 'Veterinario'}.`);
    window.setTimeout(() => navigate(profile.destination), 1600);
    window.setTimeout(() => setToastMessage(''), 3500);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar onOpenRoleSwitcher={() => {
        setPreferredRole(null);
        setIsLoginOpen(true);
      }} />

      <HeroSearch services={catalogServices} isLoading={isCatalogLoading} />

      <HowItWorks />

      <section id="servicios" className="scroll-mt-28 bg-[#F0F7F7] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0D5C75]">Servicios clínicos</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Atención profesional para cada necesidad.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              Estos valores son referenciales. Consulta el catálogo para conocer las opciones de atención disponibles.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredServiceSpecs.map((spec, index) => {
              const service = catalogServices.find((item) => {
                const name = normalizeServiceName(item.nombre);
                return spec.matches.some((match) => name.includes(match));
              });

              return (
              <Reveal key={spec.name} delay={index * 100}>
              <article
                className="h-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className={`flex h-36 items-center justify-center rounded-2xl ${serviceVisuals[index % serviceVisuals.length]}`} aria-hidden="true">
                  <Icon name={service ? getServiceIcon(service.nombre, index) : spec.icon} className="h-16 w-16" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{service?.nombre ?? spec.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{service?.descripcion ?? spec.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <span className="text-slate-500">{service ? formatServiceDuration(service) : 'Por confirmar'}</span>
                  <span className="font-bold text-[#0D5C75]">{service?.precio ?? 'Consultar'}</span>
                </div>
                {!service && <p className="mt-3 text-xs font-medium text-slate-500">Consulta disponibilidad en la clínica.</p>}
              </article>
              </Reveal>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link to="/catalogo" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0D5C75] px-5 py-2.5 text-sm font-bold text-[#0D5C75] transition hover:bg-[#E8F4F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]">
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      <PortalsGrid onOpenDemo={(role) => {
        setPreferredRole(role);
        setIsLoginOpen(true);
      }} />

      <FaqSection />

      <Footer />

      <MockRoleSwitcher
        isOpen={isLoginOpen}
        onClose={closeLogin}
        onSwitchRole={startDemo}
        preferredRole={preferredRole}
      />
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white shadow-xl transition-all duration-300 ${
          toastMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        {toastMessage}
      </div>
    </main>
  );
}

export default LandingPage;

