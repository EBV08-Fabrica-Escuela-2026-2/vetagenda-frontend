import { useLayoutEffect, type ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import LoginPage from './pages/LoginPage';
import { RegisterVeterinarianPage } from './pages/RegisterVeterinarianPage';
import { RegistroMascotaPage } from './pages/RegistroMascotaPage';
import { CatalogoServiciosPage } from './pages/CatalogoServiciosPage';
import { RegisterServicePage } from './pages/RegisterServicePage';
import { VeterinarianAppointmentsPage } from './pages/VeterinarianAppointmentsPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { DetalleCitaPage } from './pages/DetalleCitaPage';
import { ReprogramarCitaPage } from './pages/ReprogramarCitaPage';
import { ReservarCitaPage } from './pages/ReservarCitaPage';
import { CancelarCitaPage } from './pages/CancelarCitaPage';
import { ConfigurarHorariosPage } from './pages/ConfigurarHorariosPage';
import { ContactPage, PrivacyPage, TermsPage } from './pages/InformationPages';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { hasAuthenticatedClientSession } from './services/api';

function HashScrollHandler() {
  const { hash, pathname } = useLocation();

  useLayoutEffect(() => {
    if (!hash) {
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' as ScrollBehavior,
        });
      };

      scrollToTop();
      const frameId = window.requestAnimationFrame(() => {
        scrollToTop();
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    const sectionId = decodeURIComponent(hash.slice(1));
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [hash, pathname]);

  return null;
}

function ClientProtectedRoute({ children }: { children: ReactElement }) {
  const location = useLocation();

  if (hasAuthenticatedClientSession()) {
    return children;
  }

  const returnTo = `${location.pathname}${location.search}`;
  return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <HashScrollHandler />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inicio" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/veterinarios/registro" element={<RegisterVeterinarianPage />} />
        <Route path="/servicios/registro" element={<RegisterServicePage />} />
        <Route
          path="/cliente"
          element={(
            <ClientProtectedRoute>
              <ClientPortalPage />
            </ClientProtectedRoute>
          )}
        />
        <Route
          path="/mascotas/registro"
          element={(
            <ClientProtectedRoute>
              <RegistroMascotaPage />
            </ClientProtectedRoute>
          )}
        />
        <Route path="/catalogo" element={<CatalogoServiciosPage />} />
        <Route
          path="/citas/reservar"
          element={(
            <ClientProtectedRoute>
              <ReservarCitaPage />
            </ClientProtectedRoute>
          )}
        />
        <Route
          path="/cliente/citas"
          element={(
            <ClientProtectedRoute>
              <CancelarCitaPage />
            </ClientProtectedRoute>
          )}
        />
        <Route path="/mis-citas" element={<Navigate to="/cliente/citas" replace />} />
        <Route path="/citas/consultar" element={<Navigate to="/cliente/citas" replace />} />
        <Route path="/veterinario/agenda" element={<VeterinarianAppointmentsPage />} />
        <Route path="/veterinario/disponibilidad" element={<ConfigurarHorariosPage />} />
        <Route path="/veterinarios/horarios" element={<ConfigurarHorariosPage />} />
        <Route path="/disponibilidad" element={<AvailabilityPage />} />
        <Route
          path="/cliente/citas/:id"
          element={(
            <ClientProtectedRoute>
              <DetalleCitaPage />
            </ClientProtectedRoute>
          )}
        />
        <Route
          path="/detalle-cita/:id"
          element={(
            <ClientProtectedRoute>
              <DetalleCitaPage />
            </ClientProtectedRoute>
          )}
        />
        <Route path="/detalle-cita" element={<Navigate to="/cliente/citas/1" replace />} />
        <Route
          path="/reprogramar-cita/:citaId"
          element={(
            <ClientProtectedRoute>
              <ReprogramarCitaPage />
            </ClientProtectedRoute>
          )}
        />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="/terminos" element={<TermsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
