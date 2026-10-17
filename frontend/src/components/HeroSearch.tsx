import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listVeterinarians, DEMO_VETERINARIOS, type CatalogService } from '../services/api';
import { Icon } from './Icon';

const defaultVetOptions = [
  { value: 'all', label: 'Cualquier profesional' },
  ...DEMO_VETERINARIOS.map((vet) => ({ value: String(vet.id), label: vet.nombre })),
];

function getTodayDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

type HeroSearchProps = {
  services: CatalogService[];
  isLoading: boolean;
};

export function HeroSearch({ services, isLoading }: HeroSearchProps) {
  const navigate = useNavigate();
  const [service, setService] = useState('');
  const [vetOptions, setVetOptions] = useState(defaultVetOptions);
  const [veterinarian, setVeterinarian] = useState(defaultVetOptions[0].value);
  const [date, setDate] = useState(getTodayDate);

  useEffect(() => {
    let isMounted = true;
    listVeterinarians().then((vets) => {
      if (!isMounted || !vets?.length) return;
      setVetOptions([
        { value: 'all', label: 'Cualquier profesional' },
        ...vets.map((v) => ({ value: String(v.id), label: v.nombre })),
      ]);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams({ servicio: service, veterinario: veterinarian, fecha: date });
    navigate(`/disponibilidad?${query.toString()}`);
  }

  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#F0F7F7_0%,#FFFFFF_100%)] px-5 pb-16 pt-12 md:px-10 md:pb-24 md:pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F4F1] px-4 py-2 text-xs font-bold text-[#0D5C75]">
            <Icon name="sparkle" className="h-4 w-4 text-[#0D9488]" filled />
            Gestión veterinaria ágil y humana
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.7rem]">
            El cuidado de tu mascota,
            <span className="block text-[#0D5C75]">más ágil y humano.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Organiza citas, disponibilidad asistencial y el cuidado de tus mascotas en un solo lugar.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid grid-cols-1 gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/50 sm:grid-cols-2"
          >
            <label className="block min-w-0 px-2 py-1">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Especialidad o servicio</span>
              <select
                required
                disabled={isLoading || services.length === 0}
                value={service || String(services[0]?.id ?? '')}
                onChange={(event) => setService(event.target.value)}
                className="w-full rounded-lg border-0 bg-white px-0 py-1 text-sm font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              >
                {isLoading && <option value="">Cargando servicios...</option>}
                {!isLoading && services.length === 0 && <option value="">No hay servicios disponibles</option>}
                {services.map((option) => <option key={option.id} value={option.id}>{option.nombre}</option>)}
              </select>
            </label>

            <label className="block min-w-0 border-t border-slate-100 px-2 py-3 sm:border-l sm:border-t-0 sm:py-1">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Veterinario</span>
              <select
                value={veterinarian}
                onChange={(event) => setVeterinarian(event.target.value)}
                className="w-full rounded-lg border-0 bg-white px-0 py-1 text-sm font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              >
                {vetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="block min-w-0 border-t border-slate-100 px-2 py-3 sm:col-span-2">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Fecha deseada</span>
              <input
                aria-label="Fecha deseada"
                type="date"
                min={getTodayDate()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="w-full rounded-lg border-0 bg-white px-0 py-1 text-sm font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading || services.length === 0}
              className="min-h-12 w-full rounded-full bg-[#0D5C75] px-5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#094356] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 sm:col-span-2"
            >
              {isLoading ? 'Cargando servicios...' : 'Buscar horarios'}
            </button>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Icon name="calendar" className="h-4 w-4 text-[#0D9488]" /> Agenda en línea</span>
            <Link to="/cliente/citas" className="flex items-center gap-1.5 font-bold text-[#0D5C75] transition hover:text-[#0D9488]">
              <Icon name="clipboard" className="h-4 w-4 text-[#0D9488]" /> Consultar mis citas
            </Link>
            <span className="flex items-center gap-1.5"><Icon name="paw" className="h-4 w-4 text-[#0D9488]" /> Registro de mascotas</span>
            <span className="flex items-center gap-1.5"><Icon name="stethoscope" className="h-4 w-4 text-[#0D9488]" /> Portal para veterinarios</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="absolute -bottom-5 -left-4 h-32 w-32 rounded-full bg-[#E8F4F1]" aria-hidden="true" />
          <div className="absolute -right-4 -top-5 h-28 w-28 rounded-full bg-[#d9eeeb]" aria-hidden="true" />
          <div className="relative aspect-[1.12] overflow-hidden rounded-3xl bg-slate-100 shadow-xl shadow-slate-200/50">
            <img
              src="https://images.pexels.com/photos/7474851/pexels-photo-7474851.jpeg?auto=compress&w=1200"
              alt="Equipo veterinario atiende a un perro dorado en una clínica"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0D9488]">Cuidado en cada etapa</p>
              <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">Tu mascota, en buenas manos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
