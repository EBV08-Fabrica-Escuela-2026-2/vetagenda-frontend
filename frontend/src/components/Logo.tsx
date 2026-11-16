import { Link } from 'react-router-dom';

export function MedicalPaw({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect width="48" height="48" rx="16" fill="#E8F4F1" />
      <path d="M14.7 20.3c2.1 0 3.8-2.2 3.8-4.9s-1.7-4.9-3.8-4.9-3.8 2.2-3.8 4.9 1.7 4.9 3.8 4.9Zm9.3-2.1c2.2 0 3.9-2.3 3.9-5.1S26.2 8 24 8s-3.9 2.3-3.9 5.1 1.7 5.1 3.9 5.1Zm9.3 2.1c2.1 0 3.8-2.2 3.8-4.9s-1.7-4.9-3.8-4.9-3.8 2.2-3.8 4.9 1.7 4.9 3.8 4.9ZM9.5 27c2.1 0 3.8-2.2 3.8-4.9s-1.7-4.9-3.8-4.9-3.8 2.2-3.8 4.9S7.4 27 9.5 27Zm29 0c2.1 0 3.8-2.2 3.8-4.9s-1.7-4.9-3.8-4.9-3.8 2.2-3.8 4.9 1.7 4.9 3.8 4.9Z" fill="#0D5C75" />
      <path d="M24 22c-5.6 0-12 6.2-12 11.7 0 3.8 3.4 5.3 6.4 4.1 1.8-.7 3.4-1.1 5.6-1.1s3.8.4 5.6 1.1c3 1.2 6.4-.3 6.4-4.1C36 28.2 29.6 22 24 22Z" fill="#0D9488" />
      <path d="M24 25v9m-4.5-4.5h9" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

type LogoProps = {
  subtitle?: string;
  /** "dark" para fondos claros, "light" para fondos oscuros (footer). */
  variant?: 'dark' | 'light';
  className?: string;
  to?: string;
};

export function Logo({ subtitle, variant = 'dark', className = '', to = '/' }: LogoProps) {
  const isLight = variant === 'light';
  return (
    <Link
      to={to}
      aria-label="VetAgenda, inicio"
      className={`group inline-flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 ${className}`}
    >
      <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <MedicalPaw />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`text-xl font-black tracking-tight ${isLight ? 'text-white' : 'text-slate-900'}`}>
          Vet<span className={isLight ? 'text-teal-300' : 'text-[#0D9488]'}>Agenda</span>
        </span>
        {subtitle && <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>{subtitle}</span>}
      </span>
    </Link>
  );
}
