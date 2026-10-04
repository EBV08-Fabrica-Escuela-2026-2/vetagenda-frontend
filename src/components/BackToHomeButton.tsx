import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type BackToHomeButtonProps = {
  label?: string;
  className?: string;
};

export function BackToHomeButton({
  label = 'Volver al inicio',
  className = '',
}: BackToHomeButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
      {label}
    </button>
  );
}
