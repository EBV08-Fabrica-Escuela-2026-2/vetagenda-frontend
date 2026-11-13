import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import type { PacienteDetalle } from '../../types/historial';
import { PetAvatar } from '../historial/PetSelector';

const ESPECIE = { PERRO: 'Canino', GATO: 'Felino', OTRO: 'Otra especie' } as const;

function useCronometro(inicio: string | null) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!inicio) return;
    const id = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [inicio]);
  if (!inicio) return null;
  const seg = Math.max(0, Math.floor((ahora - new Date(inicio).getTime()) / 1000));
  return [Math.floor(seg / 3600), Math.floor((seg % 3600) / 60), seg % 60].map((n) => String(n).padStart(2, '0')).join(':');
}

type Props = {
  paciente: PacienteDetalle;
  /** ISO de inicio si este paciente es el de la consulta activa. */
  inicioConsulta: string | null;
  onVolverConsulta?: () => void;
};

export function PatientBanner({ paciente, inicioConsulta, onVolverConsulta }: Props) {
  const cronometro = useCronometro(inicioConsulta);
  const dato = (label: string, valor: string) => (
    <div className="border-white/10 px-5 sm:border-l">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B7D0D7]">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold leading-tight text-white">{valor}</p>
    </div>
  );

  return (
    <section className="bg-brand-800/95 bg-[linear-gradient(90deg,#08647A,#074B5D)]" aria-label="Paciente en consulta">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="flex items-center gap-4">
          <PetAvatar mascota={paciente} size="lg" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-400">
              {cronometro ? `Consulta activa · ${cronometro}` : 'Historial del paciente'}
            </p>
            <p className="font-display text-3xl font-bold leading-tight text-white">{paciente.nombre}</p>
            <p className="text-xs text-[#B7D0D7]">
              {ESPECIE[paciente.especie]} · {paciente.raza} · {paciente.edadAnios} {paciente.edadAnios === 1 ? 'año' : 'años'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-y-3 lg:ml-6">
          {dato('Peso', `${paciente.pesoKg.toLocaleString('es-CO')} kg`)}
          {dato('Sexo', paciente.sexo === 'MACHO' ? 'Macho' : 'Hembra')}
          {dato('Propietario(a)', paciente.propietario)}
        </div>
        {onVolverConsulta && (
          <button type="button" onClick={onVolverConsulta} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50 lg:ml-auto">
            <Stethoscope className="h-4 w-4" aria-hidden /> Volver a consulta
          </button>
        )}
      </div>
    </section>
  );
}
