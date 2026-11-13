import { PawPrint } from 'lucide-react';

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
        <PawPrint className="h-5 w-5" aria-hidden />
      </span>
      <span className={`font-display text-2xl font-bold tracking-tight ${light ? 'text-white' : 'text-brand-950'}`}>
        Vet.Agenda
      </span>
    </span>
  );
}
