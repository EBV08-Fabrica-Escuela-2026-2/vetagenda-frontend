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
      <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
        <section className="card w-full max-w-xl p-8">
          <p className="eyebrow !text-brand-600">VetAgenda</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-brand-950">No pudimos mostrar esta página</h1>
          <p className="mt-3 text-sm leading-6 text-ink-500">Recarga la página o vuelve al inicio para continuar.</p>
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>Recargar</button>
            <a href="/" className="btn-secondary">Volver al inicio</a>
          </div>
        </section>
      </main>
    );
  }
}
