import type { ReactElement } from 'react';
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
import { hasAuthenticatedClientSession } from './services/api';

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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inicio" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/veterinarios/registro" element={<RegisterVeterinarianPage />} />
        <Route path="/servicios/registro" element={<RegisterServicePage />} />
        <Route path="/mascotas/registro" element={<RegistroMascotaPage />} />
        <Route path="/catalogo" element={<CatalogoServiciosPage />} />
        <Route
          path="/citas/reservar"
          element={(
            <ClientProtectedRoute>
              <ReservarCitaPage />
            </ClientProtectedRoute>
          )}
        />
        <Route path="/cliente/citas" element={<CancelarCitaPage />} />
        <Route path="/mis-citas" element={<Navigate to="/cliente/citas" replace />} />
        <Route path="/citas/consultar" element={<Navigate to="/cliente/citas" replace />} />
        <Route path="/veterinario/agenda" element={<VeterinarianAppointmentsPage />} />
        <Route path="/veterinario/disponibilidad" element={<ConfigurarHorariosPage />} />
        <Route path="/veterinarios/horarios" element={<ConfigurarHorariosPage />} />
        <Route path="/disponibilidad" element={<AvailabilityPage />} />
        <Route path="/cliente/citas/:id" element={<DetalleCitaPage />} />
        <Route path="/detalle-cita/:id" element={<DetalleCitaPage />} />
        <Route path="/detalle-cita" element={<Navigate to="/cliente/citas/1" replace />} />
        <Route path="/reprogramar-cita/:citaId" element={<ReprogramarCitaPage />} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="/terminos" element={<TermsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
