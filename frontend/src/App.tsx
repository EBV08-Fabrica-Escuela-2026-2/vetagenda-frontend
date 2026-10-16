import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import { ConfigurarHorariosPage } from './pages/ConfigurarHorariosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inicio" element={<LandingPage />} />
        <Route path="/veterinarios/horarios" element={<ConfigurarHorariosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
