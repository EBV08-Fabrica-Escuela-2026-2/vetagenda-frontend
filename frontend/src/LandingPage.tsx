import { Link } from 'react-router-dom';
import { BrandHeader } from './components/BrandHeader';

const features = [
  { title: 'Registro de cliente', subtitle: 'Cliente', icon: '👤', to: '/registro' },
  { title: 'Registro veterinario', subtitle: 'Veterinario', icon: '🩺', to: '/veterinarios/registro' },
  { title: 'Registro de servicio', subtitle: 'Servicio', icon: '🧾', to: '/servicios/registro' },
  { title: 'Registro de mascota', subtitle: 'Mascota', icon: '🐾', to: '/mascotas/registro' },
  { title: 'Catálogo', subtitle: 'Servicios', icon: '📋', to: '/catalogo' },
];

function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_22%),linear-gradient(135deg,#eaf7ff_0%,#f4fbff_38%,#eef4ff_100%)] px-4 py-10 text-slate-800 md:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-sky-100 bg-white/80 shadow-[0_26px_80px_rgba(14,116,144,0.12)] backdrop-blur-sm">
        <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 px-5 py-5 md:px-8 md:py-6">
          <BrandHeader subtitle="Sistema veterinario" className="mb-2" />
        </div>

        <section className="px-5 pb-10 pt-8 md:px-10 md:pb-12">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-sky-200 bg-sky-100/80 px-4 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-emerald-500 text-base font-black text-white shadow-sm">
                V
              </div>
              <span className="bg-gradient-to-r from-sky-700 via-cyan-600 to-emerald-500 bg-clip-text text-[11px] font-black uppercase tracking-[0.32em] text-transparent">
                VetAgenda
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Gestión veterinaria simple y clara.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 md:text-lg">
              Centraliza las funciones principales de la clínica: registro del cliente, veterinario, mascota, servicio y catálogo.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.to}
                className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 text-2xl shadow-inner ring-1 ring-sky-100">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default LandingPage;

