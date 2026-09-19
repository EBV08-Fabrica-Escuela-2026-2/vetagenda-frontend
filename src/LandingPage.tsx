import { Logo } from './components/ui/Logo';
import './LandingPage.css';

function LandingPage() {
  return (
    <div>
      {/* Encabezado */}
      <header className="landing-header">
        <Logo size="md" />

        <nav className="landing-nav">
          <span>Inicio</span>
          <span>Servicios</span>
          <span>Veterinarios</span>
          <button>Iniciar sesión</button>
          <button>Registrarse</button>
        </nav>
      </header>

      {/* Contenido principal */}
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <p className="hero-label">
              CUIDADO VETERINARIO DE CONFIANZA
            </p>

            <h1>
              Atención veterinaria para
              <span> tu mascota</span>
            </h1>

            <p className="hero-description">
              Encuentra profesionales veterinarios, consulta sus servicios
              y agenda fácilmente.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary">Ver servicios</button>
              <button className="btn-secondary">Registrarme</button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="pet-card">
              <span className="pet-icon">🐾</span>
              <h3>VetAgenda</h3>
              <p>El bienestar de tu mascota en buenas manos.</p>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section>
          <h2>¿Cómo funciona VetAgenda?</h2>

          <div>
            <p>1. Registra tu mascota</p>
            <p>2. Consulta servicios y veterinarios</p>
            <p>3. Agenda tu cita</p>
          </div>
        </section>

        {/* Servicios */}
        <section>
          <h2>Nuestros servicios</h2>

          <div>
            <p>Consulta general</p>
            <p>Vacunación</p>
            <p>Otros servicios</p>
          </div>
        </section>

        {/* Llamado final */}
        <section>
          <h2>El bienestar de tu mascota, más cerca de ti.</h2>
          <button>Comenzar ahora</button>
        </section>
      </main>

      {/* Pie de página */}
      <footer>
        <p>© 2026 VetAgenda — Fábrica Escuela 2026-2</p>
      </footer>
    </div>
  );
}

export default LandingPage;
