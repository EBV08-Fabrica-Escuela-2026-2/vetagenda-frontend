function LandingPage() {
  return (
    <div>
      {/* Encabezado */}
      <header>
        <h2>🐾 VetAgenda</h2>

        <nav>
          <span>Inicio</span>
          <span>Servicios</span>
          <span>Veterinarios</span>
          <button>Iniciar sesión</button>
          <button>Registrarse</button>
        </nav>
      </header>

      {/* Sección principal */}
      <main>
        <section>
          <h1>Atención veterinaria para tu mascota</h1>

          <p>
            Encuentra profesionales veterinarios, consulta sus servicios
            y agenda fácilmente.
          </p>

          <button>Ver servicios</button>
          <button>Registrarme</button>
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
  )
}

export default LandingPage