import { useNavigate } from 'react-router-dom';

type BackToHomeButtonProps = {
  label?: string;
  className?: string;
  disabled?: boolean;
};

export function BackToHomeButton({
  label = 'Volver al inicio',
  className = '',
  disabled = false,
}: BackToHomeButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => navigate('/')}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}
