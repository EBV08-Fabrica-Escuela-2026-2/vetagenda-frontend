import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: 'brand' | 'danger';
  action?: ReactNode;
  children?: ReactNode;
};

export function StateMessage({ icon: Icon, title, description, tone = 'brand', action, children }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center" role={tone === 'danger' ? 'alert' : 'status'}>
      <span
        className={`grid h-16 w-16 place-items-center rounded-full ${
          tone === 'danger' ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-600'
        }`}
      >
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold text-brand-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
      {children}
    </div>
  );
}
