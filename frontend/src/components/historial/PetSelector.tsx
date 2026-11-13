import { Check, PawPrint } from 'lucide-react';
import type { MascotaResumen } from '../../types/historial';
import { ESPECIE_LABEL, plural } from '../../utils/format';

type Props = {
  mascotas: MascotaResumen[];
  selected: number | 'TODAS' | null;
  onSelect: (id: number | 'TODAS') => void;
  loading?: boolean;
};

export function PetAvatar({ mascota, size = 'md' }: { mascota: Pick<MascotaResumen, 'nombre' | 'fotoUrl'>; size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-14 w-14 rounded-2xl' : 'h-11 w-11 rounded-xl';
  return mascota.fotoUrl ? (
    <img src={mascota.fotoUrl} alt="" className={`${dims} shrink-0 object-cover`} />
  ) : (
    <span className={`${dims} grid shrink-0 place-items-center bg-brand-50 font-display text-lg font-bold text-brand-700`}>
      {mascota.nombre.charAt(0)}
    </span>
  );
}

export function PetSelector({ mascotas, selected, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-[68px] w-56" />
        ))}
      </div>
    );
  }

  const cardClass = (active: boolean) =>
    `relative flex w-full items-center sm:w-auto sm:min-w-[13rem] gap-3 rounded-2xl border bg-white px-3 py-3 pr-10 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 ${
      active ? 'border-brand-500 bg-[#F6FFFC] shadow-[0_0_0_1px_#0C9A90]' : 'border-line hover:border-brand-500/60'
    }`;

  const check = (
    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white">
      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
    </span>
  );

  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Mis mascotas">
      {mascotas.map((mascota) => {
        const active = selected === mascota.id;
        return (
          <button key={mascota.id} type="button" role="radio" aria-checked={active} onClick={() => onSelect(mascota.id)} className={cardClass(active)}>
            <PetAvatar mascota={mascota} />
            <span>
              <span className="block font-display text-lg font-bold leading-tight text-brand-950">{mascota.nombre}</span>
              <span className="block text-xs text-ink-400">
                {ESPECIE_LABEL[mascota.especie]} · {mascota.raza}
              </span>
            </span>
            {active && check}
          </button>
        );
      })}
      {mascotas.length > 1 && (
        <button type="button" role="radio" aria-checked={selected === 'TODAS'} onClick={() => onSelect('TODAS')} className={cardClass(selected === 'TODAS')}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <PawPrint className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-display text-lg font-bold leading-tight text-brand-950">Todas</span>
            <span className="block text-xs text-ink-400">{plural(mascotas.length, 'mascota')}</span>
          </span>
          {selected === 'TODAS' && check}
        </button>
      )}
    </div>
  );
}
