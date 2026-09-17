import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;