import { useEffect, useState, type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SESSION_EVENT, getSession, type Session } from './services/api';
import type { Rol } from './types/historial';
import { AppHeader } from './components/layout/AppHeader';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { HistorialPage } from './pages/HistorialPage';
import { ModuloMedicoPage } from './pages/ModuloMedicoPage';
import { ForbiddenState } from './components/ui/ForbiddenState';

function useSession() {
  const [session, setSession] = useState<Session | null>(getSession);
  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return session;
}

/** Guarda de ruta por rol. Sin sesión → login; rol distinto → 403. */
function RequireRole({ session, rol, children }: { session: Session | null; rol: Rol; children: ReactElement }) {
  const location = useLocation();
  if (!session) return <Navigate to="/ingresar" replace state={{ from: location.pathname + location.search }} />;
  if (session.rol !== rol) {
    return (
      <ForbiddenState
        backLabel="Ir al inicio"
        description="Esta sección no está disponible para tu tipo de cuenta."
        onBack={() => window.location.assign('/')}
      />
    );
  }
  return children;
}

function AppRoutes() {
  const session = useSession();
  return (
    <>
      <AppHeader session={session} />
      <Routes>
        <Route path="/" element={<HomePage session={session} />} />
        <Route path="/ingresar" element={<LoginPage />} />
        <Route path="/historial" element={<RequireRole session={session} rol="CLIENTE"><HistorialPage /></RequireRole>} />
        <Route path="/historial/mascotas/:mascotaId" element={<RequireRole session={session} rol="CLIENTE"><HistorialPage /></RequireRole>} />
        <Route path="/modulo-medico" element={<RequireRole session={session} rol="VETERINARIO"><ModuloMedicoPage /></RequireRole>} />
        <Route path="/modulo-medico/pacientes/:mascotaId" element={<RequireRole session={session} rol="VETERINARIO"><ModuloMedicoPage /></RequireRole>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
