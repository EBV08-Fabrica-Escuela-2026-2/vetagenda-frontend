import { Link } from 'react-router-dom';
import { BrandHeader } from './components/BrandHeader';

const features = [
  {
    title: 'Registro de cliente',
    description: 'Permite registrar usuarios y datos básicos del cliente.',
    icon: '👤',
    to: '/registro',
  },
  {
    title: 'Registro veterinario',
    description: 'Crea el perfil del profesional veterinario con sus datos principales.',
    icon: '🩺',
    to: '/veterinarios/registro',
  },
  {
    title: 'Registro de servicio',
    description: 'Agrega servicios asistenciales con nombre, descripción, precio y duración.',
    icon: '🧾',
    to: '/servicios/registro',
  },
  {
    title: 'Registro de mascota',
    description: 'Registra a cada mascota con su información esencial.',
    icon: '🐾',
    to: '/mascotas/registro',
  },
  {
    title: 'Catálogo',
    description: 'Consulta veterinarios y servicios disponibles con precios en COP.',
    icon: '📋',
    to: '/catalogo',
  },
];

function LandingPage() {
  return (
    <main className="min-h-screen bg-sky-50 text-slate-800">
      <header className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-sky-100 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
          <BrandHeader />
          <Link to="/catalogo" className="text-sm font-semibold text-sky-700">
            Ver catálogo
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20">
        <div className="rounded-[32px] bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-400 p-8 text-white shadow-[0_24px_60px_rgba(14,165,233,0.18)] lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">Sistema veterinario</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Gestiona la clínica con cinco funcionalidades esenciales.
          </h1>
          <p className="mt-4 max-w-xl text-base text-sky-50 sm:text-lg">
            VetAgenda centraliza el registro de clientes, veterinarios, mascotas, servicios y el catálogo de atención clínico.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">Funcionalidades</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">Nuestras cinco pantallas principales</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LandingPage;

