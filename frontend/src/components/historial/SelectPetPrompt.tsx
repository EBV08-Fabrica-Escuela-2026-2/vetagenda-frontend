import { PawPrint } from 'lucide-react';

const PASOS = ['Selecciona', 'Consulta', 'Revisa'];

export function SelectPetPrompt() {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
        <PawPrint className="h-7 w-7" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold text-brand-950">Elige una mascota para comenzar</h2>
      <p className="mt-2 text-sm text-ink-500">Selecciona una de tus mascotas para consultar sus citas y atenciones.</p>
      <ol className="mt-8 flex items-center gap-3 text-xs font-semibold text-ink-500">
        {PASOS.map((paso, i) => (
          <li key={paso} className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-line bg-canvas text-[11px] font-bold text-brand-800">{i + 1}</span>
              {paso}
            </span>
            {i < PASOS.length - 1 && <span aria-hidden className="h-px w-10 bg-line sm:w-16" />}
          </li>
        ))}
      </ol>
    </div>
  );
}
