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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg font-black text-sky-700 shadow-sm ring-1 ring-sky-200">
          V
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">VetAgenda</p>
          {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
        </div>
      </Link>

      {rightContent}
    </div>
  );
}
