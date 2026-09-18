import Header from './components/Header'
import RegistroMascotaPage from './pages/RegistroMascotaPage'

export default function App() {
  return (
    <div className="app">
      <Header usuarioNombre="María González" usuarioCorreo="maria@correo.com" />
      <RegistroMascotaPage />
    </div>
  )
}
