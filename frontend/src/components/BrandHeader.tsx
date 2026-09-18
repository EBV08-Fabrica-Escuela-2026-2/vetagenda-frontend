import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type BrandHeaderProps = {
  subtitle?: string;
  rightContent?: ReactNode;
  className?: string;
};

export function BrandHeader({ subtitle, rightContent, className = '' }: BrandHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-emerald-500 text-lg font-black text-white shadow-sm ring-2 ring-sky-100">
          V
        </div>
        <div>
          <p className="bg-gradient-to-r from-sky-700 via-cyan-600 to-emerald-500 bg-clip-text text-[11px] font-black uppercase tracking-[0.28em] text-transparent">
            VetAgenda
          </p>
          {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
        </div>
      </Link>

      {rightContent}
    </div>
  );
}
