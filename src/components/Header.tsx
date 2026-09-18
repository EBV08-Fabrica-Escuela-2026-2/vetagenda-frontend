interface HeaderProps {
  usuarioNombre: string
  usuarioCorreo: string
}

const NAV_ITEMS = [
  { label: 'HU01 · Registro Cliente', active: false },
  { label: 'HU02 · Registro Veterinario', active: false },
  { label: 'HU03 · Inicio de Sesión', active: false },
  { label: 'HU05 · Registro Mascota', active: true },
  { label: 'HU06 · Servicio Clínico', active: false },
]

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join('')
}

export default function Header({ usuarioNombre, usuarioCorreo }: HeaderProps) {
  return (
    <>
      <nav className="topbar">
        <div className="topbar__brand">
          <span className="topbar__pin" aria-hidden="true">
            📍
          </span>
          <span className="topbar__brand-text">VetAgenda</span>
        </div>
        <ul className="topbar__links">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                className={item.active ? 'topbar__link topbar__link--active' : 'topbar__link'}
                href="#"
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <header className="appbar">
        <div className="appbar__brand">
          <span className="appbar__logo" aria-hidden="true">
            📍
          </span>
          <span className="appbar__title">
            Vet<strong>Agenda</strong>
          </span>
        </div>

        <div className="appbar__user">
          <div className="appbar__user-info">
            <span className="appbar__user-name">{usuarioNombre}</span>
            <span className="appbar__user-email">{usuarioCorreo}</span>
          </div>
          <div className="appbar__avatar" aria-hidden="true">
            {initials(usuarioNombre)}
          </div>
        </div>
      </header>
    </>
  )
}
