import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('VetAgenda no pudo mostrar la vista.', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 text-slate-900">
        <section className="w-full max-w-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0D9488]">VetAgenda</p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">No pudimos mostrar esta página</h1>
          <p className="mt-3 leading-7 text-slate-600">
            La información de tu cuenta permanece guardada. Recarga la página o vuelve al inicio para continuar.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 bg-[#0D5C75] px-5 py-2.5 font-bold text-white hover:bg-[#094356]"
            >
              Recargar
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
            >
              Volver al inicio
            </a>
          </div>
        </section>
      </main>
    );
  }
}
