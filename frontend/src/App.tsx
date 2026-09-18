import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import { RegisterVeterinarianPage } from './pages/RegisterVeterinarianPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/veterinarios/registro" element={<RegisterVeterinarianPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;