import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import LoginPage from './pages/LoginPage';
import { RegisterVeterinarianPage } from './pages/RegisterVeterinarianPage';
import { RegistroMascotaPage } from './pages/RegistroMascotaPage';
import { CatalogoServiciosPage } from './pages/CatalogoServiciosPage';
import { RegisterServicePage } from './pages/RegisterServicePage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;