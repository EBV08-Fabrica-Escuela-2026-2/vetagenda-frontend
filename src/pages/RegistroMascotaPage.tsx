import Breadcrumb from '../components/Breadcrumb'
import RegistroMascotaForm from '../components/RegistroMascotaForm'
import type { MascotaFormData } from '../types/mascota'

export default function RegistroMascotaPage() {
  function handleGuardar(data: MascotaFormData) {
    // Punto de integración: aquí se conectaría con el servicio/API de HU05
    // (POST /mascotas) usando data.clienteId como dueño de la mascota.
    console.log('Mascota registrada:', data)
  }

  function handleVolver() {
    console.log('Navegar a Mis Mascotas')
  }

  return (
    <main className="page">
      <Breadcrumb items={['Mis Mascotas', 'Nueva Mascota']} />
      <div className="page__content">
        <RegistroMascotaForm onGuardar={handleGuardar} onVolver={handleVolver} />
      </div>
    </main>
  )
}
