import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import { RegisterVeterinarianPage } from './pages/RegisterVeterinarianPage';
import { RegistroMascotaPage } from './pages/RegistroMascotaPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/veterinarios/registro" element={<RegisterVeterinarianPage />} />
        <Route path="/mascotas/registro" element={<RegistroMascotaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;