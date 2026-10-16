import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/citas/reservar" element={<ReservarCitaPage />} />
        <Route path="/cliente/citas" element={<CancelarCitaPage />} />
        <Route path="/veterinario/agenda" element={<VeterinarianAppointmentsPage />} />
        <Route path="/disponibilidad" element={<AvailabilityPage />} />
        <Route path="/cliente/citas/:id" element={<DetalleCitaPage />} />
        <Route path="/detalle-cita/:id" element={<DetalleCitaPage />} />
        <Route path="/detalle-cita" element={<Navigate to="/cliente/citas/1" replace />} />
        <Route path="/reprogramar-cita/:citaId" element={<ReprogramarCitaPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
